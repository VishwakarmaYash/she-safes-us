import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Shield, 
  Cross, 
  Building,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SafeLocations = () => {
  const { toast } = useToast();

  const safeLocations = [
    {
      id: 1,
      name: "City Police Station",
      type: "Police",
      distance: "0.3 km",
      status: "Open 24/7",
      icon: Shield,
      color: "bg-safe",
    },
    {
      id: 2,
      name: "General Hospital",
      type: "Hospital",
      distance: "0.8 km",
      status: "Emergency 24/7",
      icon: Cross,
      color: "bg-primary",
    },
    {
      id: 3,
      name: "City Hall",
      type: "Government",
      distance: "1.2 km",
      status: "Open till 6 PM",
      icon: Building,
      color: "bg-secondary",
    }
  ];

  const handleNavigate = (location: any) => {
    toast({
      title: `Navigating to ${location.name}`,
      description: "Opening in maps application...",
    });
  };

  const handleCall = (location: any) => {
    toast({
      title: `Calling ${location.name}`,
      description: "Connecting...",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Nearby Safe Locations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeLocations.map((location) => {
          const IconComponent = location.icon;
          return (
            <div
              key={location.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${location.color}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{location.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {location.type}
                    </Badge>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Navigation className="h-3 w-3" />
                      <span>{location.distance}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{location.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCall(location)}
                  className="h-8 w-8 p-0"
                >
                  <Phone className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavigate(location)}
                  className="h-8 px-3"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Go
                </Button>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Find More Locations
        </Button>
      </CardContent>
    </Card>
  );
};

export default SafeLocations;