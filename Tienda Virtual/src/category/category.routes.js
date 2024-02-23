import express from 'express'


import {
    testCategory,
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory,
    deleteCategory
} from './category.controller.js';
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';


const api = express.Router();

//Rutas publicas 
api.get('/getAllCategories', getAllCategories)
api.get('/getCategory/:id', getCategoryById)

// Rutas privadas protegidas por middleware 
api.get( '/testCategory', [validateJwt],testCategory); //prueba de conexion al servidor
api.post('/createCategory', [validateJwt, isAdmin], createCategory)
api.put('/UptadeCategory/:id',[validateJwt,isAdmin],updateCategory)
api.delete('/DeleteCategory/:id',[validateJwt,isAdmin],deleteCategory)



export default api