import axios from "axios";

export const API_BASE_URL = "https://chatnova-dshx.onrender.com";

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});
