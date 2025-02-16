class SignalManager {
    constructor() {
        this.signals = new Map();
        this.subscribers = new Set();
        this.interval = null;

        this.initializeMockSignals();
    }

    initializeMockSignals() {
        this.addSignal('cpu_usage', {
            name: 'CPU Usage',
            type: 'percentage',
            unit: '%',
            value: 0,
            lastUpdated: new Date()
        });

        this.addSignal('memory_usage', {
            name: 'Memory Usage',
            type: 'percentage',
            unit: '%',
            value: 0,
            lastUpdated: new Date()
        });

        this.addSignal('network_rx', {
            name: 'Network RX',
            type: 'throughput',
            unit: 'MB/s',
            value: 0,
            lastUpdated: new Date()
        });

        this.addSignal('response_time', {
            name: 'Response Time',
            type: 'latency',
            unit: 'ms',
            value: 0,
            lastUpdated: new Date()
        });
    }

    addSignal(id, config) {
        this.signals.set(id, {
            id,
            ...config,
            history: []
        });
    }

    updateSignal(id, value) {
        const signal = this.signals.get(id);
        if (signal) {
            signal.value = value;
            signal.lastUpdated = new Date();

            signal.history.push({
                value,
                timestamp: new Date()
            });

            if (signal.history.length > 100) {
                signal.history.shift();
            }

            this.broadcastUpdate(id, signal);
        }
    }

    getSignal(id) {
        return this.signals.get(id);
    }

    getAllSignals() {
        return Array.from(this.signals.values());
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }

    broadcastUpdate(signalId, signal) {
        const updateData = {
            type: 'signal_update',
            signal: {
                id: signalId,
                name: signal.name,
                value: signal.value,
                unit: signal.unit,
                lastUpdated: signal.lastUpdated
            }
        };

        this.subscribers.forEach(callback => {
            try {
                callback(updateData);
            } catch (error) {
                console.error('Error broadcasting to subscriber:', error);
            }
        });
    }

    startMockUpdates() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            this.updateSignal('cpu_usage', Math.random() * 100);
            this.updateSignal('memory_usage', 30 + Math.random() * 40);
            this.updateSignal('network_rx', Math.random() * 50);
            this.updateSignal('response_time', 50 + Math.random() * 200);
        }, 2000 + Math.random() * 3000);
    }

    stopMockUpdates() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = SignalManager;