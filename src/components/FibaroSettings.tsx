import { useState } from "react";
import { Settings, Save, TestTube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FibaroConfig {
  ipAddress: string;
  username: string;
  password: string;
}

interface FibaroSettingsProps {
  config: FibaroConfig;
  onConfigChange: (config: FibaroConfig) => void;
  onTestConnection: () => Promise<boolean>;
}

export function FibaroSettings({ config, onConfigChange, onTestConnection }: FibaroSettingsProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onConfigChange(localConfig);
    localStorage.setItem('fibaroConfig', JSON.stringify(localConfig));
    toast({
      title: "Settings Saved",
      description: "Fibaro HC2 configuration has been saved.",
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      // First save the current config temporarily
      onConfigChange(localConfig);
      const success = await onTestConnection();
      
      if (success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to your Fibaro HC2 system.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to Fibaro HC2. Please check your settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Error testing connection. Please check your network and settings.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Fibaro HC2 Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">HC2 IP Address</Label>
          <Input
            id="ipAddress"
            placeholder="192.168.1.100"
            value={localConfig.ipAddress}
            onChange={(e) => setLocalConfig({ ...localConfig, ipAddress: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="admin"
            value={localConfig.username}
            onChange={(e) => setLocalConfig({ ...localConfig, username: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="password"
            value={localConfig.password}
            onChange={(e) => setLocalConfig({ ...localConfig, password: e.target.value })}
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTestingConnection || !localConfig.ipAddress || !localConfig.username || !localConfig.password}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}