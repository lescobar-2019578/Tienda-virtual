'use strict'

import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import PDF from 'pdfkit';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}

export const add = async (req, res) => {
    try {
        let { product, quantity } = req.body;
        let { completeShop } = req.body;
        let uid = req.user._id

        const productData = await Product.findById(product);
        if (!productData || productData.stock === 0 || quantity > productData.stock) {
            return res.status(400).send({ message: 'Insufficient stock' });
        }

        if (!completeShop) {
            let cart = await Cart.findOne({ user: uid });

            if (!cart) {
                const newCart = new Cart({
                    user: uid,
                    products: [{ product: product, quantity }],
                    total: 0  // Inicializamos el total en 0
                });
                let total = 0;
                for (const item of newCart.products) {
                    let productData = await Product.findById(item.product);
                    if (productData) {
                        total += productData.price * item.quantity;
                    }
                }
                newCart.total = total; // Actualizamos el total del carrito

                // Guardamos el carrito
                await newCart.save();

                return res.status(200).send({ message: 'Product added to cart cart successfully.', total });
            }

            // Verificamos si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(p => p.product.equals(product));

            if (productIndex !== -1) {
                // Si el producto ya está en el carrito, simplemente actualizamos la cantidad
                cart.products[productIndex].quantity += parseInt(quantity);
            } else {
                // Si el producto no está en el carrito, lo agregamos
                cart.products.push({ product: product, quantity });
            }


            // Calculamos el total del carrito
            let total = 0;
            for (const product of cart.products) {
                const productData = await Product.findById(product.product);
                if (productData) {
                    total += productData.price * product.quantity;
                }
            }
            cart.total = total;

            await cart.save();
            return res.status(200).send({ message: 'Product added to cart cart successfully.', total });
        } else {
            if (completeShop !== 'CONFIRM') return res.status(400).send({ message: `Validation word must be -> CONFIRM` });

            const cart = await Cart.findOne({ user: uid });

            if (!cart) {
                return res.status(400).send({ message: 'Cart cart is empty.' });
            }

            // Crear un nuevo registro de factura con los datos del carrito de compras
            const billItems = [];
            for (const item of cart.products) {
                const productData = await Product.findById(item.product);
                if (productData) {
                    billItems.push({
                        product: item.product,
                        quantity: item.quantity,
                        unitPrice: productData.price, // Precio unitario del producto
                        totalPrice: productData.price * item.quantity // Precio total del producto
                    });
                }
            }

            const bill = new Bill({
                user: cart.user,
                items: billItems,
                totalAmount: cart.total
            });
            const savedBill = await bill.save();

            // Actualizar el stock de los productos
            for (const item of cart.products) {
                const productData = await Product.findById(item.product);
                if (productData) {
                    productData.stock -= item.quantity;
                    await productData.save();
                }
            }


            await Cart.deleteOne({ _id: cart._id });

            const pdfPath = await billPDF(savedBill);
            console.log('PDF generado:', pdfPath);
            return res.status(200).send({ message: 'Purchase completed successfully and bill generated.', bill: savedBill });

        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error registering ', error: error });
    }
}

export const billPDF = async (bill) => {
    return new Promise((resolve, reject) => {
        const doc = new PDF();
        const __filename = fileURLToPath(import.meta.url);
        const currentDir = dirname(__filename);
        const billsDir = join(currentDir, '..', '..', 'bills'); // Retrocedemos dos veces para llegar a 'bills'
        const pdfPath = join(billsDir, `FacturaNo.${bill._id}.pdf`); // Ruta del archivo PDF

        const stream = doc.pipe(fs.createWriteStream(pdfPath)); // Definimos la variable stream

        doc.fontSize(20).text('Factura', { align: 'center' }).moveDown();

        doc.fontSize(12).text(`Usuario: ${bill.user}`, { align: 'left' });
        doc.text(`Fecha: ${bill.date}`, { align: 'left' }).moveDown();

        doc.text('Items de la factura:', { align: 'left' }).moveDown();

        for (const item of bill.items) {
            doc.text(`- Producto: ${item.product}, Cantidad: ${item.quantity}, Precio Unitario: ${item.unitPrice}`, { align: 'left' });
        }

        doc.moveDown().text(`Total: ${bill.totalAmount}`, { align: 'right' });

        doc.end();

        stream.on('finish', () => {
            resolve(pdfPath);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};