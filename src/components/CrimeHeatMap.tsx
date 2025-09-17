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
  lat: number;
  lng: number;
  intensity: 'high' | 'medium' | 'low';
  type: string;
  size: number;
}

interface SafeZone {
  id: number;
  lat: number;
  lng: number;
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
    getCurrentPosition();
    
    const startWatching = async () => {
      const watchId = watchPosition();
      if (watchId) {
        watchIdRef.current = watchId;
      }
    };
    
    startWatching();

    return () => {
      if (watchIdRef.current) {
        clearWatch(watchIdRef.current);
      }
    };
  }, [getCurrentPosition, watchPosition, clearWatch]);

  // Mock crime data for grid display
  const crimeZones: CrimeZone[] = [
    { id: 1, lat: 40.7128, lng: -74.0059, intensity: 'high', type: 'Theft', size: 80 },
    { id: 2, lat: 40.7150, lng: -74.0020, intensity: 'medium', type: 'Harassment', size: 60 },
    { id: 3, lat: 40.7100, lng: -74.0080, intensity: 'high', type: 'Assault', size: 70 },
    { id: 4, lat: 40.7200, lng: -73.9950, intensity: 'low', type: 'Vandalism', size: 40 },
    { id: 5, lat: 40.7050, lng: -74.0100, intensity: 'medium', type: 'Robbery', size: 55 },
  ];

  const safeZones: SafeZone[] = [
    { id: 1, lat: 40.7180, lng: -74.0030, name: 'City Police Station', type: 'police' },
    { id: 2, lat: 40.7160, lng: -73.9980, name: 'General Hospital', type: 'hospital' },
    { id: 3, lat: 40.7140, lng: -74.0040, name: 'City Hall', type: 'government' },
    { id: 4, lat: 40.7110, lng: -74.0070, name: 'Metro Police', type: 'police' },
  ];


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
        {/* Simulated Map Container */}
        <div className="relative bg-secondary/20 rounded-lg border-2 border-border overflow-hidden" style={{ height: '400px' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/30">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-border" style={{ left: `${(i + 1) * 12.5}%` }} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-border" style={{ top: `${(i + 1) * 16.67}%` }} />
              ))}
            </div>

            {/* Crime Zone Overlays */}
            {showHeatMap && crimeZones.map((zone) => (
              <div
                key={zone.id}
                className={`absolute rounded-full ${getHeatColor(zone.intensity)} animate-pulse`}
                style={{
                  width: `${zone.size}px`,
                  height: `${zone.size}px`,
                  left: `${20 + (zone.id * 15)}%`,
                  top: `${15 + (zone.id * 12)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${zone.type} - ${zone.intensity} risk`}
              />
            ))}

            {/* Safe Zone Markers */}
            {showSafeZones && safeZones.map((zone) => (
              <div
                key={zone.id}
                className="absolute flex items-center justify-center w-8 h-8 bg-safe rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${25 + (zone.id * 18)}%`,
                  top: `${60 + (zone.id * 8)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={zone.name}
              >
                {getSafeZoneIcon(zone.type)}
              </div>
            ))}

            {/* User Location */}
            <div
              className="absolute flex items-center justify-center w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse"
              style={{
                left: location ? '50%' : '45%',
                top: location ? '50%' : '45%',
                transform: 'translate(-50%, -50%)'
              }}
              title="Your Location"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Risk Level Indicator */}
          <div className="absolute top-4 right-4 z-10">
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
