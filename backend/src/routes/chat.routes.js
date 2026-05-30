import {Router} from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { sendMessage } from '../controllers/chat.controller.js';
const chatRouter = Router();

chatRouter.post('/message',authMiddleware,sendMessage);    

export default chatRouter;
