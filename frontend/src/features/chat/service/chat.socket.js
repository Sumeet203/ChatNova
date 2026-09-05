import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config/config";

export const initializeSocketConnection = ()=>{
    const socket = io(API_BASE_URL,{
        withCredentials: true
    });
    socket.on("connect",()=>{
        console.log("Connected to Socket.IO server");
    });
}