import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, Image } from "react-native";
import { Check } from 'lucide-react-native';
import { useTheme } from "../context/ThemeContext";

export default function ClubCard({ icon, name, image, description, isFollowed, isLoading, onFollowPress, onCardPress }: any) {
  const { isDark } = useTheme();

  return (
    <View style={{ width: Platform.OS === 'web' ? '48%' : '47%', marginBottom: 15 }}>
      <View 
        style={{
          height: 220,
          backgroundColor: isFollowed 
            ? (isDark ? '#0E0E10' : '#F5F5F7') 
            : (isDark ? '#09090B' : '#FFFFFF'),
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isFollowed 
            ? (isDark ? 'rgba(204, 249, 0, 0.2)' : 'rgba(204, 249, 0, 0.4)') 
            : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
          padding: 15,
          // Add shadow for light mode
          ...(isDark ? {} : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          })
        }}
      >
        <TouchableOpacity onPress={onCardPress} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ 
              width: 45, 
              height: 45, 
              borderRadius: 12, 
              backgroundColor: isDark ? '#121212' : '#F0F0F0', 
              justifyContent: 'center', 
              alignItems: 'center', 
              overflow: 'hidden' 
            }}>
                {image ? (
                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                )}
            </View>
            {isFollowed && <Check size={16} color="#CCF900" strokeWidth={3} />}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: isDark ? 'white' : 'black', fontWeight: '900', fontSize: 16 }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ color: isDark ? '#666' : '#888', fontSize: 11, marginTop: 4 }} numberOfLines={3}>
              {description}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFollowPress}
          disabled={isLoading}
          style={{
            height: 40,
            borderRadius: 12,
            backgroundColor: isFollowed 
              ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#F0F0F0') 
              : '#CCF900',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
            borderWidth: isFollowed && !isDark ? 1 : 0,
            borderColor: '#E5E5E5'
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={isFollowed ? (isDark ? "white" : "black") : "black"} />
          ) : (
            <Text style={{ color: isFollowed ? (isDark ? '#999' : '#666') : 'black', fontWeight: 'bold', fontSize: 11 }}>
              {isFollowed ? 'FOLLOWING' : 'FOLLOW'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}