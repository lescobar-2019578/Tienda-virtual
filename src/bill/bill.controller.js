'use strict'

import Bill from './bill.model.js'
import Product from '../product/product.model.js'

export const updateBillItem = async (req, res) => {
    try {
        let { billId, itemId } = req.params;
        let { newProduct, newQuantity } = req.body;

        if (!newProduct && !newQuantity) {
            return res.status(400).send({ message: 'Both product and quantity are required for update' });
        }

        let bill = await Bill.findBillById(billId);
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }

        let itemToUpdate = bill.items.find(item => item._id.toString() === itemId);
        if (!itemToUpdate) {
            return res.status(404).send({ message: 'Item not found in the bill' });
        }

        if (newProduct) {
            itemToUpdate.product = newProduct;

            let productInfo = await Product.findProductById(newProduct);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            let oldUnitPrice = itemToUpdate.unitPrice;
            itemToUpdate.unitPrice = productInfo.price;

            let priceDifference = (itemToUpdate.unitPrice - oldUnitPrice) * itemToUpdate.quantity;
            bill.total += priceDifference;

            if (newQuantity !== undefined) {
                let oldQuantity = itemToUpdate.quantity;
                let quantityDifference = newQuantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await updateProductStock(productInfo);
            }
        }
        if (newQuantity !== undefined) {
            let oldQuantity = itemToUpdate.quantity;
            let quantityDifference = newQuantity - oldQuantity;
            itemToUpdate.quantity = newQuantity;

            let priceDifference = quantityDifference * itemToUpdate.unitPrice;
            bill.total += priceDifference;

            let productInfo = await findProductById(itemToUpdate.product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            productInfo.stock -= quantityDifference;
            await updateProductStock(productInfo);
        }

        await saveBill(bill);

        return res.send({ message: 'Item updated successfully', bill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating item' });
    }
};
