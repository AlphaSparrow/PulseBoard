import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StatusBar,
    ActivityIndicator, Platform
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { getEventFeed } from '../../src/api/event.api';
import { getUserProfile } from '../../src/api/user.api';
import { getAllClubs } from '../../src/api/club.api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const THEME_ACCENT = '#CCF900';
const BG_MAIN = '#050505';
const BG_CARD = '#121212';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

export default function ClubHistoryScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminClub, setAdminClub] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [userData, eventData, allClubs] = await Promise.all([
                getUserProfile(),
                getEventFeed(),
                getAllClubs()
            ]);

            const profile = userData.data || userData;
            const linkedClub = allClubs.find((c: any) => c.email?.toLowerCase() === profile.email?.toLowerCase());

            setAdminClub(linkedClub);

            // In the real world, past events would be retrieved with a 'PAST' badge or history endpoint.
            // For now, we simulate history by showing all events for this club
            const clubEvents = (eventData || []).filter((e: any) => e.clubId === linkedClub?.clubId);
            setEvents(clubEvents);
        } catch (err) {
            console.log("Failed to load history data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && events.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: BG_MAIN, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME_ACCENT} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: BG_MAIN }}>
            <StatusBar barStyle="light-content" backgroundColor={BG_MAIN} />
            <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? hp('1%') : 0 }}>

                {/* Header */}
                <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3%'), paddingBottom: hp('2%') }}>
                    <Text style={{ color: '#737373', fontWeight: 'bold', fontSize: hp('1.5%'), letterSpacing: 3, textTransform: 'uppercase', marginBottom: hp('0.5%') }}>Archive</Text>
                    <Text style={{ color: 'white', fontSize: hp('3.7%'), fontWeight: '900', letterSpacing: -1 }}>Post History</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp('6%'), paddingBottom: hp('5%') }}>

                    {events.length === 0 && !loading && (
                        <View style={{ alignItems: 'center', marginTop: hp('10%') }}>
                            <Clock color="#444" size={hp('6%')} />
                            <Text style={{ color: '#666', marginTop: hp('2%'), fontSize: hp('1.8%') }}>No history of posts yet.</Text>
                        </View>
                    )}

                    {events.map((event: any, idx: number) => {
                        const dateObj = new Date(event.date);
                        return (
                            <View key={event._id || idx} style={{ width: '100%', backgroundColor: BG_CARD, borderRadius: 24, padding: wp('4%'), flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: hp('1.5%') }}>
                                <View style={{ width: wp('16%'), height: wp('16%'), borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: wp('4%'), backgroundColor: '#1A1A1A' }}>
                                    <Text style={{ fontSize: hp('1.2%'), fontWeight: '900', color: '#737373' }}>{dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                                    <Text style={{ color: 'white', fontSize: hp('2.5%'), fontWeight: '900' }}>{dateObj.getDate()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: 'bold' }}>{event.title}</Text>
                                    <Text style={{ color: '#52525B', fontSize: hp('1.4%') }}>{event.timeDisplay} @ {event.location}</Text>
                                    <View style={{ marginTop: hp('0.5%'), paddingHorizontal: wp('1.5%'), paddingVertical: hp('0.3%'), backgroundColor: '#222', alignSelf: 'flex-start', borderRadius: 4 }}>
                                        <Text style={{ color: '#A3A3A3', fontSize: hp('1.2%'), fontWeight: 'bold' }}>{event.badge}</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: hp('2.2%') }}>{event.icon || '📅'}</Text>
                            </View>
                        )
                    })}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
