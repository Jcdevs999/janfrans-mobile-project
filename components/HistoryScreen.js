import React, { useCallback } from 'react';
import { Text, View, FlatList, Image, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../colors';
const styles = require( '../styles' );
import { ToastAndroid } from 'react-native';

export default function HistoryScreen ()
{
    const route = useRoute();
    const userId = route.params?.id;
    const userType = route.params?.userType;
    const driverBillingType = route.params?.billingType;
    const [ isModalVisible, setViewDeliveryModalVisible ] = React.useState( false );
    const [ modalData, setModalData ] = React.useState( {} );
    const [ deliveries, setDeliveries ] = React.useState( [] );

    const openSettingsModal = ( isVisible, item ) =>
    {
        if ( isVisible && item )
        {
            setModalData( item );
            setViewDeliveryModalVisible( true );
        } else
        {
            setViewDeliveryModalVisible( false );
        }
    }

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

        if ( entry == 1 ) { statusText = 'Preparing to ship Parcel'; style.color = 'blue'; }
        if ( entry == 2 ) { statusText = 'In Transit'; style.color = 'orange'; }
        if ( entry == 3 )
        {
            statusText = estimatedTime ? `Delivered` : 'Delivered';
            style.color = 'green';
        }
        if ( entry == 4 ) { statusText = 'Cancelled'; style.color = 'red'; }
        if ( entry == 5 ) { statusText = 'Rescheduled'; style.color = 'blue'; }

        return <Text style={style}>{statusText}</Text>;
    }

    const deliveryStatus = [
        { id: 5, title: 'Rescheduled' },
        { id: 4, title: 'Cancelled' },
        { id: 3, title: 'Delivered' },
        { id: 2, title: 'In Transit' },
        { id: 1, title: 'Preparing to ship Parcel' }
    ];

    const getDeliveryListing = async () =>
    {
        var APIURL = "https://janfrans.net/api-deliveries.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        await fetch( APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify( {
                userId: userId,
                type: 0, 
                userType: userType,
                payMode: driverBillingType
            } ),
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) =>
            {
                if ( Array.isArray( data ) )
                {
                    setDeliveries( data );
                } else
                {
                    setDeliveries( [] );
                }
            } )
            .catch( ( error ) =>
            {
                ToastAndroid.show( "Network error. Please try again.", ToastAndroid.SHORT );
            } )
    }
    
    // FIXED: useFocusEffect to refresh data when screen comes into focus
    useFocusEffect(
      useCallback(() => {
        getDeliveryListing();
      }, [])
    );

    if ( userType == 3 )
    {
        // DRIVER VIEW
        return (
            <View style={styles.container}>
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
                    ListEmptyComponent={<Text style={{ alignSelf: 'center', marginTop: '80%', fontFamily: 'Poppins-SemiBold' }}>No history record found</Text>}
                />

                {/* MODAL VIEW */}
                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setViewDeliveryModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            {/* Header with close button */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.textLabel, { fontSize: 18, fontWeight: 'bold' }]}>Delivery Details</Text>
                                <TouchableOpacity onPress={() => setViewDeliveryModalVisible(false)} style={{ padding: 5 }}>
                                    <Ionicons name='close' size={24} color={COLORS.label} />
                                </TouchableOpacity>
                            </View>

                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>This order was {setStatus( modalData.delivery_status, modalData.estimated_time )}</Text>
                                {modalData.delivery_status === 3 && modalData.estimated_time && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic' } ]}>
                                        Completed on: {formatDeliveryDate( modalData.estimated_time )}
                                    </Text>
                                )}
                                {modalData.delivery_status === 5 && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic', color: 'blue' } ]}>
                                        This delivery has been rescheduled
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
                                    <Ionicons name='location-outline' size={20} color={'red'} style={{ marginRight: 10, paddingTop: 2, marginBottom: 5 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.consignee_name || modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}</Text>
                                        <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />
                                        <Text style={[ styles.textDescription, { marginBottom: 8, fontWeight: 'bold', fontSize: 14 } ]}>
                                            Total Amount Collected: {'\u20B1'}
                                            {modalData.total_amount_to_be_collected ? parseFloat( modalData.total_amount_to_be_collected ).toLocaleString( 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) : '0.00'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        );
    } else
    {
        // CUSTOMER VIEW
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.container}
                    data={deliveries}
                    renderItem={( { item, index } ) =>
                    {
                        return (
                            <TouchableOpacity onPress={() => openSettingsModal( true, item )}>
                                <View style={styles.screenBodyContainer} key={index}>
                                    <View style={styles.card}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name='car' size={20} color={'black'} />
                                                <Text style={styles.textLabel}>  {item.shipper_name?.toUpperCase() || 'N/A'}</Text>
                                            </View>
                                            <Text style={styles.textLabel}>{setStatus( item.delivery_status )}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View>
                                                <Image
                                                    style={styles.itemImage}
                                                    source={{ uri: item?.image_base64 ? item?.image_base64 : null }}
                                                />
                                            </View>
                                            <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                                <Text style={[ styles.textLabel, { fontSize: 18 } ]}>{item.consignee_name || 'N/A'}</Text>
                                                <Text style={styles.textDescription}>{item.tracking_id}</Text>
                                                <Text style={[ styles.textDescription, { marginTop: 5 } ]}>
                                                    Amount: ₱{item.total_amount_to_be_collected ? parseFloat(item.total_amount_to_be_collected).toFixed(2) : '0.00'}
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
                    ListEmptyComponent={<Text style={{ alignSelf: 'center', marginTop: '80%', fontFamily: 'Poppins-SemiBold' }}>No history record found</Text>}
                />

                {/* CUSTOMER MODAL */}
                <Modal
                    visible={isModalVisible}
                    onRequestClose={() => setViewDeliveryModalVisible( false )}
                    animationType='slide'
                    propagateSwipe={true}
                >
                    <ScrollView style={styles.container}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                            {/* Header with close button */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.textLabel, { fontSize: 18, fontWeight: 'bold' }]}>Order Details</Text>
                                <TouchableOpacity onPress={() => setViewDeliveryModalVisible(false)} style={{ padding: 5 }}>
                                    <Ionicons name='close' size={24} color={COLORS.label} />
                                </TouchableOpacity>
                            </View>

                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={styles.textLabel}>Your order is {setStatus( modalData.delivery_status )}</Text>
                                {modalData.delivery_status === 5 && (
                                    <Text style={[ styles.textDescription, { marginTop: 8, fontStyle: 'italic', color: 'blue' } ]}>
                                        This delivery has been rescheduled
                                    </Text>
                                )}
                            </View>
                            
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 25 } ]}>Order Status:</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    {deliveryStatus.map( ( delStatus, index ) => (
                                        <View key={index} style={{ marginBottom: 5 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons 
                                                    name={modalData.delivery_status >= delStatus.id ? 'checkmark-circle-outline' : 'ellipse-outline'} 
                                                    size={24} 
                                                    color={COLORS.button} 
                                                />
                                                <Text style={[ styles.textDescription, { marginLeft: 12, fontWeight: delStatus.id == modalData.delivery_status ? '600' : 'normal', color: delStatus.id == modalData.delivery_status ? COLORS.button : COLORS.label } ]}>
                                                    {delStatus.title}
                                                </Text>
                                            </View>
                                            {delStatus.id !== deliveryStatus[ deliveryStatus.length - 1 ].id && (
                                                <View style={{ marginLeft: 11, height: 15, borderLeftWidth: 2, borderLeftColor: COLORS.button }} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                            
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Shipping Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Ionicons name='cube-outline' size={20} color={COLORS.label} style={{ opacity: 0.7, marginRight: 15, paddingTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.shipper_name || 'N/A'}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.tracking_id}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{formatDeliveryDate(modalData.created_at)}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={[ styles.card, { marginBottom: 15 } ]}>
                                <Text style={[ styles.textLabel, { marginBottom: 15 } ]}>Delivery Information:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Ionicons name='location-outline' size={20} color={'red'} style={{ marginRight: 15, paddingTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[ styles.textLabel, { marginBottom: 4 } ]}>{modalData.consignee_name || modalData.full_name}</Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>
                                            {modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}
                                        </Text>
                                        <Text style={[ styles.textDescription, { marginBottom: 3 } ]}>{modalData.mobile}</Text>
                                        
                                        <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />
                                        
                                        <Text style={[ styles.textDescription, { marginBottom: 8, fontWeight: 'bold', fontSize: 14 } ]}>
                                            Total Amount: ₱{modalData.total_amount_to_be_collected ? parseFloat(modalData.total_amount_to_be_collected).toFixed(2) : '0.00'}
                                        </Text>
                                        
                                        {modalData.delivery_status === 3 && modalData.estimated_time && (
                                            <Text style={[ styles.textDescription, { fontStyle: 'italic', color: 'green' } ]}>
                                                Delivered on: {formatDeliveryDate(modalData.estimated_time)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        );
    }
}