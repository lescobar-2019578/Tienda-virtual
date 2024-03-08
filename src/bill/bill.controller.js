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

        // Actualizar el producto y/o la cantidad
        if (product) {
            itemToUpdate.product = product;

            // Obtener el precio del producto y actualizar el unitPrice del ítem
            const productInfo = await Product.findById(product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            const oldUnitPrice = itemToUpdate.unitPrice;
            itemToUpdate.unitPrice = productInfo.price;

            // Recalcular el totalAmount basado en el cambio en el unitPrice
            bill.totalAmount += (itemToUpdate.unitPrice - oldUnitPrice) * itemToUpdate.quantity;

            // Actualizar el stock del producto en base a la diferencia en la cantidad
            if (quantity !== undefined) {
                const oldQuantity = itemToUpdate.quantity;
                const quantityDifference = quantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await productInfo.save();
            }
        }
        if (quantity !== undefined) {
            const oldQuantity = itemToUpdate.quantity;
            const quantityDifference = quantity - oldQuantity;
            itemToUpdate.quantity = quantity;

            // Recalcular el totalAmount basado en la diferencia en la cantidad
            bill.totalAmount += quantityDifference * itemToUpdate.unitPrice;

            // Actualizar el stock del producto en base a la diferencia en la cantidad
            const productInfo = await Product.findById(itemToUpdate.product);
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
