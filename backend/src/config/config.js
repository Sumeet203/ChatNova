import dotenv from "dotenv";
dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const PORT = process.env.PORT || 3000;
