'use strict';

import Bill from './bill.model.js';
import Product from '../product/product.model.js';

export const update = async (req, res) => {
    try {
        let { id } = req.params;
        let { product, quantity } = req.body;

        // Validar si se proporcionó el producto y la cantidad
        if (!product && !quantity) {
            return res.status(400).send({ message: 'Product and quantity are required' });
        }

        // Encontrar la factura
        let bill = await Bill.findById(id);
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }

        // Encontrar el ítem de la factura que se va a actualizar
        let itemToUpdate = bill.items.find(item => item.product.toString() === product);
        if (!itemToUpdate) {
            return res.status(404).send({ message: 'Item not found in the bill' });
        }

        // Actualizar el producto y la cantidad
        if (product) {
            itemToUpdate.product = product;

            let productInfo = await Product.findById(product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            let oldUnitPrice = itemToUpdate.unitPrice;
            itemToUpdate.unitPrice = productInfo.price;

            bill.totalAmount += (itemToUpdate.unitPrice - oldUnitPrice) * itemToUpdate.quantity;

            if (quantity !== undefined) {
                let oldQuantity = itemToUpdate.quantity;
                let quantityDifference = quantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await productInfo.save();
            }
        }
        if (quantity !== undefined) {
            let oldQuantity = itemToUpdate.quantity;
            let quantityDifference = quantity - oldQuantity;
            itemToUpdate.quantity = quantity;
            bill.totalAmount += quantityDifference * itemToUpdate.unitPrice;
            let productInfo = await Product.findById(itemToUpdate.product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            productInfo.stock -= quantityDifference; // Aquí restamos la diferencia
            await productInfo.save();
        }

        // Guardar la factura actualizada
        await bill.save();

        return res.send({ message: 'Item updated successfully', bill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating item', error: error });
    }
};
