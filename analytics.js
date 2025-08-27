// Analytics and Status Charts for Oblivion X Protects Dashboard
// Real-time charts and performance monitoring

class OblivionAnalytics {
    constructor() {
        this.charts = new Map();
        this.realTimeData = {
            scriptExecutions: [],
            userActivity: [],
            keyUsage: [],
            securityEvents: []
        };
        this.updateInterval = 30000; // 30 seconds
        this.maxDataPoints = 50;
        
        this.init();
    }

    init() {
        this.setupChartContainers();
        this.startDataCollection();
        this.createCharts();
        this.startRealTimeUpdates();
    }

    setupChartContainers() {
        // Create chart containers if they don't exist
        const chartsGrid = document.querySelector('.charts-grid');
        if (!chartsGrid) return;

        const chartConfigs = [
            { id: 'executionsChart', title: 'Script Executions', type: 'line' },
            { id: 'usersChart', title: 'Active Users', type: 'area' },
            { id: 'securityChart', title: 'Security Events', type: 'bar' },
            { id: 'performanceChart', title: 'System Performance', type: 'gauge' }
        ];

        chartConfigs.forEach(config => {
            const existingChart = document.getElementById(config.id);
            if (!existingChart) {
                const chartCard = this.createChartCard(config);
                chartsGrid.appendChild(chartCard);
            }
        });
    }

    createChartCard(config) {
        const card = document.createElement('div');
        card.className = 'chart-card';
        card.innerHTML = `
            <h3>${config.title}</h3>
            <div class="chart-container">
                <canvas id="${config.id}" width="400" height="200"></canvas>
            </div>
            <div class="chart-stats">
                <div class="stat-item">
                    <span class="stat-label">Current:</span>
                    <span class="stat-value" id="${config.id}-current">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Peak:</span>
                    <span class="stat-value" id="${config.id}-peak">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average:</span>
                    <span class="stat-value" id="${config.id}-avg">0</span>
                </div>
            </div>
        `;
        return card;
    }

    createCharts() {
        this.createExecutionsChart();
        this.createUsersChart();
        this.createSecurityChart();
        this.createPerformanceChart();
    }

    createExecutionsChart() {
        const canvas = document.getElementById('executionsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');

        // Simple chart implementation without Chart.js dependency
        this.charts.set('executions', {
            canvas: canvas,
            ctx: ctx,
            data: [],
            gradient: gradient,
            type: 'line'
        });

        this.drawChart('executions');
    }

    createUsersChart() {
        const canvas = document.getElementById('usersChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');

        this.charts.set('users', {
            canvas: canvas,
            ctx: ctx,
            data: [],
            gradient: gradient,
            type: 'area'
        });

        this.drawChart('users');
    }

    createSecurityChart() {
        const canvas = document.getElementById('securityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.set('security', {
            canvas: canvas,
            ctx: ctx,
            data: [],
            type: 'bar'
        });

        this.drawChart('security');
    }

    createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.set('performance', {
            canvas: canvas,
            ctx: ctx,
            data: [],
            type: 'gauge'
        });

        this.drawChart('performance');
    }

    drawChart(chartName) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        const { ctx, canvas, data, gradient, type } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set styles
        ctx.strokeStyle = '#a855f7';
        ctx.fillStyle = gradient || '#a855f7';
        ctx.lineWidth = 2;

        if (data.length === 0) {
            // Draw placeholder
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#666';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Loading data...', width / 2, height / 2);
            return;
        }

        switch (type) {
            case 'line':
                this.drawLineChart(chart);
                break;
            case 'area':
                this.drawAreaChart(chart);
                break;
            case 'bar':
                this.drawBarChart(chart);
                break;
            case 'gauge':
                this.drawGaugeChart(chart);
                break;
        }
    }

    drawLineChart(chart) {
        const { ctx, canvas, data } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;

        if (data.length < 2) return;

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#a855f7';
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawAreaChart(chart) {
        const { ctx, canvas, data, gradient } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;

        if (data.length < 2) return;

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        // Draw filled area
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fill();

        // Draw line
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    drawBarChart(chart) {
        const { ctx, canvas, data } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;

        if (data.length === 0) return;

        const maxValue = Math.max(...data);
        const barWidth = (width - 2 * padding) / data.length - 5;

        data.forEach((value, index) => {
            const x = padding + index * (barWidth + 5);
            const barHeight = (value / maxValue) * (height - 2 * padding);
            const y = height - padding - barHeight;

            // Gradient for bars
            const barGradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            barGradient.addColorStop(0, '#a855f7');
            barGradient.addColorStop(1, '#7c3aed');

            ctx.fillStyle = barGradient;
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    drawGaugeChart(chart) {
        const { ctx, canvas, data } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        const value = data.length > 0 ? data[data.length - 1] : 0;
        const maxValue = 100;
        const angle = (value / maxValue) * Math.PI - Math.PI / 2;

        // Draw gauge background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        // Draw gauge fill
        const gaugeGradient = ctx.createConicGradient(0, centerX, centerY);
        gaugeGradient.addColorStop(0, '#22c55e');
        gaugeGradient.addColorStop(0.5, '#eab308');
        gaugeGradient.addColorStop(1, '#ef4444');

        ctx.strokeStyle = gaugeGradient;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(value)}%`, centerX, centerY + 10);
    }

    startDataCollection() {
        // Simulate real-time data collection
        setInterval(() => {
            this.collectExecutionData();
            this.collectUserData();
            this.collectSecurityData();
            this.collectPerformanceData();
        }, 5000);
    }

    collectExecutionData() {
        const executions = Math.floor(Math.random() * 100) + 50;
        this.addDataPoint('executions', executions);
        this.updateStats('executionsChart', executions);
    }

    collectUserData() {
        const users = Math.floor(Math.random() * 50) + 20;
        this.addDataPoint('users', users);
        this.updateStats('usersChart', users);
    }

    collectSecurityData() {
        const events = Math.floor(Math.random() * 10);
        this.addDataPoint('security', events);
        this.updateStats('securityChart', events);
    }

    collectPerformanceData() {
        const performance = Math.floor(Math.random() * 30) + 70; // 70-100%
        this.addDataPoint('performance', performance);
        this.updateStats('performanceChart', performance);
    }

    addDataPoint(chartName, value) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        chart.data.push(value);
        if (chart.data.length > this.maxDataPoints) {
            chart.data.shift();
        }
    }

    updateStats(chartId, currentValue) {
        const chart = this.charts.get(chartId.replace('Chart', ''));
        if (!chart) return;

        const data = chart.data;
        const peak = Math.max(...data);
        const average = data.reduce((a, b) => a + b, 0) / data.length;

        const currentEl = document.getElementById(`${chartId}-current`);
        const peakEl = document.getElementById(`${chartId}-peak`);
        const avgEl = document.getElementById(`${chartId}-avg`);

        if (currentEl) currentEl.textContent = Math.round(currentValue);
        if (peakEl) peakEl.textContent = Math.round(peak);
        if (avgEl) avgEl.textContent = Math.round(average);
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.charts.forEach((chart, name) => {
                this.drawChart(name);
            });
        }, this.updateInterval);
    }

    // Public API methods
    addCustomEvent(type, data) {
        switch (type) {
            case 'script_execution':
                this.realTimeData.scriptExecutions.push({
                    timestamp: new Date(),
                    ...data
                });
                break;
            case 'user_activity':
                this.realTimeData.userActivity.push({
                    timestamp: new Date(),
                    ...data
                });
                break;
            case 'security_event':
                this.realTimeData.securityEvents.push({
                    timestamp: new Date(),
                    ...data
                });
                break;
        }
    }

    getAnalyticsData(timeRange = '24h') {
        const now = new Date();
        let startTime;

        switch (timeRange) {
            case '1h':
                startTime = new Date(now - 60 * 60 * 1000);
                break;
            case '24h':
                startTime = new Date(now - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now - 24 * 60 * 60 * 1000);
        }

        return {
            executions: this.realTimeData.scriptExecutions.filter(e => e.timestamp >= startTime),
            users: this.realTimeData.userActivity.filter(u => u.timestamp >= startTime),
            security: this.realTimeData.securityEvents.filter(s => s.timestamp >= startTime)
        };
    }

    exportData(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            charts: {},
            realTimeData: this.realTimeData
        };

        this.charts.forEach((chart, name) => {
            data.charts[name] = chart.data;
        });

        if (format === 'csv') {
            return this.convertToCSV(data);
        }

        return JSON.stringify(data, null, 2);
    }

    convertToCSV(data) {
        let csv = 'Timestamp,Chart,Value\n';
        
        Object.entries(data.charts).forEach(([chartName, values]) => {
            values.forEach((value, index) => {
                const timestamp = new Date(Date.now() - (values.length - index) * 30000).toISOString();
                csv += `${timestamp},${chartName},${value}\n`;
            });
        });

        return csv;
    }
}

// CSS for chart styling
const chartStyles = `
.chart-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.chart-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary-purple);
    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2);
}

.chart-card h3 {
    color: var(--text-primary);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.chart-container {
    position: relative;
    height: 200px;
    margin-bottom: 1rem;
}

.chart-container canvas {
    width: 100%;
    height: 100%;
    border-radius: 8px;
}

.chart-stats {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.stat-item {
    text-align: center;
    flex: 1;
}

.stat-label {
    display: block;
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
}

.stat-value {
    display: block;
    color: var(--primary-purple);
    font-size: 1.2rem;
    font-weight: 700;
}

@media (max-width: 768px) {
    .chart-stats {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .stat-label {
        margin-bottom: 0;
    }
}
`;

// Inject styles
if (!document.querySelector('#chart-styles')) {
    const style = document.createElement('style');
    style.id = 'chart-styles';
    style.textContent = chartStyles;
    document.head.appendChild(style);
}

// Export for global use
window.OblivionAnalytics = OblivionAnalytics;
