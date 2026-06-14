import express from 'express';
import { loginUser, registerUser } from '../controllers/authController';
import { validateRegister, validateLogin } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

export default router;
