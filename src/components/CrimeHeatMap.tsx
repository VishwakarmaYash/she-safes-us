import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Shield, 
  Eye, 
  EyeOff,
  Layers,
  Target,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";

interface CrimeZone {
  id: number;
  x: number;
  y: number;
  intensity: 'high' | 'medium' | 'low';
  type: string;
  size: number;
}

interface SafeZone {
  id: number;
  x: number;
  y: number;
  name: string;
  type: 'police' | 'hospital' | 'government';
}

const CrimeHeatMap = () => {
  const { toast } = useToast();
  const { 
    location, 
    isLoading: locationLoading, 
    error: locationError, 
    getCurrentPosition,
    watchPosition,
    clearWatch 
  } = useGeolocation();
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  // Start watching position when component mounts
  useEffect(() => {
    // Get initial position
    getCurrentPosition();
    
    // Start continuous tracking
    const startWatching = async () => {
      const watchId = watchPosition();
      if (watchId) {
        watchIdRef.current = watchId;
      }
    };
    
    startWatching();

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current) {
        clearWatch(watchIdRef.current);
      }
    };
  }, [getCurrentPosition, watchPosition, clearWatch]);

  // Mock crime data - in real app this would come from crime APIs
  const crimeZones: CrimeZone[] = [
    { id: 1, x: 25, y: 30, intensity: 'high', type: 'Theft', size: 80 },
    { id: 2, x: 70, y: 20, intensity: 'medium', type: 'Harassment', size: 60 },
    { id: 3, x: 15, y: 70, intensity: 'high', type: 'Assault', size: 70 },
    { id: 4, x: 85, y: 60, intensity: 'low', type: 'Vandalism', size: 40 },
    { id: 5, x: 50, y: 80, intensity: 'medium', type: 'Robbery', size: 55 },
  ];

  const safeZones: SafeZone[] = [
    { id: 1, x: 40, y: 15, name: 'City Police Station', type: 'police' },
    { id: 2, x: 80, y: 40, name: 'General Hospital', type: 'hospital' },
    { id: 3, x: 60, y: 50, name: 'City Hall', type: 'government' },
    { id: 4, x: 20, y: 50, name: 'Metro Police', type: 'police' },
  ];

  const currentLocation = location 
    ? { 
        x: 45 + (location.longitude - (-74.006)) * 1000, // Approximate conversion for demo
        y: 45 + (40.7128 - location.latitude) * 1000 
      }
    : { x: 45, y: 45 }; // Fallback position

  const getHeatColor = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-gradient-radial from-destructive/60 via-destructive/30 to-transparent';
      case 'medium':
        return 'bg-gradient-radial from-warning/50 via-warning/25 to-transparent';
      case 'low':
        return 'bg-gradient-radial from-orange-400/40 via-orange-400/20 to-transparent';
      default:
        return 'bg-gradient-radial from-destructive/40 via-destructive/20 to-transparent';
    }
  };

  const getSafeZoneIcon = (type: string) => {
    switch (type) {
      case 'police':
        return <Shield className="h-4 w-4 text-safe" />;
      case 'hospital':
        return <div className="h-4 w-4 bg-safe rounded-full flex items-center justify-center text-white text-xs font-bold">+</div>;
      case 'government':
        return <div className="h-4 w-4 bg-primary rounded-sm"></div>;
      default:
        return <Shield className="h-4 w-4 text-safe" />;
    }
  };

  const handleNavigateToSafe = () => {
    toast({
      title: "Finding Safest Route",
      description: "Calculating path avoiding high-risk areas...",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary" />
            <span>Crime Heat Map</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeatMap(!showHeatMap)}
              className={showHeatMap ? 'bg-destructive/10 border-destructive/30' : ''}
            >
              {showHeatMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-1 text-xs">Heat</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={showSafeZones ? 'bg-safe/10 border-safe/30' : ''}
            >
              {showSafeZones ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-1 text-xs">Safe</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div className="relative bg-secondary/20 rounded-lg border-2 border-border overflow-hidden" style={{ height: '400px' }}>
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-muted"></div>
              ))}
            </div>
          </div>

          {/* Street Lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-muted"></div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted"></div>
            <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-muted"></div>
            <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-muted"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-muted"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-muted"></div>
          </div>

          {/* Crime Heat Zones */}
          {showHeatMap && crimeZones.map((zone) => (
            <div
              key={`crime-${zone.id}`}
              className={`absolute rounded-full ${getHeatColor(zone.intensity)} pointer-events-none transition-opacity duration-300`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.size}px`,
                height: `${zone.size}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive opacity-80" />
              </div>
            </div>
          ))}

          {/* Safe Zones */}
          {showSafeZones && safeZones.map((zone) => (
            <div
              key={`safe-${zone.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 cursor-pointer group"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
              }}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-safe/20 rounded-full animate-pulse"></div>
                <div className="relative bg-white border-2 border-safe rounded-full p-2 shadow-lg">
                  {getSafeZoneIcon(zone.type)}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-card border border-border rounded-md p-2 shadow-lg whitespace-nowrap">
                    <p className="text-xs font-medium">{zone.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{zone.type}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Current Location */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${Math.max(5, Math.min(95, currentLocation.x))}%`,
              top: `${Math.max(5, Math.min(95, currentLocation.y))}%`,
            }}
          >
            <div className="relative">
              <div className={`absolute -inset-3 rounded-full animate-ping ${location ? 'bg-primary/30' : 'bg-muted/30'}`}></div>
              <div className={`relative rounded-full p-2 shadow-lg border-2 border-white ${location ? 'bg-primary' : 'bg-muted'}`}>
                <Target className="h-4 w-4 text-white" />
              </div>
              {/* Location Accuracy Circle */}
              {location && (
                <div 
                  className="absolute border-2 border-primary/30 rounded-full bg-primary/10"
                  style={{
                    width: `${Math.min(100, location.accuracy / 10)}px`,
                    height: `${Math.min(100, location.accuracy / 10)}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
            <h4 className="text-xs font-semibold mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive/60 rounded-full"></div>
                <span className="text-xs">High Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning/50 rounded-full"></div>
                <span className="text-xs">Medium Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-safe/60 rounded-full"></div>
                <span className="text-xs">Safe Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-xs">You are here</span>
              </div>
            </div>
          </div>

          {/* Risk Level Indicator */}
          <div className="absolute top-4 right-4">
            {locationError ? (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Location Error
              </Badge>
            ) : locationLoading ? (
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                <Target className="h-3 w-3 mr-1 animate-spin" />
                Finding Location...
              </Badge>
            ) : location ? (
              <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20">
                <Shield className="h-3 w-3 mr-1" />
                Live Location
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted/10 text-muted-foreground border-muted/20">
                <Shield className="h-3 w-3 mr-1" />
                Simulated Location
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              Recenter
            </Button>
          </div>
          <Button onClick={handleNavigateToSafe} className="bg-safe hover:bg-safe/90">
            <Navigation className="h-4 w-4 mr-1" />
            Find Safe Route
          </Button>
        </div>

        {/* Crime Statistics */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 bg-destructive/5 rounded border border-destructive/20">
            <div className="text-lg font-bold text-destructive">2</div>
            <div className="text-xs text-muted-foreground">High Risk Areas</div>
          </div>
          <div className="text-center p-2 bg-warning/5 rounded border border-warning/20">
            <div className="text-lg font-bold text-warning">2</div>
            <div className="text-xs text-muted-foreground">Medium Risk</div>
          </div>
          <div className="text-center p-2 bg-safe/5 rounded border border-safe/20">
            <div className="text-lg font-bold text-safe">4</div>
            <div className="text-xs text-muted-foreground">Safe Zones</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrimeHeatMap;
