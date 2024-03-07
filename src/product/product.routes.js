import express from 'express'

import {
    testProduct,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    soldOut,
    getTopSellingProducts,
    getProductsByCategory
} from './product.controller.js';
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';

const api = express.Router()

//Rutas publicas 
api.get('/getAllProducts', getAllProducts)
api.get('/getProduct/:id', getProductById)

// Rutas privadas protegidas por middleware (seccion de autentic)
api.get( '/testProduct', [validateJwt],testProduct) //prueba de conexion al servidor
api.post('/createProduct', [validateJwt, isAdmin], createProduct)
api.put('/UptadeProduct/:id',[validateJwt,isAdmin],updateProduct)
api.delete('/DeleteProduct/:id',[validateJwt,isAdmin],deleteProduct)
api.get('/soldOut',[validateJwt, isAdmin],  soldOut)
api.get('/getTopProducts',[validateJwt, isAdmin],  getTopSellingProducts)
api.get('/getProductsByCategory/:id',[validateJwt, isAdmin],  getProductsByCategory)



export default api;