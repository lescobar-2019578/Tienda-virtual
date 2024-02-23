'use strict'

import Category from './category.model.js';

export const testCategory = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}


// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}

// Obtener una categoría por su ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send({ error: 'Category not found' });
        }
        res.status(200).send(category);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).send(newCategory);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}

// Actualizar una categoría
export const updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).send({ error: 'Category not found' });
        }
        res.status(200).send(updatedCategory);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).send({ error: 'Category not found' });
        }
        res.status(200).send(deletedCategory);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}


