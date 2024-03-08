import express from 'express'


import {
    test,
    getAllCategories, 
    getCategoryById, 
    create, 
    update,
    deleteC
} from './category.controller.js';
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';


const api = express.Router();

//Rutas publicas 
api.get('/getAllCategories', getAllCategories)
api.get('/getCategory/:id', getCategoryById)
api.get( '/test',test); //prueba de conexion al servidor

// Rutas privadas protegidas por middleware 
api.post('/create', [validateJwt, isAdmin], create)
api.put('/uptade/:id',[validateJwt,isAdmin],update)
api.delete('/delete/:id',[validateJwt,isAdmin],deleteC)



export default api