// SignalR Analytics Dashboard - Renderer Process
class SignalRAnalytics {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.crashData = [];
        this.sessionStartTime = null;
        this.settings = {
            autoReconnect: true,
            dataRetention: 24,
            updateInterval: 1000
        };
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.updateTimer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.loadCrashData();
        this.updateUI();
        this.addLog('System initialized', 'info');
        
        // Setup electron menu handlers
        if (window.electronAPI) {
            window.electronAPI.onExportStatistics(this.handleExportRequest.bind(this));
            window.electronAPI.onImportStatistics(this.handleImportRequest.bind(this));
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Connection controls
        document.getElementById('connect-btn').addEventListener('click', () => this.connect());
        document.getElementById('disconnect-btn').addEventListener('click', () => this.disconnect());
        document.getElementById('test-connection-btn').addEventListener('click', () => this.testConnection());

        // Settings
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-data-btn').addEventListener('click', () => this.resetData());

        // Analytics controls
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());
        document.getElementById('refresh-stats-btn').addEventListener('click', () => this.refreshStatistics());

        // Log controls
        document.getElementById('clear-logs-btn').addEventListener('click', () => this.clearLogs());
        document.getElementById('export-logs-btn').addEventListener('click', () => this.exportLogs());

        // Time filter
        document.getElementById('time-filter').addEventListener('change', () => this.refreshStatistics());

        // Auto-save settings on input change
        ['websocket-url', 'hub-name', 'auth-token', 'auto-reconnect', 'data-retention', 'update-interval'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    clearTimeout(this.saveTimeout);
                    this.saveTimeout = setTimeout(() => this.saveSettings(), 1000);
                });
            }
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Refresh data for specific tabs
        if (tabName === 'statistics') {
            this.refreshStatistics();
        }
    }

    async connect() {
        const url = document.getElementById('websocket-url').value.trim();
        const hubName = document.getElementById('hub-name').value.trim();
        const authToken = document.getElementById('auth-token').value.trim();

        if (!url || !hubName) {
            this.addLog('Please enter valid WebSocket URL and Hub Name', 'error');
            return;
        }

        try {
            this.addLog(`Connecting to ${url}...`, 'info');
            this.updateConnectionStatus('connecting');
            
            // Simulate SignalR connection (replace with actual SignalR implementation)
            this.connection = new WebSocket(url.replace('https:', 'wss:').replace('http:', 'ws:'));
            
            this.connection.onopen = () => {
                this.isConnected = true;
                this.sessionStartTime = Date.now();
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                this.addLog('Connected successfully', 'success');
                
                document.getElementById('connect-btn').disabled = true;
                document.getElementById('disconnect-btn').disabled = false;
                
                this.startDataCollection();
            };

            this.connection.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.connection.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.addLog('Connection closed', 'warning');
                
                document.getElementById('connect-btn').disabled = false;
                document.getElementById('disconnect-btn').disabled = true;
                
                this.stopDataCollection();
                
                if (this.settings.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    this.addLog(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'info');
                    setTimeout(() => this.connect(), 5000);
                }
            };

            this.connection.onerror = (error) => {
                this.addLog(`Connection error: ${error.message || 'Unknown error'}`, 'error');
            };

        } catch (error) {
            this.addLog(`Failed to connect: ${error.message}`, 'error');
            this.updateConnectionStatus('disconnected');
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
        this.addLog('Disconnected', 'info');
        this.stopDataCollection();
    }

    testConnection() {
        const url = document.getElementById('websocket-url').value.trim();
        
        if (!url) {
            this.addLog('Please enter a WebSocket URL to test', 'error');
            return;
        }

        this.addLog(`Testing connection to ${url}...`, 'info');
        
        // Simple connectivity test
        const testWs = new WebSocket(url.replace('https:', 'wss:').replace('http:', 'ws:'));
        
        const timeout = setTimeout(() => {
            testWs.close();
            this.addLog('Connection test timed out', 'error');
        }, 5000);

        testWs.onopen = () => {
            clearTimeout(timeout);
            testWs.close();
            this.addLog('Connection test successful', 'success');
        };

        testWs.onerror = () => {
            clearTimeout(timeout);
            this.addLog('Connection test failed', 'error');
        };
    }

    startDataCollection() {
        this.stopDataCollection(); // Clear any existing timer
        
        this.updateTimer = setInterval(() => {
            // Simulate receiving crash data (replace with actual SignalR data handling)
            if (this.isConnected) {
                this.simulateCrashData();
            }
        }, this.settings.updateInterval);
    }

    stopDataCollection() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    simulateCrashData() {
        // Simulate realistic crash game data
        const multiplier = this.generateRealisticMultiplier();
        const crashData = {
            multiplier: multiplier,
            timestamp: Date.now(),
            gameId: Math.random().toString(36).substr(2, 9)
        };
        
        this.addCrashData(crashData);
        this.addLog(`Game crashed at ${multiplier.toFixed(2)}x`, 'crash');
    }

    generateRealisticMultiplier() {
        // Generate realistic crash multipliers based on typical crash game probabilities
        const rand = Math.random();
        
        if (rand < 0.5) {
            // 50% chance for 1.0x - 2.0x
            return 1.0 + Math.random();
        } else if (rand < 0.8) {
            // 30% chance for 2.0x - 5.0x
            return 2.0 + Math.random() * 3;
        } else if (rand < 0.95) {
            // 15% chance for 5.0x - 10.0x
            return 5.0 + Math.random() * 5;
        } else {
            // 5% chance for 10.0x+
            return 10.0 + Math.random() * 40;
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Handle different message types
            if (message.type === 'crash' && message.multiplier) {
                const crashData = {
                    multiplier: parseFloat(message.multiplier),
                    timestamp: message.timestamp || Date.now(),
                    gameId: message.gameId || Math.random().toString(36).substr(2, 9)
                };
                
                this.addCrashData(crashData);
                this.addLog(`Game crashed at ${crashData.multiplier.toFixed(2)}x`, 'crash');
            }
        } catch (error) {
            this.addLog(`Failed to parse message: ${error.message}`, 'error');
        }
    }

    addCrashData(data) {
        this.crashData.unshift(data);
        
        // Limit data based on retention settings
        const retentionTime = this.settings.dataRetention * 60 * 60 * 1000; // Convert hours to ms
        const cutoffTime = Date.now() - retentionTime;
        
        this.crashData = this.crashData.filter(item => item.timestamp > cutoffTime);
        
        this.updateUI();
        this.saveCrashData();
    }

    updateUI() {
        this.updateStats();
        this.updateCrashHistory();
        this.updateMultiplierRanges();
        this.updateSessionInfo();
    }

    updateStats() {
        const totalGames = this.crashData.length;
        const avgMultiplier = totalGames > 0 ? 
            this.crashData.reduce((sum, data) => sum + data.multiplier, 0) / totalGames : 0;
        const maxMultiplier = totalGames > 0 ? 
            Math.max(...this.crashData.map(data => data.multiplier)) : 0;
        const winRate = totalGames > 0 ? 
            (this.crashData.filter(data => data.multiplier >= 2.0).length / totalGames) * 100 : 0;

        document.getElementById('total-games').textContent = totalGames.toLocaleString();
        document.getElementById('avg-multiplier').textContent = avgMultiplier.toFixed(2) + 'x';
        document.getElementById('max-multiplier').textContent = maxMultiplier.toFixed(2) + 'x';
        document.getElementById('win-rate').textContent = winRate.toFixed(1) + '%';
    }

    updateCrashHistory() {
        const historyContainer = document.getElementById('crash-history');
        const recentCrashes = this.crashData.slice(0, 50); // Show last 50 crashes
        
        historyContainer.innerHTML = '';
        
        recentCrashes.forEach(crash => {
            const crashElement = document.createElement('div');
            crashElement.className = `crash-value ${crash.multiplier >= 2.0 ? 'win' : 'loss'}`;
            crashElement.textContent = crash.multiplier.toFixed(2) + 'x';
            crashElement.title = new Date(crash.timestamp).toLocaleString();
            historyContainer.appendChild(crashElement);
        });
    }

    updateMultiplierRanges() {
        const ranges = {
            '1-2x': [1.0, 2.0],
            '2-5x': [2.01, 5.0],
            '5-10x': [5.01, 10.0],
            '10x-plus': [10.01, Infinity]
        };

        Object.entries(ranges).forEach(([key, [min, max]]) => {
            const count = this.crashData.filter(data => 
                data.multiplier >= min && data.multiplier <= max
            ).length;
            
            const elementId = `range-${key}`;
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = count.toLocaleString();
            }
        });
    }

    updateSessionInfo() {
        // Update session duration
        if (this.sessionStartTime) {
            const duration = Date.now() - this.sessionStartTime;
            const hours = Math.floor(duration / 3600000);
            const minutes = Math.floor((duration % 3600000) / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            
            document.getElementById('session-duration').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update games per minute
        if (this.sessionStartTime && this.crashData.length > 0) {
            const sessionMinutes = (Date.now() - this.sessionStartTime) / 60000;
            const gamesPerMinute = sessionMinutes > 0 ? (this.crashData.length / sessionMinutes).toFixed(1) : 0;
            document.getElementById('games-per-minute').textContent = gamesPerMinute;
        }

        // Update last update time
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        document.getElementById('data-points').textContent = this.crashData.length.toLocaleString();
    }

    refreshStatistics() {
        const timeFilter = document.getElementById('time-filter').value;
        const filteredData = this.getFilteredData(timeFilter);
        
        this.updateStatisticsTable(filteredData);
    }

    getFilteredData(timeFilter) {
        const now = Date.now();
        let cutoffTime;
        
        switch (timeFilter) {
            case '1h':
                cutoffTime = now - 3600000;
                break;
            case '6h':
                cutoffTime = now - 21600000;
                break;
            case '24h':
                cutoffTime = now - 86400000;
                break;
            case '7d':
                cutoffTime = now - 604800000;
                break;
            default:
                cutoffTime = 0;
        }
        
        return this.crashData.filter(data => data.timestamp > cutoffTime);
    }

    updateStatisticsTable(data) {
        const tableBody = document.getElementById('statistics-table-body');
        tableBody.innerHTML = '';
        
        // Group data by hour
        const hourlyData = this.groupDataByHour(data);
        
        Object.entries(hourlyData).sort((a, b) => b[0] - a[0]).forEach(([hour, games]) => {
            const row = document.createElement('tr');
            
            const avgMultiplier = games.reduce((sum, game) => sum + game.multiplier, 0) / games.length;
            const winRate = (games.filter(game => game.multiplier >= 2.0).length / games.length) * 100;
            const maxMultiplier = Math.max(...games.map(game => game.multiplier));
            
            const riskLevel = this.calculateRiskLevel(winRate);
            
            row.innerHTML = `
                <td class="time-cell">${new Date(parseInt(hour)).toLocaleString()}</td>
                <td>${games.length}</td>
                <td>${avgMultiplier.toFixed(2)}x</td>
                <td>
                    <div class="cell-content">
                        <span class="win-rate ${this.getWinRateClass(winRate)}">${winRate.toFixed(1)}%</span>
                    </div>
                </td>
                <td>${maxMultiplier.toFixed(2)}x</td>
                <td>
                    <div class="cell-content">
                        <div class="martingale-indicator ${riskLevel}"></div>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    groupDataByHour(data) {
        const grouped = {};
        
        data.forEach(game => {
            const hourTimestamp = Math.floor(game.timestamp / 3600000) * 3600000;
            if (!grouped[hourTimestamp]) {
                grouped[hourTimestamp] = [];
            }
            grouped[hourTimestamp].push(game);
        });
        
        return grouped;
    }

    calculateRiskLevel(winRate) {
        if (winRate >= 45) return 'martingale-safe';
        if (winRate >= 35) return 'martingale-risky';
        return 'martingale-dangerous';
    }

    getWinRateClass(winRate) {
        if (winRate >= 45) return 'high';
        if (winRate >= 35) return 'medium';
        return 'low';
    }

    updateConnectionStatus(status) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        statusDot.className = `status-dot ${status}`;
        
        switch (status) {
            case 'connected':
                statusText.textContent = 'Connected';
                break;
            case 'connecting':
                statusText.textContent = 'Connecting...';
                break;
            default:
                statusText.textContent = 'Disconnected';
        }
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('log-container');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span>${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Limit log entries
        while (logContainer.children.length > 1000) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    saveSettings() {
        this.settings = {
            autoReconnect: document.getElementById('auto-reconnect').checked,
            dataRetention: parseInt(document.getElementById('data-retention').value),
            updateInterval: parseInt(document.getElementById('update-interval').value)
        };
        
        if (window.electronAPI) {
            const settingsData = JSON.stringify({
                settings: this.settings,
                connection: {
                    url: document.getElementById('websocket-url').value,
                    hubName: document.getElementById('hub-name').value,
                    authToken: document.getElementById('auth-token').value
                }
            });
            
            window.electronAPI.getUserDataPath().then(userDataPath => {
                const settingsPath = `${userDataPath}/signalr-settings.json`;
                window.electronAPI.writeFile(settingsPath, settingsData);
            });
        }
        
        this.addLog('Settings saved', 'success');
        
        // Restart data collection if connected with new interval
        if (this.isConnected) {
            this.startDataCollection();
        }
    }

    loadSettings() {
        if (window.electronAPI) {
            window.electronAPI.getUserDataPath().then(userDataPath => {
                const settingsPath = `${userDataPath}/signalr-settings.json`;
                window.electronAPI.readFile(settingsPath).then(result => {
                    if (result.success) {
                        const data = JSON.parse(result.data);
                        this.settings = { ...this.settings, ...data.settings };
                        
                        // Update UI with loaded settings
                        document.getElementById('auto-reconnect').checked = this.settings.autoReconnect;
                        document.getElementById('data-retention').value = this.settings.dataRetention;
                        document.getElementById('update-interval').value = this.settings.updateInterval;
                        
                        if (data.connection) {
                            document.getElementById('websocket-url').value = data.connection.url || '';
                            document.getElementById('hub-name').value = data.connection.hubName || '';
                            document.getElementById('auth-token').value = data.connection.authToken || '';
                        }
                    }
                });
            });
        }
    }

    saveCrashData() {
        if (window.electronAPI) {
            const dataToSave = JSON.stringify({
                crashData: this.crashData.slice(0, 10000), // Limit saved data
                lastUpdate: Date.now()
            });
            
            window.electronAPI.getUserDataPath().then(userDataPath => {
                const dataPath = `${userDataPath}/signalr-crashdata.json`;
                window.electronAPI.writeFile(dataPath, dataToSave);
            });
        }
    }

    loadCrashData() {
        if (window.electronAPI) {
            window.electronAPI.getUserDataPath().then(userDataPath => {
                const dataPath = `${userDataPath}/signalr-crashdata.json`;
                window.electronAPI.readFile(dataPath).then(result => {
                    if (result.success) {
                        const data = JSON.parse(result.data);
                        this.crashData = data.crashData || [];
                        this.updateUI();
                        this.addLog(`Loaded ${this.crashData.length} crash data points`, 'info');
                    }
                });
            });
        }
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.crashData = [];
            this.sessionStartTime = null;
            this.updateUI();
            this.saveCrashData();
            this.addLog('All data has been reset', 'warning');
        }
    }

    clearHistory() {
        if (confirm('Clear crash history?')) {
            this.crashData = [];
            this.updateUI();
            this.saveCrashData();
            this.addLog('Crash history cleared', 'info');
        }
    }

    clearLogs() {
        document.getElementById('log-container').innerHTML = '';
        this.addLog('Logs cleared', 'info');
    }

    exportLogs() {
        const logs = Array.from(document.getElementById('log-container').children)
            .map(entry => entry.textContent)
            .join('\n');
        
        if (window.electronAPI) {
            const exportData = JSON.stringify({
                logs: logs,
                exportTime: new Date().toISOString(),
                totalEntries: document.getElementById('log-container').children.length
            }, null, 2);
            
            // This will be handled by the main process through menu
            console.log('Export logs requested');
        }
    }

    async handleExportRequest(event, filePath) {
        try {
            const exportData = {
                settings: this.settings,
                crashData: this.crashData,
                sessionInfo: {
                    startTime: this.sessionStartTime,
                    totalGames: this.crashData.length,
                    isConnected: this.isConnected
                },
                exportTime: new Date().toISOString()
            };
            
            const result = await window.electronAPI.writeFile(filePath, JSON.stringify(exportData, null, 2));
            if (result.success) {
                this.addLog(`Statistics exported to ${filePath}`, 'success');
            } else {
                this.addLog(`Failed to export: ${result.error}`, 'error');
            }
        } catch (error) {
            this.addLog(`Export error: ${error.message}`, 'error');
        }
    }

    async handleImportRequest(event, filePath) {
        try {
            const result = await window.electronAPI.readFile(filePath);
            if (result.success) {
                const importData = JSON.parse(result.data);
                
                if (importData.crashData && Array.isArray(importData.crashData)) {
                    this.crashData = [...importData.crashData, ...this.crashData];
                    this.updateUI();
                    this.saveCrashData();
                    this.addLog(`Imported ${importData.crashData.length} crash data points`, 'success');
                }
                
                if (importData.settings) {
                    this.settings = { ...this.settings, ...importData.settings };
                    this.saveSettings();
                }
            } else {
                this.addLog(`Failed to import: ${result.error}`, 'error');
            }
        } catch (error) {
            this.addLog(`Import error: ${error.message}`, 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signalrAnalytics = new SignalRAnalytics();
});
