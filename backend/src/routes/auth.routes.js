import {Router} from 'express';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';
import { getMe, login, register, resendEmailVerificationLink, verifyEmail,logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register",registerValidator,register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }    
 */
authRouter.post("/login",loginValidator,login);

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private  
 */
authRouter.get("/get-me",authMiddleware,getMe);
/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get("/verify-email",verifyEmail);

/**
 * @route GET /api/auth/resend-verification-email
 * @desc Resend verification email to user
 * @access Public
 */
authRouter.get("/resend-verification-email",authMiddleware,resendEmailVerificationLink);
authRouter.get("/logout",authMiddleware,logout);
export default authRouter;
