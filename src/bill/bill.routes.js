'use strict'
import {Router} from 'express'
import { update } from './bill.controller.js'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.put('/update/:id', [validateJwt, isAdmin], update)

export default api