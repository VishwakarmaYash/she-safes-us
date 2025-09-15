import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  permission: PermissionState | null;
}

export const useGeolocation = (options?: PositionOptions) => {
  const { toast } = useToast();
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
    isSupported: 'geolocation' in navigator,
    permission: null,
  });

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options,
  };

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state }));
        
        result.addEventListener('change', () => {
          setState(prev => ({ ...prev, permission: result.state }));
        });
      });
    }
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser.' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setState(prev => ({
          ...prev,
          location: locationData,
          isLoading: false,
          error: null,
        }));

        toast({
          title: "Location Updated",
          description: `Accuracy: ±${Math.round(position.coords.accuracy)}m`,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      defaultOptions
    );
  }, [state.isSupported, defaultOptions, toast]);

  // Watch position for continuous tracking
  const watchPosition = useCallback(() => {
    if (!state.isSupported) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setState(prev => ({
          ...prev,
          location: locationData,
          isLoading: false,
          error: null,
        }));
      },
      (error) => {
        let errorMessage = 'Unable to track your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      },
      defaultOptions
    );

    return watchId;
  }, [state.isSupported, defaultOptions]);

  const clearWatch = useCallback((watchId: number) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Get location accuracy level
  const getAccuracyLevel = useCallback((): 'high' | 'medium' | 'low' => {
    if (!state.location) return 'low';
    
    const accuracy = state.location.accuracy;
    if (accuracy <= 10) return 'high';
    if (accuracy <= 100) return 'medium';
    return 'low';
  }, [state.location]);

  // Format coordinates for display
  const getFormattedLocation = useCallback(() => {
    if (!state.location) return null;
    
    return {
      latitude: state.location.latitude.toFixed(6),
      longitude: state.location.longitude.toFixed(6),
      accuracy: Math.round(state.location.accuracy),
      lastUpdate: new Date(state.location.timestamp).toLocaleTimeString(),
    };
  }, [state.location]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    getAccuracyLevel,
    getFormattedLocation,
  };
};