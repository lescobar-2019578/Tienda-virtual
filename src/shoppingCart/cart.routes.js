import { Router } from "express";
import {
     test, 
     create
     
    } from "./cart.controller.js";
import { isClient, validateJwt} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/create', [validateJwt, isClient], create)
export default api