class SignalSyncClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.signals = new Map();

        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.statusEl = document.getElementById('connectionStatus');
        this.logArea = document.getElementById('logArea');
        this.signalList = document.getElementById('signalList');
        this.typeFilter = document.getElementById('typeFilter');
        this.searchFilter = document.getElementById('searchFilter');

        this.initEventListeners();
    }

    initEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        this.typeFilter.addEventListener('change', () => this.applyFilters());
        this.searchFilter.addEventListener('input', () => this.applyFilters());
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
        switch (data.type) {
            case 'welcome':
                this.log(`Server: ${data.message}`);
                break;
            case 'initial_signals':
                this.log(`Loaded ${data.signals.length} signals`);
                data.signals.forEach(signal => this.updateSignalDisplay(signal));
                break;
            case 'signal_update':
                this.updateSignalDisplay(data.signal);
                break;
            default:
                this.log(`Unknown message type: ${data.type}`);
        }
    }

    updateSignalDisplay(signal) {
        this.signals.set(signal.id, signal);

        let signalEl = document.getElementById(`signal-${signal.id}`);
        if (!signalEl) {
            signalEl = this.createSignalElement(signal);
            this.signalList.appendChild(signalEl);
        }

        const valueEl = signalEl.querySelector('.signal-value');
        const timestampEl = signalEl.querySelector('.signal-timestamp');

        valueEl.textContent = `${Math.round(signal.value * 100) / 100} ${signal.unit}`;
        timestampEl.textContent = new Date(signal.lastUpdated).toLocaleTimeString();

        signalEl.classList.add('updated');
        setTimeout(() => signalEl.classList.remove('updated'), 500);
    }

    createSignalElement(signal) {
        const div = document.createElement('div');
        div.id = `signal-${signal.id}`;
        div.className = 'signal-card';

        div.innerHTML = `
            <div class="signal-header">
                <h4 class="signal-name">${signal.name}</h4>
                <span class="signal-type">${signal.type || 'metric'}</span>
            </div>
            <div class="signal-body">
                <div class="signal-value">-- ${signal.unit}</div>
                <div class="signal-timestamp">--:--:--</div>
            </div>
        `;

        return div;
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

    applyFilters() {
        const typeFilter = this.typeFilter.value;
        const searchTerm = this.searchFilter.value.toLowerCase();

        this.signals.forEach((signal, id) => {
            const signalEl = document.getElementById(`signal-${id}`);
            if (!signalEl) return;

            const matchesType = typeFilter === 'all' || signal.type === typeFilter;
            const matchesSearch = !searchTerm || signal.name.toLowerCase().includes(searchTerm);

            if (matchesType && matchesSearch) {
                signalEl.style.display = 'block';
            } else {
                signalEl.style.display = 'none';
            }
        });

        const visibleCount = Array.from(this.signalList.children).filter(el => el.style.display !== 'none').length;
        this.log(`Filtered signals: ${visibleCount} of ${this.signals.size} visible`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.client = new SignalSyncClient();
});