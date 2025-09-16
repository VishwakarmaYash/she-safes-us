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
import { Loader } from "@googlemaps/js-api-loader";

// Declare global google maps types
declare global {
  interface Window {
    google: typeof google;
  }
}

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
  const [googleMapsKey, setGoogleMapsKey] = useState(() => 
    localStorage.getItem('googleMapsApiKey') || ''
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Save API key to localStorage
  const handleSaveApiKey = () => {
    localStorage.setItem('googleMapsApiKey', googleMapsKey);
    toast({
      title: "API Key Saved",
      description: "Google Maps API key has been saved locally.",
    });
  };

  // Initialize Google Maps when API key is provided
  useEffect(() => {
    if (!googleMapsKey || !mapContainer.current || map.current) return;

    const loader = new Loader({
      apiKey: googleMapsKey,
      version: "weekly",
    });

    loader.load().then(async () => {
      if (!mapContainer.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 40.7128, lng: -74.006 }, // NYC coordinates
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{"color": "#212121"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#757575"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#212121"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"color": "#2c2c2c"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#000000"}]
          }
        ]
      });

      setIsMapReady(true);
      updateMapMarkers();

    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Maps Loading Error",
        description: "Failed to load Google Maps. Check your API key.",
        variant: "destructive"
      });
    });

    return () => {
      // Google Maps cleanup is handled automatically
    };
  }, [googleMapsKey]);

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

    map.current.panTo({ lat: location.latitude, lng: location.longitude });
    map.current.setZoom(15);

    updateMapMarkers();
  }, [location, isMapReady]);

  // Mock crime data with real coordinates (NYC area)
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

  // Update map markers
  const updateMapMarkers = () => {
    if (!map.current || !isMapReady || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add crime zone markers
    if (showHeatMap) {
      crimeZones.forEach(zone => {
        const marker = new google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: map.current,
          title: `${zone.type} - ${zone.intensity} risk`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: zone.size / 8,
            fillColor: zone.intensity === 'high' ? '#ef4444' : 
                      zone.intensity === 'medium' ? '#f59e0b' : '#fb923c',
            fillOpacity: 0.6,
            strokeColor: zone.intensity === 'high' ? '#dc2626' : 
                        zone.intensity === 'medium' ? '#d97706' : '#ea580c',
            strokeWeight: 2,
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${zone.type}</h3>
              <p style="font-size: 12px; color: #666; margin: 0;">${zone.intensity.charAt(0).toUpperCase() + zone.intensity.slice(1)} Risk</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        markersRef.current.push(marker);
      });
    }

    // Add safe zone markers
    if (showSafeZones) {
      safeZones.forEach(zone => {
        let iconSymbol = '🛡️';
        if (zone.type === 'hospital') iconSymbol = '🏥';
        if (zone.type === 'government') iconSymbol = '🏛️';

        const marker = new google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: map.current,
          title: zone.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${iconSymbol} ${zone.name}</h3>
              <p style="font-size: 12px; color: #666; margin: 0;">${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        markersRef.current.push(marker);
      });
    }

    // Add user location marker
    if (location) {
      const userMarker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">📍 Your Location</h3>
            <p style="font-size: 12px; color: #666; margin: 0;">Accuracy: ${location.accuracy.toFixed(0)}m</p>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        infoWindow.open(map.current, userMarker);
      });

      // Add accuracy circle
      const accuracyCircle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map: map.current,
        center: { lat: location.latitude, lng: location.longitude },
        radius: location.accuracy,
      });

      markersRef.current.push(userMarker);
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
        {/* Google Maps API Key Input */}
        {!googleMapsKey && (
          <div className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Google Maps API Key Required</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get your API key from{' '}
              <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Cloud Console
              </a>
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Paste your Google Maps API key here..."
                value={googleMapsKey}
                onChange={(e) => setGoogleMapsKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveApiKey} size="sm">
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="relative bg-secondary/20 rounded-lg border-2 border-border overflow-hidden" style={{ height: '400px' }}>
          {googleMapsKey ? (
            <div ref={mapContainer} className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Enter Google Maps API key to view map</p>
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
