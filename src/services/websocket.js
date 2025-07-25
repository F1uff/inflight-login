// Simple polling service to replace Socket.IO
// This uses regular HTTP requests to check for updates

class PollingService {
  constructor() {
    this.connected = false;
    this.listeners = new Map();
    this.intervalId = null;
    this.pollingInterval = 10000; // Poll every 10 seconds (reduced frequency)
    this.lastUpdateTimestamp = Date.now();
    this.apiBaseUrl = 'http://localhost:3001/api/v1';
  }

  // Start polling for updates
  connect() {
    console.log('🔧 Starting polling service...');
    this.connected = true;
    
    // Start polling for updates
    this.startPolling();
    
    console.log('✅ Polling service started');
  }

  // Start the polling loop
  startPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (this.connected) {
        await this.checkForUpdates();
      }
    }, this.pollingInterval);

    // Do initial check
    this.checkForUpdates();
  }

  // Check for updates via HTTP requests
  async checkForUpdates() {
    try {
      const currentTimestamp = Date.now();
      
      // Check for driver updates
      await this.checkDriverUpdates();
      
      // Check for vehicle updates
      await this.checkVehicleUpdates();
      
      // Update timestamp after successful checks
      this.lastUpdateTimestamp = currentTimestamp;
      
    } catch (error) {
      console.warn('⚠️ Error checking for updates:', error.message);
    }
  }

  // Check for driver updates
  async checkDriverUpdates() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user-dashboard/drivers?timestamp=${this.lastUpdateTimestamp}`);
      
      if (response.status === 429) {
        console.warn('⚠️ Rate limited on driver updates, backing off...');
        // Temporarily increase polling interval
        this.temporaryBackoff();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // If we got new data, notify listeners
        if (data.hasUpdates) {
          console.log('👤 Driver updates detected');
          this.notifyListeners('drivers-updated', data.drivers || []);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking driver updates:', error.message);
    }
  }

  // Check for vehicle updates
  async checkVehicleUpdates() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user-dashboard/vehicles?timestamp=${this.lastUpdateTimestamp}`);
      
      if (response.status === 429) {
        console.warn('⚠️ Rate limited on vehicle updates, backing off...');
        // Temporarily increase polling interval
        this.temporaryBackoff();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // If we got new data, notify listeners
        if (data.hasUpdates) {
          console.log('🚗 Vehicle updates detected');
          this.notifyListeners('vehicles-updated', data.vehicles || []);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking vehicle updates:', error.message);
    }
  }

  // Subscribe to update events
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    console.log(`📡 Subscribed to ${event} events (polling mode)`);
  }

  // Unsubscribe from events
  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`📡 Unsubscribed from ${event} events`);
      }
    }
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Stop polling
  disconnect() {
    console.log('🔧 Stopping polling service...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.connected = false;
    this.listeners.clear();
    
    console.log('✅ Polling service stopped');
  }

  // Check connection status
  isConnected() {
    return this.connected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.connected,
      serviceId: `polling-${Date.now()}`,
      transport: 'http-polling',
      interval: this.pollingInterval
    };
  }

  // Set polling interval
  setPollingInterval(interval) {
    this.pollingInterval = interval;
    if (this.connected) {
      this.startPolling(); // Restart with new interval
    }
    console.log(`🔧 Polling interval set to ${interval}ms`);
  }

  // Force a manual update check
  async forceUpdate() {
    console.log('🔄 Force checking for updates...');
    await this.checkForUpdates();
  }

  // Simulate an event (for testing/development)
  simulateEvent(event, data) {
    console.log(`🧪 Simulating ${event} event:`, data);
    this.notifyListeners(event, data);
  }

  // Update the timestamp to mark when we last checked
  updateTimestamp() {
    this.lastUpdateTimestamp = Date.now();
  }

  // Handle rate limiting by temporarily backing off
  temporaryBackoff() {
    const originalInterval = this.pollingInterval;
    const backoffInterval = Math.min(this.pollingInterval * 2, 60000); // Max 1 minute
    
    console.log(`🐌 Backing off: increasing polling interval from ${originalInterval}ms to ${backoffInterval}ms`);
    
    this.setPollingInterval(backoffInterval);
    
    // Restore original interval after 2 minutes
    setTimeout(() => {
      if (this.connected) {
        console.log(`⚡ Restoring normal polling interval: ${originalInterval}ms`);
        this.setPollingInterval(originalInterval);
      }
    }, 120000); // 2 minutes
  }
}

// Create and export the service instance
const pollingService = new PollingService();

// Make service available globally for debugging (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.pollingService = pollingService;
  console.log('🔧 Polling service available globally as window.pollingService (dev mode)');
}

export default pollingService; 