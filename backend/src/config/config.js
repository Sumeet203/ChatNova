import dotenv from "dotenv";
dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL || "https://chatnova-dshx.onrender.com";
export const FRONTEND_URL = process.env.FRONTEND_URL || "https://chat-nova-virid.vercel.app";
export const PORT = process.env.PORT || 3000;
