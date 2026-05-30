import 'dotenv/config';
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
import http from 'http';
import { initSocket } from './src/sockets/server.socket.js';

const httpServer = http.createServer(app);
initSocket(httpServer);
async function startServer() {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.log("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

startServer();
