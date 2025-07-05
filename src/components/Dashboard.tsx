import { useState, useEffect } from "react";
import { TemperatureSensor } from "@/components/TemperatureSensor";
import { MotionDetector } from "@/components/MotionDetector";
import { FibaroSettings } from "@/components/FibaroSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Wifi, WifiOff, Settings, RefreshCw } from "lucide-react";
import { fibaroApi, FibaroDevice, FibaroRoom } from "@/services/fibaroApi";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [temperatureSensors, setTemperatureSensors] = useState<any[]>([]);
  const [motionDetectors, setMotionDetectors] = useState<any[]>([]);
  const [fibaroConfig, setFibaroConfig] = useState({
    ipAddress: '',
    username: '',
    password: ''
  });
  const { toast } = useToast();

  // Load saved config on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fibaroConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setFibaroConfig(config);
      fibaroApi.setConfig(config);
    } else {
      setShowSettings(true); // Show settings if no config is saved
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadFibaroData = async () => {
    if (!fibaroConfig.ipAddress) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Fibaro HC2 settings first.",
        variant: "destructive",
      });
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      const [tempDevices, motionDevices, rooms] = await Promise.all([
        fibaroApi.getTemperatureSensors(),
        fibaroApi.getMotionSensors(),
        fibaroApi.getRooms(),
      ]);

      const formattedTempSensors = tempDevices.map(device => 
        fibaroApi.formatTemperatureSensor(device, rooms)
      );

      const formattedMotionSensors = motionDevices.map(device => 
        fibaroApi.formatMotionSensor(device, rooms)
      );

      setTemperatureSensors(formattedTempSensors);
      setMotionDetectors(formattedMotionSensors);
      setIsOnline(true);

      toast({
        title: "Data Updated",
        description: `Loaded ${formattedTempSensors.length} temperature sensors and ${formattedMotionSensors.length} motion detectors.`,
      });
    } catch (error) {
      console.error('Failed to load Fibaro data:', error);
      setIsOnline(false);
      toast({
        title: "Connection Failed",
        description: "Could not load data from Fibaro HC2. Check your settings and network connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (newConfig: typeof fibaroConfig) => {
    setFibaroConfig(newConfig);
    fibaroApi.setConfig(newConfig);
  };

  const handleTestConnection = async (): Promise<boolean> => {
    try {
      return await fibaroApi.testConnection();
    } catch {
      return false;
    }
  };

  // Auto-load data when config is available
  useEffect(() => {
    if (fibaroConfig.ipAddress && fibaroConfig.username && fibaroConfig.password) {
      loadFibaroData();
    }
  }, [fibaroConfig]);

  const activeMotionCount = motionDetectors.filter(detector => detector.isActive).length;
  const averageTemperature = temperatureSensors.length > 0 
    ? temperatureSensors.reduce((sum, sensor) => sum + sensor.temperature, 0) / temperatureSensors.length
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fibaro HC2 Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadFibaroData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </Badge>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <FibaroSettings
            config={fibaroConfig}
            onConfigChange={handleConfigChange}
            onTestConnection={handleTestConnection}
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Motion</CardTitle>
              <Badge variant="secondary">{activeMotionCount}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-motion-active">{activeMotionCount} Sensors</div>
              <p className="text-xs text-muted-foreground">Currently detecting motion</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
              <Badge variant="outline">{temperatureSensors.length} Sensors</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {temperatureSensors.length > 0 ? `${averageTemperature.toFixed(1)}°C` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Across all sensors</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Badge variant="default" className="bg-status-online">
                {isOnline ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isOnline ? 'text-status-online' : 'text-status-offline'}`}>
                {isOnline ? 'All Good' : 'Check Connection'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'All devices responding' : 'Fibaro HC2 unreachable'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Temperature Sensors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <span>Temperature Sensors</span>
            <Badge variant="outline">{temperatureSensors.length}</Badge>
          </h2>
          {temperatureSensors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {temperatureSensors.map((sensor) => (
                <TemperatureSensor key={sensor.id} {...sensor} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {fibaroConfig.ipAddress 
                    ? "No temperature sensors found or connection failed." 
                    : "Configure your Fibaro HC2 settings to see temperature sensors."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Motion Detectors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <span>Motion Detectors</span>
            <Badge variant="outline">{motionDetectors.length}</Badge>
          </h2>
          {motionDetectors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {motionDetectors.map((detector) => (
                <MotionDetector key={detector.id} {...detector} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {fibaroConfig.ipAddress 
                    ? "No motion detectors found or connection failed." 
                    : "Configure your Fibaro HC2 settings to see motion detectors."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}