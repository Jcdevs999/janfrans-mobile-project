import React, { useEffect } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '../colors';
// Remove this line: const styles = require('../styles');
import { ToastAndroid } from 'react-native';

const getNotificationIcon = (type) => {
    switch(type) {
        case 'message': return '💬';
        case 'alert': return '⚠️';
        case 'update': return '🔄';
        case 'reminder': return '⏰';
        case 'system': return '⚙️';
        default: return '🔔';
    }
};

const getNotificationColor = (type) => {
    switch(type) {
        case 'message': return '#007AFF';
        case 'alert': return '#ff3b30';
        case 'update': return '#34c759';
        case 'reminder': return '#ff9500';
        case 'system': return '#8e8e93';
        default: return '#007AFF';
    }
};

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
};

export default function NotificationScreen() {

    const route = useRoute();
    const userId = route.params?.id;
    const userType = route.params?.userType;

    useEffect(() => {
        getNotificationListing();
    }, []);
    const [notification, setNotification] = React.useState([]);

    const getNotificationListing = async () => {
        var APIURL = "https://janfrans.site/api-notification.php";
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        await fetch(APIURL, {
            method: 'post',
            headers: headers,
            body: JSON.stringify({
                userId: userId,
                userType: userType
            }),
        })
        .then((response) => response.json())
        .then((data)=>{
            setNotification(data);
            getNotificationListing();
        })
        .catch((error)=>{
            ToastAndroid.show(error, ToastAndroid.SHORT);
        })
    }

return (
        <FlatList 
            style={styles.container}
            data={notification}
            renderItem={({item, index}) => {
                return (
                    <View style={styles.screenBodyContainer} key={index}>
                        <View style={[styles.card, {opacity: item.is_read ? 0.7 : 1}]}>
                            {/* Unread indicator */}
                            {!item.is_read && <View style={styles.unreadIndicator} />}
                            
                            <View style={styles.cardContent}>
                                <View style={styles.headerRow}>
                                    {/* Icon container */}
                                    <View style={styles.iconContainer}>
                                        <View style={[styles.iconCircle, {backgroundColor: getNotificationColor(item.type)}]}>
                                            <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Content */}
                                    <View style={styles.contentContainer}>
                                        <Text 
                                            style={[
                                                styles.textLabel, 
                                                {fontWeight: item.is_read ? 'normal' : '600'}
                                            ]} 
                                            numberOfLines={2}
                                        >
                                            {userType == 3 ? item.activity : item.message}
                                        </Text>
                                        
                                        <View style={styles.metaRow}>
                                            <Text style={styles.textDescription}>
                                                {formatTimeAgo(item.created_at)}
                                            </Text>
                                            {item.priority === 'high' && (
                                                <View style={styles.priorityBadge}>
                                                    <Text style={styles.priorityText}>!</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    
                                    {/* Action indicator */}
                                    <View style={styles.actionContainer}>
                                        <Text style={styles.chevron}>›</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )
            }}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={<View style={styles.separator} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Text style={styles.emptyIcon}>🔔</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptyDescription}>
                        You'll see your notifications here when you receive them
                    </Text>
                </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={notification.length === 0 ? styles.emptyListContainer : null}
        />
    );
};

const styles = StyleSheet.create({
    // External styles that you need (add from your styles.js)
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    textLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.label,
        fontFamily: 'Poppins-SemiBold',
    },
    textDescription: {
        fontSize: 12,
        fontWeight: "400",
        color: COLORS.label,
        fontFamily: 'Poppins-Regular',
    },
    card: {
        borderWidth: 1, 
        borderColor: COLORS.inputBorder, 
        borderRadius: 10, 
        backgroundColor: COLORS.white, 
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    screenBodyContainer: {
        paddingHorizontal: 15,
        paddingTop: 5,
        paddingBottom: 5,
    },
    
    // Local notification-specific styles
    unreadIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: '#007AFF',
        zIndex: 1,
    },
    cardContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priorityBadge: {
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    priorityText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
    },
    chevron: {
        fontSize: 18,
        color: '#c7c7cc',
        fontWeight: '300',
    },
    separator: {
        height: 8,
    },
    emptyListContainer: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f2f2f7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 15,
        color: '#8e8e93',
        textAlign: 'center',
        lineHeight: 20,
    },
});