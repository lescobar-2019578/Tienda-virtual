'use strict'

import { checkUpdateClient } from '../utils/validator.js'
import Category from './category.model.js'
import Product from '../product/product.model.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}


// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
    try {
        let categories = await Category.find() 
        res.send(categories) 
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' }) 
    }
}

// Obtener una categoría por su ID
export const getCategoryById = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id) 
        if (!category) {
            return res.status(404).send({ error: 'Category not found' }) 
        }
        res.send(category) 
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' }) 
    }
}

// Crear una nueva categoría
export const create = async (req, res) => {
    try {
        let newCategory = new Category(req.body) 
        await newCategory.save() 
        res.send(newCategory) 
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' }) 
    }
}

// Actualizar una categoría
export const update = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdateClient(data, id)
        if (update === false) return res.status(400).send({ message: 'enter all data' })
        let updatedCategory = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updatedCategory) return res.status(401).send({ message: 'Category not found and not updated' })
        res.send({ message: 'Updated category', updatedCategory })
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' })
    }
}

// Eliminar una categoría
export const deleteC = async (req, res) => {
    try {
        let { id } = req.params 
        
        let targetCategory = await Category.findCategoryById(id) 
        if (!targetCategory) {
            return res.status(404).send({ message: 'Category not found' }) 
        }

        let defaultCategory = await Category.findDefaultCategory() 
        if (!defaultCategory) {
            return res.status(404).send({ message: 'Default category not found' }) 
        }

        let updateProducts = await Product.updateProductsCategory(targetCategory._id, defaultCategory._id) 

        let deletedCategory = await Category.removeCategory(id) 
        if (!deletedCategory) {
            return res.status(404).send({ message: 'Error deleting category' }) 
        }

        return res.send({ message: `Category "${deletedCategory.name}" deleted successfully` }) 
    } catch (error) {
        console.error(error) 
        return res.status(500).send({ message: 'Internal server error' }) 
    }
} 

export const defaultCategory = async () => {
    try {
        let create = await Category.findOne({name: 'Default'}) 

        if (create) {
            return  
        }
        let defaultCategoryData = {
            name: 'Default',
            description: 'Default category'
        } 

        let defaultCategory = new Category(defaultCategoryData) 
        await defaultCategory.save() 
        console.log('Category for default created with name is "Default" and description "Default category"')


    } catch (error) {
        console.error(error) 
    }
} 

