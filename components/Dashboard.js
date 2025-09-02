import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeliveryScreen from './DeliveryScreen';
import HistoryScreen from './HistoryScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../colors';
import { useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { ToastAndroid } from 'react-native';


export default function Dashboard ()
{

    const Tab = createBottomTabNavigator();
    const route = useRoute();
    const userId = route.params?.id;
    const email = route.params?.email;
    const userType = route.params?.userType;
    const full_name = route.params?.full_name;
    ToastAndroid.show( 'Login Successfully', ToastAndroid.SHORT );

    useEffect( () =>
    {
        _getLocation();
        coordinatesSubmit();
    }, [] )

    const _getLocation = async () =>
    {
        try
        {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if ( status !== 'granted' )
            {
                console.warn( 'Permission to access location was denied' );
                return
            }
            let location = await Location.getCurrentPositionAsync( { accuracy: Location.Accuracy.Highest, maximumAge: 10000, timeout: 5000 } )
            coordinatesSubmit( location.coords );
        } catch ( error )
        {
            console.warn( error );
        }
    }

    const coordinatesSubmit = ( entry ) =>
    {
        if ( entry )
        {
            console.log( 'latitudeee', entry?.latitude );
            console.log( 'longitudeee', entry?.longitude );
            var APIURL = "https://janfrans.site/api-map.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    userId: userId,
                    latitude: entry.latitude,
                    longitude: entry.longitude
                } ),
            } )
                .then( ( response ) => response.json() )
                .then( ( data ) =>
                {
                    if ( data.code == 1 )
                    {
                    } else
                    {
                    }
                } )
                .catch( ( error ) =>
                {
                    ToastAndroid.show( error, ToastAndroid.SHORT );
                } )
        }
    }

    if ( userType == 3 )
    {
        return (

            <Tab.Navigator
                initialRouteName='Delivery'
                screenOptions={{
                    tabBarLabelPosition: 'below-icon',
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: COLORS.buttonText,
                    tabBarInactiveTintColor: COLORS.black,
                    tabBarStyle: {
                        backgroundColor: COLORS.header,
                    },
                    tabBarLabelStyle: {
                        fontFamily: 'Poppins-SemiBold',
                        fontSize: 10, 
                    },

                }}
            >
                <Tab.Screen
                    name='Delivery'
                    component={DeliveryScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'Delivery',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='car' size={20} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name='History'
                    component={HistoryScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'History',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='time' size={20} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name='Notification'
                    component={NotificationScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'Notification',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='notifications' size={20} color={color} />
                        ),
                        // tabBarBadge: 3
                    }}
                />
                <Tab.Screen
                    name='Profile'
                    component={ProfileScreen}
                    initialParams={{ id: userId, email: email, userType: userType, full_name: full_name }}
                    options={{
                        tabBarLabel: 'My Profile',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='person' size={20} color={color} />
                        )
                    }}
                />
            </Tab.Navigator>
        );
    } else if ( userType == 4 )
    {
        return (

            <Tab.Navigator
                initialRouteName='Delivery'
                screenOptions={{
                    tabBarLabelPosition: 'below-icon',
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: COLORS.buttonText,
                    tabBarInactiveTintColor: COLORS.black,
                    tabBarStyle: {
                        backgroundColor: COLORS.header,
                    }
                }}
            >
                <Tab.Screen
                    name='Delivery'
                    component={DeliveryScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'Delivery',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='car' size={20} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name='History'
                    component={HistoryScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'History',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='time' size={20} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name='Notification'
                    component={NotificationScreen}
                    initialParams={{ id: userId, email: email, userType: userType }}
                    options={{
                        tabBarLabel: 'Notification',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='notifications' size={20} color={color} />
                        ),
                        // tabBarBadge: 3
                    }}
                />
                <Tab.Screen
                    name='Profile'
                    component={ProfileScreen}
                    initialParams={{ id: userId, email: email, userType: userType, full_name: full_name }}
                    options={{
                        tabBarLabel: 'My Profile',
                        headerShown: false,
                        tabBarIcon: ( { color } ) => (
                            <Ionicons name='person' size={20} color={color} />
                        )
                    }}
                />
            </Tab.Navigator>
        );
    } else
    {

    }
}