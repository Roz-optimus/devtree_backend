import { Router } from "express";
import {body} from "express-validator";
import { createAccount, getUser, getUserByHandle, login, searchByHandle, uploadImage, uptadeProfile } from "./handlers"; 
import { handleInputErros } from "./middleware/validation";
import { authenticate } from "./middleware/auth";
const router = Router();

//rutas

router.post('/auth/register',
    body('handle').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El email es requerido'),
    body('password').isLength({min:6}).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleInputErros,
    createAccount
); 
    
router.post('/auth/login', 
    body('email').isEmail().withMessage('El email es requerido'),
    body('password').isLength({min:6}).withMessage('La contraseña es requerida'),
    handleInputErros,
    login
)    

router.get('/user', authenticate, getUser)

router.patch('/user', 
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
  
    handleInputErros,
    authenticate, 
    uptadeProfile)

router.post('/user/image', authenticate, uploadImage)

router.get('/:handle', getUserByHandle)

router.post('/search', 
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
    handleInputErros,
    searchByHandle)

export default router;