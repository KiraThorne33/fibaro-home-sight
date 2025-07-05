// Fibaro HC2 API Service
export interface FibaroDevice {
  id: number;
  name: string;
  roomID: number;
  type: string;
  baseType: string;
  enabled: boolean;
  visible: boolean;
  isPlugin: boolean;
  parentId: number;
  viewXml: boolean;
  configXml: boolean;
  interfaces: string[];
  properties: {
    [key: string]: any;
    value?: string;
    unit?: string;
    dead?: string;
    batteryLevel?: string;
    armed?: string;
    breached?: string;
    lastBreached?: string;
  };
  actions: {
    [key: string]: any;
  };
  created: number;
  modified: number;
}

export interface FibaroRoom {
  id: number;
  name: string;
  sectionID: number;
  icon: string;
  colorCSS: string;
  created: number;
  modified: number;
}

export interface FibaroConfig {
  ipAddress: string;
  username: string;
  password: string;
}

class FibaroApiService {
  private config: FibaroConfig | null = null;

  constructor() {
    // Load config from localStorage on initialization
    const savedConfig = localStorage.getItem('fibaroConfig');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  setConfig(config: FibaroConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    if (!this.config?.ipAddress) {
      throw new Error('Fibaro HC2 configuration not set');
    }
    return `http://${this.config.ipAddress}/api`;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.config?.username || !this.config?.password) {
      throw new Error('Fibaro HC2 credentials not set');
    }

    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/settings/info`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getDevices(): Promise<FibaroDevice[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/devices`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  }

  async getRooms(): Promise<FibaroRoom[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/rooms`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      throw error;
    }
  }

  async getTemperatureSensors(): Promise<FibaroDevice[]> {
    const devices = await this.getDevices();
    return devices.filter(device => 
      device.interfaces.includes('temperature') || 
      device.type === 'com.fibaro.temperatureSensor' ||
      (device.properties.value && device.properties.unit === '°C')
    );
  }

  async getMotionSensors(): Promise<FibaroDevice[]> {
    const devices = await this.getDevices();
    return devices.filter(device => 
      device.interfaces.includes('motionSensor') || 
      device.type === 'com.fibaro.motionSensor' ||
      device.baseType === 'com.fibaro.motionSensor'
    );
  }

  // Helper method to format device data for our components
  formatTemperatureSensor(device: FibaroDevice, rooms: FibaroRoom[]) {
    const room = rooms.find(r => r.id === device.roomID);
    const temperature = parseFloat(device.properties.value || '0');
    const lastModified = new Date(device.modified * 1000);
    const timeDiff = Date.now() - lastModified.getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    
    return {
      id: device.id.toString(),
      name: device.name,
      temperature,
      unit: 'C' as const,
      location: room?.name || 'Unknown Room',
      trend: 'stable' as const, // Would need historical data to determine trend
      lastUpdate: `${minutesAgo} min ago`,
    };
  }

  formatMotionSensor(device: FibaroDevice, rooms: FibaroRoom[]) {
    const room = rooms.find(r => r.id === device.roomID);
    const isActive = device.properties.value === 'true' || device.properties.breached === 'true';
    const batteryLevel = device.properties.batteryLevel ? parseInt(device.properties.batteryLevel) : undefined;
    
    // Calculate last triggered time
    const lastBreached = device.properties.lastBreached;
    let lastTriggered = 'Never';
    if (lastBreached) {
      const lastBreachedTime = new Date(parseInt(lastBreached) * 1000);
      const timeDiff = Date.now() - lastBreachedTime.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      if (hoursAgo > 0) {
        lastTriggered = `${hoursAgo} hours ago`;
      } else if (minutesAgo > 0) {
        lastTriggered = `${minutesAgo} min ago`;
      } else {
        lastTriggered = 'Just now';
      }
    }

    return {
      id: device.id.toString(),
      name: device.name,
      location: room?.name || 'Unknown Room',
      isActive,
      lastTriggered,
      batteryLevel,
    };
  }
}

export const fibaroApi = new FibaroApiService();