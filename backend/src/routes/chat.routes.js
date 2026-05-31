import {Router} from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { sendMessage,getChats, getMessages, deleteChat,deleteMessage} from '../controllers/chat.controller.js';
const chatRouter = Router();

chatRouter.post('/message',authMiddleware,sendMessage);    
chatRouter.get("/getchats",authMiddleware,getChats);
chatRouter.get("/:chatId/messages",authMiddleware,getMessages);
chatRouter.delete("/delete/:chatId",authMiddleware,deleteChat);
chatRouter.delete("/message/delete/:messageId",authMiddleware,deleteMessage);
export default chatRouter;
