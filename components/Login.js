import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TextInput, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../colors';
const styles = require( '../styles' );
import { ToastAndroid } from 'react-native';

export default function Login ()
{

    const navigation = useNavigation();
    const [ form, setForm ] = React.useState( {
        email: '',
        password: ''
    } );

    const [ errors, setErrors ] = React.useState( {} );

    const validateLoginForm = () =>
    {
        let errors = {};
        if ( !form.email ) errors.email = "Invalid Email";
        if ( !form.password ) errors.password = "Invalid Password";
        setErrors( errors );
        return Object.keys( errors ).length === 0;
    }

    const loginSubmit = () =>
    {
        if ( form.email && form.password )
        {
            var APIURL = "https://janfrans.site/api-login.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    email: form.email,
                    password: form.password
                } ),
            } )
                .then( ( response ) => response.json() )
                .then( ( data ) =>
                {
                    if ( data.user_type == 3 )
                    {
                        navigation.navigate( 'Dashboard', { id: data.id, userType: data.user_type, email: data.username, full_name: data.full_name } );
                        setForm( { email: '', password: '' } ); // Reset form after successful login
                        setErrors( {} );
                        // Do NOT show a toast here for successful login
                    } else if ( data.user_type == 4 )
                    {
                        ToastAndroid.show( 'No Record Found', ToastAndroid.SHORT );
                    } else if ( data.user_type == 1 || data.user_type == 2 )
                    {
                        ToastAndroid.show( 'You can access your Admin or Staff account through Janfrans Admin Portal', ToastAndroid.SHORT );
                    } else
                    {
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                    }
                } )
                .catch( ( error ) =>
                {
                    ToastAndroid.show( error, ToastAndroid.SHORT );
                } )
        } else
        {
            validateLoginForm();
        }
    }

    return (

        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require( '../assets/janfrans.png' )}
                    />
                </View>
                <Text style={[ styles.textLabel, styles.labelAlignment ]}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={email => setForm( { ...form, email } )}
                    value={form.email}
                    placeholder='Email'
                    autoCapitalize='none'
                />
                {
                    errors.email ? <Text style={styles.warning}>{errors.email}</Text> : null
                }
                <Text style={[ styles.textLabel, styles.labelAlignment ]}>Password</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={password => setForm( { ...form, password } )}
                    value={form.password}
                    placeholder='Password'
                    secureTextEntry
                />
                {
                    errors.password ? <Text style={styles.warning}>{errors.password}</Text> : null
                }
                <TouchableOpacity style={styles.buttonContainer} onPress={() => loginSubmit()}>
                    <Text style={styles.buttonLabel}>Sign in</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <View style={[styles.buttonRegister, {flexDirection: 'row', marginTop: 20}]}>
                        <Text style={styles.textDescription}>Don't have an account? </Text>
                        <Text style={[styles.textDescription, {color: COLORS.button} ]}>Sign up here</Text>
                    </View>
                </TouchableOpacity> */}
            </View>
        </SafeAreaView>
    );

}