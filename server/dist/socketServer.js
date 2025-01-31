import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
const { verify } = jwt;
dotenv.config();
const clients = new Map();
export const initializeWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        const token = req.headers['sec-websocket-protocol'];
        if (!token) {
            ws.close(1008, 'Unauthorized');
            return;
        }
        try {
            const decoded = verify(token, process.env.JWT_SECRET);
            const student_id = decoded.id;
            clients.set(student_id, ws);
            console.log(`WebSocket подключен для пользователя ${student_id}`);
            ws.on('close', () => {
                clients.delete(student_id);
                console.log(`WebSocket отключен для пользователя ${student_id}`);
            });
        }
        catch (error) {
            ws.close(1008, 'Invalid token');
        }
    });
};
export const notifyUser = (student_id, data) => {
    const client = clients.get(student_id);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
};
