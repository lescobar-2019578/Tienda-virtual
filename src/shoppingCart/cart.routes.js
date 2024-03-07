import { Router } from "express";
import {
     test, 
     create,
     billPDF
    } from "./cart.controller.js";
import { isClient, validateJwt} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/create', [validateJwt, isClient], create)
api.post('/billPDF', [validateJwt, isClient], billPDF)

export default api