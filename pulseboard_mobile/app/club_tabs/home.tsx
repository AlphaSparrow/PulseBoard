import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, Platform,
    Modal, TextInput, TextInputProps, Alert, Image, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MapPin, LogOut, X, Plus, Mail, ChevronLeft, ImageUp, Clock, ChevronRight,
    PlayCircle, Calendar, Grid, Siren, Settings, Menu
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { createEventApi, fetchEventsByClub } from '../../src/api/event.api';
import { getUserProfile } from '../../src/api/user.api';
import { getAllClubs } from '../../src/api/club.api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';


const THEME_ACCENT = '#CCF900';

const getRgba = (hex: string, opacity: number) => {
    if (!hex) return `rgba(255, 255, 255, ${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const SectionHeader = React.memo(({ title, icon: Icon, color = "white" }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp('6%'), marginBottom: hp('2.5%'), marginTop: hp('1%') }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%') }}>
      {Icon && <Icon color={color} size={hp('2.5%')} />}
      <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  </View>
));

const SidebarItem = React.memo(({ icon: Icon, label, color, index, onPress, isAlert }: any) => (
  <MotiView
    from={{ opacity: 0, translateX: 20 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ type: 'timing', duration: 300, delay: index * 30, easing: Easing.out(Easing.quad) }}
    style={{ marginBottom: hp('1.2%') }}
  >
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: hp('1.6%'), paddingHorizontal: wp('4%'), backgroundColor: '#0F0F0F',
        borderRadius: 18, borderWidth: 1, borderColor: isAlert ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: wp('10%'), height: wp('10%'), borderRadius: 12, backgroundColor: getRgba(color, 0.1),
          alignItems: 'center', justifyContent: 'center', marginRight: wp('3.5%'), borderWidth: 1, borderColor: getRgba(color, 0.15)
        }}>
          <Icon color={color} size={hp('2%')} />
        </View>
        <Text style={{ color: isAlert ? '#EF4444' : '#E5E5E5', fontSize: hp('1.7%'), fontWeight: '600' }}>{label}</Text>
      </View>
      {!isAlert && <ChevronRight color="#333" size={hp('1.8%')} />}
    </TouchableOpacity>
  </MotiView>
));

export default function ClubHomeScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminClub, setAdminClub] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '', location: '', timeDisplay: '', description: '',
        badge: 'UPCOMING', color: '#EAB308'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [eventDate, setEventDate] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [eventTime, setEventTime] = useState(new Date());
    const [eventEndTime, setEventEndTime] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    const handleLogout = async () => {
        // Implement logout logic if applicable or just route to login
        router.replace('/');
    };

    const openEventModal = (event: any) => {
        setSelectedEvent(event);
        setEventModalVisible(true);
    };

    const closeEventModal = () => {
        setEventModalVisible(false);
        setSelectedEvent(null);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need gallery access to upload an event image.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        try {
            setLoading(true);
            const [userData, allClubs] = await Promise.all([
                getUserProfile(),
                getAllClubs()
            ]);
            const profile = userData.data || userData;
            const linkedClub = allClubs.find((c: any) => c.email?.toLowerCase() === profile.email?.toLowerCase());
            setAdminClub(linkedClub);

            if (linkedClub?.clubId) {
                const clubEvents = await fetchEventsByClub(linkedClub.clubId);
                setEvents(clubEvents || []);
            }
        } catch (err) {
            console.log('Failed to load club data', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishEvent = async () => {
        const { title, location, description, timeDisplay, badge, color } = eventForm;
        if (!title || !location || !description || !timeDisplay) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('location', location);
            formData.append('description', description);
            formData.append('timeDisplay', timeDisplay);
            formData.append('badge', badge);
            formData.append('color', color);
            formData.append('clubId', String(adminClub?.clubId || 1));
            formData.append('icon', adminClub?.icon || '📅');
            
            const finalStart = new Date(eventDate);
            finalStart.setHours(eventTime.getHours(), eventTime.getMinutes(), 0);
            formData.append('date', finalStart.toISOString());
            
            const finalEnd = new Date(eventDate);
            finalEnd.setHours(eventEndTime.getHours(), eventEndTime.getMinutes(), 0);
            formData.append('endDate', finalEnd.toISOString());

            if (selectedImage) {
                const filename = selectedImage.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: selectedImage, name: filename, type } as any);
            }

            await createEventApi(formData as any);
            Alert.alert("Success", "Event published!");
            setModalVisible(false);
            setSelectedImage(null);
            setEventForm({ title: '', location: '', timeDisplay: '', description: '', badge: 'UPCOMING', color: '#EAB308' });
            loadData();
        } catch (err: any) { 
            console.log("Failed to publish:", err);
            if (err.response?.status === 409) {
                Alert.alert("Room Conflict", err.response.data?.message || "This room is already booked.");
            } else {
                Alert.alert("Error", "Failed to publish event"); 
            }
        }
        finally { setIsSubmitting(false); }
    };

    const liveEvents = useMemo(() => events.filter((e: any) => e.badge === 'LIVE'), [events]);
    const upcomingEvents = useMemo(() => events.filter((e: any) => e.badge === 'UPCOMING'), [events]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME_ACCENT} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#050505' }}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? hp('1%') : 0 }}>

                {/* Header */}
                <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3%'), paddingBottom: hp('2%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: '#737373', fontWeight: 'bold', fontSize: hp('1.4%'), letterSpacing: 3, textTransform: 'uppercase', marginBottom: hp('0.4%') }}>Club Portal</Text>
                        <Text style={{ color: 'white', fontSize: hp('3.5%'), fontWeight: '900', letterSpacing: -1 }}>
                            {adminClub ? adminClub.name : 'Your Club'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowSidebar(true)}
                        style={{ width: wp('11%'), height: wp('11%'), backgroundColor: '#121212', borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222' }}
                    >
                        <Menu color="white" size={hp('2.5%')} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: hp('5%') }}>

                    {/* Feed Content */}
                    <SectionHeader title="Happening Now" icon={PlayCircle} color={THEME_ACCENT} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp('6%') }} style={{ marginBottom: hp('5%') }}>
                        {liveEvents.map((event: any) => {
                            const cardColor = event.color || THEME_ACCENT;
                            return (
                                <TouchableOpacity key={event._id} onPress={() => openEventModal(event)} activeOpacity={0.8} style={{ width: wp('55%'), backgroundColor: '#121212', borderRadius: 32, marginRight: wp('4%'), overflow: 'hidden' }}>
                                    {event.imageUrl && (
                                        <Image style={{ width: '100%', height: hp('14%') }} source={{ uri: event.imageUrl }} resizeMode="cover" />
                                    )}
                                    <View style={{ padding: wp('5%') }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: hp('2%') }}>
                                            <View style={{ paddingHorizontal: wp('3%'), paddingVertical: hp('0.5%'), borderRadius: 999, borderWidth: 1, backgroundColor: getRgba(cardColor, 0.2), borderColor: getRgba(cardColor, 0.3) }}>
                                                <Text style={{ fontSize: hp('1.2%'), fontWeight: '900', letterSpacing: 2, color: cardColor }}>LIVE</Text>
                                            </View>
                                            <Text style={{ fontSize: hp('3.5%') }}>{event.icon}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ color: '#737373', fontSize: hp('1.2%'), fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>{event.clubName}</Text>
                                            <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: '900' }} numberOfLines={2}>{event.title}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp('0.5%') }}>
                                                <MapPin size={hp('1.5%')} color="#666" />
                                                <Text style={{ color: '#A3A3A3', fontSize: hp('1.4%'), marginLeft: wp('1%') }}>{event.location}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>

                    <SectionHeader title="Coming Up" icon={Calendar} color="#A0A0A0" />
                    <View style={{ paddingHorizontal: wp('6%'), gap: hp('1.5%') }}>
                        {upcomingEvents.map((event: any) => {
                            const dateObj = new Date(event.date);
                            const cardColor = event.color || THEME_ACCENT;
                            return (
                                <TouchableOpacity key={event._id} onPress={() => openEventModal(event)} activeOpacity={0.7} style={{ width: '100%', backgroundColor: '#121212', borderRadius: 24, padding: wp('4%'), flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: wp('16%'), height: wp('16%'), borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: wp('4%'), backgroundColor: '#1A1A1A' }}>
                                        <Text style={{ fontSize: hp('1.2%'), fontWeight: '900', color: '#737373' }}>{dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                                        <Text style={{ color: 'white', fontSize: hp('2.5%'), fontWeight: '900' }}>{dateObj.getDate()}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginRight: wp('2%') }}>
                                        <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: 'bold' }}>{event.title}</Text>
                                        <Text style={{ color: THEME_ACCENT, fontSize: hp('1.4%'), fontWeight: 'bold' }}>{event.clubName}</Text>
                                        <Text style={{ color: '#52525B', fontSize: hp('1.4%') }}>{event.timeDisplay} @ {event.location}</Text>
                                    </View>
                                    {event.imageUrl ? (
                                        <Image source={{ uri: event.imageUrl }} style={{ width: wp('12%'), height: wp('12%'), borderRadius: 12, backgroundColor: '#1A1A1A' }} />
                                    ) : (
                                        <Text style={{ fontSize: hp('2.2%') }}>{event.icon}</Text>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>

                {/* FLOATING ACTION BUTTONS */}
                <View style={{ position: 'absolute', bottom: hp('4%'), right: wp('6%'), gap: hp('1.5%') }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setEmailModalVisible(true)}
                        style={{ width: wp('14%'), height: wp('14%'), backgroundColor: '#161618', borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                    >
                        <Mail color="white" size={hp('2.8%')} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setModalVisible(true)}
                        style={{ width: wp('16%'), height: wp('16%'), backgroundColor: THEME_ACCENT, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: THEME_ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
                    >
                        <Plus color="black" size={hp('3.5%')} strokeWidth={3} />
                    </TouchableOpacity>
                </View>

            </SafeAreaView>

            {/* PUBLISH MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: wp('3%') }}>
                    <ScrollView contentContainerStyle={{ backgroundColor: '#0E0E10', padding: wp('6%'), borderRadius: 24, borderWidth: 1, borderColor: '#27272A', width: '100%' }}>
                        <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: '900' }}>Post New Event</Text>
                        <Text style={{ color: THEME_ACCENT, fontSize: hp('1.4%'), marginBottom: hp('2%') }}>Club: {adminClub?.name || 'Your Club'}</Text>

                        <Label text="Title" />
                        <CustomInput placeholder="Event Name" onChangeText={(t) => setEventForm({ ...eventForm, title: t })} value={eventForm.title} />
                        <Label text="Description" />
                        <CustomInput
                            placeholder="Details..."
                            multiline
                            style={{ minHeight: hp('15%'), textAlignVertical: 'top' }}
                            onChangeText={(t) => setEventForm({ ...eventForm, description: t })}
                            value={eventForm.description}
                        />

                        <Label text="Date" />
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setShowDatePicker(true)}
                            style={{ backgroundColor: '#161618', padding: hp('1.5%'), borderRadius: 10, marginTop: hp('0.5%'), marginBottom: hp('1.5%'), borderWidth: 1, borderColor: '#222', justifyContent: 'center' }}
                        >
                            <Text style={{ color: 'white' }}>
                                {eventDate.getDate().toString().padStart(2, '0')}-{(eventDate.getMonth() + 1).toString().padStart(2, '0')}-{eventDate.getFullYear()}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: wp('2.5%') }}>
                            <View style={{ flex: 1 }}>
                                <Label text="Start Time" />
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setShowTimePicker(true)}
                                    style={{ backgroundColor: '#161618', padding: hp('1.5%'), borderRadius: 10, marginTop: hp('0.5%'), borderWidth: 1, borderColor: '#222', justifyContent: 'center' }}
                                >
                                    <Text style={{ color: eventForm.timeDisplay ? 'white' : '#52525B' }}>
                                        {eventForm.timeDisplay || '6:00 PM'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Label text="End Time" />
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setShowEndTimePicker(true)}
                                    style={{ backgroundColor: '#161618', padding: hp('1.5%'), borderRadius: 10, marginTop: hp('0.5%'), borderWidth: 1, borderColor: '#222', justifyContent: 'center' }}
                                >
                                    <Text style={{ color: 'white' }}>
                                        {`${eventEndTime.getHours() % 12 || 12}:${eventEndTime.getMinutes().toString().padStart(2, '0')} ${eventEndTime.getHours() >= 12 ? 'PM' : 'AM'}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <CustomDatePickerModal
                            visible={showDatePicker}
                            date={eventDate}
                            onCancel={() => setShowDatePicker(false)}
                            onConfirm={(selectedDate: any) => {
                                setShowDatePicker(false);
                                if (selectedDate) setEventDate(selectedDate);
                            }}
                        />

                        <CustomTimePickerModal
                            visible={showTimePicker}
                            time={eventTime}
                            onCancel={() => setShowTimePicker(false)}
                            onConfirm={(selectedDate: any) => {
                                setShowTimePicker(false);
                                if (selectedDate) {
                                    setEventTime(selectedDate);
                                    const hours = selectedDate.getHours();
                                    const minutes = selectedDate.getMinutes();
                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                    const displayHours = hours % 12 || 12;
                                    const displayMinutes = minutes.toString().padStart(2, '0');
                                    setEventForm({ ...eventForm, timeDisplay: `${displayHours}:${displayMinutes} ${ampm}` });
                                }
                            }}
                        />

                        <CustomTimePickerModal
                            visible={showEndTimePicker}
                            time={eventEndTime}
                            onCancel={() => setShowEndTimePicker(false)}
                            onConfirm={(selectedDate: any) => {
                                setShowEndTimePicker(false);
                                if (selectedDate) setEventEndTime(selectedDate);
                            }}
                        />

                        <Label text="Location" /><CustomInput placeholder="Room/Venue (e.g. LHC 110)" onChangeText={(t) => setEventForm({ ...eventForm, location: t })} />

                        {/* Upload Image */}
                        <Label text="Event Poster" />
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={pickImage}
                            style={{
                                marginTop: hp('1%'),
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: wp('3%'),
                                paddingVertical: hp('1.8%'),
                                paddingHorizontal: wp('6%'),
                                borderRadius: 999,
                                backgroundColor: '#161618',
                                borderWidth: 1.5,
                                borderColor: 'rgba(204, 249, 0, 0.25)',
                                alignSelf: 'center',
                            }}
                        >
                            <ImageUp color={THEME_ACCENT} size={hp('2.5%')} strokeWidth={2} />
                            <Text style={{ color: 'white', fontSize: hp('1.7%'), fontWeight: '800', letterSpacing: 0.5 }}>
                                {selectedImage ? 'Change Image' : 'Select File'}
                            </Text>
                        </TouchableOpacity>

                        {selectedImage && (
                            <View style={{ marginTop: hp('1.5%'), alignItems: 'center' }}>
                                <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A', backgroundColor: '#0A0A0A' }}>
                                    <Image
                                        source={{ uri: selectedImage }}
                                        style={{ width: wp('76%'), height: undefined, aspectRatio: 1, maxHeight: hp('25%'), borderRadius: 16 }}
                                        resizeMode="contain"
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSelectedImage(null)}
                                    style={{ marginTop: hp('0.8%') }}
                                >
                                    <Text style={{ color: '#EF4444', fontSize: hp('1.3%'), fontWeight: '700' }}>Remove Image</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity onPress={handlePublishEvent} disabled={isSubmitting} style={{ backgroundColor: THEME_ACCENT, padding: hp('2%'), borderRadius: 15, alignItems: 'center', marginTop: hp('3%') }}>
                            {isSubmitting ? <ActivityIndicator color="black" /> : <Text style={{ color: 'black', fontWeight: '900', fontSize: hp('1.9%') }}>PUBLISH EVENT</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: hp('2%') }}>
                            <Text style={{ color: '#52525B', textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* IMPORT FROM EMAIL MODAL */}
            <Modal visible={emailModalVisible} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#0E0E10', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: wp('6%'), paddingBottom: hp('5%'), borderWidth: 1, borderColor: '#27272A' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('2.5%') }}>
                            <View>
                                <Text style={{ color: THEME_ACCENT, fontSize: hp('1.3%'), fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Auto-Import</Text>
                                <Text style={{ color: 'white', fontSize: hp('2.6%'), fontWeight: '900' }}>Import from Email</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEmailModalVisible(false)} style={{ width: wp('10%'), height: wp('10%'), backgroundColor: '#1A1A1A', borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                                <X color="white" size={hp('2.2%')} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ backgroundColor: '#161618', borderRadius: 16, padding: wp('4.5%'), marginBottom: hp('1.5%'), borderWidth: 1, borderColor: '#222' }}>
                            <Text style={{ color: THEME_ACCENT, fontSize: hp('1.3%'), fontWeight: '900', letterSpacing: 1, marginBottom: hp('0.5%') }}>STEP 1 — REGISTER YOUR EMAIL</Text>
                            <Text style={{ color: '#A0A0A0', fontSize: hp('1.6%'), lineHeight: hp('2.4%') }}>Contact your admin to link your email to your club, or use:</Text>
                            <Text style={{ color: 'white', fontSize: hp('1.5%'), fontWeight: '700', marginTop: hp('0.8%'), fontFamily: 'monospace', backgroundColor: '#0A0A0A', padding: hp('0.8%'), borderRadius: 8 }}>
                                PATCH /api/clubs/{adminClub?.clubId}/email{`\n`}{'{"email": "yourname@example.com"}'}
                            </Text>
                        </View>

                        <View style={{ backgroundColor: '#161618', borderRadius: 16, padding: wp('4.5%'), marginBottom: hp('1.5%'), borderWidth: 1, borderColor: '#222' }}>
                            <Text style={{ color: THEME_ACCENT, fontSize: hp('1.3%'), fontWeight: '900', letterSpacing: 1, marginBottom: hp('0.5%') }}>STEP 2 — SEND ANY EMAIL</Text>
                            <Text style={{ color: '#A0A0A0', fontSize: hp('1.6%'), lineHeight: hp('2.4%') }}>From your registered email, send to:</Text>
                            <Text style={{ color: 'white', fontSize: hp('1.6%'), fontWeight: '700', marginTop: hp('0.8%'), fontFamily: 'monospace', backgroundColor: '#0A0A0A', padding: hp('0.8%'), borderRadius: 8 }}>
                                events@pulseboard.mailgun.org
                            </Text>
                            <Text style={{ color: '#A0A0A0', fontSize: hp('1.5%'), marginTop: hp('1%'), lineHeight: hp('2.2%') }}>
                                AI will read the subject and body to extract event details automatically.
                            </Text>
                        </View>

                        <View style={{ backgroundColor: '#0D1117', borderRadius: 16, padding: wp('4.5%'), borderWidth: 1, borderColor: '#30363D' }}>
                            <Text style={{ color: '#6B7280', fontSize: hp('1.3%'), fontWeight: '700', letterSpacing: 1, marginBottom: hp('0.5%') }}>EXAMPLE EMAIL</Text>
                            <Text style={{ color: '#58A6FF', fontSize: hp('1.5%'), fontWeight: '600' }}>Subject: Final Hack Night — Hackathon Closing Ceremony</Text>
                            <Text style={{ color: '#8B949E', fontSize: hp('1.5%'), marginTop: hp('0.5%'), lineHeight: hp('2.2%') }}>
                                {`Hey team,\nJoin us for the closing ceremony on March 10th at 7 PM in LT-1.\nPrizes will be announced. All teams must attend.`}
                            </Text>
                        </View>

                        <Text style={{ color: '#52525B', fontSize: hp('1.4%'), textAlign: 'center', marginTop: hp('2%') }}>
                            Powered by Groq AI · Events appear within seconds
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* EVENT DETAILS MODAL */}
            <Modal
                visible={eventModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeEventModal}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: '#0D0D0D',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        borderWidth: 1,
                        borderColor: '#1E1E1E',
                        maxHeight: hp('85%'),
                    }}>
                        {selectedEvent && (
                            <>
                                <View style={{ height: 4, backgroundColor: selectedEvent.color || THEME_ACCENT, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />

                                <ScrollView contentContainerStyle={{ padding: wp('6%') }} showsVerticalScrollIndicator={false}>
                                    {/* Close */}
                                    <TouchableOpacity
                                        onPress={closeEventModal}
                                        style={{ alignSelf: 'flex-end', width: wp('8%'), height: wp('8%'), backgroundColor: '#1A1A1A', borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: hp('1.5%') }}
                                    >
                                        <X color="#666" size={hp('2%')} />
                                    </TouchableOpacity>

                                    {/* Image */}
                                    {selectedEvent.imageUrl ? (
                                        <TouchableOpacity activeOpacity={0.9} onPress={() => setFullScreenImage(selectedEvent.imageUrl)}>
                                            <Image 
                                                source={{ uri: selectedEvent.imageUrl }}
                                                style={{ width: '100%', height: hp('20%'), borderRadius: 16, marginBottom: hp('2%') }}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ) : null}

                                    {/* Icon + Title */}
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: wp('3%'), marginBottom: hp('2%') }}>
                                        {!selectedEvent.imageUrl ? <Text style={{ fontSize: hp('5%') }}>{selectedEvent.icon}</Text> : null}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: THEME_ACCENT, fontSize: hp('1.4%'), fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: hp('0.5%') }}>{selectedEvent.clubName}</Text>
                                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: hp('2.5%'), lineHeight: hp('3.2%') }}>
                                                {selectedEvent.title}
                                            </Text>
                                            {selectedEvent.badge === 'LIVE' && (
                                                <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', alignSelf: 'flex-start', paddingHorizontal: wp('2.5%'), paddingVertical: 4, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' }}>
                                                    <Text style={{ color: '#EF4444', fontSize: hp('1.3%'), fontWeight: '900', letterSpacing: 1 }}>● LIVE NOW</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {selectedEvent.description ? (
                                        <Text style={{ color: '#999', fontSize: hp('1.7%'), lineHeight: hp('2.6%'), marginBottom: hp('2.5%') }}>
                                            {selectedEvent.description}
                                        </Text>
                                    ) : null}

                                    <View style={{ height: 1, backgroundColor: '#1E1E1E', marginBottom: hp('2.5%') }} />

                                    {/* Date */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%'), marginBottom: hp('2%') }}>
                                        <View style={{ width: wp('9%'), height: wp('9%'), borderRadius: 12, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center' }}>
                                            <Calendar size={hp('2%')} color={selectedEvent.color || THEME_ACCENT} />
                                        </View>
                                        <View>
                                            <Text style={{ color: '#555', fontSize: hp('1.2%'), marginBottom: 2 }}>DATE & TIME</Text>
                                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: hp('1.8%') }}>
                                                {new Date(selectedEvent.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </Text>
                                            <Text style={{ color: selectedEvent.color || THEME_ACCENT, fontSize: hp('1.5%'), marginTop: 2 }}>
                                                {selectedEvent.timeDisplay}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Location */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp('3%') }}>
                                        <View style={{ width: wp('9%'), height: wp('9%'), borderRadius: 12, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={hp('2%')} color={selectedEvent.color || THEME_ACCENT} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#555', fontSize: hp('1.2%'), marginBottom: 2 }}>LOCATION</Text>
                                            <Text style={{ color: selectedEvent.location && selectedEvent.location !== 'TBD' ? '#fff' : '#444', fontWeight: '600', fontSize: hp('1.8%') }}>
                                                {selectedEvent.location || 'TBD'}
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

            {/* Full Screen Image Modal */}
            <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ position: 'absolute', top: hp('5%'), right: wp('5%'), zIndex: 10, padding: wp('3%') }} onPress={() => setFullScreenImage(null)}>
                        <X color="white" size={hp('3.5%')} />
                    </TouchableOpacity>
                    {fullScreenImage && (
                        <Image 
                            source={{ uri: fullScreenImage }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

            {/* Sidebar Logic */}
            <AnimatePresence>
                {showSidebar && (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
                        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowSidebar(false)} />
                        </MotiView>
                        <MotiView from={{ translateX: wp('100%') }} animate={{ translateX: 0 }} exit={{ translateX: wp('100%') }} transition={{ type: 'timing', duration: 250 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: wp('82%'), backgroundColor: '#050505', borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <SafeAreaView style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%'), paddingTop: hp('3%') }}>
                                    <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: '900' }}>Menu</Text>
                                    <TouchableOpacity onPress={() => setShowSidebar(false)}><X color="#fff" size={hp('2.2%')} /></TouchableOpacity>
                                </View>
                                <ScrollView contentContainerStyle={{ padding: wp('6%') }}>
                                    <SidebarItem index={1} icon={Grid} label="LHC Heatmap" color="#6366F1" onPress={() => { setShowSidebar(false); router.push('/heatmap'); }} />
                                    <SidebarItem index={4} icon={Siren} label="S.O.S Protocol" color="#F87171" isAlert={true} onPress={() => { setShowSidebar(false); router.push('/sos'); }} />
                                    <SidebarItem index={7} icon={Settings} label="Settings" color="#A1A1AA" onPress={() => { setShowSidebar(false); router.push('/settings'); }} />
                                </ScrollView>
                                <TouchableOpacity onPress={() => router.replace('/')} style={{ margin: wp('6%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: hp('2%'), borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <LogOut color="#EF4444" size={hp('2%')} /><Text style={{ color: '#EF4444', fontWeight: '700', marginLeft: 10 }}>LOG OUT</Text>
                                </TouchableOpacity>
                            </SafeAreaView>
                        </MotiView>
                    </View>
                )}
            </AnimatePresence>
        </View>
    );
}

const Label = ({ text }: { text: string }) => (
    <Text style={{ color: THEME_ACCENT, fontSize: 10, fontWeight: 'bold', marginTop: hp('2%') }}>{text.toUpperCase()}</Text>
);

const CustomInput = (props: TextInputProps) => (
    <TextInput
        {...props}
        placeholderTextColor="#52525B"
        style={[{ backgroundColor: '#161618', color: 'white', padding: hp('1.5%'), borderRadius: 10, marginTop: hp('0.5%'), borderWidth: 1, borderColor: '#222' }, props.style]}
    />
);

const CustomDatePickerModal = ({ visible, date, onConfirm, onCancel }: any) => {
    const [currentMonth, setCurrentMonth] = useState(date || new Date());
    const [selectedDate, setSelectedDate] = useState(date || new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const changeMonth = (delta: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + delta);
        setCurrentMonth(newMonth);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: wp('5%') }}>
                <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', backgroundColor: '#121212', borderRadius: 24, padding: wp('6%'), borderWidth: 1, borderColor: '#27272A' }}>
                    <Text style={{ color: 'white', fontSize: hp('2.2%'), fontWeight: 'bold', marginBottom: hp('2%') }}>Select Date</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('2%') }}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 5 }}><ChevronLeft color="white" size={hp('2.5%')} /></TouchableOpacity>
                        <Text style={{ color: 'white', fontSize: hp('2%'), fontWeight: 'bold' }}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 5 }}><ChevronRight color="white" size={hp('2.5%')} /></TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <View key={d} style={{ width: '14.28%', alignItems: 'center', marginBottom: hp('1%') }}>
                                <Text style={{ color: '#737373', fontSize: hp('1.4%'), fontWeight: 'bold' }}>{d}</Text>
                            </View>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => <View key={`empty-${i}`} style={{ width: '14.28%' }} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                            return (
                                <TouchableOpacity
                                    key={`day-${day}`}
                                    onPress={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                                    style={{ width: '14.28%', alignItems: 'center', justifyContent: 'center', height: wp('10%'), backgroundColor: isSelected ? THEME_ACCENT : 'transparent', borderRadius: 99 }}
                                >
                                    <Text style={{ color: isSelected ? 'black' : 'white', fontWeight: isSelected ? 'bold' : 'normal', fontSize: hp('1.6%') }}>{day}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: hp('3%'), gap: wp('4%') }}>
                        <TouchableOpacity onPress={onCancel} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('4%') }}>
                            <Text style={{ color: '#A1A1AA', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm(selectedDate)} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('5%'), backgroundColor: THEME_ACCENT, borderRadius: 12 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold' }}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};

const CustomTimePickerModal = ({ visible, time, onConfirm, onCancel }: any) => {
    const defaultHour = time ? (time.getHours() % 12 || 12) : 6;
    const defaultMinute = time ? time.getMinutes() : 0;
    const defaultAm = time ? time.getHours() < 12 : false;

    const [selectedHour, setSelectedHour] = useState(defaultHour);
    const [selectedMinute, setSelectedMinute] = useState(defaultMinute);
    const [isAm, setIsAm] = useState(defaultAm);

    const ITEM_HEIGHT = hp('6%');

    const handleConfirm = () => {
        const newTime = new Date();
        newTime.setHours(isAm ? (selectedHour === 12 ? 0 : selectedHour) : (selectedHour === 12 ? 12 : selectedHour + 12));
        newTime.setMinutes(selectedMinute);
        onConfirm(newTime);
    };

    if (!visible) return null;

    const hours = Array.from({ length: 12 }).map((_, i) => i + 1);
    const minutes = Array.from({ length: 60 }).map((_, i) => i);
    const periods = ['AM', 'PM'];

    const renderScrollList = (data: any[], selectedValue: any, onSelect: (val: any) => void, padZero: boolean = true) => (
        <View style={{ height: ITEM_HEIGHT * 3, width: wp('22%'), overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: ITEM_HEIGHT, width: '100%', height: ITEM_HEIGHT, borderTopWidth: 2, borderBottomWidth: 2, borderColor: THEME_ACCENT }} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                    if (data[index] !== undefined) onSelect(data[index]);
                }}
                contentOffset={{ x: 0, y: Math.max(0, data.indexOf(selectedValue)) * ITEM_HEIGHT }}
            >
                {data.map((item, idx) => {
                    const isSelected = item === selectedValue;
                    return (
                        <View key={idx} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: isSelected ? 'white' : '#52525B', fontSize: isSelected ? hp('3%') : hp('2.2%'), fontWeight: isSelected ? '900' : 'bold' }}>
                                {typeof item === 'number' && padZero ? item.toString().padStart(2, '0') : item}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: wp('5%') }}>
                <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', backgroundColor: '#121212', borderRadius: 24, padding: wp('6%'), borderWidth: 1, borderColor: '#27272A' }}>
                    <Text style={{ color: 'white', fontSize: hp('2.2%'), fontWeight: 'bold', marginBottom: hp('3%') }}>Set Time</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {renderScrollList(hours, selectedHour, setSelectedHour)}
                        <Text style={{ color: 'white', fontSize: hp('4%'), fontWeight: 'bold', marginHorizontal: wp('2%') }}>:</Text>
                        {renderScrollList(minutes, selectedMinute, setSelectedMinute)}
                        <View style={{ width: wp('4%') }} />
                        {renderScrollList(periods, isAm ? 'AM' : 'PM', (val) => setIsAm(val === 'AM'), false)}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: hp('5%'), gap: wp('4%') }}>
                        <TouchableOpacity onPress={onCancel} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('4%') }}>
                            <Text style={{ color: '#A1A1AA', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('5%'), backgroundColor: THEME_ACCENT, borderRadius: 12 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};
