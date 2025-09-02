import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
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

    // const currentPosition = {
    //     latitude: 14.6091,
    //     longitude: 121.0223,
    // }
    // const [myLocation, setInitialLocation] = React.useState();

    const currentPosition = {
        latitude: d_lat,
        longitude: d_lon,
    }
    
    const [currentLocation, setcurrentLocation] = React.useState(currentPosition);

    const destination = {
        latitude: c_lat,
        longitude: c_lon,
    }
    const [pin, setPinLocation] = React.useState({})
    const mapRef = React.useRef();
    const [region, setRegion] = React.useState(null);

    useEffect(() => {
        // _getLocation();
        setPinLocation(destination);
        setcurrentLocation(currentPosition);
        // coordinatesSubmit();
    },[])

    // const _getLocation = async () => {
    //     try{
    //         let {status} = await Location.requestForegroundPermissionsAsync();
    //         if(status !== 'granted'){
    //             console.warn('Permission to access location was denied');
    //             return 
    //         }
    //         let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest,maximumAge: 10000,timeout: 5000})
    //         // setInitialLocation(location.coords);
    //         coordinatesSubmit(location.coords);
    //     }catch(error){
    //         console.warn(error);
    //     }
    // }

    const focusOnDestination = () => {
        if(pin.latitude && pin.longitude){
            const loc = {
                latitude: parseFloat(pin.latitude),
                longitude: parseFloat(pin.longitude),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
            if(mapRef.current){
                mapRef.current.animateToRegion(loc, 1000);
            }
        }
    }

    const focusOnLocation = () => {
        if(currentLocation.latitude && currentLocation.longitude){
            const des = {
                latitude: parseFloat(currentLocation.latitude),
                longitude: parseFloat(currentLocation.longitude),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
            if(mapRef.current){
                mapRef.current.animateToRegion(des, 1000);
            }
        }
    }

    // const coordinatesSubmit = (entry) => {
    //     if(entry){
    //         console.log('latitudeee', entry?.latitude);
    //         console.log('longitudeee', entry?.longitude);
    //         console.log('userId', userId);
    //         var APIURL = "http://192.168.1.3/janfrans/api-map.php";
    //         var headers = {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         };
    //         fetch(APIURL, {
    //             method: 'post',
    //             headers: headers,
    //             body: JSON.stringify({
    //                 userId: userId,
    //                 latitude: entry.latitude,
    //                 longitude:  entry.longitude
    //                 }),
    //         })
    //         .then((response) => response.json())
    //         .then((data)=>{
    //             if(data.code == 1){
    //                 alert(data.message);
    //             }else{
    //                 alert(data.message);
    //             }
           
    //         })
    //         .catch((error)=>{
    //             alert(error);
    //         })
    //     }
    // }

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
                        description='I am here'
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
                        description='I want to go here'
                    />
                }
            </MapView>
            <View style={styles.buttonCurrentLocation}>
                <Button title="Get Location" onPress={focusOnLocation}/>
            </View>
            <View style={styles.buttonDestination}>
                <Button title="Destination" onPress={focusOnDestination}/>
            </View>
        </View>
    )
}