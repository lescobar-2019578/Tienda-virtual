'use strict'

import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import PDF from 'pdfkit'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'


export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const create = async (req, res) => {
    try {
        const { product, quantity, buyComplete } = req.body 
        const uid = req.user._id 

        const productData = await Product.findById(product) 
        if (!productData || productData.stock === 0 || quantity > productData.stock) {
            return res.status(400).send({ message: 'There is insufficient stock for this product.' }) 
        }

        if (!buyComplete) {
            let cart = await Cart.findOne({ user: uid }) 

            if (!cart) {
                const newCart = new Cart({
                    user: uid,
                    products: [{ product: product, quantity }],
                    total: 0
                }) 

                let total = 0 
                for (let item of newCart.products) {
                    let productData = await Product.findById(item.product) 
                    if (productData) {
                        total += productData.price * item.quantity 
                    }
                }
                newCart.total = total 
                await newCart.save() 
                return res.send({ message: 'Product added to cart successfully.', total }) 
            }

            const productIndex = cart.products.findIndex(p => p.product.equals(product)) 

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += parseInt(quantity) 
            } else {
                cart.products.push({ product: product, quantity }) 
            }

            let total = 0 
            for (const item of cart.products) {
                const productData = await Product.findById(item.product) 
                if (productData) {
                    total += productData.price * item.quantity 
                }
            }
            cart.total = total 
            await cart.save() 

            return res.send({ message: 'Product added to cart successfully.', total }) 
        } else {
            if (buyComplete !== 'CONFIRM') return res.status(400).send({ message: `Validation word must be 'CONFIRM'.` }) 

            let cart = await Cart.findOne({ user: uid }) 

            if (!cart) {
                return res.status(400).send({ message: 'The cart is empty.' }) 
            }

            let billItems = [] 
            for (let item of cart.products) {
                let productData = await Product.findById(item.product) 
                if (productData) {
                    billItems.push({
                        product: item.product,
                        quantity: item.quantity,
                        unitPrice: productData.price, // Precio unitario del producto
                        totalPrice: productData.price * item.quantity // Precio total del producto
                    }) 
                }
            }

            let bill = new Bill({
                user: cart.user,
                items: billItems,
                totalAmount: cart.total
            }) 
            let savedBill = await bill.save() 
            
            for (const item of cart.products) {
                const productData = await Product.findById(item.product) 
                if (productData) {
                    productData.stock -= item.quantity 
                    await productData.save() 
                }
            }
            await Cart.deleteOne({ _id: cart._id }) 

            let pdfPath = await generateBillPDF(savedBill) 
            console.log('PDF generated:', pdfPath) 

            return res.send({ message: 'Purchase completed successfully and bill generated.', bill: savedBill }) 
        }
    } catch (error) {
        console.error(error) 
        return res.status(500).send({ message: 'Error processing purchase.', error: error }) 
    }
}



export const generateBillPDF = async (bill) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDF()  // Crear un nuevo documento PDF
            const __filename = fileURLToPath(import.meta.url) 
            const currentDir = dirname(__filename) 
            const billsDir = join(currentDir, '..', 'bill')  // Directorio donde se guardarán las facturas
            const pdfPath = join(billsDir, `InvoiceNo.${bill._id}.pdf`)  // Ruta del archivo PDF

            // Te aseguras de que el directorio de facturas exista
            if (!fs.existsSync(billsDir)) {
                fs.mkdirSync(billsDir, { recursive: true }) 
            }

            let stream = doc.pipe(fs.createWriteStream(pdfPath))  // Crear un flujo de escritura para el archivo PDF

            // Escribir el contenido de la factura en el documento PDF
            doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown() 

            doc.fontSize(12).text(`Bill ID: ${bill._id}`, { align: 'left' }) 
            doc.fontSize(12).text(`User: ${bill.user}`, { align: 'left' }) 
            doc.text(`Date: ${bill.date}`, { align: 'left' }).moveDown() 

            doc.text('Invoice Items:', { align: 'left' }).moveDown() 

            for (let item of bill.items) {
                doc.text(`- Product: ${item.product} , 
                            Quantity: ${item.quantity}, 
                            Unite Price: ${item.unitPrice}`, 
                            { align: 'left' })
                             
            }

            doc.moveDown().text(`Total Amount: ${bill.totalAmount}`, { align: 'right' }) 

            doc.end()  // Finalizar la escritura del documento PDF

            stream.on('finish', () => {
                console.log(`PDF generated at: ${pdfPath}`) 
                resolve(pdfPath) 
            }) 

            stream.on('error', (err) => {
                reject(err)  
            }) 
        } catch (error) {
            reject(error)  
        }
    }) 
}