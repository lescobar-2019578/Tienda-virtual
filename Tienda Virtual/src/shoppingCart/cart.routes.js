import { Router } from "express";
import { test, add } from "./cart.controller.js";
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/add', [validateJwt, isAdmin], add)

export default api