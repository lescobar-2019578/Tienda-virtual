'use strict'

import Product from './product.model.js' 
import Category from '../category/category.model.js'
import mongoose from 'mongoose';

export const testProduct = (req, res) => {
  console.log('test') 
  return res.send({ message: 'Test is running' }) 
}

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find().populate('category') 
    res.send(products) 
  } catch (error) {
    res.status(500).send({ error: 'they can not be seen the products' }) 
  }
}

// Obtener un producto por su ID
export const getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id) 
    if (!product) {
      return res.status(404).send({ error: 'Product not found' }) 
    }
    res.send(product) 
  } catch (error) {
    res.status(500).send({ error: 'The product was not found' }) 
  }
}

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    let data = req.body
    let category = await Category.findOne({ _id: data.category }) 
    if (!category) return res.status(404).send({ message: "Category does not exist" })
    let newProduct = new Product(data) 
    await newProduct.save() 
    return res.send({ message: `You just added ${newProduct.name} to the store!` }) 
  } catch (error) {
    res.status(500).send({ error: 'could not be added product' }) 
  }
}

// Actualizar un producto
export const updateProduct = async (req, res) => {
  try {
    let updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }) 
    if (!updatedProduct) {
      return res.status(404).send({ error: 'Product not found' }) 
    }
    res.send(updatedProduct) 
  } catch (error) {
    res.status(500).send({ error: 'Could not update product' }) 
  }
}

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    let deletedProduct = await Product.findByIdAndDelete(req.params.id) 
    if (!deletedProduct) {
      return res.status(404).send({ error: 'Product not found' }) 
    }
    res.send(deletedProduct) 
  } catch (error) {
    res.status(500).send({ error: 'Could not delete product' }) 
  }
}

// Productos agotados
export const soldOut = async (req, res) => {
  try {
      let data = await Product.findOne({stock: 0}).populate('category') 
      if (!data) {
      return res.status(444).send({ message: "No out-of-stock products found" }) 
      }
      return res.send({data}) 
  } catch (error) {
      console.error(error) 
      return res.status(500).send({ message: 'Failed to retrieve out-of-stock products' }) 
  }
} 

// Obtener los productos mas vendidos
export const getTopSellingProducts = async (req, res) => {
  try {
    let allProducts = await Product.find();

    // Ordenar los productos por cantidad vendida de forma descendente
    allProducts.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);

    // Tomar los primeros 10 productos de la lista ordenada
    let topSellingProducts = allProducts.slice(0, 10);

    // Retornar los detalles de los productos más vendidos
    return res.send(topSellingProducts); 
  } catch (err) {
      console.error(err) 
      return res.status(500).send({ message: 'Error retrieving top selling products', error: err }) 
  }
} 

// Buscar los productos que tiene la categoria
export const getProductsByCategory = async (req, res) => {
  try {
      let { id } = req.params 

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid category -- Not Found Category' }) 
      }

      let products = await Product.find({category: id}) 

      return res.send(products) 
  } catch (error) {
      console.error(error) 
      return res.status(500).send({ message: 'Error retrieving products by category', error: error }) 
  }
} 


