import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
    export async function sendMessage(req,res){
        const {message, chatId} = req.body;
        let chat=null , title = null;
        if(!chatId){
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user : req.user.id,
                title 
            });
        }
        
        const userMessage = await messageModel.create({
            chat: chatId || chat._id,
            content: message,
            role: "user"
        }) 
        const messages = await messageModel.find({chat : chatId || chat._id});
        console.log(messages);  
        
        const result = await generateResponse(messages);

        const aiMessage= await messageModel.create({
            chat : chatId || chat._id,
            content : result, 
            role : 'ai'
        })
        res.status(201).json({
            aiMessage,
            title : title, 
            chat,
            message
        })
    };

export async function getChats(req,res){
    const user = req.user;
    const chats = await chatModel.find({user:user.id});
    res.status(200).json({
        message : "Chats retrieved successfully",
        chats
    });
} 

export async function getMessages(req,res){
    const {chatId} = req.params;
    const chat = await chatModel.findOne({
        _id : chatId,
        user : req.user.id
    });
    if(!chat){
        return res.status(404).json({
            message : "Chat not found"
        })
    }
    const messages = await messageModel.find({chat : chatId});
    res.status(200).json({
        message : "Messages retrieved successfully",
        messages
    })
};


export async function deleteChat(req,res){
    const {chatId} = req.params;
    const chat = await chatModel.findOneAndDelete({
        _id : chatId,
        user : req.user.id
    });
    await messageModel.deleteMany({chat:chatId});
    if(!chat){
        return res.status(404).json({
            message : "Chat not found"
        })
    };
    re.status(200).json({
        message : "Chat deleted successfully"
    });
}


export async function deleteMessage(req,res){
    const {messageId} = req.params;
    const message = messageModel.findByIdAndDelete(messageId);
    if(!message){
        return res.status(404).json({
            message : "Message not found"
        })
    };
    res.status(200).json({
        message : "Message deleted successfully"
    });
}
