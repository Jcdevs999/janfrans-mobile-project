import React, { useEffect } from 'react';
import { Text, View, FlatList, Image, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../colors';
const styles = require('../styles');
import { ToastAndroid } from 'react-native';

export default function HistoryScreen() {

    const route = useRoute();
    const userId = route.params?.id;
    const email = route.params?.email;
    const userType = route.params?.userType;

    const[isModalVisible, setViewDeliveryModalVisible] = React.useState(false);
    const [modalData, setModalData] = React.useState([]);

    const openSettingsModal = (isVisible, data) => {
        setModalData(data);
        setViewDeliveryModalVisible(isVisible);
    }

    const setStatus = (entry) => {
        let x = '';
        if(entry == 1) x = <Text style={{color: 'blue'}}>Preparing to ship Parcel</Text>;
        if(entry == 2) x = <Text style={{color: 'orange'}}>In Transit</Text>;
        if(entry == 3) x = <Text style={{color: 'green'}}>Delivered</Text>;
        if(entry == 4) x = <Text style={{color: 'red'}}>Cancelled</Text>;
        if(entry == 5) x = <Text style={{color: 'blue'}}>Rescheduled</Text>;
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

    useEffect(() => {
        getDeliveryListing();
    }, []);
    const [deliveries, setDeliveries] = React.useState([]);
    const getDeliveryListing = async () => {
        var APIURL = "https://janfrans.net/api-deliveries.php";
        var headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        await fetch(APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify({
                userId: userId,
                type: 0,
                userType: userType
            }),
        })
        .then((response) => response.json())
        .then((data)=>{
           setDeliveries(data);
           getDeliveryListing();
        })
        .catch((error)=>{
            ToastAndroid.show(error, ToastAndroid.SHORT);
        })
    }

    if(userType == 3){
        return (
            <View style={styles.container}>
                <FlatList 
                    style={styles.container}
                    data={deliveries}
 renderItem={({item, i}) => {
                    return (
                        <TouchableOpacity onPress={() => openSettingsModal(true, item)}>
                            <View style={styles.screenBodyContainer} key={i}>
                                <View style={styles.card}>
                                    {/* Header Section */}
                                    <View style={{ marginBottom: 12 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <View style={{ flex: 1, marginRight: 10 }}>
                                                <Text style={[styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 }]}>
                                                    TRACKING NO
                                                </Text>
                                                <Text style={[styles.textLabel, { fontSize: 14, marginTop: 2 }]} numberOfLines={1}>
                                                    {item.tracking_id}
                                                </Text>
                                            </View>
                                            <Text style={[styles.textLabel, { fontSize: 12 }]}>
                                                {setStatus(item.delivery_status)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Customer Information */}
                                    <View style={{ marginBottom: 12 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <Ionicons name='person-outline' size={16} color={COLORS.label} style={{ opacity: 0.7, marginRight: 6 }} />
                                            <Text style={[styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 }]}>
                                                DELIVERY TO
                                            </Text>
                                        </View>
                                        <Text style={[styles.textLabel, { fontSize: 15, marginBottom: 4 }]} numberOfLines={1}>
                                            {item.full_name}
                                        </Text>
                                        <Text style={[styles.textDescription, { fontSize: 13, lineHeight: 18 }]} numberOfLines={2}>
                                            {item.street}, {item.barangay}, {item.city}, {item.zipcode}
                                        </Text>
                                        <Text style={[styles.textDescription, { fontSize: 13, marginTop: 2 }]}>
                                            {item.mobile}
                                        </Text>
                                    </View>

                                    {/* Divider */}
                                    <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 12 }} />

                                    {/* Order Information */}
                                    <View style={{ marginBottom: 12 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <Ionicons name='cube-outline' size={16} color={COLORS.label} style={{ opacity: 0.7, marginRight: 6 }} />
                                            <Text style={[styles.textLabel, { fontSize: 12, color: COLORS.label, opacity: 0.7 }]}>
                                                ORDER DETAILS
                                            </Text>
                                        </View>
                                        
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text style={[styles.textLabel, { fontSize: 15, marginBottom: 4 }]} numberOfLines={2}>
                                                    {item.item}
                                                </Text>
                                                <Text style={[styles.textDescription, { fontSize: 12, lineHeight: 16 }]} numberOfLines={3}>
                                                    {item.description}
                                                </Text>
                                            </View>
                                            
                                            <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                    <Text style={[styles.textDescription, { fontSize: 12 }]}>Qty: </Text>
                                                    <Text style={[styles.textLabel, { fontSize: 14, fontWeight: '600' }]}>
                                                        {item.quantity}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.textLabel, { 
                                                    fontSize: 16, 
                                                    fontWeight: '700', 
                                                    color: COLORS.total 
                                                }]}>
                                                    ₱{parseFloat(item.total_amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
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
                                            <Text style={[styles.textDescription, { fontSize: 11, marginRight: 4 }]}>
                                                Tap to view details
                                            </Text>
                                            <Ionicons name='chevron-forward' size={12} color={COLORS.label} style={{ opacity: 0.5 }} />
                                        </View>
                                    </View>
                                </View>

                                <Modal 
                                    visible={isModalVisible}
                                    onRequestClose={() => setViewDeliveryModalVisible(false)}
                                    animationType='slide'
                                    propagateSwipe={true}
                                    key={modalData.id}
                                >
                                    <ScrollView style={styles.container}>
                                        <View style={{paddingHorizontal: 15, paddingVertical: 15}}>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={styles.textLabel}>Your order is {setStatus(modalData.delivery_status)}</Text>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 25}]}>Order Status:</Text>
                                                {
                                                    deliveryStatus.map((delStatus, index) => {
                                                        return (
                                                            <View style={{marginLeft: 7}} key={index}>
                                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                                    {
                                                                        modalData.delivery_status == delStatus.id ?
                                                                            <Ionicons name='checkmark-circle-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                    }
                                                                    {
                                                                        delStatus.id == modalData.delivery_status ?
                                                                            <Text style={[styles.textDescription, {marginLeft: 10, fontWeight: '600', color: COLORS.button}]}>{delStatus.title}</Text>
                                                                            :
                                                                            <Text style={[styles.textDescription, {marginLeft: 10}]}>{delStatus.title}</Text>
                                                                    }
                                                                </View>
                                                                {
                                                                    delStatus.id == 1 ? <Text></Text> : <Text style={{marginLeft: 13, color: COLORS.button}}>|</Text>
                                                                }
                                                            </View>
                                                        )
                                                    })
                                                }
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 10}]}>Shipping Information:</Text>
                                                <View style={{flexDirection: 'row'}}>
                                                    <View style={{alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10}}>
                                                        <Ionicons name='car' size={20} color={'green'}/>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.textLabel}>{modalData.delivered_by}</Text>
                                                        <Text style={styles.textDescription}>{modalData.tracking_id}</Text>
                                                        <Text style={styles.textDescription}>{modalData.created_at}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 10}]}>Delivery Information:</Text>
                                                <View style={{flexDirection: 'row'}}>
                                                    <View style={{alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10}}>
                                                        <Ionicons name='location-outline' size={20} color={'red'}/>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.textLabel}>{modalData.full_name}</Text>
                                                        <Text style={styles.textDescription}>{modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}</Text>
                                                        <Text style={styles.textDescription}>{modalData.mobile}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={styles.textLabel}>Order Information:</Text>        
                                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
                                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                        <Ionicons name='car' size={20} color={'black'}/><Text style={styles.textLabel}>  {modalData.store}</Text>
                                                    </View>
                                                </View>
                                                <View style={{marginVertical: 5}}>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <View>
                                                            {/* <Image
                                                                style={styles.itemImage}
                                                                source={{uri:modalData?.image_base64 ? modalData?.image_base64 : null}}
                                                            /> */}
                                                        </View>
                                                        <View style={{paddingHorizontal: 10, flex: 1}}>
                                                            <Text style={styles.textLabel} numberOfLines={2}>{modalData.item}</Text>
                                                            <Text style={styles.textDescription} numberOfLines={3}>{modalData.description}</Text>
                                                            <View style={{flexDirection: 'row'}}>
                                                                <Text style={styles.textDescription}>Quantity: </Text>
                                                                <Text style={styles.textLabel}>{modalData.quantity}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={{alignSelf: 'flex-end'}}>
                                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                            <Text style={styles.textDescription}>Total: </Text>
                                                            <Text style={styles.textLabel}>₱{modalData.total_amount}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </Modal>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={<View style={{height: 5}} />}
                    ListEmptyComponent={<Text style={{alignSelf: 'center', marginTop: '100%'}}>No history record found</Text>}
                />
           </View>
        );
    }else{
        return (
            <FlatList 
                style={styles.container}
                data={deliveries}
                renderItem={({item, i}) => {
                    return (
                        
                        <TouchableOpacity onPress={() => openSettingsModal(true, item)}>
                            <View style={styles.screenBodyContainer} key={i}>
                                <View style={styles.card}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Ionicons name='car' size={20} color={'black'}/><Text style={styles.textLabel}>  {item.store.toUpperCase()}</Text>
                                        </View>
                                        <Text style={styles.textLabel}>{setStatus(item.delivery_status)}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row'}}>
                                        <View>
                                            <Image
                                                style={styles.itemImage}
                                                source={{uri:item?.image_base64 ? item?.image_base64 : null}}
                                            />
                                        </View>
                                        <View style={{paddingHorizontal: 10}}>
                                            <Text style={[styles.textLabel, {fontSize: 18}]}>{item.item}</Text>
                                            <Text style={styles.textDescription}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={{alignSelf: 'flex-end'}}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={styles.textDescription}>Quantity:  </Text>
                                            <Text style={styles.textLabel}>{item.quantity}</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={styles.textDescription}>Total of {item.quantity} item(s):  </Text>
                                            <Text style={styles.textLabel}>{'\u20B1'}{item.total_amount}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Modal 
                                    visible={isModalVisible}
                                    onRequestClose={() => setViewDeliveryModalVisible(false)}
                                    animationType='slide'
                                    propagateSwipe={true}
                                    key={modalData.id}
                                >
                                    <ScrollView style={styles.container}>
                                        <View style={{paddingHorizontal: 15, paddingVertical: 15}}>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={styles.textLabel}>Your order is {setStatus(modalData.delivery_status)}</Text>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 25}]}>Order Status:</Text>
                                                {
                                                    deliveryStatus.map((delStatus, index) => {
                                                        return (
                                                            <View style={{marginLeft: 7}} key={index}>
                                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                                    {
                                                                        modalData.delivery_status == 1 && delStatus.id != modalData.delivery_status ? 
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            modalData.delivery_status == 2 && delStatus.id != modalData.delivery_status ? 
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            modalData.delivery_status == 3 && delStatus.id != modalData.delivery_status ? 
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            modalData.delivery_status == 4 && delStatus.id != modalData.delivery_status ? 
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            modalData.delivery_status == 5 && delStatus.id != modalData.delivery_status ? 
                                                                            <Ionicons name='ellipse-outline' size={30} color={COLORS.button}/>
                                                                            :
                                                                            <Ionicons name='checkmark-circle-outline' size={30} color={COLORS.button}/> 
                                                                    }
                                                                    {
                                                                        delStatus.id == modalData.delivery_status ?
                                                                            <Text style={[styles.textDescription, {marginLeft: 10, fontWeight: 600, color: COLORS.button}]}>{delStatus.title}</Text>
                                                                            :
                                                                            <Text style={[styles.textDescription, {marginLeft: 10}]}>{delStatus.title}</Text>
                                                                    }
                                                                </View>
                                                                    {
                                                                        delStatus.id == 1 ? <Text></Text> : <Text style={{marginLeft: 13, color: COLORS.button}}>|</Text>
                                                                    }
                                                            </View>
                                                        )
                                                    })
                                                }
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 10}]}>Shipping Information:</Text>
                                                <View style={{flexDirection: 'row'}}>
                                                    <View style={{alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10}}>
                                                        <Ionicons name='car' size={20} color={'green'}/>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.textLabel}>{modalData.delivered_by}</Text>
                                                        <Text style={styles.textDescription}>{modalData.tracking_id}</Text>
                                                        <Text style={styles.textDescription}>{modalData.created_at}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={[styles.textLabel, {marginBottom: 10}]}>Delivery Information:</Text>
                                                <View style={{flexDirection: 'row'}}>
                                                    <View style={{alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10}}>
                                                        <Ionicons name='location-outline' size={20} color={'red'}/>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.textLabel}>{modalData.full_name}</Text>
                                                        <Text style={styles.textDescription}>{modalData.street}, {modalData.barangay}, {modalData.city}, {modalData.zipcode}</Text>
                                                        <Text style={styles.textDescription}>{modalData.mobile}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[styles.card, {marginVertical: 5}]}>
                                                <Text style={styles.textLabel}>Order Information:</Text>        
                                                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
                                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                        <Ionicons name='car' size={20} color={'black'}/><Text style={styles.textLabel}>  {modalData.store}</Text>
                                                    </View>
                                                </View>
                                                <View style={{marginVertical: 15}}>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <View>
                                                            <Image
                                                                style={styles.itemImage}
                                                                source={{uri:modalData?.image_base64 ? modalData?.image_base64 : null}}
                                                            />
                                                        </View>
                                                        <View style={{paddingHorizontal: 10}}>
                                                            <Text style={styles.textLabel}>{modalData.item}</Text>
                                                            <Text style={styles.textDescription}>{modalData.description}</Text>
                                                            <View style={{flexDirection: 'row'}}>
                                                                <Text style={styles.textDescription}>Quantity: </Text>
                                                                <Text style={styles.textLabel}>{modalData.quantity}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={{alignSelf: 'flex-end'}}>
                                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                            <Text style={styles.textDescription}>Total: </Text>
                                                            <Text style={styles.textLabel}>{'\u20B1'}{modalData.total_amount}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </Modal>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={<View style={{height: 5}} />}
                ListEmptyComponent={<Text style={{alignSelf: 'center', marginTop: '100%'}}>No history record found</Text>}
            />
        );
    }
    
}