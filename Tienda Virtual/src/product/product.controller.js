'use strict'

import Product from './product.model.js';
import Category from '../category/category.model.js'

export const testProduct = (req, res) => {
  console.log('test');
  return res.send({ message: 'Test is running' });
}

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: 'they can not be seen the products' });
  }
}

// Obtener un producto por su ID
export const getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ error: 'The product was not found' });
  }
}

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    let data = req.body
    let category = await Category.findOne({ _id: data.category });
    if (!category) return res.status(404).send({ message: "Category does not exist" })
    let newProduct = new Product(data);
    await newProduct.save();
    return res.status(200).send({ message: `You just added ${newProduct.name} to the store!` });
  } catch (error) {
    res.status(500).send({ error: 'could not be added product' });
  }
}

// Actualizar un producto
export const updateProduct = async (req, res) => {
  try {
    let updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(500).send({ error: 'Could not update product' });
  }
}

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    let deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.status(200).send(deletedProduct);
  } catch (error) {
    res.status(500).send({ error: 'Could not delete product' });
  }
}



