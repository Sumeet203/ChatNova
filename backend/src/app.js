import cookieParser from 'cookie-parser';
import express from 'express'
import authRouter from './routes/auth.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import chatRouter from './routes/chat.routes.js';
import { FRONTEND_URL } from './config/config.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
const allowedOrigin = FRONTEND_URL;

app.use(cors({
    origin : allowedOrigin,
    credentials : true, 
    methods : ['GET','POST','PUT','DELETE'],
}));
app.use("/api/auth",authRouter);
app.use("/api/chats",chatRouter);
app.get("/",(req,res)=>{
    res.send("Welcome to Perpexility API");
});
export default app;
