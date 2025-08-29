# SignalR Analytics Desktop

A modern desktop application for analyzing SignalR crash game data with real-time monitoring, statistics, and data visualization.

## Features

- **Real-time Connection**: Connect to SignalR WebSocket endpoints
- **Live Analytics**: Monitor crash game multipliers in real-time
- **Statistics Dashboard**: Comprehensive time-based analysis
- **Data Export/Import**: Save and load your statistics
- **Cross-platform**: Windows, macOS, and Linux support
- **Dark Theme**: Modern, eye-friendly interface

## Screenshots

The application features a modern dark theme with:
- Connection management interface
- Real-time crash data visualization
- Statistical analysis tables
- System logs and monitoring

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Development Setup

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create assets directory** and add icons:
   ```
   mkdir assets
   # Add icon.ico (Windows), icon.png (Linux), icon.icns (macOS)
   ```
4. **Run in development mode**:
   ```bash
   npm start
   ```

### Building for Production

Build for all platforms:
```bash
npm run build-all
```

Build for specific platforms:
```bash
npm run build-win    # Windows
npm run build-linux  # Linux
npm run build-mac    # macOS
```

## Project Structure

```
signalr-analytics-desktop/
├── main.js           # Electron main process
├── preload.js        # Secure IPC bridge
├── renderer.js       # Dashboard logic
├── index.html        # Application UI
├── package.json      # Project configuration
├── assets/           # Application icons
│   ├── icon.ico     # Windows icon
│   ├── icon.png     # Linux icon
│   └── icon.icns    # macOS icon
└── dist/            # Built applications
```

## Usage

### Connecting to SignalR

1. **Launch the application**
2. **Navigate to Connection tab**
3. **Enter your SignalR details**:
   - WebSocket URL (e.g., `wss://your-server.com/crashGameHub`)
   - Hub Name (default: `crashGameHub`)
   - Authentication Token (if required)
4. **Click Connect**

### Monitoring Data

- **Analytics tab**: View real-time statistics and crash history
- **Statistics tab**: Analyze time-based performance data
- **Logs tab**: Monitor connection status and system events

### Data Management

- **Export**: File → Export Statistics (Ctrl+E)
- **Import**: File → Import Statistics (Ctrl+I)
- **Auto-save**: Settings and data are automatically saved

## Configuration

### Connection Settings

- **WebSocket URL**: Your SignalR hub endpoint
- **Hub Name**: The SignalR hub identifier
- **Auth Token**: Optional authentication token
- **Auto-reconnect**: Automatic reconnection on disconnect

### Application Settings

- **Data Retention**: How long to keep historical data (1-168 hours)
- **Update Interval**: Data refresh rate (100-5000ms)

## API Integration

### Expected SignalR Message Format

The application expects crash data in this format:
```javascript
{
  "type": "crash",
  "multiplier": 2.45,
  "timestamp": 1634567890000,
  "gameId": "game_12345"
}
```

### WebSocket Connection

The application uses standard WebSocket connections and can be adapted for different SignalR implementations.

## Security Features

- **Context Isolation**: Secure renderer process
- **CSP Headers**: Content Security Policy protection
- **No Node Integration**: Sandboxed renderer environment
- **Secure IPC**: Protected inter-process communication

## Data Storage

Application data is stored in:
- **Windows**: `%APPDATA%/signalr-analytics-desktop/`
- **macOS**: `~/Library/Application Support/signalr-analytics-desktop/`
- **Linux**: `~/.config/signalr-analytics-desktop/`

Files stored:
- `signalr-settings.json` - Application settings
- `signalr-crashdata.json` - Historical crash data

## Troubleshooting

### Connection Issues

1. **Verify WebSocket URL** is correct and accessible
2. **Check firewall settings** for outbound connections
3. **Test connection** using the built-in test feature
4. **Review logs** in the Logs tab for error messages

### Performance Issues

1. **Reduce data retention** period
2. **Increase update interval** to reduce CPU usage
3. **Clear old data** using Reset Data button

### Build Issues

1. **Update Node.js** to version 16 or higher
2. **Clear node_modules**: `rm -rf node_modules && npm install`
3. **Check platform icons** are present in assets folder

## Development

### Code Structure

- **Main Process** (`main.js`): Electron application lifecycle
- **Renderer Process** (`renderer.js`): UI logic and WebSocket handling
- **Preload Script** (`preload.js`): Secure API bridge

### Adding Features

1. **UI Changes**: Modify `index.html` and CSS
2. **Logic Updates**: Update `renderer.js`
3. **IPC Communication**: Use `electronAPI` in preload.js

### Testing

Run in development mode and use Chrome DevTools:
```bash
npm start
# Press F12 to open DevTools
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the Logs tab for error messages
- Review this README for common solutions
- Create an issue in the project repository

## Changelog

### v1.0.0
- Initial release
- SignalR WebSocket connection support
- Real-time crash data monitoring
- Statistics and analytics dashboard
- Cross-platform desktop application
- Data export/import functionality
