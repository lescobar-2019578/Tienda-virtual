//Validar diferentes datos.
'use strict'

import { hash, compare } from 'bcrypt'

//Encriptar la contraseña
export const encrypt = (password)=>{
    try{
        return hash(password, 10)
    }catch(err){
        console.error(err)
        return err
    }
}

//Validar la contraseña
export const checkPassword = async(password, hash)=>{
    try{
        return await compare(password, hash)
    }catch(err){
        console.error(err);
        return err
    }
}

export const checkUpdate = (data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' ||
            data.role ||
            data.role == ''
        ) {
            return false
        }
        return true
    }
}

export const checkUpdateClient = (data, id) => {
    if (id) {
        if (
            Object.entries(data).length === 0 ||
            data.name == '' ||
            data.description == '' ||
            data.password ||
            data.password == '' ||
            data.role == '' ||
            data.role

        ) {
            return false
        }
        return true
    } else {
        if (
            Object.entries(data).length === 0 ||
            data.category ||
            data.category == ''
        ) {
            return false
        }
        return true
    }
}