import {Router} from 'express';
import { authMiddleware, verifiedAuthMiddleware } from '../middleware/auth.middleware.js';
import { sendMessage,getChats, getMessages, deleteChat,deleteMessage} from '../controllers/chat.controller.js';
const chatRouter = Router();

chatRouter.use(authMiddleware, verifiedAuthMiddleware);
chatRouter.post('/message',sendMessage);
chatRouter.get("/getchats",getChats);
chatRouter.get("/:chatId/messages",getMessages);
chatRouter.delete("/delete/:chatId",deleteChat);
chatRouter.delete("/message/delete/:messageId",deleteMessage);
export default chatRouter;
