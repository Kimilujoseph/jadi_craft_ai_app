import { App } from "./express-app.js";
import express from "express";
import http from 'http';
import { WebSocketServer } from 'ws';
import { connectWithRetry } from "./database/connection.js";
import webSocketManager from './utils/WebSocketManager.js';
import jwt from 'jsonwebtoken';
import prisma from './database/client.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    await App(app);
    await connectWithRetry();

    wss.on('connection', (ws) => {
        let userId = null; // To store the userId for this connection

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === 'auth' && data.token) {
                    try {
                        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);

                        // Check if user exists in the database
                        const user = await prisma.uSERS.findUnique({
                            where: { user_id: decoded.id }, // CORRECTED: Use decoded.id
                        });
                        console.log("Authenticated user:", user);

                        if (user) {
                            userId = user.user_id.toString();
                            webSocketManager.addClient(userId, ws);
                            ws.send(JSON.stringify({ type: 'auth_success', message: 'Authentication successful' }));
                        } else {
                            throw new Error('User not found.');
                        }
                    } catch (error) {
                        ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid or expired token.' }));
                        ws.close();
                    }
                }
            } catch (error) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            if (userId) {
                webSocketManager.removeClient(userId);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            if (userId) {
                webSocketManager.removeClient(userId);
            }
        });
    });

    server.listen(PORT, () => {
        console.log(`The server is listening on port ${PORT}`);
    });
};

startServer();
