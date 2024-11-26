const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const clients = new Map(); // Храним соединения по student_id

const initializeWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const token = req.headers['sec-websocket-protocol']; // Извлекаем JWT из заголовков

    if (!token) {
      ws.close(1008, 'Unauthorized'); // Закрываем соединение без токена
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Проверяем токен
      const student_id = decoded.id;

      // Сохраняем соединение
      clients.set(student_id, ws);

      console.log(`WebSocket подключен для пользователя ${student_id}`);

      ws.on('close', () => {
        clients.delete(student_id); // Удаляем соединение при закрытии
        console.log(`WebSocket отключен для пользователя ${student_id}`);
      });
    } catch (error) {
      ws.close(1008, 'Invalid token'); // Закрываем соединение, если токен некорректный
    }
  });
};

// Уведомление клиента о новом анализе
const notifyUser = (student_id, data) => {
  const client = clients.get(student_id);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

module.exports = { initializeWebSocketServer, notifyUser };
