# SignalSync

A real-time signal synchronization tool built with Node.js and WebSockets. Monitor multiple signal sources with live updates, filtering, and data export capabilities.

## Features

### Real-time Monitoring
- WebSocket-based real-time signal updates
- Live dashboard with animated signal cards
- Connection status and activity logging
- Configurable update intervals per signal type

### Signal Management
- JSON-based configuration system
- Support for multiple signal types (percentage, throughput, latency, counter)
- Individual signal thresholds and metadata
- Historical data tracking with configurable limits

### Filtering & Search
- Filter signals by type (percentage, throughput, latency, counter)
- Real-time search by signal name
- Visual indication of active filters
- Responsive grid layout

### Data Export
- Export signal data to JSON format
- Export signal data to CSV format
- REST API for programmatic access
- Historical data endpoints

### REST API
- `GET /api/signals` - Get all signals with configuration
- `GET /api/signals/:id` - Get specific signal details
- `GET /api/signals/:id/history` - Get signal historical data
- `GET /api/export/json` - Download signals as JSON
- `GET /api/export/csv` - Download signals as CSV

## Getting Started

### Installation
```bash
npm install
```

### Configuration
Edit `config/signals.json` to configure your signals:
```json
{
  "signals": {
    "system": {
      "cpu_usage": {
        "name": "CPU Usage",
        "type": "percentage",
        "unit": "%",
        "enabled": true,
        "updateInterval": 3000,
        "thresholds": {
          "warning": 70,
          "critical": 90
        }
      }
    }
  },
  "refreshRate": 2000,
  "maxHistory": 100
}
```

### Running
```bash
npm start           # Production mode
npm run dev        # Development with auto-reload
```

Server will start on port 3000 (or PORT environment variable).

### Usage
1. Open http://localhost:3000 in your browser
2. Click "Connect" to establish WebSocket connection
3. View real-time signal updates in the dashboard
4. Use filters to search and filter signals
5. Export data using JSON or CSV buttons

## Architecture

- `server.js` - Express server with WebSocket and REST API
- `signal-manager.js` - Core signal management and mock data generation
- `config/signals.json` - Signal configuration and settings
- `public/` - Static web client files
  - `index.html` - Main dashboard interface
  - `client.js` - WebSocket client and UI logic
  - `style.css` - Responsive styling

## Development

The application uses mock data generators for demonstration. In production, replace the mock signal updates with real data sources (APIs, databases, sensors, etc.).

Signal types supported:
- **percentage** - 0-100% values (CPU, memory usage)
- **throughput** - Rate-based metrics (network, requests/sec)
- **latency** - Time-based metrics (response time, ping)
- **counter** - Numeric counters (connections, errors)

## License

MIT