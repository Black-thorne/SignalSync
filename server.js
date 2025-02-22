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
app.use(express.json());

// API endpoints
app.get('/api/signals', (req, res) => {
    res.json({
        signals: signalManager.getAllSignals(),
        config: signalManager.config
    });
});

app.get('/api/signals/:id', (req, res) => {
    const signal = signalManager.getSignal(req.params.id);
    if (signal) {
        res.json(signal);
    } else {
        res.status(404).json({ error: 'Signal not found' });
    }
});

app.get('/api/signals/:id/history', (req, res) => {
    const signal = signalManager.getSignal(req.params.id);
    if (signal) {
        res.json({
            id: signal.id,
            name: signal.name,
            history: signal.history
        });
    } else {
        res.status(404).json({ error: 'Signal not found' });
    }
});

app.get('/api/export/:format', (req, res) => {
    const format = req.params.format.toLowerCase();
    const signals = signalManager.getAllSignals();

    switch (format) {
        case 'json':
            res.setHeader('Content-Disposition', 'attachment; filename=signals.json');
            res.json(signals);
            break;
        case 'csv':
            const csvData = signalsToCsv(signals);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=signals.csv');
            res.send(csvData);
            break;
        default:
            res.status(400).json({ error: 'Unsupported format' });
    }
});

function signalsToCsv(signals) {
    const headers = ['id', 'name', 'type', 'value', 'unit', 'lastUpdated'];
    const rows = [headers.join(',')];

    signals.forEach(signal => {
        const row = [
            signal.id,
            `"${signal.name}"`,
            signal.type,
            signal.value,
            signal.unit,
            signal.lastUpdated
        ];
        rows.push(row.join(','));
    });

    return rows.join('\n');
}

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