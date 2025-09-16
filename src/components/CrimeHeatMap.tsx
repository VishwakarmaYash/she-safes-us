import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Shield, 
  Eye, 
  EyeOff,
  Layers,
  Target,
  Maximize2,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.006, 40.7128], // NYC coordinates
      zoom: 12,
      pitch: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapReady(true);
      updateMapMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

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

  // Update user location on map
  useEffect(() => {
    if (!map.current || !location) return;

    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 15,
      duration: 2000
    });

    updateMapMarkers();
  }, [location, isMapReady]);

  // Mock crime data with real coordinates (NYC area)
  const crimeZones: CrimeZone[] = [
    { id: 1, x: -74.0059, y: 40.7128, intensity: 'high', type: 'Theft', size: 80 },
    { id: 2, x: -74.0020, y: 40.7150, intensity: 'medium', type: 'Harassment', size: 60 },
    { id: 3, x: -74.0080, y: 40.7100, intensity: 'high', type: 'Assault', size: 70 },
    { id: 4, x: -73.9950, y: 40.7200, intensity: 'low', type: 'Vandalism', size: 40 },
    { id: 5, x: -74.0100, y: 40.7050, intensity: 'medium', type: 'Robbery', size: 55 },
  ];

  const safeZones: SafeZone[] = [
    { id: 1, x: -74.0030, y: 40.7180, name: 'City Police Station', type: 'police' },
    { id: 2, x: -73.9980, y: 40.7160, name: 'General Hospital', type: 'hospital' },
    { id: 3, x: -74.0040, y: 40.7140, name: 'City Hall', type: 'government' },
    { id: 4, x: -74.0070, y: 40.7110, name: 'Metro Police', type: 'police' },
  ];

  // Update map markers
  const updateMapMarkers = () => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add crime zone markers
    if (showHeatMap) {
      crimeZones.forEach(zone => {
        const el = document.createElement('div');
        el.className = 'crime-marker';
        el.style.width = `${zone.size / 2}px`;
        el.style.height = `${zone.size / 2}px`;
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        
        switch (zone.intensity) {
          case 'high':
            el.style.backgroundColor = 'rgba(239, 68, 68, 0.6)';
            el.style.border = '2px solid rgb(239, 68, 68)';
            break;
          case 'medium':
            el.style.backgroundColor = 'rgba(245, 158, 11, 0.5)';
            el.style.border = '2px solid rgb(245, 158, 11)';
            break;
          case 'low':
            el.style.backgroundColor = 'rgba(251, 146, 60, 0.4)';
            el.style.border = '2px solid rgb(251, 146, 60)';
            break;
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([zone.x, zone.y])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${zone.type}</h3>
              <p class="text-xs text-gray-600">${zone.intensity.charAt(0).toUpperCase() + zone.intensity.slice(1)} Risk</p>
            </div>
          `))
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }

    // Add safe zone markers
    if (showSafeZones) {
      safeZones.forEach(zone => {
        const el = document.createElement('div');
        el.className = 'safe-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundColor = 'rgb(34, 197, 94)';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontSize = '12px';
        el.style.fontWeight = 'bold';

        switch (zone.type) {
          case 'police':
            el.innerHTML = '🛡️';
            break;
          case 'hospital':
            el.innerHTML = '+';
            break;
          case 'government':
            el.innerHTML = '🏛️';
            break;
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([zone.x, zone.y])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${zone.name}</h3>
              <p class="text-xs text-gray-600">${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</p>
            </div>
          `))
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }

    // Add user location marker
    if (location) {
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.backgroundColor = 'rgb(59, 130, 246)';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Your Location</h3>
            <p class="text-xs text-gray-600">Accuracy: ${location.accuracy.toFixed(0)}m</p>
          </div>
        `))
        .addTo(map.current);

      markersRef.current.push(marker);
    }
  };

  // Update markers when toggles change
  useEffect(() => {
    updateMapMarkers();
  }, [showHeatMap, showSafeZones, isMapReady]);


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
        {/* Mapbox Token Input */}
        {!mapboxToken && (
          <div className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Mapbox Token Required</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get your free token from{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Paste your Mapbox public token here..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="relative bg-secondary/20 rounded-lg border-2 border-border overflow-hidden" style={{ height: '400px' }}>
          {mapboxToken ? (
            <div ref={mapContainer} className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Enter Mapbox token to view map</p>
              </div>
            </div>
          )}

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
