import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeliveryScreen from './DeliveryScreen';
import HistoryScreen from './HistoryScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../colors';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { ToastAndroid } from 'react-native';
import { useLocationTracking } from './LocationService'; // ADD THIS LINE

export default function Dashboard() {
    const Tab = createBottomTabNavigator();
    const route = useRoute();
    const userId = route.params?.id;
    const email = route.params?.email;
    const userType = route.params?.userType;
    const full_name = route.params?.full_name;
    const billingType = route.params?.billingType; 
    
    const hasShownLoginToast = useRef(false);


    useLocationTracking(userId, userType);

    useEffect(() => {
        if (!hasShownLoginToast.current) {
            ToastAndroid.show('Login Successfully', ToastAndroid.SHORT);
            hasShownLoginToast.current = true;
        }
    }, []);

    if (userType == 3) {
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
                    initialParams={{ id: userId, email: email, userType: userType, billingType: billingType }}
                    options={{
                        tabBarLabel: 'Delivery',
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name='car' size={20} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name='History'
                    component={HistoryScreen}
                    initialParams={{ id: userId, email: email, userType: userType, billingType: billingType }}
                    options={{
                        tabBarLabel: 'History',
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
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
                        tabBarIcon: ({ color }) => (
                            <Ionicons name='notifications' size={20} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name='Profile'
                    component={ProfileScreen}
                    initialParams={{ id: userId, email: email, userType: userType, full_name: full_name }}
                    options={{
                        tabBarLabel: 'My Profile',
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name='person' size={20} color={color} />
                        )
                    }}
                />
            </Tab.Navigator>
        );
    } else if (userType == 4) {
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
                        tabBarIcon: ({ color }) => (
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
                        tabBarIcon: ({ color }) => (
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
                        tabBarIcon: ({ color }) => (
                            <Ionicons name='notifications' size={20} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name='Profile'
                    component={ProfileScreen}
                    initialParams={{ id: userId, email: email, userType: userType, full_name: full_name }}
                    options={{
                        tabBarLabel: 'My Profile',
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name='person' size={20} color={color} />
                        )
                    }}
                />
            </Tab.Navigator>
        );
    } else {
        return null;
    }
}