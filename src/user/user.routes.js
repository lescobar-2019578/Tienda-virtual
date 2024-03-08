import express from 'express'
import { 
    validateJwt,
    isAdmin
} from '../middlewares/validate-jwt.js';
import {
    test,
    registerAdmin, 
    registerClient,
    login, 
    update, 
    deleteU
} from './user.controller.js';

const api = express.Router();

//RUTAS PÚBLICAS
api.post('/registerAdmin', registerAdmin)
api.post('/registerClient', registerClient)
api.post('/login', login)

//RUTAS PRIVADAS (solo usuarios logeados)
                  //Middleware
api.get('/test', [validateJwt, isAdmin], test)
api.put('/update/:id', [validateJwt], update) //Middleware -> funciones intermedias que sirven para validar.
api.delete('/delete/:id', [validateJwt, isAdmin], deleteU)

export default api