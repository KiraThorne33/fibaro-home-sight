import { useState, useEffect } from "react";
import { TemperatureSensor } from "@/components/TemperatureSensor";
import { MotionDetector } from "@/components/MotionDetector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Wifi, WifiOff } from "lucide-react";

// Mock data - replace with real Fibaro HC2 API calls
const mockTemperatureSensors = [
  {
    id: "temp-001",
    name: "Living Room",
    temperature: 22.5,
    unit: "C" as const,
    location: "Main Floor",
    trend: "stable" as const,
    lastUpdate: "2 min ago",
  },
  {
    id: "temp-002",
    name: "Master Bedroom",
    temperature: 20.1,
    unit: "C" as const,
    location: "Second Floor",
    trend: "down" as const,
    lastUpdate: "1 min ago",
  },
  {
    id: "temp-003",
    name: "Kitchen",
    temperature: 24.8,
    unit: "C" as const,
    location: "Main Floor",
    trend: "up" as const,
    lastUpdate: "3 min ago",
  },
  {
    id: "temp-004",
    name: "Basement",
    temperature: 18.2,
    unit: "C" as const,
    location: "Lower Level",
    trend: "stable" as const,
    lastUpdate: "5 min ago",
  },
];

const mockMotionDetectors = [
  {
    id: "motion-001",
    name: "Front Door",
    location: "Main Entrance",
    isActive: false,
    lastTriggered: "2 hours ago",
    batteryLevel: 85,
  },
  {
    id: "motion-002",
    name: "Living Room",
    location: "Main Floor",
    isActive: true,
    lastTriggered: "Just now",
    batteryLevel: 92,
  },
  {
    id: "motion-003",
    name: "Back Garden",
    location: "Outdoor",
    isActive: false,
    lastTriggered: "Yesterday 11:30 PM",
    batteryLevel: 67,
  },
  {
    id: "motion-004",
    name: "Upstairs Hallway",
    location: "Second Floor",
    isActive: false,
    lastTriggered: "45 min ago",
    batteryLevel: 23,
  },
];

export function Dashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeMotionCount = mockMotionDetectors.filter(detector => detector.isActive).length;
  const averageTemperature = mockTemperatureSensors.reduce((sum, sensor) => sum + sensor.temperature, 0) / mockTemperatureSensors.length;

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
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </Badge>
          </div>
        </div>

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
              <Badge variant="outline">{mockTemperatureSensors.length} Sensors</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{averageTemperature.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Across all sensors</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Badge variant="default" className="bg-status-online">Healthy</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-online">All Good</div>
              <p className="text-xs text-muted-foreground">All devices responding</p>
            </CardContent>
          </Card>
        </div>

        {/* Temperature Sensors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <span>Temperature Sensors</span>
            <Badge variant="outline">{mockTemperatureSensors.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTemperatureSensors.map((sensor) => (
              <TemperatureSensor key={sensor.id} {...sensor} />
            ))}
          </div>
        </div>

        {/* Motion Detectors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <span>Motion Detectors</span>
            <Badge variant="outline">{mockMotionDetectors.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockMotionDetectors.map((detector) => (
              <MotionDetector key={detector.id} {...detector} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}