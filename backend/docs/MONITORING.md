# Performance Monitoring & Logging System

## Overview

The Inflight Admin API includes a comprehensive performance monitoring and logging system that provides real-time insights into system health, performance metrics, error tracking, and alerting capabilities.

## Features

### 1. **Real-Time Performance Monitoring**
- Request/response time tracking
- Memory usage monitoring
- CPU usage tracking
- Active request monitoring
- Database connection pool statistics

### 2. **Error Tracking & Statistics**
- Comprehensive error categorization
- Error rate calculations
- Recent error history
- Error severity tracking
- Custom error classes with detailed logging

### 3. **System Health Monitoring**
- Overall health score calculation
- Database response time monitoring
- API response time tracking
- Active session monitoring
- System error counting

### 4. **Performance Alerting**
- Real-time alert generation
- Severity-based alerting (critical, warning, info)
- Threshold-based monitoring
- Trend analysis and notifications

### 5. **Caching & Optimization**
- In-memory caching with statistics
- Cache hit/miss tracking
- Performance optimization suggestions
- Request throttling and rate limiting

## API Endpoints

### Performance Monitoring

#### GET `/api/v1/monitoring/performance`
Get comprehensive system performance metrics including health, performance data, and optimization suggestions.

**Response:**
```json
{
  "systemHealth": {
    "memory": {
      "heapUsed": 125,
      "heapTotal": 200,
      "external": 15,
      "rss": 180
    },
    "cpu": {
      "user": 1250000,
      "system": 450000
    },
    "uptime": 3600,
    "activeRequests": 3,
    "stats": {
      "totalRequests": 1250,
      "slowRequests": 25,
      "errorRequests": 12,
      "averageResponseTime": 145.5,
      "peakMemoryUsage": 200,
      "errorRate": 0.96,
      "slowRequestRate": 2.0
    }
  },
  "performanceMetrics": {
    "currentRequests": [
      {
        "requestId": "1642684800000-abc123",
        "method": "GET",
        "url": "/api/v1/dashboard/overview",
        "duration": 150,
        "memoryAtStart": 120
      }
    ],
    "stats": {
      "totalRequests": 1250,
      "slowRequests": 25,
      "errorRequests": 12,
      "averageResponseTime": 145.5,
      "peakMemoryUsage": 200
    }
  },
  "optimizationSuggestions": [
    {
      "type": "warning",
      "message": "Average response time is high (>500ms). Consider implementing caching or optimizing database queries."
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET `/api/v1/monitoring/realtime`
Get real-time system status including current activity and alerts.

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "system": {
    "health": { /* health metrics */ },
    "performance": { /* performance metrics */ },
    "database": {
      "totalConnections": 10,
      "idleConnections": 7,
      "waitingClients": 0
    }
  },
  "activity": {
    "recentBookings": 5,
    "hourlyBookings": 45,
    "activeBookings": 12
  },
  "alerts": [
    {
      "id": "high-memory",
      "severity": "warning",
      "title": "High Memory Usage",
      "message": "Heap memory usage is 520MB",
      "threshold": "500MB",
      "current": "520MB",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### GET `/api/v1/monitoring/trends?hours=24`
Get performance trends over time with analysis.

**Parameters:**
- `hours` (optional): Time period in hours (default: 24)

**Response:**
```json
{
  "period": "24 hours",
  "trends": [
    {
      "timestamp": "2024-01-01T11:00:00.000Z",
      "healthScore": "98.5",
      "dbResponseTime": "15.2",
      "apiResponseTime": "145.8",
      "totalErrors": 2
    }
  ],
  "analysis": {
    "status": "analyzed",
    "healthScore": {
      "trend": "stable",
      "change": "0.2"
    },
    "responseTime": {
      "trend": "faster",
      "change": "-12.5ms"
    },
    "errors": {
      "trend": "stable",
      "change": 0
    }
  },
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

#### GET `/api/v1/monitoring/alerts`
Get current performance alerts with summary.

**Response:**
```json
{
  "alerts": [
    {
      "id": "high-memory",
      "severity": "warning",
      "title": "High Memory Usage",
      "message": "Heap memory usage is 520MB",
      "threshold": "500MB",
      "current": "520MB",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "summary": {
    "total": 1,
    "critical": 0,
    "warning": 1,
    "info": 0
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET `/api/v1/monitoring/errors`
Get detailed error statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "byType": {
      "ValidationError": 45,
      "AuthenticationError": 30,
      "DatabaseError": 25,
      "SystemError": 25
    },
    "bySeverity": {
      "low": 75,
      "medium": 35,
      "high": 15
    },
    "byStatusCode": {
      "400": 45,
      "401": 30,
      "500": 50
    },
    "recentErrors": [
      {
        "timestamp": "2024-01-01T12:00:00.000Z",
        "type": "ValidationError",
        "severity": "low",
        "statusCode": 400,
        "message": "Email is required"
      }
    ],
    "uptime": 86400000,
    "errorRate": 2.08,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### System Health

#### GET `/api/v1/monitoring/health`
Basic system health check.

#### GET `/api/v1/monitoring/metrics?hours=24`
System metrics over time.

## Performance Headers

All API responses include performance headers:

- `X-Response-Time`: Request processing time in milliseconds
- `X-Request-ID`: Unique request identifier for tracking
- `X-Memory-Usage`: Memory usage at request completion

## Alerting Thresholds

### Memory Usage
- **Warning**: > 500MB heap usage
- **Critical**: > 1GB heap usage

### Response Time
- **Warning**: > 500ms average response time
- **Critical**: > 1000ms average response time

### Error Rate
- **Warning**: > 2% error rate
- **Critical**: > 5% error rate

### Server Load
- **Warning**: > 10 active requests
- **Critical**: > 20 active requests

## Logging System

### Log Levels
- **ERROR**: System errors, exceptions, failed requests
- **WARN**: Slow requests, high resource usage, degraded performance
- **INFO**: Request summaries, system events
- **DEBUG**: Detailed debugging information

### Log Files
- `backend/logs/error.log`: Error events and exceptions
- `backend/logs/access.log`: Request access logs
- Console: Real-time colored logging output

### Log Format
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "...",
    "statusCode": 500,
    "errorType": "database",
    "severity": "high"
  },
  "request": {
    "method": "GET",
    "url": "/api/v1/dashboard/overview",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "userId": 123,
    "userRole": "admin"
  },
  "environment": "production",
  "processId": 12345
}
```

## Database Performance Monitoring

### Connection Pool Monitoring
- Total connections
- Active connections  
- Idle connections
- Waiting clients
- Connection errors

### Query Performance
- Slow query detection (>100ms)
- Query execution time tracking
- Database response time monitoring

### Health Checks
- Periodic connection testing (every minute)
- Pool capacity monitoring
- Error rate tracking

## Optimization Suggestions

The system provides automated optimization suggestions based on performance metrics:

1. **High Response Time**: Suggests caching implementation or database optimization
2. **High Error Rate**: Recommends error handling improvements
3. **Memory Usage**: Suggests memory optimization strategies
4. **Database Performance**: Recommends index optimization

## Integration Examples

### Frontend Monitoring Dashboard
```javascript
// Fetch real-time monitoring data
const response = await fetch('/api/v1/monitoring/realtime', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const monitoring = await response.json();

// Display alerts
monitoring.alerts.forEach(alert => {
  console.warn(`${alert.severity.toUpperCase()}: ${alert.message}`);
});
```

### Performance Tracking
```javascript
// Track API performance
console.log(`Response time: ${response.headers.get('X-Response-Time')}`);
console.log(`Request ID: ${response.headers.get('X-Request-ID')}`);
console.log(`Memory usage: ${response.headers.get('X-Memory-Usage')}`);
```

## Development & Testing

### Local Monitoring
```bash
# Start server with monitoring
npm run dev

# Check real-time metrics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/monitoring/realtime

# View performance trends
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/monitoring/trends?hours=1"
```

### Load Testing
```bash
# Generate load for testing
for i in {1..100}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:3001/api/v1/dashboard/overview &
done
wait

# Check performance impact
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/monitoring/performance
```

## Production Deployment

### Environment Variables
```bash
# Performance monitoring settings
SLOW_REQUEST_THRESHOLD=1000
ENABLE_PERFORMANCE_LOGGING=true
ENABLE_PERFORMANCE_METRICS=true

# Alert thresholds
MEMORY_WARNING_THRESHOLD=500
MEMORY_CRITICAL_THRESHOLD=1000
ERROR_RATE_WARNING=2
ERROR_RATE_CRITICAL=5
```

### Monitoring Setup
1. Enable performance monitoring middleware
2. Configure alert thresholds
3. Set up log rotation
4. Configure external monitoring integrations
5. Set up alert notifications

## Best Practices

1. **Regular Monitoring**: Check performance metrics regularly
2. **Alert Response**: Set up automated responses to critical alerts
3. **Log Analysis**: Regularly analyze error logs for patterns
4. **Performance Testing**: Load test before deployments
5. **Optimization**: Act on optimization suggestions
6. **Capacity Planning**: Monitor trends for capacity planning

## Support

For monitoring system questions:
- Check the real-time monitoring dashboard
- Review error logs in `backend/logs/`
- Use performance API endpoints for debugging
- Contact: dev@inflight.com 