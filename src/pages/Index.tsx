import EmergencyButton from "@/components/EmergencyButton";
import SafeLocations from "@/components/SafeLocations";
import EmergencyContacts from "@/components/EmergencyContacts";
import CrimeHeatMap from "@/components/CrimeHeatMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Thermometer, Wifi } from "lucide-react";

const Index = () => {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current Location</span>
              </div>
              <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20">
                Downtown Safe Zone
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>8:32 PM</span>
              </div>
              <div className="flex items-center space-x-1">
                <Thermometer className="h-4 w-4" />
                <span>22°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wifi className="h-4 w-4 text-safe" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <div className="text-2xl font-bold text-safe">127</div>
                  <div className="text-xs text-muted-foreground">Safe Locations Nearby</div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">Emergency Support</div>
                </div>
                <div className="text-center p-3 bg-accent/20 rounded-lg border border-accent/30">
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-xs text-muted-foreground">Emergency Contacts</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg border border-secondary">
                  <div className="text-2xl font-bold text-foreground">Safe</div>
                  <div className="text-xs text-muted-foreground">Current Status</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Location Update</span>
                  <span className="font-medium">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">GPS Accuracy</span>
                  <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20">
                    High (±3m)
                  </Badge>
                </div>
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