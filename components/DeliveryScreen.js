import React, { useEffect } from 'react';
import { Text, View, FlatList, Image, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
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

    const [ isQRModalVisible, setViewQRModalVisible ] = React.useState( false );

    const [ isModalVisible, setViewDeliveryModalVisible ] = React.useState( false );
    const [ modalData, setModalData ] = React.useState( [] );
    const [ trackNo, setTrackNo ] = React.useState();
    const [ deliveries, setDeliveries ] = React.useState( [] );

    const openSettingsModal = ( isVisible, data ) =>
    {
        setModalData( data );
        setViewDeliveryModalVisible( isVisible );
    }

    const formatDeliveryDate = ( dateString ) =>
    {
        if ( !dateString ) return '';

        let date;
        if ( dateString.includes( 'T' ) || dateString.includes( 'Z' ) || dateString.includes( '+' ) )
        {
            date = new Date( dateString );
        } else
        {
            date = new Date( dateString + '+08:00' );
        }

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
        let x = '';
        if ( entry == 1 ) x = <Text style={{ color: 'blue' }}>Preparing to ship Parcel</Text>;
        if ( entry == 2 ) x = <Text style={{ color: 'orange' }}>In Transit</Text>;
        if ( entry == 3 )
        {
            const deliveryText = estimatedTime ?
                `Delivered on ${ formatDeliveryDate( estimatedTime ) }` :
                'Delivered';
            x = <Text style={{ color: 'green' }}>{deliveryText}</Text>;
        }
        if ( entry == 4 ) x = <Text style={{ color: 'red' }}>Cancelled</Text>;
        if ( entry == 5 ) x = <Text style={{ color: 'blue' }}>Rescheduled</Text>;
        return x;
    }

    const deliveryStatus = [
        {
            id: 5,
            title: 'Rescheduled',
        },
        {
            id: 4,
            title: 'Cancelled',
        },
        {
            id: 3,
            title: 'Delivered',
        },
        {
            id: 2,
            title: 'In Transit',
        },
        {
            id: 1,
            title: 'Preparing to ship Parcel',
        }
    ];

    useEffect( () =>
    {
        getDeliveryListing();
    }, [] );

    const getDeliveryListing = async () =>
    {
        var APIURL = "https://janfrans.site/api-deliveries.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        await fetch( APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify( {
                userId: userId,
                type: 1,
                userType: userType
            } ),
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) =>
            {
                setDeliveries( data );
            } )
            .catch( ( error ) =>
            {
                ToastAndroid.show( error, ToastAndroid.SHORT );
            } )
    }

    const validateTrackingNumber = async () =>
    {
        var APIURL = "https://janfrans.site/api-validate-tracking.php";
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
                    driverId: userId
                } ),
            } );
            const data = await response.json();
            if ( data.code === 1 )
            {
                return { valid: true, message: data.message };
            } else
            {
                return { valid: false, message: data.message };
            }
        } catch ( error )
        {
            return { valid: false, message: error.toString() };
        }
    };

    const registerParcel = async () =>
    {
        // Validate tracking number first
        const validation = await validateTrackingNumber();
        if ( !validation.valid )
        {
            ToastAndroid.show( validation.message, ToastAndroid.SHORT );
            return;
        }

        // Proceed to register if valid
        var APIURL = "https://janfrans.site/api-register-parcel.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        await fetch( APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify( {
                trackingNo: trackNo,
                driverId: userId,
                status: 2
            } ),
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) =>
            {
                if ( data.code == 1 )
                {
                    ToastAndroid.show( data.message, ToastAndroid.SHORT );
                    setViewQRModalVisible( false );
                    getDeliveryListing();
                } else
                {
                    ToastAndroid.show( data.message, ToastAndroid.SHORT );
                }
            } )
            .catch( ( error ) =>
            {
                ToastAndroid.show( error, ToastAndroid.SHORT );
            } )
    }

    const updateParcel = async ( status, deliveryId ) =>
    {
        var APIURL = "https://janfrans.site/api-update-delivery.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        await fetch( APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify( {
                deliveryId: deliveryId,
                deliveryStatus: status
            } ),
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) =>
            {
                if ( data.code == 1 )
                {
                    ToastAndroid.show( data.message, ToastAndroid.SHORT );
                    setViewDeliveryModalVisible( false );
                    getDeliveryListing();
                } else
                {
                    ToastAndroid.show( data.message, ToastAndroid.SHORT );
                }
            } )
            .catch( ( error ) =>
            {
                ToastAndroid.show( error, ToastAndroid.SHORT );
            } )
    }

    if ( userType == 3 )
    {
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
                                        {/* Header Section */}
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <View style={{ flex: 1, marginRight: 10 }}>
                                                    <Text style={[ styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 } ]}>
                                                        TRACKING NO
                                                    </Text>
                                                    <Text style={[ styles.textLabel, { fontSize: 14, marginTop: 2 } ]} numberOfLines={1}>
                                                        {item.tracking_id}
                                                    </Text>
                                                </View>
                                                <Text style={[ styles.textLabel, { fontSize: 12 } ]}>
                                                    {setStatus( item.delivery_status, item.estimated_time )}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Customer Information */}
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                <Ionicons name='person-outline' size={16} color={COLORS.label} style={{ opacity: 0.7, marginRight: 6 }} />
                                                <Text style={[ styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 } ]}>
                                                    DELIVERY TO
                                                </Text>
                                            </View>
                                            <Text style={[ styles.textLabel, { fontSize: 15, marginBottom: 4 } ]} numberOfLines={1}>
                                                {item.full_name}
                                            </Text>
                                            <Text style={[ styles.textDescription, { fontSize: 13, lineHeight: 18 } ]} numberOfLines={2}>
                                                {item.street}, {item.barangay}, {item.city}, {item.zipcode}
                                            </Text>
                                            <Text style={[ styles.textDescription, { fontSize: 13, marginTop: 2 } ]}>
                                                {item.mobile}
                                            </Text>
                                        </View>

                                        {/* Divider */}
                                        <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />

                                        {/* Order Information */}
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                <Ionicons name='cube-outline' size={16} color={COLORS.label} style={{ opacity: 0.7, marginRight: 6 }} />
                                                <Text style={[ styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 } ]}>
                                                    ORDER DETAILS
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <View style={{ flex: 1, marginRight: 12 }}>
                                                    <Text style={[ styles.textLabel, { fontSize: 15, marginBottom: 4 } ]} numberOfLines={2}>
                                                        {item.item}
                                                    </Text>
                                                    <Text style={[ styles.textDescription, { fontSize: 12, lineHeight: 16 } ]} numberOfLines={3}>
                                                        {item.description}
                                                    </Text>
                                                </View>

                                                <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                        <Text style={[ styles.textDescription, { fontSize: 12 } ]}>Qty: </Text>
                                                        <Text style={[ styles.textLabel, { fontSize: 14, fontWeight: '600' } ]}>
                                                            {item.quantity}
                                                        </Text>
                                                    </View>
                                                    <Text style={[ styles.textLabel, {
                                                        fontSize: 16,
                                                        fontWeight: '700',
                                                        color: COLORS.total
                                                    } ]}>
                                                        ₱{parseFloat( item.total_amount ).toLocaleString( 'en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        } )}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Action Indicator */}
                                        <View style={{ alignItems: 'center', paddingTop: 8 }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: COLORS.inputText,
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 15
                                            }}>
                                                <Text style={[ styles.textDescription, { fontSize: 11, marginRight: 4 } ]}>
                                                    Tap to view details
                                                </Text>
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
                    ListEmptyComponent={<Text style={{
                        alignSelf: 'center', marginTop: '80%', fontFamily: 'Poppins-SemiBold'}}>No delivery record found</Text>}
                />

                {/* Modal for Driver View */}
                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setViewDeliveryModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                    key={modalData.id}
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            {/* Order Status Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>Your order is {setStatus( modalData.delivery_status, modalData.estimated_time )}</Text>
                                {modalData.delivery_status === 3 && modalData.estimated_time && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic' } ]}>
                                        Delivered on: {formatDeliveryDate( modalData.estimated_time )}
                                    </Text>
                                )}
                            </View>

                            {/* Delivery Status Timeline Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 20 } ]}>Order Status:</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    {deliveryStatus.map( ( delStatus, index ) =>
                                    {
                                        return (
                                            <View key={index} style={{ marginBottom: 5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {modalData.delivery_status == delStatus.id ?
                                                        <Ionicons name='checkmark-circle-outline' size={24} color={COLORS.button} />
                                                        :
                                                        <Ionicons name='ellipse-outline' size={24} color={COLORS.button} />
                                                    }
                                                    <Text style={[
                                                        styles.textDescription,
                                                        {
                                                            marginLeft: 12,
                                                            fontWeight: delStatus.id == modalData.delivery_status ? '600' : 'normal',
                                                            color: delStatus.id == modalData.delivery_status ? COLORS.button : COLORS.label
                                                        }
                                                    ]}>
                                                        {delStatus.title}
                                                    </Text>
                                                </View>
                                                {delStatus.id !== deliveryStatus[ deliveryStatus.length - 1 ].id && (
                                                    <View style={{ marginLeft: 12, height: 15 }}>
                                                        <Text style={{ color: COLORS.button, lineHeight: 15 }}>|</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )
                                    } )}
                                </View>
                            </View>

                            {/* Shipping Information Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Shipping Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        paddingRight: 15,
                                        paddingTop: 2
                                    }}>
                                        <Ionicons name='car' size={20} color={'green'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.delivered_by}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.tracking_id}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>Created: {modalData.created_at}</Text>
                                        {modalData.delivery_status === 3 && modalData.estimated_time && (
                                            <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>
                                                Delivered: {formatDeliveryDate( modalData.estimated_time )}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Delivery Information Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Delivery Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        paddingRight: 15,
                                        paddingTop: 2
                                    }}>
                                        <Ionicons name='location-outline' size={20} color={'red'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>
                                            {modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}
                                        </Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 8 } ]}>{modalData.mobile}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Order Information Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Order Information:</Text>

                                {/* Store Info */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <Ionicons name='car' size={20} color={'black'} />
                                    <Text style={[ styles.textLabel, { marginLeft: 8 } ]}>{modalData.store}</Text>
                                </View>

                                {/* Product Info */}
                                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                    <View style={{ marginRight: 15 }}>
                                        {/* <Image
                                            style={[ styles.itemImage, { width: 80, height: 80 } ]}
                                            source={{ uri: modalData?.image_base64 ? modalData?.image_base64 : null }}
                                        /> */}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.item}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 8 } ]}>{modalData.description}</Text>
                                        <View style={{ alignSelf: 'flex-end', marginBottom: 4 }}>
                                            <Text style={styles.textDescription}>
                                                Quantity: <Text style={styles.textLabel}>{modalData.quantity}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Total */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    borderTopWidth: 1,
                                    borderTopColor: COLORS.inputBorder,
                                    paddingTop: 15,
                                    marginBottom: 20
                                }}>
                                    <Text style={[ styles.textDescription, { marginRight: 8 } ]}>Total: </Text>
                                    <Text style={[ styles.textLabel, { fontWeight: 'bold' } ]}>{'\u20B1'}{modalData.total_amount}</Text>
                                </View>

                                {/* Driver Action Buttons */}
                                {userType == 3 && (
                                    <View style={{ gap: 12 }}>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#34C759' } ]}
                                            onPress={() => updateParcel( 3, modalData.id )}
                                        >
                                            <Text style={styles.buttonLabel}>Order Delivered</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#FF9500' } ]}
                                            onPress={() => updateParcel( 5, modalData.id )}
                                        >
                                            <Text style={styles.buttonLabel}>Reschedule Order</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[ styles.buttonContainer, { marginTop: 0, backgroundColor: '#FF3B30' } ]}
                                            onPress={() => updateParcel( 4, modalData.id )}
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
                <Modal
                    visible={isQRModalVisible}
                    onRequestClose={() => setViewQRModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                    style={styles.qrModal}
                >
                    <View style={[ styles.container ]}>
                        <View style={styles.body}>
                            <Text style={[ styles.textDescription, { alignSelf: 'center', marginVertical: 20 } ]}>Enter Tracking Number</Text>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={setTrackNo}
                                value={trackNo}
                                placeholder='Tracking No.'
                            />
                            <TouchableOpacity style={styles.buttonContainer} onPress={() => registerParcel()}>
                                <Text style={styles.buttonLabel}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        );
    } else
    {
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
                                        {/* Store and Status Header */}
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 12,
                                            paddingBottom: 8,
                                            borderBottomWidth: 1,
                                            borderBottomColor: COLORS.inputBorder
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <Ionicons name='storefront-outline' size={18} color={COLORS.button} />
                                                <Text style={[ styles.textLabel, {
                                                    fontSize: 14,
                                                    marginLeft: 8,
                                                    fontWeight: '600',
                                                    color: COLORS.button
                                                } ]} numberOfLines={1}>
                                                    {item.store.toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: getStatusColor( item.delivery_status ),
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 12
                                            }}>
                                                <Text style={[ styles.textLabel, {
                                                    fontSize: 11,
                                                    color: 'white',
                                                    fontWeight: '600'
                                                } ]}>
                                                    {setStatus( item.delivery_status, item.estimated_time )}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Product Information */}
                                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                            <View style={{ marginRight: 12 }}>
                                                <Image
                                                    style={[ styles.itemImage, {
                                                        backgroundColor: COLORS.inputText,
                                                        borderRadius: 8
                                                    } ]}
                                                    source={{ uri: item?.image_base64 ? item?.image_base64 : null }}
                                                />
                                            </View>

                                            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={[ styles.textLabel, {
                                                        fontSize: 16,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    } ]} numberOfLines={2}>
                                                        {item.item}
                                                    </Text>
                                                    <Text style={[ styles.textDescription, {
                                                        fontSize: 13,
                                                        lineHeight: 18
                                                    } ]} numberOfLines={3}>
                                                        {item.description}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Order Summary */}
                                        <View style={{
                                            backgroundColor: COLORS.inputText,
                                            padding: 10,
                                            borderRadius: 8,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <View>
                                                <Text style={[ styles.textDescription, { fontSize: 12 } ]}>
                                                    Quantity: {item.quantity} item{item.quantity > 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[ styles.textDescription, { fontSize: 11, marginBottom: 2 } ]}>
                                                    Total Amount
                                                </Text>
                                                <Text style={[ styles.textLabel, {
                                                    fontSize: 16,
                                                    fontWeight: '700',
                                                    color: COLORS.total
                                                } ]}>
                                                    ₱{parseFloat( item.total_amount ).toLocaleString( 'en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    } )}
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
                    ListEmptyComponent={<Text style={{ alignSelf: 'center', marginTop: '100%', fontFamily: 'Poppins-SemiBold' }}>No delivery record found</Text>}
                />

                {/* Modal for Customer View */}
                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setViewDeliveryModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                    key={modalData.id}
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            {/* Order Status Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>Your order is {setStatus( modalData.delivery_status, modalData.estimated_time )}</Text>
                                {modalData.delivery_status === 3 && modalData.estimated_time && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic' } ]}>
                                        Delivered on: {formatDeliveryDate( modalData.estimated_time )}
                                    </Text>
                                )}
                            </View>

                            {/* Delivery Status Timeline Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 20 } ]}>Order Status:</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    {deliveryStatus.map( ( delStatus, index ) =>
                                    {
                                        return (
                                            <View key={index} style={{ marginBottom: 5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {modalData.delivery_status == delStatus.id ?
                                                        <Ionicons name='checkmark-circle-outline' size={24} color={COLORS.button} />
                                                        :
                                                        <Ionicons name='ellipse-outline' size={24} color={COLORS.button} />
                                                    }
                                                    <Text style={[
                                                        styles.textDescription,
                                                        {
                                                            marginLeft: 12,
                                                            fontWeight: delStatus.id == modalData.delivery_status ? '600' : 'normal',
                                                            color: delStatus.id == modalData.delivery_status ? COLORS.button : COLORS.label
                                                        }
                                                    ]}>
                                                        {delStatus.title}
                                                    </Text>
                                                </View>
                                                {delStatus.id !== deliveryStatus[ deliveryStatus.length - 1 ].id && (
                                                    <View style={{ marginLeft: 12, height: 15 }}>
                                                        <Text style={{ color: COLORS.button, lineHeight: 15 }}>|</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )
                                    } )}
                                </View>
                            </View>

                            {/* Shipping Information Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Shipping Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        paddingRight: 15,
                                        paddingTop: 2
                                    }}>
                                        <Ionicons name='car' size={20} color={'green'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.delivered_by}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.tracking_id}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>Created: {modalData.created_at}</Text>
                                        {modalData.delivery_status === 3 && modalData.estimated_time && (
                                            <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>
                                                Delivered: {formatDeliveryDate( modalData.estimated_time )}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Delivery Information Card */}
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Delivery Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        paddingRight: 15,
                                        paddingTop: 2
                                    }}>
                                        <Ionicons name='location-outline' size={20} color={'red'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>
                                            {modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}
                                        </Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 8 } ]}>{modalData.mobile}</Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                            {
                                                navigation.navigate( 'Map', {
                                                    customer_latitude: modalData.driver_latitude,
                                                    customer_longitude: modalData.driver_longitude,
                                                    driver_latitude: modalData.customer_latitude,
                                                    driver_longitude: modalData.customer_longitude,
                                                    id: userId
                                                } );
                                                setViewDeliveryModalVisible( false );
                                            }}
                                            style={{ alignSelf: 'flex-start' }}
                                        >
                                            <Text style={{
                                                fontStyle: 'italic',
                                                textDecorationLine: 'underline',
                                                color: COLORS.button,
                                                fontSize: 14
                                            }}>
                                                View Map
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Order Information Card */}
                            <View style={[ styles.card, { marginBottom: 20 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Order Information:</Text>

                                {/* Store Info */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <Ionicons name='car' size={20} color={'black'} />
                                    <Text style={[ styles.textLabel, { marginLeft: 8 } ]}>{modalData.store}</Text>
                                </View>

                                {/* Product Info */}
                                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                    <View style={{ marginRight: 15 }}>
                                        <Image
                                            style={[ styles.itemImage, { width: 80, height: 80 } ]}
                                            source={{ uri: modalData?.image_base64 ? modalData?.image_base64 : null }}
                                        />
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

                                {/* Total */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    borderTopWidth: 1,
                                    borderTopColor: COLORS.inputBorder,
                                    paddingTop: 10
                                }}>
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