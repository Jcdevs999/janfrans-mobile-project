import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from './colors.js';

module.exports = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    body: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 10,
    },
    textLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.label,
      fontFamily: 'Poppins-SemiBold',
    },
    textDescription: {
      fontSize: 14,
      fontWeight: "400",
      color: COLORS.label,
      fontFamily: 'Poppins-Regular',
    },
    labelAlignment: {
      marginTop: 20,
      marginBottom:10, 
    },
    textInput: {
      height: 60,
      width: '100%',
      borderColor: COLORS.inputBorder,
      color: COLORS.inputColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      backgroundColor: COLORS.inputText,
      alignSelf: 'center',
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      shadowColor: COLORS.black,
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity:  0.17,
        shadowRadius: 3.05,
        elevation: 4,
    },
    buttonContainer: {
      width: '100%',
      alignSelf: 'center',
      backgroundColor: COLORS.button,
      borderRadius: 15,
      alignItems: 'center',
      padding: 15,
      marginTop: 20,
      shadowColor: COLORS.black,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity:  0.17,
          shadowRadius: 3.05,
          elevation: 4,
    },
    buttonLabel: {
      color: COLORS.buttonText,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Poppins-SemiBold',
    },
    warning: {
      color: 'red',
      fontWeight: '400',
      paddingVertical: 5,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    screenContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    imageContainer: {
      width: 120,
      height: 120,
      borderRadius: 75,
      shadowColor: COLORS.black,
        shadowOffset: {
          width: 120,
          height: 120,
        },
        shadowOpacity:  0.2,
        shadowRadius: 100,
        elevation: 30,
    },
    itemImage: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    card: {
      borderWidth: 2, 
      borderColor: COLORS.inputBorder, 
      borderRadius: 10, 
      backgroundColor: COLORS.white, 
      padding: 15,
    },
    screenBodyContainer: {
      paddingHorizontal: 10,
      paddingTop: 10,
    },
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
    actionButton: {
      backgroundColor: COLORS.button,
      width:  60,
      height: 60,
      position: 'absolute',
      bottom: 40,
      right: 40,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 30,
    },
    logo: {
      width: 300,
      height: 60,
    },
    buttonCurrentLocation: {
      position: 'absolute',
      bottom: 50,
      right: 80,
      width: '100%',
      alignItems: 'center',
    },
    buttonDestination: {
      position: 'absolute',
      bottom: 50,
      left: 80,
      width: '100%',
      alignItems: 'center',
    },
    label: {
      marginVertical: 10,
      paddingHorizontal: 10,
      fontFamily: 'Poppins-Regular',
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: "#F5F5F5",
      paddingTop: StatusBar.currentHeight,
      justifyContent: "center",
      alignItems: "center"
    }
  }
);