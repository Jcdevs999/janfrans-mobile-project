import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TextInput, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../colors';
const styles = require('../styles');
import { ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Login() {
    const navigation = useNavigation();
    const [form, setForm] = React.useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const validateLoginForm = () => {
        let errors = {};
        if (!form.email) errors.email = "Invalid Email";
        if (!form.password) errors.password = "Invalid Password";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const loginSubmit = async () => {
        if (isLoading) return;
        
        if (form.email && form.password) {
            setIsLoading(true);
            
            var APIURL = "https://janfrans.site/api-login.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            try {
                const response = await fetch(APIURL, {
                    method: 'post',
                    headers: headers,
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password
                    }),
                });
                
                const data = await response.json();
                
                if (data.user_type == 3) {
                    setForm({ email: '', password: '' });
                    setErrors({});
                    
                    navigation.navigate('Dashboard', { 
                        id: data.id, 
                        userType: data.user_type, 
                        email: data.username, 
                        full_name: data.full_name 
                    });
                } else if (data.user_type == 4) {
                    ToastAndroid.show(data.message ||'No Record Found', ToastAndroid.SHORT);
                } else if (data.user_type == 1 || data.user_type == 2) {
                    ToastAndroid.show('You can access your Admin or Staff account through Janfrans Admin Portal', ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show(data.message || 'Login failed', ToastAndroid.SHORT);
                }
            } catch (error) {
                console.error('Login error:', error);
                ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
            } finally {
                setIsLoading(false);
            }
        } else {
            validateLoginForm();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require('../assets/janfrans.png')}
                    />
                </View>
                
                <Text style={[styles.textLabel, styles.labelAlignment]}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={email => setForm({ ...form, email })}
                    value={form.email}
                    placeholder='Email'
                    autoCapitalize='none'
                    editable={!isLoading}
                />
                {errors.email ? <Text style={styles.warning}>{errors.email}</Text> : null}
                
                <Text style={[styles.textLabel, styles.labelAlignment]}>Password</Text>
                <View style={{ position: 'relative' }}>
                    <TextInput
                        style={[styles.textInput, { paddingRight: 50 }]}
                        onChangeText={password => setForm({ ...form, password })}
                        value={form.password}
                        placeholder='Password'
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {form.password ? (
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 15,
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 30
                            }}
                            onPress={() => setShowPassword(!showPassword)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={showPassword ? 'visibility-off' : 'visibility'}
                                size={22}
                                color="#666"
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
                {errors.password ? <Text style={styles.warning}>{errors.password}</Text> : null}
                
                <TouchableOpacity 
                    style={[styles.buttonContainer, isLoading && { opacity: 0.6 }]} 
                    onPress={loginSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonLabel}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}