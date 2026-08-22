import { Server } from "socket.io";

let io;

export function initSocket(httpServer){
    io = new Server(httpServer,{
        cors : {
            origin : "https://chat-nova-bsq4lqxct-sumeets-projects-74908129.vercel.app/",
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