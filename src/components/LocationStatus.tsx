import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

const LocationStatus = () => {
  const {
    location,
    isLoading,
    error,
    permission,
    getCurrentPosition,
    getAccuracyLevel,
    getFormattedLocation
  } = useGeolocation();

  const [isWatching, setIsWatching] = useState(false);
  const formattedLocation = getFormattedLocation();
  const accuracyLevel = getAccuracyLevel();

  // Auto-start location tracking on component mount
  useEffect(() => {
    if (permission === 'granted' && !location && !error) {
      getCurrentPosition();
    }
  }, [permission, location, error, getCurrentPosition]);

  const handleLocationRequest = () => {
    getCurrentPosition();
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-safe', text: 'Granted' };
      case 'denied':
        return { icon: Lock, color: 'text-destructive', text: 'Denied' };
      case 'prompt':
        return { icon: AlertTriangle, color: 'text-warning', text: 'Prompt' };
      default:
        return { icon: AlertTriangle, color: 'text-muted-foreground', text: 'Unknown' };
    }
  };

  const getAccuracyColor = () => {
    switch (accuracyLevel) {
      case 'high':
        return 'bg-safe/10 text-safe border-safe/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Location Status</span>
            </div>
            
            {/* Permission Status */}
            <div className="flex items-center space-x-2">
              <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
              <Badge variant="secondary" className={`${permissionStatus.color} bg-transparent`}>
                {permissionStatus.text}
              </Badge>
            </div>

            {/* Location Accuracy */}
            {location && (
              <Badge variant="secondary" className={getAccuracyColor()}>
                <Navigation className="h-3 w-3 mr-1" />
                {accuracyLevel} (±{formattedLocation?.accuracy}m)
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Current Coordinates */}
            {location && formattedLocation && (
              <div className="text-xs text-muted-foreground hidden md:block">
                <div>Lat: {formattedLocation.latitude}</div>
                <div>Lng: {formattedLocation.longitude}</div>
              </div>
            )}

            {/* Last Update Time */}
            {location && formattedLocation && (
              <div className="text-xs text-muted-foreground">
                Updated: {formattedLocation.lastUpdate}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-1 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                <span className="hidden sm:inline">{error}</span>
              </div>
            )}

            {/* Action Button */}
            <Button
              size="sm"
              variant={location ? "outline" : "default"}
              onClick={handleLocationRequest}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">
                {location ? 'Refresh' : 'Get Location'}
              </span>
            </Button>
          </div>
        </div>

        {/* Additional Info Row */}
        {location && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>GPS Signal: Strong</span>
              <span>Satellites: 8/12</span>
              <span>Speed: 0 km/h</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-safe rounded-full animate-pulse"></div>
              <span>Live Tracking</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationStatus;