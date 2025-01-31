import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const { verify } = jwt;

dotenv.config();

const clients: Map<string, WebSocket> = new Map();

export const initializeWebSocketServer = (
  server: import('http').Server
): void => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const token = req.headers['sec-websocket-protocol'] as string;

    if (!token) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      const student_id = decoded.id;

      clients.set(student_id, ws);

      console.log(`WebSocket подключен для пользователя ${student_id}`);
      console.log('прив');

      ws.on('close', () => {
        clients.delete(student_id);
        console.log(`WebSocket отключен для пользователя ${student_id}`);
      });
    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  });
};

export const notifyUser = (student_id: string, data: object): void => {
  const client = clients.get(student_id);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};
