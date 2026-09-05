import { generateChatTitle, generateResponseStream } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
function sendStreamEvent(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function getChats(req,res){
    const user = req.user;
    const chats = await chatModel.find({user:user.id}).sort({ updatedAt: -1, createdAt: -1 });
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

export async function sendMessage(req,res){
    const {message, chatId} = req.body;
    const abortController = new AbortController();
    let clientDisconnected = false;

    res.set({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    res.on("close", () => {
        clientDisconnected = true;
        abortController.abort();
    });

    try {
        let chat = null;
        let title = null;
        if (!chatId) {
            title = await generateChatTitle(message);
            chat = await chatModel.create({ user: req.user.id, title });
        } else {
            chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
            if (!chat) {
                sendStreamEvent(res, "error", { message: "Chat not found" });
                return res.end();
            }
        }

        const activeChatId = chat._id;
        chat.updatedAt = new Date();
        await chat.save();
        await messageModel.create({ chat: activeChatId, content: message, role: "user" });
        const messages = await messageModel.find({ chat: activeChatId }).sort({ createdAt: 1 });

        // The init event lets the client create the user message and exactly one
        // empty assistant message before the first model token arrives.
        sendStreamEvent(res, "init", {
            chat: !chatId ? chat : null,
            title,
            chatId: activeChatId.toString(),
        });

        let content = "";
        for await (const chunk of generateResponseStream(messages, abortController.signal)) {
            if (clientDisconnected) return;
            content += chunk;
            sendStreamEvent(res, "chunk", { text: chunk });
        }

        if (clientDisconnected) return;
        const aiMessage = await messageModel.create({
            chat: activeChatId,
            content,
            role: "ai",
        });
        sendStreamEvent(res, "done", { aiMessage });
        res.end();
    } catch (error) {
        if (!clientDisconnected) {
            console.error("Chat stream failed:", error);
            sendStreamEvent(res, "error", { message: "Unable to generate a response. Please try again." });
            res.end();
        }
    }
};