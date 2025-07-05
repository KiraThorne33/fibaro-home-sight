import { Eye, EyeOff, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MotionDetectorProps {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  lastTriggered: string;
  batteryLevel?: number;
}

export function MotionDetector({
  id,
  name,
  location,
  isActive,
  lastTriggered,
  batteryLevel,
}: MotionDetectorProps) {
  return (
    <Card className={`bg-card border-border transition-all duration-300 ${
      isActive 
        ? "ring-2 ring-motion-active shadow-[var(--glow-motion)]" 
        : "hover:bg-card/80"
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Eye className="h-5 w-5 text-motion-active animate-pulse" />
          ) : (
            <EyeOff className="h-5 w-5 text-motion-inactive" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={isActive 
                ? "bg-motion-active text-white" 
                : "bg-motion-inactive text-white"
              }
            >
              {isActive ? "MOTION DETECTED" : "No Motion"}
            </Badge>
            {batteryLevel && (
              <span className={`text-xs ${
                batteryLevel < 20 ? "text-destructive" : "text-muted-foreground"
              }`}>
                {batteryLevel}%
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{location}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last: {lastTriggered}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}