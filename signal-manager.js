const fs = require('fs');
const path = require('path');

class SignalManager {
    constructor() {
        this.signals = new Map();
        this.subscribers = new Set();
        this.intervals = new Map();
        this.config = this.loadConfig();

        this.initializeSignalsFromConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, 'config', 'signals.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('Error loading config, using defaults:', error.message);
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            signals: {
                system: {
                    cpu_usage: {
                        name: 'CPU Usage',
                        type: 'percentage',
                        unit: '%',
                        enabled: true,
                        updateInterval: 3000,
                        thresholds: { warning: 70, critical: 90 }
                    }
                }
            },
            refreshRate: 2000,
            maxHistory: 100
        };
    }

    initializeSignalsFromConfig() {
        Object.entries(this.config.signals).forEach(([category, signals]) => {
            Object.entries(signals).forEach(([id, config]) => {
                if (config.enabled) {
                    this.addSignal(id, {
                        ...config,
                        category,
                        value: 0,
                        lastUpdated: new Date()
                    });
                }
            });
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

            if (signal.history.length > this.config.maxHistory) {
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
        this.signals.forEach((signal, id) => {
            if (!this.intervals.has(id)) {
                const interval = setInterval(() => {
                    let value;
                    switch (signal.type) {
                        case 'percentage':
                            value = Math.random() * 100;
                            break;
                        case 'throughput':
                            value = Math.random() * 100;
                            break;
                        case 'latency':
                            value = 50 + Math.random() * 500;
                            break;
                        default:
                            value = Math.random() * 100;
                    }
                    this.updateSignal(id, value);
                }, signal.updateInterval || this.config.refreshRate);

                this.intervals.set(id, interval);
            }
        });
    }

    stopMockUpdates() {
        this.intervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.intervals.clear();
    }
}

module.exports = SignalManager;