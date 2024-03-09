import { Router } from "express";
import {
     test, 
     create,
     deleteCart
    } from "./cart.controller.js";
import { isClient, validateJwt} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/create', [validateJwt, isClient], create)
api.delete('/delete',[validateJwt, isClient], deleteCart)
export default api