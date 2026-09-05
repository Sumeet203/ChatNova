import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/config.js";

let io;

export function initSocket(httpServer){
    io = new Server(httpServer,{
        cors : {
            origin : FRONTEND_URL,
            credentials : true
        }
    });
    console.log("Socket.io server is running");
    io.on("connection",(socket)=>{
        console.log("A user connected:",socket.id);
    });
};

export function getIO(){
    if(!io){
        throw new Error("Socker.io is not initialized");
    }
    return io;
};