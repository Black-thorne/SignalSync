const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to SignalSync'
    }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`SignalSync server running on port ${PORT}`);
});