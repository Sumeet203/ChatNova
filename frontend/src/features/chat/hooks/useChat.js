import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessageStream, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, appendToMessage, addMessages, setStreaming, setHasReceivedFirstChunk } from "../chat.slice";
import { useDispatch } from "react-redux";
import { useRef } from "react";


export const useChat = () => {

    const dispatch = useDispatch();
    const activeStreamRef = useRef(null);
    
    async function handleSendMessage({ message, chatId }) {
        if (activeStreamRef.current) return;

        const controller = new AbortController();
        activeStreamRef.current = controller;
        dispatch(setLoading(true));
        dispatch(setStreaming(true));
        dispatch(setHasReceivedFirstChunk(false));
        dispatch(setError(null));

        let activeChatId = chatId;
        const assistantMessageId = crypto.randomUUID();
        try {
            await sendMessageStream({
                message,
                chatId,
                signal: controller.signal,
                onEvent: (event, data) => {
                    if (event === "init") {
                        activeChatId = data.chatId;
                        if (data.chat) {
                            dispatch(createNewChat({ chatId: activeChatId, title: data.title }));
                        }
                        dispatch(addNewMessage({ chatId: activeChatId, content: message, role: "user", id: crypto.randomUUID() }));
                        dispatch(addNewMessage({ chatId: activeChatId, content: "", role: "ai", id: assistantMessageId }));
                        dispatch(setCurrentChatId(activeChatId));
                    }
                    if (event === "chunk") {
                        dispatch(setHasReceivedFirstChunk(true));
                        dispatch(appendToMessage({ chatId: activeChatId, messageId: assistantMessageId, text: data.text }));
                    }
                    if (event === "error") {
                        throw new Error(data.message);
                    }
                },
            });
        } catch (error) {
            if (error.name !== "AbortError") {
                dispatch(setError(error.message || "Unable to generate a response."));
            }
        } finally {
            if (activeStreamRef.current === controller) activeStreamRef.current = null;
            dispatch(setLoading(false));
            dispatch(setStreaming(false));
            dispatch(setHasReceivedFirstChunk(false));
        }
    }

    function cancelActiveStream() {
        activeStreamRef.current?.abort();
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt || chat.createdAt || new Date().toISOString(),
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId,chats) {
        if(chats[chatId]?.messages.length == 0){
        const data = await getMessages(chatId);
        const {messages} = data;
        const formattedmessages = messages.map(msg=>({
            content : msg.content,  
            role : msg.role
        }));
        dispatch(addMessages({
            chatId,
            messages : formattedmessages
        }));
        }
        dispatch(setCurrentChatId(chatId));
    }

    function handleOpenNewChat(){
        dispatch(setCurrentChatId(null));
    }

    function handleDeleteChat(chatId){
        deleteChat(chatId);
        dispatch(setCurrentChatId(null));
        dispatch(setChats((prevChats)=>{
            const updatedChats = {...prevChats};
            delete updatedChats[chatId];
            return updatedChats;
        }));
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleOpenNewChat,
        handleDeleteChat,
        cancelActiveStream,
    }

}
