import { Thermometer, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TemperatureSensorProps {
  id: string;
  name: string;
  temperature: number;
  unit: "C" | "F";
  location: string;
  trend: "up" | "down" | "stable";
  lastUpdate: string;
}

export function TemperatureSensor({
  id,
  name,
  temperature,
  unit,
  location,
  trend,
  lastUpdate,
}: TemperatureSensorProps) {
  const getTemperatureColor = (temp: number, unit: string) => {
    const celsius = unit === "F" ? ((temp - 32) * 5) / 9 : temp;
    if (celsius >= 25) return "text-temperature-hot";
    if (celsius >= 20) return "text-temperature-warm";
    if (celsius >= 15) return "text-temperature-cool";
    return "text-temperature-cold";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-temperature-hot" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-temperature-cool" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border hover:bg-card/80 transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {name}
        </CardTitle>
        <Thermometer className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className={`text-3xl font-bold ${getTemperatureColor(temperature, unit)}`}>
            {temperature}°{unit}
          </div>
          {getTrendIcon()}
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">{location}</p>
          <p className="text-xs text-muted-foreground">
            Updated: {lastUpdate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}