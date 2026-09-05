import dotenv from "dotenv";
dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const PORT = process.env.PORT || 3000;
