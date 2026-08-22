import cookieParser from 'cookie-parser';
import express from 'express'
import authRouter from './routes/auth.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import chatRouter from './routes/chat.routes.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
    origin : "https://chat-nova-virid.vercel.app",
    credentials : true, 
    methods : ['GET','POST','PUT','DELETE'],
}));
app.use("/api/auth",authRouter);
app.use("/api/chats",chatRouter);
app.get("/",(req,res)=>{
    res.send("Welcome to Perpexility API");
});
export default app;
