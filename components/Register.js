import React from 'react';
import { Text, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
const styles = require('../styles');
import { useNavigation } from '@react-navigation/native';
import { ToastAndroid } from 'react-native';

export default function Register() {

    const navigation = useNavigation();
    const [regForm, setRegistrationForm] = React.useState({
        fullName: '',
        street: '',
        barangay: '',
        city: '',
        zipCode: '',
        mobile: '',
        uname: '',
        pass: ''
    });

    const [errors, setErrors] = React.useState({});

    const validateRegisterForm = () => {
        let errors = {};
        if(!regForm.fullName) errors.fullName = "Invalid Full Name";
        if(!regForm.street) errors.street = "Invalid Street";
        if(!regForm.barangay) errors.barangay = "Invalid Barangay";
        if(!regForm.city) errors.city = "Invalid City";
        if(!regForm.zipCode) errors.zipCode = "Invalid Zip Code";
        if(!regForm.mobile) errors.mobile = "Invalid Mobile No.";
        if(!regForm.uname) errors.uname = "Invalid Email";
        if(!regForm.pass) errors.pass = "Invalid Password";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const registrationSubmit = () => {
        if(regForm.uname && regForm.pass){
            var APIURL = "https://janfrans.site/api-register.php";
            var headers = {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            };
            fetch(APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify({
                    full_name: regForm.fullName,
                    street: regForm.street,
                    barangay: regForm.barangay,
                    city: regForm.city,
                    zipcode: regForm.zipCode,
                    mobile: regForm.mobile,
                    email: regForm.uname,
                    password: regForm.pass,
                    user_type: 4,
                    status: 1
                  }),
            })
            .then((response) => response.json())
            .then((data)=>{
                if(data.code == 1){
                    ToastAndroid.show(data.message, ToastAndroid.SHORT);
                    navigation.navigate('Login');
                    regForm.fullName = '';
                    regForm.street = '';
                    regForm.barangay = '';
                    regForm.city = '';
                    regForm.zipCode = '';
                    regForm.mobile = '';
                    regForm.uname = '';
                    regForm.pass = '';
                    setErrors({});
                }else{
                    ToastAndroid.show(data.message, ToastAndroid.SHORT);
                }
            })
            .catch((error)=>{
                ToastAndroid.show(error, ToastAndroid.SHORT);
            })
        }else{
            validateRegisterForm();
        }
    }

    return (

        <ScrollView style={styles.container}>
            <View style={{paddingHorizontal: 15}}>
                <Text style={[styles.textLabel, styles.label]}>Full Name</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={fullName => setRegistrationForm({ ...regForm, fullName })}
                    value={regForm.fullName}
                    placeholder='Full Name'
                />
                {
                errors.fullName ? <Text style={styles.warning}>{ errors.fullName }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Street</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={street => setRegistrationForm({ ...regForm, street })}
                    value={regForm.street}
                    placeholder='Street Address'
                />
                {
                errors.street ? <Text style={styles.warning}>{ errors.street }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Barangay</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={barangay => setRegistrationForm({ ...regForm, barangay })}
                    value={regForm.barangay}
                    placeholder='Barangay'
                />
                {
                errors.barangay ? <Text style={styles.warning}>{ errors.barangay }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>City</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={city => setRegistrationForm({ ...regForm, city })}
                    value={regForm.city}
                    placeholder='City'
                />
                {
                errors.city ? <Text style={styles.warning}>{ errors.city }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Zip Code</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={zipCode => setRegistrationForm({ ...regForm, zipCode })}
                    value={regForm.zipCode}
                    placeholder='Zip Code'
                    keyboardType='numeric'
                />
                {
                errors.zipCode ? <Text style={styles.warning}>{ errors.zipCode }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Mobile</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={mobile => setRegistrationForm({ ...regForm, mobile })}
                    value={regForm.mobile}
                    placeholder='Mobile No.'
                    keyboardType='numeric'
                />
                {
                errors.mobile ? <Text style={styles.warning}>{ errors.mobile }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={uname => setRegistrationForm({ ...regForm, uname })}
                    value={regForm.uname}
                    placeholder='Email'
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                {
                errors.uname ? <Text style={styles.warning}>{ errors.uname }</Text> : null
                }
                <Text style={[styles.textLabel, styles.label]}>Password</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={pass => setRegistrationForm({ ...regForm, pass })}
                    value={regForm.pass}
                    placeholder='Password'
                    secureTextEntry
                />
                {
                errors.pass ? <Text style={styles.warning}>{ errors.pass }</Text> : null
                }
                <TouchableOpacity style={styles.buttonContainer} onPress={() => registrationSubmit()}>
                    <Text style={styles.buttonLabel}>Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

}