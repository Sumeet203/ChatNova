import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isStreaming: false,
        hasReceivedFirstChunk: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, id } = action.payload
            if (state.chats[chatId]) {
                state.chats[chatId].messages.push({ id, content, role })
                state.chats[chatId].lastUpdated = new Date().toISOString()
            }
        },
        appendToMessage: (state, action) => {
            const { chatId, messageId, text } = action.payload
            const message = state.chats[chatId]?.messages.find((item) => item.id === messageId)
            if (message) message.content += text
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.chats[ chatId ].messages.push(...messages)
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setStreaming: (state, action) => {
            state.isStreaming = action.payload
        },
        setHasReceivedFirstChunk: (state, action) => {
            state.hasReceivedFirstChunk = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const { setChats, setCurrentChatId, setLoading, setError, createNewChat, addNewMessage, appendToMessage, addMessages, setStreaming, setHasReceivedFirstChunk } = chatSlice.actions
export default chatSlice.reducer
