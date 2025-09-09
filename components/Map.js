import React, { useEffect, useRef } from 'react';
import { View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
const styles = require('../styles');
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';

export default function Map() {

    const route = useRoute();
    const c_lat = route.params?.customer_latitude;
    const c_lon = route.params?.customer_longitude;
    const d_lat = route.params?.driver_latitude;
    const d_lon = route.params?.driver_longitude;
    const userId = route.params?.id;

    const currentPosition = {
        latitude: d_lat,
        longitude: d_lon,
    }
    
    const [currentLocation, setCurrentLocation] = React.useState(currentPosition);
    const destination = {
        latitude: c_lat,
        longitude: c_lon,
    }
    const [pin, setPinLocation] = React.useState({})
    const mapRef = React.useRef();
    const [region, setRegion] = React.useState(null);
    
    // Use useRef to store the interval ID so it persists across re-renders
    const locationIntervalRef = useRef(null);

    useEffect(() => {
        _getLocation();
        setPinLocation(destination);
        setCurrentLocation(currentPosition);
        
        // Start the location update interval
        startLocationUpdates();
        
        // Cleanup interval when component unmounts
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [])

    const startLocationUpdates = () => {
        // Clear any existing interval
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
        }
        
        // Set up interval to update location every 20 seconds (20000 milliseconds)
        locationIntervalRef.current = setInterval(() => {
            _getLocation();
        }, 20000);
    };

    const _getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to access location was denied');
                Alert.alert('Location Permission', 'Permission to access location was denied');
                return;
            }
            
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
                maximumAge: 10000,
                timeout: 5000
            });
            
            // Update the current location state
            const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setCurrentLocation(newLocation);
            
            // Send coordinates to server
            coordinatesSubmit(location.coords);
            
        } catch (error) {
            console.warn('Location error:', error);
            Alert.alert('Location Error', 'Failed to get current location');
        }
    }

    const coordinatesSubmit = (entry) => {
        if (entry && userId) {
            console.log('Updating location - Latitude:', entry?.latitude);
            console.log('Updating location - Longitude:', entry?.longitude);
            console.log('Driver ID:', userId);
            
            var APIURL = "http://janfrans.site/api-map.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            fetch(APIURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    userId: userId,
                    latitude: entry.latitude,
                    longitude: entry.longitude
                }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.code == 1) {
                    console.log('Location updated successfully:', data.message);
                } else {
                    console.warn('Failed to update location:', data.message);
                }
            })
            .catch((error) => {
                console.error('API Error:', error);
            });
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                ref={mapRef}
                initialRegion={
                    {
                        latitude: parseFloat(currentLocation?.latitude),
                        longitude: parseFloat(currentLocation?.longitude),
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }
                }
                provider='google'
                >
                {
                    currentLocation.latitude && currentLocation.longitude &&
                    <Marker
                        coordinate={{
                            latitude: parseFloat(currentLocation.latitude),
                            longitude: parseFloat(currentLocation.longitude)
                        }}
                        title='Current Location'
                        description='Driver location (updates every 20s)'
                    />
                }
                {
                    pin.latitude && pin.longitude &&
                    <Marker
                        coordinate={{
                            latitude: parseFloat(pin.latitude),
                            longitude: parseFloat(pin.longitude)
                        }}
                        title='Destination'
                        description='Customer location'
                    />
                }
            </MapView>
        </View>
    )
}