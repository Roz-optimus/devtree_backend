import User from "../models/User";
import {  validationResult } from "express-validator";
import type { Request, Response} from "express"; 
import formidable from 'formidable';
import {v4 as uuid} from 'uuid';
import slug from "slug";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import cloudinary from "../config/cloudinary";

//Royner garcia
export const createAccount = async (req: Request, res: Response) => {

   

     const {email, password}= req.body;
     
     const userExist= await User.findOne({email})
     if(userExist){
        const error= new Error("El email ya esta registrado");
         res.status(409).json({message: error.message});
         return;
     }

     const handle= slug(req.body.handle, '')
     const handleExist= await User.findOne({handle})
     if(handleExist){
        const error= new Error("Nombre de usuario ya existe");
         res.status(409).json({message: error.message});
         return;
     }
     
     const user = new User(req.body);
     user.password= await hashPassword(password);
     user.handle= handle;

    await user.save();
    res.status(201).send('Registro exitoso');
};

export const login = async (req: Request, res: Response) => {
    let errors= validationResult(req);
    if(!errors.isEmpty()){
         res.status(400).json({errors: errors.array()});
         return;
    }

    const {email, password}= req.body;

    const user= await User.findOne({email});
    if(!user){
        const error= new Error("Email no existe");
        res.status(404).json({message: error.message});
        return;
    }
  
  
    const isPasswordCorrect = await checkPassword(password, user.password);
    if(!isPasswordCorrect){
        const error= new Error("Password incorrecto");
        res.status(401).json({message : error.message});	
        return;
    }

    const token = generateJWT({id: user._id});
    res.send(token)
};

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
};

export const uptadeProfile = async (req : Request, res: Response) => {
    try {
        const {description, links}= req.body

        const handle= slug(req.body.handle, '')
        const handleExist= await User.findOne({handle})
        if(handleExist && handleExist.email !== req.user.email){
           const error= new Error("Nombre de usuario ya existe");
            res.status(409).json({error: error.message});
            return;
        }
        req.user.description = description
        req.user.handle= handle
        req.user.links= links
        await req.user.save()
        res.send('Perfil actualizado Correctamente')

    } catch (e) {
        const error = new Error ('Hubo un error')
         res.status(500).json({error: error.message})
         return;
    }
};
export const uploadImage = async (req: Request, res: Response) => {
    const form= formidable({multiples:false})
    
    try { 
        form.parse(req, (error, fields, files)=> {
            
            cloudinary.uploader.upload(files.file[0].filepath, {public_id: uuid()}, async function(error, result){
             if(error){
                const erro = new Error('Hubo un error al subir la imagen')
                return res.status(500).json({error: error.message})
             }
               if(result){
                req.user.image = result.secure_url
                await req.user.save()
                res.json({image: result.secure_url})
               }
            })

        })
  } catch (e) {
    const error = new Error('hubo un error')
    res.status(500).json({error: error.message})
    return;
  }
   
};

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const {handle}= req.params
        const user = await User.findOne({handle})

        console.log(user)
        if(!user){
            const error = new Error ('El usuario no existe')
            res.status(500).json({error: error.message})  
            return;
        }
        res.json(user)
    }catch (e){
        const error = new Error('hubo un error')
        
    }
}

export const searchByHandle = async (req: Request, res: Response) => {
  try {
    const {handle}= req.body
    const userExist = await User.findOne({handle})
    if(userExist){
        const error = new Error (`${handle} ya esta registrado`)
        res.status(409).json({error: error.message})  
        return;
    }
    res.send(`${handle} esta disponible`)

  } catch (e) {
    const error = new Error ('El usuario no existe')
            res.status(500).json({error: error.message})  
            return;
  }  
}