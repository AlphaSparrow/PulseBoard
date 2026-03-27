import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    ImageBackground,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, MapPin, Clock, RefreshCw, Inbox, X, Mail, Calendar } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import api from '../../src/api/client';

const BG_IMAGE = require('../../assets/roll.jpg');

interface PersonalEvent {
    _id: string;
    title: string;
    description?: string;
    icon: string;
    badge: 'LIVE' | 'UPCOMING';
    date: string;
    timeDisplay: string;
    location: string;
    color?: string;
    sourceFrom: string;
    sourceSubject: string;
}

export default function InboxScreen() {
    const [events, setEvents] = useState<PersonalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rescanning, setRescanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null);

    const fetchEvents = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        setError(null);
        try {
            const response = await api.get('/personal-events');
            setEvents(response.data?.events || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load smart inbox.');
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    };

    const handleRescan = async () => {
        Alert.alert(
            'Re-scan Inbox',
            'This will clear your current events and re-analyse your Gmail with updated filters. Results appear in the next scan cycle (up to 5 min).',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Re-scan',
                    style: 'destructive',
                    onPress: async () => {
                        setRescanning(true);
                        try {
                            await api.post('/personal-events/rescan');
                            setEvents([]);
                            Alert.alert('Re-scan started', 'Your inbox will be updated within 5 minutes. Pull to refresh.');
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Re-scan failed.');
                        } finally {
                            setRescanning(false);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => { fetchEvents(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEvents(true);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderEvent = ({ item }: { item: PersonalEvent }) => (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setSelectedEvent(item)}
            style={{
                backgroundColor: '#111',
                borderRadius: 12,
                marginBottom: hp('1.8%'),
                borderWidth: 1,
                borderColor: '#222',
                overflow: 'hidden',
            }}
        >
            {/* Colored top bar */}
            <View style={{ height: 3, backgroundColor: item.color || '#CCF900' }} />

            <View style={{ padding: wp('4%') }}>
                {/* Header row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%') }}>
                    <Text style={{ fontSize: hp('2.8%'), marginRight: wp('2%') }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: hp('1.9%') }} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <Text style={{ color: '#666', fontSize: hp('1.3%'), marginTop: 2 }} numberOfLines={1}>
                            {item.sourceFrom}
                        </Text>
                    </View>
                    {item.badge === 'LIVE' && (
                        <View style={{ backgroundColor: '#ff4444', paddingHorizontal: wp('2%'), paddingVertical: 3, borderRadius: 4 }}>
                            <Text style={{ color: '#fff', fontSize: hp('1.2%'), fontWeight: '900', letterSpacing: 1 }}>LIVE</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                {item.description ? (
                    <Text style={{ color: '#aaa', fontSize: hp('1.5%'), marginBottom: hp('1%') }} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                {/* Date / time / location row */}
                <View style={{ flexDirection: 'row', gap: wp('4%'), flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={hp('1.6%')} color="#CCF900" />
                        <Text style={{ color: '#CCF900', fontSize: hp('1.4%'), fontWeight: '700' }}>
                            {formatDate(item.date)}{'  '}{item.timeDisplay}
                        </Text>
                    </View>
                    {item.location !== 'TBD' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MapPin size={hp('1.6%')} color="#888" />
                            <Text style={{ color: '#888', fontSize: hp('1.4%') }}>{item.location}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#050505' }}>
            <StatusBar hidden={true} />
            <ImageBackground
                source={BG_IMAGE}
                style={{ flex: 1 }}
                resizeMode="cover"
                imageStyle={{ opacity: 0.15 }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(5, 5, 5, 0.85)', '#050505']}
                    locations={[0, 0.4, 0.8]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={{
                        paddingHorizontal: wp('5%'),
                        paddingTop: hp('2%'),
                        paddingBottom: hp('2%'),
                        borderBottomWidth: 1,
                        borderBottomColor: '#1a1a1a',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: hp('0.5%') }}>
                                <Zap size={hp('1.6%')} color="#CCF900" fill="#CCF900" />
                                <Text style={{ color: '#CCF900', fontFamily: 'monospace', fontSize: hp('1.3%'), letterSpacing: 2 }}>
                                    AI-PARSED FROM YOUR GMAIL
                                </Text>
                            </View>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: hp('3%'), letterSpacing: 1 }}>
                                Smart Inbox
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: wp('3%'), alignItems: 'center' }}>
                            {/* Re-scan button */}
                            <TouchableOpacity onPress={handleRescan} disabled={rescanning} style={{ padding: 4 }}>
                                {rescanning
                                    ? <ActivityIndicator size="small" color="#CCF900" />
                                    : <Zap size={wp('5%')} color="#CCF900" />
                                }
                            </TouchableOpacity>
                            {/* Refresh button */}
                            <TouchableOpacity onPress={() => fetchEvents(false)} disabled={loading} style={{ padding: 4 }}>
                                <RefreshCw color={loading ? '#555' : '#CCF900'} size={wp('5.5%')} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1, paddingHorizontal: wp('5%'), paddingTop: hp('2%') }}>
                        {loading && !refreshing ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#CCF900" />
                                <Text style={{ color: '#888', marginTop: hp('2%'), fontFamily: 'monospace', fontSize: hp('1.4%') }}>
                                    Loading smart events...
                                </Text>
                            </View>
                        ) : error ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp('10%') }}>
                                <Text style={{ color: '#ff4444', textAlign: 'center', fontSize: hp('1.8%') }}>{error}</Text>
                            </View>
                        ) : events.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp('10%') }}>
                                <Inbox color="#333" size={hp('8%')} />
                                <Text style={{ color: '#fff', fontWeight: '800', fontSize: hp('2%'), marginTop: hp('2%'), textAlign: 'center' }}>
                                    No events yet
                                </Text>
                                <Text style={{ color: '#555', fontSize: hp('1.5%'), textAlign: 'center', marginTop: hp('1%'), lineHeight: hp('2.2%') }}>
                                    PulseBoard scans your Gmail every 5 minutes.{'\n'}Tap the ⚡ icon above to force a fresh re-scan.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={events}
                                keyExtractor={(item) => item._id}
                                renderItem={renderEvent}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: hp('4%') }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        tintColor="#CCF900"
                                        colors={['#CCF900']}
                                    />
                                }
                            />
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>

            {/* ── Full Event Detail Modal ── */}
            <Modal
                visible={!!selectedEvent}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedEvent(null)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: '#0d0d0d',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderWidth: 1,
                        borderColor: '#222',
                        maxHeight: hp('85%'),
                    }}>
                        {selectedEvent && (
                            <>
                                {/* Colored accent bar */}
                                <View style={{ height: 4, backgroundColor: selectedEvent.color || '#CCF900', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />

                                <ScrollView contentContainerStyle={{ padding: wp('6%') }} showsVerticalScrollIndicator={false}>
                                    {/* Close button */}
                                    <TouchableOpacity
                                        onPress={() => setSelectedEvent(null)}
                                        style={{ alignSelf: 'flex-end', marginBottom: hp('1%') }}
                                    >
                                        <X color="#555" size={wp('6%')} />
                                    </TouchableOpacity>

                                    {/* Icon + Title */}
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: wp('3%'), marginBottom: hp('2%') }}>
                                        <Text style={{ fontSize: hp('5%') }}>{selectedEvent.icon}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: hp('2.6%'), lineHeight: hp('3.2%') }}>
                                                {selectedEvent.title}
                                            </Text>
                                            {selectedEvent.badge === 'LIVE' && (
                                                <View style={{ backgroundColor: '#ff4444', alignSelf: 'flex-start', paddingHorizontal: wp('2.5%'), paddingVertical: 4, borderRadius: 4, marginTop: 6 }}>
                                                    <Text style={{ color: '#fff', fontSize: hp('1.3%'), fontWeight: '900', letterSpacing: 1 }}>● LIVE NOW</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Description */}
                                    {selectedEvent.description ? (
                                        <Text style={{ color: '#bbb', fontSize: hp('1.7%'), lineHeight: hp('2.6%'), marginBottom: hp('2.5%') }}>
                                            {selectedEvent.description}
                                        </Text>
                                    ) : null}

                                    {/* Divider */}
                                    <View style={{ height: 1, backgroundColor: '#1e1e1e', marginBottom: hp('2.5%') }} />

                                    {/* Date & Time */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%'), marginBottom: hp('1.8%') }}>
                                        <Calendar size={hp('2.2%')} color="#CCF900" />
                                        <View>
                                            <Text style={{ color: '#888', fontSize: hp('1.3%'), marginBottom: 2 }}>DATE & TIME</Text>
                                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: hp('1.8%') }}>
                                                {formatDate(selectedEvent.date)}
                                            </Text>
                                            <Text style={{ color: '#CCF900', fontSize: hp('1.6%'), marginTop: 2 }}>
                                                {selectedEvent.timeDisplay}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Location */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%'), marginBottom: hp('1.8%') }}>
                                        <MapPin size={hp('2.2%')} color="#CCF900" />
                                        <View>
                                            <Text style={{ color: '#888', fontSize: hp('1.3%'), marginBottom: 2 }}>LOCATION</Text>
                                            <Text style={{ color: selectedEvent.location !== 'TBD' ? '#fff' : '#555', fontWeight: '600', fontSize: hp('1.8%') }}>
                                                {selectedEvent.location}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View style={{ height: 1, backgroundColor: '#1e1e1e', marginBottom: hp('2.5%') }} />

                                    {/* Source Email */}
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: wp('3%'), marginBottom: hp('1.8%') }}>
                                        <Mail size={hp('2.2%')} color="#666" style={{ marginTop: 2 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#888', fontSize: hp('1.3%'), marginBottom: 2 }}>FROM</Text>
                                            <Text style={{ color: '#aaa', fontSize: hp('1.6%') }}>{selectedEvent.sourceFrom || '—'}</Text>
                                            <Text style={{ color: '#555', fontSize: hp('1.4%'), marginTop: 4 }} numberOfLines={3}>
                                                {selectedEvent.sourceSubject}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ height: hp('3%') }} />
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
