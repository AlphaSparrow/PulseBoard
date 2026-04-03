import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StatusBar,
    ActivityIndicator, Platform, TouchableOpacity, Modal, TextInput, Alert, Image
} from 'react-native';
import { Clock, ChevronLeft, ChevronRight, ImageUp, X } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { getEventFeed } from '../../src/api/event.api';
import { getUserProfile } from '../../src/api/user.api';
import { getAllClubs } from '../../src/api/club.api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';

const THEME_ACCENT = '#CCF900';
const BG_MAIN = '#050505';
const BG_CARD = '#121212';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

export default function ClubHistoryScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminClub, setAdminClub] = useState<any>(null);

    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Form State
    const [editTitle, setEditTitle] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editTimeDisplay, setEditTimeDisplay] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    // Date/Time Picker State
    const [editDateObj, setEditDateObj] = useState(new Date());
    const [editTimeObj, setEditTimeObj] = useState(new Date());
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);
    const [showEditTimePicker, setShowEditTimePicker] = useState(false);

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

    const openModal = (event: any) => {
        setSelectedPost(event);
        setEditTitle(event.title || '');
        setEditLocation(event.location || '');
        setEditTimeDisplay(event.timeDisplay || '');
        setEditDate(event.date || '');
        setEditDescription(event.description || '');
        setSelectedImage(event.imageUrl || null);

        // Parse existing date/time into Date objects for the pickers
        const parsedDate = event.date ? new Date(event.date) : new Date();
        setEditDateObj(parsedDate);
        // Parse timeDisplay like "6:00 PM" into a Date object
        if (event.timeDisplay) {
            const timeMatch = event.timeDisplay.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeMatch) {
                const t = new Date();
                let hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const ampm = timeMatch[3].toUpperCase();
                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                t.setHours(hours, minutes);
                setEditTimeObj(t);
            }
        }

        setIsEditing(false);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedPost(null);
    };

    const handleSaveEdit = () => {
        const updatedDate = editDateObj.toISOString();

        // Optimistic UI Update:
        setEvents(prevEvents => prevEvents.map(e => {
            if (e._id === selectedPost._id) {
                return { ...e, title: editTitle, location: editLocation, timeDisplay: editTimeDisplay, date: updatedDate, description: editDescription, imageUrl: selectedImage };
            }
            return e;
        }));

        // Switch back to view mode
        setIsEditing(false);
        setSelectedPost({ ...selectedPost, title: editTitle, location: editLocation, timeDisplay: editTimeDisplay, date: updatedDate, description: editDescription, imageUrl: selectedImage });
    };

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
                            <TouchableOpacity
                                key={event._id || idx}
                                style={{ width: '100%', backgroundColor: BG_CARD, borderRadius: 24, padding: wp('4%'), flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER_COLOR, marginBottom: hp('1.5%') }}
                                onPress={() => openModal(event)}
                            >
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
                            </TouchableOpacity>
                        )
                    })}

                </ScrollView>

                {/* Pop-up Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModal}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: wp('92%'), maxHeight: hp('85%'), backgroundColor: BG_CARD, borderRadius: 20, padding: wp('6%'), borderWidth: 1, borderColor: BORDER_COLOR }}>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('2%') }}>
                                {selectedPost && !isEditing ? (
                                    <>
                                        {/* View Mode */}
                                        {selectedPost.imageUrl && (
                                            <TouchableOpacity activeOpacity={0.9} onPress={() => setFullScreenImage(selectedPost.imageUrl)}>
                                                <Image 
                                                    source={{ uri: selectedPost.imageUrl }}
                                                    style={{ width: '100%', height: hp('20%'), borderRadius: 16, marginBottom: hp('2%') }}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        )}
                                        <Text style={{ color: 'white', fontSize: hp('2.8%'), fontWeight: 'bold', marginBottom: hp('1%') }}>{selectedPost.title}</Text>
                                        <Text style={{ color: '#A3A3A3', fontSize: hp('1.8%'), marginBottom: hp('1%') }}>Location: {selectedPost.location}</Text>
                                        <Text style={{ color: '#A3A3A3', fontSize: hp('1.8%'), marginBottom: hp('2%') }}>Time: {selectedPost.timeDisplay}</Text>
                                        <Text style={{ color: '#A3A3A3', fontSize: hp('1.8%'), marginBottom: hp('1%') }}>Date: {new Date(selectedPost.date).toDateString()}</Text>
                                        {selectedPost.description && (
                                            <Text style={{ color: 'white', fontSize: hp('1.6%'), marginTop: hp('1.5%'), marginBottom: hp('2%') }}>{selectedPost.description}</Text>
                                        )}

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp('2%') }}>
                                            <TouchableOpacity onPress={closeModal} style={{ flex: 1, backgroundColor: '#333', padding: hp('1.5%'), borderRadius: 10, marginRight: wp('2%'), alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setIsEditing(true)} style={{ flex: 1, backgroundColor: THEME_ACCENT, padding: hp('1.5%'), borderRadius: 10, marginLeft: wp('2%'), alignItems: 'center' }}>
                                                <Text style={{ color: 'black', fontWeight: 'bold' }}>Edit</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : selectedPost && isEditing ? (
                                    <>
                                        {/* Edit Mode */}
                                        <Text style={{ color: 'white', fontSize: hp('2.5%'), fontWeight: 'bold', marginBottom: hp('2%') }}>Edit Post</Text>

                                        <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Title</Text>
                                        <TextInput
                                            style={{ backgroundColor: '#1A1A1A', color: 'white', padding: wp('3%'), borderRadius: 10, marginBottom: hp('1.5%') }}
                                            value={editTitle}
                                            onChangeText={setEditTitle}
                                        />

                                        <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Location</Text>
                                        <TextInput
                                            style={{ backgroundColor: '#1A1A1A', color: 'white', padding: wp('3%'), borderRadius: 10, marginBottom: hp('1.5%') }}
                                            value={editLocation}
                                            onChangeText={setEditLocation}
                                        />

                                        <View style={{ flexDirection: 'row', gap: wp('2.5%'), marginBottom: hp('1.5%') }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Date</Text>
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => setShowEditDatePicker(true)}
                                                    style={{ backgroundColor: '#1A1A1A', padding: wp('3%'), borderRadius: 10, borderWidth: 1, borderColor: '#222', justifyContent: 'center' }}
                                                >
                                                    <Text style={{ color: 'white', fontSize: hp('1.6%') }}>
                                                        {editDateObj.getDate().toString().padStart(2, '0')}-{(editDateObj.getMonth() + 1).toString().padStart(2, '0')}-{editDateObj.getFullYear()}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Time</Text>
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => setShowEditTimePicker(true)}
                                                    style={{ backgroundColor: '#1A1A1A', padding: wp('3%'), borderRadius: 10, borderWidth: 1, borderColor: '#222', justifyContent: 'center' }}
                                                >
                                                    <Text style={{ color: editTimeDisplay ? 'white' : '#52525B', fontSize: hp('1.6%') }}>
                                                        {editTimeDisplay || '6:00 PM'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <CustomDatePickerModal
                                            visible={showEditDatePicker}
                                            date={editDateObj}
                                            onCancel={() => setShowEditDatePicker(false)}
                                            onConfirm={(selectedDate: any) => {
                                                setShowEditDatePicker(false);
                                                if (selectedDate) setEditDateObj(selectedDate);
                                            }}
                                        />

                                        <CustomTimePickerModal
                                            visible={showEditTimePicker}
                                            time={editTimeObj}
                                            onCancel={() => setShowEditTimePicker(false)}
                                            onConfirm={(selectedTime: any) => {
                                                setShowEditTimePicker(false);
                                                if (selectedTime) {
                                                    setEditTimeObj(selectedTime);
                                                    const hours = selectedTime.getHours();
                                                    const minutes = selectedTime.getMinutes();
                                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                                    const displayHours = hours % 12 || 12;
                                                    const displayMinutes = minutes.toString().padStart(2, '0');
                                                    setEditTimeDisplay(`${displayHours}:${displayMinutes} ${ampm}`);
                                                }
                                            }}
                                        />

                                        <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Description</Text>
                                        <TextInput
                                            style={{ backgroundColor: '#1A1A1A', color: 'white', padding: wp('3%'), borderRadius: 10, marginBottom: hp('2%'), minHeight: hp('10%') }}
                                            value={editDescription}
                                            onChangeText={setEditDescription}
                                            multiline
                                            textAlignVertical="top"
                                        />

                                        <Text style={{ color: '#737373', marginBottom: hp('0.5%'), fontSize: hp('1.5%') }}>Event Poster</Text>
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
                                                backgroundColor: '#1A1A1A',
                                                borderWidth: 1.5,
                                                borderColor: 'rgba(204, 249, 0, 0.25)',
                                                alignSelf: 'center',
                                                marginBottom: hp('1%'),
                                            }}
                                        >
                                            <ImageUp color={THEME_ACCENT} size={hp('2.5%')} strokeWidth={2} />
                                            <Text style={{ color: 'white', fontSize: hp('1.7%'), fontWeight: '800', letterSpacing: 0.5 }}>
                                                {selectedImage ? 'Change Image' : 'Select File'}
                                            </Text>
                                        </TouchableOpacity>

                                        {selectedImage && (
                                            <View style={{ marginTop: hp('1.5%'), alignItems: 'center', marginBottom: hp('2%') }}>
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

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp('1%') }}>
                                            <TouchableOpacity onPress={() => setIsEditing(false)} style={{ flex: 1, backgroundColor: '#333', padding: hp('1.5%'), borderRadius: 10, marginRight: wp('2%'), alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleSaveEdit} style={{ flex: 1, backgroundColor: THEME_ACCENT, padding: hp('1.5%'), borderRadius: 10, marginLeft: wp('2%'), alignItems: 'center' }}>
                                                <Text style={{ color: 'black', fontWeight: 'bold' }}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : null}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>

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

        </View>
    );
}

// ── Custom Date Picker Modal ──
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
                                    style={{
                                        width: '14.28%', alignItems: 'center', justifyContent: 'center', height: wp('10%'),
                                        backgroundColor: isSelected ? THEME_ACCENT : 'transparent', borderRadius: 99
                                    }}
                                >
                                    <Text style={{ color: isSelected ? 'black' : 'white', fontWeight: isSelected ? 'bold' : 'normal', fontSize: hp('1.6%') }}>{day}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: hp('3%'), gap: wp('4%') }}>
                        <TouchableOpacity onPress={onCancel} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('4%') }}><Text style={{ color: '#A1A1AA', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm(selectedDate)} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('5%'), backgroundColor: THEME_ACCENT, borderRadius: 12 }}><Text style={{ color: 'black', fontWeight: 'bold' }}>Confirm</Text></TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};

// ── Custom Time Picker Modal ──
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
                            <Text style={{
                                color: isSelected ? 'white' : '#52525B',
                                fontSize: isSelected ? hp('3%') : hp('2.2%'),
                                fontWeight: isSelected ? '900' : 'bold'
                            }}>
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
                        <TouchableOpacity onPress={onCancel} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('4%') }}><Text style={{ color: '#A1A1AA', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} style={{ paddingVertical: hp('1%'), paddingHorizontal: wp('5%'), backgroundColor: THEME_ACCENT, borderRadius: 12 }}><Text style={{ color: 'black', fontWeight: 'bold' }}>OK</Text></TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};
