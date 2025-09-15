import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Phone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmergencyButton = () => {
  const [isActivated, setIsActivated] = useState(false);
  const { toast } = useToast();

  const handleSOSPress = () => {
    setIsActivated(true);
    toast({
      title: "SOS Alert Activated",
      description: "Emergency contacts are being notified of your location.",
      variant: "destructive",
    });

    // Reset after 3 seconds for demo
    setTimeout(() => {
      setIsActivated(false);
    }, 3000);
  };

  const handleQuickCall = (service: string) => {
    toast({
      title: `Calling ${service}`,
      description: "Connecting to emergency services...",
    });
  };

  return (
    <Card className="p-6 text-center bg-gradient-to-br from-background to-accent/20 border-primary/20">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Emergency Assistant</h2>
          <p className="text-muted-foreground">Tap SOS to alert your emergency contacts</p>
        </div>

        {/* Main SOS Button */}
        <div className="relative">
          <Button
            onClick={handleSOSPress}
            size="lg"
            className={`
              h-32 w-32 rounded-full text-xl font-bold shadow-lg transition-all duration-300 mx-auto
              ${isActivated 
                ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                : 'bg-sos hover:bg-sos/90 hover:scale-105'
              }
            `}
            disabled={isActivated}
          >
            <div className="flex flex-col items-center space-y-1">
              <Shield className="h-8 w-8" />
              <span>{isActivated ? 'ACTIVATED' : 'SOS'}</span>
            </div>
          </Button>
          
          {isActivated && (
            <div className="absolute inset-0 rounded-full border-4 border-destructive animate-ping" />
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleQuickCall('Police')}
            variant="outline"
            className="h-16 border-primary/30 hover:bg-primary/10"
          >
            <div className="flex flex-col items-center space-y-1">
              <Phone className="h-5 w-5" />
              <span className="text-sm">Call Police</span>
            </div>
          </Button>
          
          <Button
            onClick={() => handleQuickCall('Emergency')}
            variant="outline"
            className="h-16 border-destructive/30 hover:bg-destructive/10"
          >
            <div className="flex flex-col items-center space-y-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Emergency</span>
            </div>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Hold SOS button for 3 seconds to activate silent mode
        </p>
      </div>
    </Card>
  );
};

export default EmergencyButton;