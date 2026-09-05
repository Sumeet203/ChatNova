import { api, API_BASE_URL } from "../../../config/config";

export const sendMessageStream = async ({ message, chatId, signal, onEvent }) => {
    const response = await fetch(`${API_BASE_URL}/api/chats/message`, {
        method: "POST",
        credentials: "include",
        signal,
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message, chatId }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Unable to start chat stream (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const processEvent = (frame) => {
        const event = frame.match(/^event: ?(.+)$/m)?.[1];
        const data = frame.match(/^data: ?(.+)$/m)?.[1];
        if (!event || !data) return;
        onEvent(event, JSON.parse(data));
    };

    while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            processEvent(buffer.slice(0, boundary));
            buffer = buffer.slice(boundary + 2);
        }
        if (done) break;
    }
};

export const getChats = async () =>{
    const response = await api.get("/api/chats/getchats");
    return response.data;
}

export const getMessages = async (chatId) =>{
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
};
export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`);
    return response.data;
}
