// CrimeHeatMap.tsx
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
  intensity: "high" | "medium" | "low";
  type: string;
  size: number;
}

interface SafeZone {
  id: number;
  x: number;
  y: number;
  name: string;
  type: "police" | "hospital" | "government";
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

  useEffect(() => {
    getCurrentPosition();
    const watchId = watchPosition();
    if (watchId) watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current) clearWatch(watchIdRef.current);
    };
  }, [getCurrentPosition, watchPosition, clearWatch]);

  // Mock data (normally from API)
  const crimeZones: CrimeZone[] = [
    { id: 1, x: 250, y: 300, intensity: "high", type: "Theft", size: 80 },
    { id: 2, x: 700, y: 200, intensity: "medium", type: "Harassment", size: 60 },
    { id: 3, x: 150, y: 700, intensity: "high", type: "Assault", size: 70 },
    { id: 4, x: 850, y: 600, intensity: "low", type: "Vandalism", size: 40 },
    { id: 5, x: 500, y: 800, intensity: "medium", type: "Robbery", size: 55 },
  ];

  const safeZones: SafeZone[] = [
    { id: 1, x: 400, y: 150, name: "City Police Station", type: "police" },
    { id: 2, x: 800, y: 400, name: "General Hospital", type: "hospital" },
    { id: 3, x: 600, y: 500, name: "City Hall", type: "government" },
    { id: 4, x: 200, y: 500, name: "Metro Police", type: "police" },
  ];

  // Convert real coordinates → map coordinates (rough demo)
  const mapX = location ? (location.longitude + 180) * 5 : 500;
  const mapY = location ? (90 - location.latitude) * 5 : 500;

  const getHeatColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "bg-gradient-radial from-destructive/60 via-destructive/30 to-transparent";
      case "medium":
        return "bg-gradient-radial from-warning/50 via-warning/25 to-transparent";
      case "low":
        return "bg-gradient-radial from-orange-400/40 via-orange-400/20 to-transparent";
      default:
        return "bg-gradient-radial from-destructive/40 via-destructive/20 to-transparent";
    }
  };

  const getSafeZoneIcon = (type: string) => {
    switch (type) {
      case "police":
        return <Shield className="h-4 w-4 text-safe" />;
      case "hospital":
        return <div className="h-4 w-4 bg-safe rounded-full flex items-center justify-center text-white text-xs font-bold">+</div>;
      case "government":
        return <div className="h-4 w-4 bg-primary rounded-sm"></div>;
      default:
        return <Shield className="h-4 w-4 text-safe" />;
    }
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
            >
              {showHeatMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-1 text-xs">Heat</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSafeZones(!showSafeZones)}
            >
              {showSafeZones ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-1 text-xs">Safe</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-secondary/20 rounded-lg border-2 border-border overflow-hidden" style={{ height: "400px" }}>
          {/* Move whole map when location changes */}
          <div
            className="absolute transition-transform duration-500"
            style={{
              width: "2000px",
              height: "2000px",
              transform: `translate(${-mapX + 200}px, ${-mapY + 200}px)`,
            }}
          >
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10 grid grid-cols-20 grid-rows-20">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-muted"></div>
              ))}
            </div>

            {/* Crime Zones */}
            {showHeatMap && crimeZones.map((zone) => (
              <div
                key={`crime-${zone.id}`}
                className={`absolute rounded-full ${getHeatColor(zone.intensity)}`}
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.size}px`,
                  height: `${zone.size}px`,
                  transform: "translate(-50%, -50%)",
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
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${zone.x}px`, top: `${zone.y}px` }}
              >
                <div className="relative bg-white border-2 border-safe rounded-full p-2 shadow-lg">
                  {getSafeZoneIcon(zone.type)}
                </div>
              </div>
            ))}
          </div>

          {/* FIXED location marker (always center) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full animate-ping bg-primary/30"></div>
              <div className="relative rounded-full p-2 shadow-lg border-2 border-white bg-primary">
                <Target className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrimeHeatMap;
