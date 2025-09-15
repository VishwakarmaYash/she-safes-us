import EmergencyButton from "@/components/EmergencyButton";
import SafeLocations from "@/components/SafeLocations";
import EmergencyContacts from "@/components/EmergencyContacts";
import CrimeHeatMap from "@/components/CrimeHeatMap";
import LocationStatus from "@/components/LocationStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Thermometer, Wifi } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

const Index = () => {
  const { location, getFormattedLocation } = useGeolocation();
  const formattedLocation = getFormattedLocation();

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Location Status Bar */}
      <LocationStatus />

      {/* Real-time Location Info */}
      {location && formattedLocation && (
        <Card className="bg-gradient-to-r from-safe/5 to-primary/5 border-safe/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-safe" />
                  <span className="text-sm font-medium">Live Location</span>
                </div>
                <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20">
                  Real-time Tracking
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Thermometer className="h-4 w-4" />
                  <span>22°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wifi className="h-4 w-4 text-safe" />
                  <span>GPS Connected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Button - Full width on mobile, spans 2 columns on desktop */}
        <div className="lg:col-span-2">
          <EmergencyButton />
        </div>

        {/* Emergency Contacts */}
        <div className="lg:col-span-1">
          <EmergencyContacts />
        </div>
      </div>

      {/* Crime Heat Map and Safe Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Heat Map */}
        <CrimeHeatMap />
        
        <div className="space-y-6">
          {/* Safe Locations */}
          <SafeLocations />
          
          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-safe/10 rounded-lg border border-safe/20">
                  <div className="text-2xl font-bold text-safe">{location ? 'LIVE' : '127'}</div>
                  <div className="text-xs text-muted-foreground">{location ? 'GPS Active' : 'Safe Locations'}</div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{formattedLocation?.accuracy || '24/7'}</div>
                  <div className="text-xs text-muted-foreground">{location ? 'Accuracy (m)' : 'Emergency Support'}</div>
                </div>
                <div className="text-center p-3 bg-accent/20 rounded-lg border border-accent/30">
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-xs text-muted-foreground">Emergency Contacts</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg border border-secondary">
                  <div className="text-2xl font-bold text-foreground">{location ? 'LIVE' : 'Safe'}</div>
                  <div className="text-xs text-muted-foreground">{location ? 'Tracking' : 'Status'}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Location Update</span>
                  <span className="font-medium">{formattedLocation?.lastUpdate || '2 minutes ago'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">GPS Accuracy</span>
                  <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20">
                    {location ? `Live (±${formattedLocation?.accuracy}m)` : 'High (±3m)'}
                  </Badge>
                </div>
                {location && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Coordinates</span>
                    <span className="font-mono text-xs">{formattedLocation?.latitude}, {formattedLocation?.longitude}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-4"></div>
    </main>
  );
};

export default Index;