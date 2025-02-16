const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const SignalManager = require('./signal-manager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const signalManager = new SignalManager();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to SignalSync'
    }));

    ws.send(JSON.stringify({
        type: 'initial_signals',
        signals: signalManager.getAllSignals()
    }));

    const signalUpdateHandler = (updateData) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(updateData));
        }
    };

    signalManager.subscribe(signalUpdateHandler);
    signalManager.startMockUpdates();

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received message:', message);
        } catch (error) {
            console.error('Invalid message format:', data.toString());
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        signalManager.unsubscribe(signalUpdateHandler);
    });
});

server.listen(PORT, () => {
    console.log(`SignalSync server running on port ${PORT}`);
});