class SignalSyncClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;

        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.statusEl = document.getElementById('connectionStatus');
        this.logArea = document.getElementById('logArea');

        this.initEventListeners();
    }

    initEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    connect() {
        if (this.ws) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.log(`Connecting to ${wsUrl}...`);

        try {
            this.ws = new WebSocket(wsUrl);
            this.setupWebSocketHandlers();
        } catch (error) {
            this.log(`Connection error: ${error.message}`, 'error');
        }
    }

    setupWebSocketHandlers() {
        this.ws.onopen = () => {
            this.isConnected = true;
            this.updateUI();
            this.log('Connected to SignalSync server');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                this.log(`Failed to parse message: ${event.data}`);
            }
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            this.ws = null;
            this.updateUI();
            this.log('Disconnected from server');
        };

        this.ws.onerror = (error) => {
            this.log('WebSocket error occurred', 'error');
        };
    }

    handleMessage(data) {
        this.log(`Received: ${data.type} - ${data.message || JSON.stringify(data)}`);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    updateUI() {
        this.connectBtn.disabled = this.isConnected;
        this.disconnectBtn.disabled = !this.isConnected;

        this.statusEl.textContent = this.isConnected ? 'Connected' : 'Disconnected';
        this.statusEl.className = `status ${this.isConnected ? 'connected' : 'disconnected'}`;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;

        this.logArea.appendChild(entry);
        this.logArea.scrollTop = this.logArea.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.client = new SignalSyncClient();
});