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
        let { product, quantity, buyComplete } = req.body
        let uid = req.user._id

        let productData = await Product.findById(product)
        if (!productData || productData.stock === 0 || quantity > productData.stock) {
            return res.status(400).send({ message: 'There is insufficient stock for this product.' })
        }

        if (!buyComplete) {
            let cart = await Cart.findOne({ user: uid })

            if (!cart) {
                let newCart = new Cart({
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

            let productIndex = cart.products.findIndex(p => p.product.equals(product))

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += parseInt(quantity)
            } else {
                cart.products.push({ product: product, quantity })
            }

            let total = 0
            for (let item of cart.products) {
                let productData = await Product.findById(item.product)
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

            for (let item of cart.products) {
                let productData = await Product.findById(item.product)
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
            let doc = new PDF();
            let __filename = fileURLToPath(import.meta.url);
            let currentDir = dirname(__filename);
            let billsDir = join(currentDir, '..', 'bill');
            let pdfPath = join(billsDir, `InvoiceNo.${bill._id}.pdf`);

            if (!fs.existsSync(billsDir)) {
                fs.mkdirSync(billsDir, { recursive: true });
            }

            let stream = doc.pipe(fs.createWriteStream(pdfPath));

            doc.text(`Fecha: ${new Date(bill.date).toLocaleDateString('es-ES')}`, { align: 'right' }).moveDown();
            doc.fontSize(30).text('Factura', { align: 'center' }).moveDown();

            doc.fontSize(15).text(`ID de Factura: ${bill._id}`, { align: 'left' });
            doc.fontSize(12).text(`Usuario: ${bill.user}`, { align: 'left' });

            doc.moveDown().fontSize(11).text('Artículos de la Factura:', { align: 'left' });

            for (let item of bill.items) {
                doc.text(`- Producto: ${item.product},
                        Cantidad: ${item.quantity},
                        Precio Unitario: ${item.unitPrice}`,
                        { align: 'left' });
            }

            doc.moveDown().moveDown().text(`Monto Total: ${bill.totalAmount}`, { align: 'right' });

            doc.end();

            stream.on('finish', () => {
                console.log(`PDF generado en: ${pdfPath}`);
                resolve(pdfPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteCart = async (req, res) => {
    try {
        let { _id } = req.user._id;

        // Encuentra el carrito del usuario
        let cart = await Cart.findOne({ user: _id });

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found for this user.' });
        }

        // Elimina el carrito
        await Cart.deleteOne({ _id: cart._id });

        return res.send({ message: 'Cart deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error deleting cart.', error: error });
    }
};