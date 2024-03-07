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
        let { product, quantity } = req.body
        let { completeShop } = req.body
        let uid = req.user._id

        let productData = await Product.findById(product)
        if (!productData || productData.stock === 0 || quantity > productData.stock) {
            return res.status(400).send({ message: 'There is insufficient stock for this product.' })
        }

        if (!completeShop) {
            let cart = await Cart.findOne({ user: uid })

            if (!cart) {
                const newCart = newCartEntry(userId, selectedProduct, selectedQuantity) 
                let total = calculateCartTotal(newCart.products) 
                newCart.total = total 
                await saveCart(newCart) 

                return res.send({ message: 'Product added to cart successfully.', total }) 
            }


            // Miramos si el producto está en el carrito
            let productIndex = findProductIndexInCart(userCart.products, selectedProduct) 

            if (productIndex !== -1) {
                userCart.products[productIndex].quantity += parseInt(selectedQuantity) 
            } else {
                userCart.products.push({ product: selectedProduct, quantity: selectedQuantity }) 
            }


            // Calculamos el total del carrito
            userCart.total = calculateCartTotal(userCart.products) 
            await saveCart(userCart) 

            return res.send({ message: 'Product added to cart successfully.', total: userCart.total }) 
            } else {
            if (isPurchaseComplete !== 'CONFIRM') return res.status(400).send({ message: `Validation word must be 'CONFIRM'.` }) 

            let userCart = await getCartByUserId(userId) 

            if (!userCart) {
                return res.status(400).send({ message: 'The cart is empty.' }) 
            }

            // Crear un nuevo registro de factura con los datos del carrito de compras
            const billItems = await prepareBillItems(userCart.products) 

            const bill = createBill(userId, billItems, userCart.total) 
            const savedBill = await saveBill(bill) 

            await updateProductStock(userCart.products) 
            await deleteCart(userCart._id) 

            const pdfPath = await generateBillPDF(savedBill) 
            console.log('PDF generated:', pdfPath) 

            return res.status(200).send({ message: 'Purchase completed successfully and bill generated.', bill: savedBill }) 
            }

         } catch (error) {
                console.error(error) 
                return res.status(500).send({ message: 'Error processing purchase.', error: error }) 
        }
}

export const billPDF = async (bill) => {
    return new Promise((resolve, reject) => {
        let doc = new PDFDocument() 
        let __filename = fileURLToPath(import.meta.url) 
        let currentDir = dirname(__filename) 
        let billsDir = join(currentDir, '..', '..', 'bills') 
        let pdfPath = join(billsDir, `InvoiceNo.${bill._id}.pdf`) 

        let stream = doc.pipe(fs.createWriteStream(pdfPath)) 

        doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown() 

        doc.fontSize(12).text(`User: ${bill.user}`, { align: 'left' }) 
        doc.text(`Date: ${bill.date}`, { align: 'left' }).moveDown() 

        doc.text('Invoice Items:', { align: 'left' }).moveDown() 

        for (let item of bill.items) {
            doc.text(`- Product: ${item.product}, Quantity: ${item.quantity}, Unit Price: ${item.unitPrice}`, { align: 'left' }) 
        }

        doc.moveDown().text(`Total: ${bill.totalAmount}`, { align: 'right' }) 

        doc.end() 

        stream.on('finish', () => {
            resolve(pdfPath) 
        }) 

        stream.on('error', (err) => {
            reject(err) 
        }) 
    }) 
} 