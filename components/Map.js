import React, { useEffect, useRef, useState } from 'react';
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

    const initialPosition = {
        latitude: d_lat,
        longitude: d_lon,
    };
    
    const [currentLocation, setCurrentLocation] = useState(initialPosition);
    const destination = {
        latitude: c_lat,
        longitude: c_lon,
    };
    const [pin, setPinLocation] = useState({});
    const mapRef = useRef(null);

    const [region, setRegion] = useState({
        latitude: parseFloat(d_lat) || 14.6536,
        longitude: parseFloat(d_lon) || 120.9822,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    
    const locationIntervalRef = useRef(null);

    useEffect(() => {
        _getLocation();
        setPinLocation(destination);
        
        startLocationUpdates();
        
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [] );
    console.log( _getLocation );

    const startLocationUpdates = () => {
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
        }
        
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
            
            const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setCurrentLocation(newLocation);
            
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
            
            var APIURL = "https://janfrans.net/api-map.php";
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