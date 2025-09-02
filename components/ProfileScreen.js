import React from 'react';
import { Text, View, Image, TouchableOpacity, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../colors';
const styles = require( '../styles' );
import { ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen ()
{

    const navigation = useNavigation();
    const route = useRoute();
    const userId = route.params?.id;
    const full_name = route.params?.full_name;
    const email = route.params?.email;
    const userType = route.params?.userType;

    const passwordUppercase_validator = /(?=.*[A-Z])/;
    const passwordFirstLetterUppercase_validator = /^(?![A-Z])/;
    const passwordDigit_validator = /(?=.*\d)/;
    const passwordLastDigit_validator = /^(?!.*\d$)/;
    const passwordSpecialCharacter_validator = /(?=.*[@$!%*?&])/;
    const passwordLastSpecialCharacter_validator = /^(?!.*[\W_]{1}$)/;

    const [ isModalVisible, setEditProfileModalVisible ] = React.useState( false );
    const [ isChangePasswordModalVisible, setChangePasswordModalVisible ] = React.useState( false );
    const [ isOTPModalVisible, setOTPModalVisible ] = React.useState( false );
    const [ isSignoutModalVisible, setSignoutModalVisible ] = React.useState( false );
    const [ isLoading, setIsLoading ] = React.useState( false );

    const [ profileForm, setProfileInfoForm ] = React.useState( {
        fullName: '',
        street: '',
        barangay: '',
        city: '',
        zipCode: '',
        mobile: '',
        username: '',
        password: '',
        user_type: '',
        status: ''
    } );

    const [ passwordForm, setPasswordForm ] = React.useState( {
        password: '',
        cpassword: ''
    } );

    const [ otpForm, setOTPForm ] = React.useState( {
        otp: ''
    } );

    const [ errors, setErrors ] = React.useState( {} );

    const validatePasswordForm = () =>
    {
        let errors = {};
        if ( !passwordSpecialCharacter_validator.test( passwordForm.password ) || !passwordLastSpecialCharacter_validator.test( passwordForm.password ) ) errors.password = "Password must have at least one non-alphanumeric character, not at the end of the password";
        if ( !passwordDigit_validator.test( passwordForm.password ) || !passwordLastDigit_validator.test( passwordForm.password ) ) errors.password = "Password must have at least one digit (0 through 9), not at the end of the password";
        if ( !passwordUppercase_validator.test( passwordForm.password ) || !passwordFirstLetterUppercase_validator.test( passwordForm.password ) ) errors.password = "Password must have at least one change of case, not at the start of the password";
        if ( passwordForm.password.length < 8 ) errors.password = "Password must have at least 8 characters";
        if ( !passwordForm.password ) errors.password = "Please enter password";
        if ( !passwordForm.cpassword ) errors.cpassword = "Please enter confirm Password";
        if ( passwordForm.password != passwordForm.cpassword ) errors.password = "Password mismatched";
        if ( passwordForm.password != passwordForm.cpassword ) errors.cpassword = "Password mismatched";
        setErrors( errors );
        return Object.keys( errors ).length === 0;
    }

    const validateOTPForm = () =>
    {
        let errors = {};
        if ( !otpForm.otp ) errors.otp = "Please enter OTP";
        setErrors( errors );
        return Object.keys( errors ).length === 0;
    }

    const validateProfileForm = () =>
    {
        let errors = {};
        if ( !profileForm.fullName ) errors.fullName = "Invalid Full Name";
        if ( !profileForm.street ) errors.street = "Invalid Street";
        if ( !profileForm.barangay ) errors.barangay = "Invalid Barangay";
        if ( !profileForm.city ) errors.city = "Invalid City";
        if ( !profileForm.zipCode ) errors.zipCode = "Invalid Zip Code";
        if ( !profileForm.mobile ) errors.mobile = "Invalid Mobile No.";
        if ( !profileForm.username ) errors.username = "Invalid Username";
        if ( !profileForm.password ) errors.password = "Invalid Password";
        setErrors( errors );
        return Object.keys( errors ).length === 0;
    }

    const updateProfileSubmit = () =>
    {
        if ( profileForm.username && profileForm.password )
        {
            var APIURL = "https://janfrans.site/api-update-profile.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    user_id: userId,
                    full_name: profileForm.fullName,
                    street: profileForm.street,
                    barangay: profileForm.barangay,
                    city: profileForm.city,
                    zipcode: profileForm.zipCode,
                    mobile: profileForm.mobile,
                    email: profileForm.username,
                    password: profileForm.password,
                    user_type: 4,
                    status: 1
                } ),
            } )
                .then( ( response ) => response.json() )
                .then( ( data ) =>
                {
                    console.log( 'data', data )
                    if ( data.code == 1 )
                    {
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                        profileForm.fullName = '';
                        profileForm.street = '';
                        profileForm.barangay = '';
                        profileForm.city = '';
                        profileForm.zipCode = '';
                        profileForm.mobile = '';
                        profileForm.email = '';
                        profileForm.password = '';
                        setErrors( {} );
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
            validateProfileForm();
        }
    }

    const updatePasswordSubmit = () =>
    {
        if ( ( passwordForm.password && passwordForm.cpassword ) &&
            ( passwordForm.password == passwordForm.cpassword ) &&
            ( passwordUppercase_validator.test( passwordForm.password ) &&
                passwordFirstLetterUppercase_validator.test( passwordForm.password ) &&
                passwordDigit_validator.test( passwordForm.password ) &&
                passwordLastDigit_validator.test( passwordForm.password ) &&
                passwordSpecialCharacter_validator.test( passwordForm.password ) &&
                passwordLastSpecialCharacter_validator.test( passwordForm.password )
            ) )
        {
            setIsLoading( true );
            var APIURL = "https://janfrans.site/api-change-password.php";
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    user_id: userId,
                    email: email,
                    password: passwordForm.password,
                    otp: otpForm.otp
                } ),
            } )
                .then( ( response ) => response.json() )
                .then( ( data ) =>
                {
                    console.log( 'data', data )
                    if ( data.code == 0 )
                    {
                        setChangePasswordModalVisible( false );
                        setOTPModalVisible( true );
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                        setIsLoading( false );
                        validateOTPForm();
                    } else if ( data.code == 1 )
                    {
                        setChangePasswordModalVisible( false );
                        setOTPModalVisible( true );
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                        setIsLoading( false );
                        setErrors( {} );
                    } else if ( data.code == 2 )
                    {
                        setChangePasswordModalVisible( false );
                        setOTPModalVisible( false );
                        passwordForm.password = '';
                        passwordForm.cpassword = '';
                        otpForm.otp = '';
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                        setIsLoading( false );
                        setErrors( {} );
                    } else
                    {
                        ToastAndroid.show( data.message, ToastAndroid.SHORT );
                        validateOTPForm();
                    }
                } )
                .catch( ( error ) =>
                {
                    ToastAndroid.show( error, ToastAndroid.SHORT );
                } )
        } else
        {
            validatePasswordForm();
        }
    }

    if ( isLoading )
    {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="0000FF" />
                <Text>Loading...</Text>
            </SafeAreaView>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.screenContainer}>
                <Image
                    style={styles.imageContainer}
                    source={require( '../assets/cute.png' )}
                />
                <Text style={[ styles.textLabel, { fontSize: 20, marginTop: 25 } ]}>{full_name}</Text>
                <Text style={{ marginTop: 5 }}>{email}</Text>
                {
                    userType == 3 ?
                        <TouchableOpacity onPress={() => setChangePasswordModalVisible( true )}>
                            <Text style={[ styles.textDescription, { color: COLORS.button, marginTop: 10 } ]}>Change Password</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => setEditProfileModalVisible( true )}>
                            <Text style={[ styles.textDescription, { color: COLORS.button } ]}>Edit Profile</Text>
                        </TouchableOpacity>
                }
                <TouchableOpacity style={[ styles.buttonContainer, { width: '40%', borderRadius: 25, marginTop: 30, backgroundColor: 'red' } ]} onPress={() => setSignoutModalVisible( true )}>
                    <Text style={[ styles.buttonLabel, { fontSize: 14 } ]}>Sign Out</Text>
                </TouchableOpacity>
                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setEditProfileModalVisible( false )}
                    animationType='slide'
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 15 }}>
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={fullName => setProfileInfoForm( { ...profileForm, fullName } )}
                                value={profileForm.fullName}
                                placeholder='Full Name'
                            />
                            {
                                errors.fullName ? <Text style={styles.warning}>{errors.fullName}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Street Address</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={street => setProfileInfoForm( { ...profileForm, street } )}
                                value={profileForm.street}
                                placeholder='Street Address'
                            />
                            {
                                errors.street ? <Text style={styles.warning}>{errors.street}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Barangay</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={barangay => setProfileInfoForm( { ...profileForm, barangay } )}
                                value={profileForm.barangay}
                                placeholder='Barangay'
                            />
                            {
                                errors.barangay ? <Text style={styles.warning}>{errors.barangay}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>City</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={city => setProfileInfoForm( { ...profileForm, city } )}
                                value={profileForm.city}
                                placeholder='City'
                            />
                            {
                                errors.city ? <Text style={styles.warning}>{errors.city}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Zip Code</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={zipCode => setProfileInfoForm( { ...profileForm, zipCode } )}
                                value={profileForm.zipCode}
                                placeholder='Zip Code'
                                keyboardType='numeric'
                            />
                            {
                                errors.zipCode ? <Text style={styles.warning}>{errors.zipCode}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Mobile No.</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={mobile => setProfileInfoForm( { ...profileForm, mobile } )}
                                value={profileForm.mobile}
                                placeholder='Mobile No.'
                                keyboardType='numeric'
                            />
                            {
                                errors.mobile ? <Text style={styles.warning}>{errors.mobile}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={username => setProfileInfoForm( { ...profileForm, username } )}
                                value={profileForm.username}
                                placeholder='Username'
                            />
                            {
                                errors.username ? <Text style={styles.warning}>{errors.username}</Text> : null
                            }
                            <Text style={[ styles.textLabel, { paddingVertical: 10 } ]}>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={password => setProfileInfoForm( { ...profileForm, password } )}
                                value={profileForm.password}
                                placeholder='Password'
                            />
                            {
                                errors.password ? <Text style={styles.warning}>{errors.password}</Text> : null
                            }
                            <TouchableOpacity style={styles.buttonContainer} onPress={() => updateProfileSubmit()}>
                                <Text style={styles.buttonLabel}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Modal>
                <Modal
                    visible={isChangePasswordModalVisible}
                    onRequestClose={() => setChangePasswordModalVisible( false )}
                    animationType='slide'
                >
                    <View style={[ styles.container ]}>
                        <View style={styles.body}>
                            <Text style={[ styles.textLabel, { alignSelf: 'center', marginVertical: 20, fontSize: 20 } ]}>Change Password</Text>
                            <Text style={[ styles.textDescription, { marginVertical: 20 } ]}>Enter New Password</Text><TextInput
                                style={styles.textInput}
                                onChangeText={password => setPasswordForm( { ...passwordForm, password } )}
                                value={passwordForm.password}
                                placeholder='New Password'
                                secureTextEntry />
                            {
                                errors.password ? <Text style={styles.warning}>{errors.password}</Text> : null
                            }
                            <Text style={[ styles.textDescription, { marginVertical: 20 } ]}>Confirm Password</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={cpassword => setPasswordForm( { ...passwordForm, cpassword } )}
                                value={passwordForm.cpassword}
                                placeholder='Confirm Password'
                                secureTextEntry
                            />
                            {
                                errors.cpassword ? <Text style={styles.warning}>{errors.cpassword}</Text> : null
                            }
                            <TouchableOpacity style={styles.buttonContainer} onPress={() => updatePasswordSubmit()}>
                                <Text style={styles.buttonLabel}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={isOTPModalVisible}
                    onRequestClose={() => setOTPModalVisible( false )}
                    animationType='slide'
                >
                    <View style={[ styles.container ]}>
                        <View style={styles.body}>
                            <Text style={[ styles.textDescription, { textAlign: 'center', marginVertical: 20 } ]}>An OPT has been sent to your email</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={otp => setOTPForm( { ...otpForm, otp } )}
                                value={otpForm.otp}
                                placeholder='Enter Code' />
                            {
                                errors.otp ? <Text style={styles.warning}>{errors.otp}</Text> : null
                            }
                            <TouchableOpacity style={styles.buttonContainer} onPress={() => updatePasswordSubmit()}>
                                <Text style={styles.buttonLabel}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={isSignoutModalVisible}
                    onRequestClose={() => setSignoutModalVisible( false )}
                    animationType='slide'
                >
                    <View style={[ styles.container ]}>
                        <View style={styles.body}>
                            <Text style={[ styles.textDescription, { textAlign: 'center', marginVertical: 20 } ]}>Do you really want to Sign Out?</Text>
                            <View>
                                <TouchableOpacity
                                    style={styles.buttonContainer}
                                    onPress={() =>
                                    {
                                        navigation.reset( {
                                            index: 0,
                                            routes: [ { name: 'Login' } ],
                                        } );
                                    }}
                                >
                                    <Text style={styles.buttonLabel}>Sign Out</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonContainer} onPress={() => setSignoutModalVisible( false )}>
                                    <Text style={styles.buttonLabel}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}