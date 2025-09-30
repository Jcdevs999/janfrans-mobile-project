import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export const useLocationTracking = (userId, userType) => {
    const locationIntervalRef = useRef(null);
    const isTrackingRef = useRef(false);

    useEffect(() => {

        if (userId && userType === 3) {
            console.log('Starting location tracking for driver:', userId);
            startLocationTracking();
        } else {
            console.log('Not a driver or no userId, skipping location tracking');
        }

        return () => {
            stopLocationTracking();
        };
    }, [userId, userType]);

    const startLocationTracking = async () => {
        if (isTrackingRef.current) {
            console.log('Location tracking already running');
            return;
        }

        try {
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'This app needs location access to track deliveries. Please enable location permissions in your device settings.',
                    [{ text: 'OK' }]
                );
                return;
            }

            console.log('Location permission granted');

            // Get initial location immediately
            await updateLocation();

            // Set up interval for continuous updates (every 20 seconds)
            locationIntervalRef.current = setInterval(() => {
                updateLocation();
            }, 20000);

            isTrackingRef.current = true;
            console.log('Location tracking started successfully');

        } catch (error) {
            console.error('Failed to start location tracking:', error);
            Alert.alert('Location Error', 'Failed to start location tracking: ' + error.message);
        }
    };

    const stopLocationTracking = () => {
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
            locationIntervalRef.current = null;
        }
        isTrackingRef.current = false;
        console.log('Location tracking stopped');
    };

    const updateLocation = async () => {
        try {
            console.log('Getting current location...');
            
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                maximumAge: 10000,
                timeout: 5000
            });

            const { latitude, longitude } = location.coords;
            console.log('Current location:', { latitude, longitude });

            // Send to API
            await sendLocationToAPI(userId, latitude, longitude);

        } catch (error) {
            console.warn('Location update failed:', error.message);
            
            // Try with lower accuracy if high accuracy fails
            try {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
                const { latitude, longitude } = location.coords;
                await sendLocationToAPI(userId, latitude, longitude);
            } catch (fallbackError) {
                console.error('Fallback location also failed:', fallbackError);
            }
        }
    };

    const sendLocationToAPI = async (userId, latitude, longitude) => {
        try {
            console.log('Sending location to API...', { userId, latitude, longitude });

            const response = await fetch('https://janfrans.net/api-map.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    latitude: latitude,
                    longitude: longitude
                }),
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (data.code == 1) {
                console.log('Location sent successfully');
            } else {
                console.warn('API returned error:', data.message);
            }

        } catch (error) {
            console.error('Failed to send location to API:', error);
        }
    };

    return {
        startLocationTracking,
        stopLocationTracking,
        updateLocation
    };
};