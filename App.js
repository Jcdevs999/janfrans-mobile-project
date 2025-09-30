import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import { COLORS } from './colors';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

const Stack = createNativeStackNavigator();

export default function App ()
{
  const [ fontsLoaded ] = useFonts( {
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  } );

  if ( !fontsLoaded )
  {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen
          name='Login'
          component={Login}
          options={{
            title: 'Login',
            headerStyle: {
              backgroundColor: COLORS.header
            },
            headerTintColor: COLORS.buttonText
          }}
        />
        <Stack.Screen
          name='Register'
          component={Register}
          options={{
            title: 'Register',
            headerStyle: {
              backgroundColor: COLORS.header
            },
            headerTintColor: COLORS.buttonText
          }}
        />
        <Stack.Screen
          name='Dashboard'
          component={Dashboard}
          options={{
            title: 'Dashboard',
            headerStyle: {
              backgroundColor: COLORS.header
            },
            headerTintColor: COLORS.white,
            headerBackVisible: false,
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold', 
              fontSize: 20
            }

          }}
        />
        <Stack.Screen
          name='Map'
          component={Map}
          options={{
            title: 'Map',
            headerStyle: {
              backgroundColor: COLORS.header
            },
            headerTintColor: COLORS.buttonText
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

}


