import React, { useEffect, useCallback } from 'react';
import { Text, View, FlatList, Image, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../colors';
const styles = require( '../styles' );
import { ToastAndroid } from 'react-native';

export default function DeliveryScreen ()
{
    const navigation = useNavigation();
    const route = useRoute();
    const userId = route.params?.id;
    const userType = route.params?.userType;
    const driverBillingType = route.params?.billingType;
    const [ isQRModalVisible, setViewQRModalVisible ] = React.useState( false );
    const [ isModalVisible, setViewDeliveryModalVisible ] = React.useState( false );
    const [ modalData, setModalData ] = React.useState( {} );
    const [ trackNo, setTrackNo ] = React.useState();
    const [ deliveries, setDeliveries ] = React.useState( [] );
    const [ isLoading, setIsLoading ] = React.useState( false );

    const openSettingsModal = ( isVisible, item ) =>
    {
        if ( isVisible && item )
        {

            setModalData( item );


            trackUnifiedDelivery( item.tracking_id, item.id );
        }


        if ( !isVisible )
        {
            setViewDeliveryModalVisible( false );
        }
    };

    const formatDeliveryDate = ( dateString ) =>
    {
        if ( !dateString ) return '';
        let date = new Date( dateString );
        return date.toLocaleDateString( 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        } );
    }

    const setStatus = ( entry, estimatedTime = null ) =>
    {
        let statusText;
        let style = { color: 'gray' };

        if ( entry == 1 )
        {
            statusText = 'Preparing to ship Parcel';
            style.color = 'blue';
        }
        if ( entry == 2 )
        {
            statusText = 'In Transit';
            style.color = 'orange';
        }
        if ( entry == 3 )
        {
            statusText = estimatedTime ? `Delivered on ${ formatDeliveryDate( estimatedTime ) }` : 'Delivered';
            style.color = 'green';
        }
        if ( entry == 4 )
        {
            statusText = 'Cancelled';
            style.color = 'red';
        }
        if ( entry == 5 )
        {
            statusText = 'Rescheduled';
            style.color = 'blue';
        }

        return <Text style={style}>{statusText}</Text>;
    }

    const getRegisterAPIEndpoint = () =>
    {
        switch ( driverBillingType )
        {
            case 'express':
                return "https://janfrans.net/api-register-express.php";
            case 'forward':
                return "https://janfrans.net/api-register-forward.php";
            case 'motorcycle':
                return "https://janfrans.net/api-register-motorcycle.php";
            default:
                return "https://janfrans.net/api-register-parcel.php";
        }
    }

    const getValidateAPIEndpoint = () =>
    {
        return "https://janfrans.net/api-validate-tracking.php";
    }

    const getDriverTypeDisplayName = () =>
    {
        switch ( driverBillingType )
        {
            case 'express':
                return 'Express Driver';
            case 'forward':
                return 'Forward Driver';
            case 'motorcycle':
                return 'Motorcycle Driver';
        }
    }

    const getStatusColor = ( status ) =>
    {
        switch ( status )
        {
            case 1: return 'blue';
            case 2: return 'orange';
            case 3: return 'green';
            case 4: return 'red';
            case 5: return 'blue';
            default: return 'gray';
        }
    }

    const deliveryStatus = [
        { id: 5, title: 'Rescheduled' },
        { id: 4, title: 'Cancelled' },
        { id: 3, title: 'Delivered' },
        { id: 2, title: 'In Transit' },
        { id: 1, title: 'Preparing to ship Parcel' }
    ];

    useFocusEffect(
        useCallback( () =>
        {
            getDeliveryListing();
        }, [] )
    );

    const getDeliveryListing = async () =>
    {
        setIsLoading( true );
        var APIURL = "https://janfrans.net/api-deliveries.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        try
        {
            const response = await fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    userId: userId,
                    type: 1, 
                    userType: userType,
                    payMode: driverBillingType,
                } ),
            } );

            const data = await response.json();
            console.log( 'Fetched deliveries:', data.length );
            setDeliveries( data );
        } catch ( error )
        {
            console.error( 'Error fetching deliveries:', error );
            ToastAndroid.show( "Network error. Please try again.", ToastAndroid.SHORT );
        } finally
        {
            setIsLoading( false );
        }
    };

    const validateTrackingNumber = async () =>
    {
        var APIURL = getValidateAPIEndpoint();
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        try
        {
            const response = await fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    trackingNo: trackNo,
                    driverId: userId,
                    billingType: driverBillingType
                } ),
            } );
            const data = await response.json();
            
            return data;
        } catch ( error )
        {
            return { code: 0, message: "Validation failed. Please check your connection." };
        }
    };

    const registerParcel = async () =>
    {
        if ( !trackNo || trackNo.trim() === '' )
        {
            ToastAndroid.show( "Please enter a tracking number.", ToastAndroid.SHORT );
            return;
        }

        setIsLoading( true );
        const validation = await validateTrackingNumber();

        // Check if validation failed (code is 0)
        if ( validation.code !== 1 )
        {
            ToastAndroid.show( validation.message, ToastAndroid.SHORT );
            setIsLoading( false );
            return;
        }


        if ( validation.data?.was_reassigned )
        {

            ToastAndroid.show( validation.message, ToastAndroid.LONG );
            setViewQRModalVisible( false );
            setTrackNo( '' );
            setTimeout( () =>
            {
                getDeliveryListing();
            }, 500 );
            setIsLoading( false );
            return; 
        }


        var APIURL = getRegisterAPIEndpoint();
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        try
        {
            const response = await fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    trackingNo: trackNo,
                    driverId: userId,
                    status: 2
                } ),
            } );

            const data = await response.json();
            ToastAndroid.show( data.message, ToastAndroid.LONG );

            if ( data.code == 1 )
            {
                setViewQRModalVisible( false );
                setTrackNo( '' );

                setTimeout( () =>
                {
                    getDeliveryListing();
                }, 500 );
            }
        } catch ( error )
        {
            console.error( 'Registration error:', error );
            ToastAndroid.show( "Registration failed. Please try again.", ToastAndroid.SHORT );
        } finally
        {
            setIsLoading( false );
        }
    }

    const updateParcel = async ( status, deliveryId ) =>
    {
        setIsLoading( true );
        var APIURL = "https://janfrans.net/api-update-delivery.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        try
        {
            const response = await fetch( APIURL, {
                method: 'post',
                headers: headers,
                body: JSON.stringify( {
                    deliveryId: deliveryId,
                    deliveryStatus: status
                } ),
            } );

            const data = await response.json();
            ToastAndroid.show( data.message, ToastAndroid.SHORT );

            if ( data.code == 1 )
            {
                setViewDeliveryModalVisible( false );

                // Add a small delay before refreshing the list
                setTimeout( () =>
                {
                    getDeliveryListing();
                }, 500 );
            }
        } catch ( error )
        {
            console.error( 'Update error:', error );
            ToastAndroid.show( "Update failed. Please try again.", ToastAndroid.SHORT );
        } finally
        {
            setIsLoading( false );
        }
    }

    const trackUnifiedDelivery = async ( trackingId, deliveryId ) =>
    {
        console.log( '🔍 Tracking delivery:', { trackingId, deliveryId } );

        try
        {
            const response = await fetch( 'https://janfrans.net/api-track-unified.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( {
                    tracking_id: trackingId
                } )
            } );

            const data = await response.json();
            console.log( '📍 Tracking response:', data );

            if ( data.success )
            {
                
                if ( data.delivery.status_id === 5 )
                {
                    console.log( '🔄 Found rescheduled delivery, attempting to reactivate...' );

                    
                    const reactivateResponse = await fetch( 'https://janfrans.net/api-reactivate-delivery.php', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify( {
                            tracking_id: trackingId,
                            driver_id: userId
                        } )
                    } );

                    const reactivateData = await reactivateResponse.json();
                    console.log( '🔄 Reactivation response:', reactivateData );

                    if ( reactivateData.success )
                    {
                        ToastAndroid.show( 'Rescheduled delivery reactivated and back in transit!', ToastAndroid.LONG );

                        
                        data.delivery.status_id = 2; 
                        data.delivery.status_name = 'In Transit';
                        data.delivery.status_color = 'orange';

                        
                        setTimeout( () =>
                        {
                            getDeliveryListing();
                        }, 1000 );
                    } else
                    {
                        ToastAndroid.show( reactivateData.message || 'Failed to reactivate delivery', ToastAndroid.SHORT );
                    }
                }

                
                setModalData( prevData =>
                {
                    const newData = {
                        ...prevData,
                        ...data.delivery,
                        id: deliveryId,
                        delivery_status: data.delivery.status_id, 
                        billing_info: data.billing,
                        has_billing: data.has_billing_record,
                    };
                    console.log( '📋 Modal data updated:', newData );
                    return newData;
                } );

                setViewDeliveryModalVisible( true );

            } else
            {
                console.warn( '⚠️ Tracking failed:', data.message );
                ToastAndroid.show( data.message, ToastAndroid.SHORT );
                setViewDeliveryModalVisible( true );
            }
        } catch ( error )
        {
            console.error( '❌ Tracking error:', error );
            ToastAndroid.show( 'Error tracking delivery', ToastAndroid.SHORT );
            setViewDeliveryModalVisible( true );
        }
    };

    if ( userType == 3 )
    {
        return (
            <View style={styles.container}>
                {driverBillingType && (
                    <View style={{ backgroundColor: COLORS.inputText, paddingHorizontal: 15, paddingVertical: 8, marginBottom: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ backgroundColor: COLORS.button, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 8 }}>
                            <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{driverBillingType.toUpperCase()}</Text>
                        </View>
                        <Text style={{ color: COLORS.label, fontSize: 12, opacity: 0.8 }}>Driver</Text>
                    </View>
                )}

                <FlatList
                    style={styles.container}
                    data={deliveries}
                    renderItem={( { item } ) =>
                    {
                        return (
                            <TouchableOpacity onPress={() => openSettingsModal( true, item )}>
                                <View style={styles.screenBodyContainer}>
                                    <View style={styles.card}>
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <View style={{ flex: 1, marginRight: 10 }}>
                                                    <Text style={[ styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 } ]}>TRACKING NO</Text>
                                                    <Text style={[ styles.textLabel, { fontSize: 14, marginTop: 2 } ]} numberOfLines={1}>{item.tracking_id}</Text>
                                                </View>
                                                <Text style={[ styles.textLabel, { fontSize: 12 } ]}>{setStatus( item.delivery_status, item.estimated_time )}</Text>
                                            </View>
                                        </View>

                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                <Ionicons name='person-outline' size={16} color={COLORS.label} style={{ opacity: 0.7, marginRight: 6 }} />
                                                <Text style={[ styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 } ]}>
                                                    DELIVERY TO
                                                </Text>
                                            </View>
                                            <Text style={[ styles.textLabel, { fontSize: 15, marginBottom: 4 } ]} numberOfLines={1}>
                                                {item.full_name || item.consignee_name}
                                            </Text>
                                            <Text style={[ styles.textDescription, { fontSize: 13, lineHeight: 18 } ]} numberOfLines={2}>
                                                {item.street}, {item.barangay}, {item.city}, {item.zipcode}
                                            </Text>
                                            <Text style={[ styles.textDescription, { fontSize: 13, marginTop: 2 } ]}>
                                                {item.mobile}
                                            </Text>
                                        </View>

                                        <View style={{ alignItems: 'center', paddingTop: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputText, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 }}>
                                                <Text style={[ styles.textDescription, { fontSize: 11, marginRight: 4 } ]}>Tap to view details</Text>
                                                <Ionicons name='chevron-forward' size={12} color={COLORS.label} style={{ opacity: 0.5 }} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={( item ) => item.id.toString()}
                    ItemSeparatorComponent={<View style={{ height: 5 }} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: '80%' }}>
                            {isLoading ? (
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Loading deliveries...</Text>
                            ) : (
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>No delivery record found</Text>
                            )}
                        </View>
                    }
                />

                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setViewDeliveryModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>Your order is {setStatus( modalData.delivery_status, modalData.estimated_time )}</Text>
                                {modalData.delivery_status === 3 && modalData.estimated_time && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic' } ]}>
                                        Delivered on: {formatDeliveryDate( modalData.estimated_time )}
                                    </Text>
                                )}
                            </View>

                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 20 } ]}>Order Status:</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    {deliveryStatus.map( ( delStatus, index ) => (
                                        <View key={index} style={{ marginBottom: 5 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons
                                                    name={modalData.delivery_status >= delStatus.id ? 'checkmark-circle-outline' : 'ellipse-outline'}
                                                    size={24}
                                                    color={COLORS.button}
                                                />
                                                <Text style={[ styles.textDescription, { marginLeft: 12, fontWeight: modalData.delivery_status == delStatus.id ? '600' : 'normal', color: modalData.delivery_status == delStatus.id ? COLORS.button : COLORS.label } ]}>
                                                    {delStatus.title}
                                                </Text>
                                            </View>
                                            {delStatus.id !== deliveryStatus[ deliveryStatus.length - 1 ].id && (
                                                <View style={{ marginLeft: 11, height: 15, borderLeftWidth: 2, borderLeftColor: COLORS.button }} />
                                            )}
                                        </View>
                                    ) )}
                                </View>
                            </View>

                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Shipping Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Ionicons name='cube-outline' size={20} color={COLORS.label} style={{ opacity: 0.7, marginRight: 15, paddingTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.shipper_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.tracking_id}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Delivery Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'start' }}>
                                    <Ionicons name='location-outline' size={20} color={'red'} style={{ marginRight: 10, paddingTop: 25, marginBottom: 5 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.consignee_name || modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}</Text>
                                        {/* Divider */}
                                        <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />
                                        <Text style={[ styles.textDescription, { marginBottom: 8, fontWeight: 'bold', fontSize: 14 } ]}>
                                            Total Amount to be Collected: {'\u20B1'}
                                            {modalData.total_amount_to_be_collected ? parseFloat( modalData.total_amount_to_be_collected ).toLocaleString( 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) : '0.00'}
                                        </Text>
                                    </View>
                                </View>
                                {userType == 3 && (
                                    <View style={{ gap: 12, marginTop: 15 }}>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#34C759', opacity: isLoading ? 0.6 : 1 } ]}
                                            onPress={() => updateParcel( 3, modalData.id )}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.buttonLabel}>Order Delivered</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#FF9500', opacity: isLoading ? 0.6 : 1 } ]}
                                            onPress={() => updateParcel( 5, modalData.id )}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.buttonLabel}>Reschedule Order</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#FF3B30', opacity: isLoading ? 0.6 : 1 } ]}
                                            onPress={() => updateParcel( 4, modalData.id )}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.buttonLabel}>Cancel Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </Modal>

                <TouchableOpacity style={styles.actionButton} onPress={() => setViewQRModalVisible( true )}>
                    <Ionicons name='add-circle-outline' size={60} color={COLORS.inputText} />
                </TouchableOpacity>
                <Modal visible={isQRModalVisible} onRequestClose={() => setViewQRModalVisible( false )} animationType='slide' propagateSwipe={true} style={styles.qrModal}>
                    <View style={[ styles.container ]}>
                        <View style={styles.body}>
                            <Text style={[ styles.textDescription, { alignSelf: 'center', marginVertical: 20 } ]}>Enter Tracking Number</Text>
                            {driverBillingType && (
                                <Text style={[ styles.textDescription, { alignSelf: 'center', marginBottom: 15, color: COLORS.button, fontWeight: 'bold' } ]}>{getDriverTypeDisplayName()}</Text>
                            )}
                            <TextInput
                                style={[ styles.textInput, { opacity: isLoading ? 0.6 : 1 } ]}
                                onChangeText={setTrackNo}
                                value={trackNo}
                                placeholder='Tracking No.'
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={[ styles.buttonContainer, { opacity: isLoading ? 0.6 : 1 } ]}
                                onPress={() => registerParcel()}
                                disabled={isLoading}
                            >
                                <Text style={styles.buttonLabel}>{isLoading ? 'Processing...' : 'Submit'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    } else
    {
        // Customer view (remains unchanged as per request)
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.container}
                    data={deliveries}
                    renderItem={( { item, i } ) =>
                    {
                        return (
                            <TouchableOpacity onPress={() => openSettingsModal( true, item )}>
                                <View style={styles.screenBodyContainer} key={i}>
                                    <View style={styles.card}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <Ionicons name='storefront-outline' size={18} color={COLORS.button} />
                                                <Text style={[ styles.textLabel, { fontSize: 14, marginLeft: 8, fontWeight: '600', color: COLORS.button } ]} numberOfLines={1}>{item.shipper_name.toUpperCase()}</Text>
                                            </View>
                                            <View style={{ backgroundColor: getStatusColor( item.delivery_status ), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                                <Text style={[ styles.textLabel, { fontSize: 11, color: 'white', fontWeight: '600' } ]}>{setStatus( item.delivery_status )}</Text>
                                            </View>
                                        </View>
                                        {item.billing_type && (
                                            <View style={{ backgroundColor: COLORS.button, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 }}>
                                                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{item.billing_type.toUpperCase()} DELIVERY</Text>
                                            </View>
                                        )}
                                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                            <View style={{ marginRight: 12 }}>
                                                <Image style={[ styles.itemImage, { backgroundColor: COLORS.inputText, borderRadius: 8 } ]} source={{ uri: item?.image_base64 ? item?.image_base64 : null }} />
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={[ styles.textLabel, { fontSize: 16, fontWeight: '600', marginBottom: 4 } ]} numberOfLines={2}>{item.consignee_name}</Text>
                                                    <Text style={[ styles.textDescription, { fontSize: 13, lineHeight: 18 } ]} numberOfLines={3}>{item.remarks}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ backgroundColor: COLORS.inputText, padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View>
                                                <Text style={[ styles.textDescription, { fontSize: 12 } ]}>Quantity: {item.quantity} item{item.quantity > 1 ? 's' : ''}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[ styles.textDescription, { fontSize: 11, marginBottom: 2 } ]}>Total Amount</Text>
                                                <Text style={[ styles.textLabel, { fontSize: 16, fontWeight: '700', color: COLORS.total } ]}>
                                                    ₱{parseFloat( item.total_amount_to_be_collected ).toLocaleString( 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 } )}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={( item ) => item.id.toString()}
                    ItemSeparatorComponent={<View style={{ height: 5 }} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: '100%' }}>
                            {isLoading ? (
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>Loading deliveries...</Text>
                            ) : (
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }}>No delivery record found</Text>
                            )}
                        </View>
                    }
                />
                <Modal visible={isModalVisible} onRequestClose={() => setViewDeliveryModalVisible( false )} animationType='slide' propagateSwipe={true}>
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>Your order is {setStatus( modalData.delivery_status, modalData.estimated_time )}</Text>
                                {modalData.delivery_status === 3 && modalData.estimated_time && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic' } ]}>Delivered on: {formatDeliveryDate( modalData.estimated_time )}</Text>
                                )}
                            </View>
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 20 } ]}>Order Status:</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    {deliveryStatus.map( ( delStatus, index ) => (
                                        <View key={index} style={{ marginBottom: 5 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name={modalData.delivery_status >= delStatus.id ? 'checkmark-circle-outline' : 'ellipse-outline'} size={24} color={COLORS.button} />
                                                <Text style={[ styles.textDescription, { marginLeft: 12, fontWeight: delStatus.id == modalData.delivery_status ? '600' : 'normal', color: delStatus.id == modalData.delivery_status ? COLORS.button : COLORS.label } ]}>{delStatus.title}</Text>
                                            </View>
                                            {delStatus.id !== deliveryStatus[ deliveryStatus.length - 1 ].id && ( <View style={{ marginLeft: 11, height: 15, borderLeftWidth: 2, borderLeftColor: COLORS.button }} /> )}
                                        </View>
                                    ) )}
                                </View>
                            </View>
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Shipping Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Ionicons name='car' size={20} color={'green'} style={{ marginRight: 15, paddingTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.delivered_by}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.tracking_id}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>Created: {modalData.created_at}</Text>
                                        {modalData.delivery_status === 3 && modalData.estimated_time && ( <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>Delivered: {formatDeliveryDate( modalData.estimated_time )}</Text> )}
                                        {modalData.billing_type && ( <Text style={[ styles.textDescription, { marginBottom: 3, fontWeight: 'bold', color: COLORS.button } ]}>Delivery Type: {modalData.billing_type.toUpperCase()}</Text> )}
                                    </View>
                                </View>
                            </View>
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Delivery Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name='location-outline' size={20} color={'red'} style={{ marginRight: 15 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.consignee_name || modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}</Text>
                                        {/* divider */}
                                        <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />
                                        <Text style={[ styles.textDescription, { marginBottom: 8, fontWeight: 'bold', fontSize: 14 } ]}>
                                            Total Amount to be Collected: {'\u20B1'}
                                            {modalData.total_amount_to_be_collected ? parseFloat( modalData.total_amount_to_be_collected ).toLocaleString( 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) : '0.00'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[ styles.card, { marginBottom: 20 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Order Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <Ionicons name='car' size={20} color={'black'} />
                                    <Text style={[ styles.textLabel, { marginLeft: 8 } ]}>{modalData.store}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                    <View style={{ marginRight: 15 }}>
                                        <Image style={[ styles.itemImage, { width: 80, height: 80 } ]} source={{ uri: modalData?.image_base64 ? modalData?.image_base64 : null }} />
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.item}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 8 } ]}>{modalData.description}</Text>
                                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                            <Text style={styles.textDescription}>Quantity: </Text>
                                            <Text style={styles.textLabel}>{modalData.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: COLORS.inputBorder, paddingTop: 10 }}>
                                    <Text style={[ styles.textDescription, { marginRight: 8 } ]}>Total: </Text>
                                    <Text style={[ styles.textLabel, { fontWeight: 'bold' } ]}>{'\u20B1'}{modalData.total_amount}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        );
    }
}