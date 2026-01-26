import React from "react";
import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";

type ClubCardProps = {
  icon: string;
  name: string;
  selected: boolean;
  onPress: (event: GestureResponderEvent) => void;
};

export default function ClubCard({
  icon,
  name,
  selected,
  onPress,
}: ClubCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border-2 rounded-2xl p-4 mb-4 flex-row items-center justify-between
        ${selected ? "border-green-400 bg-green-500/10" : "border-green-800 bg-black"}
      `}
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{icon}</Text>
        <Text className="text-white text-lg font-semibold">{name}</Text>
      </View>

      <View
        className={`w-5 h-5 rounded-full border-2
          ${selected ? "bg-green-400 border-green-400" : "border-gray-500"}
        `}
      />
    </TouchableOpacity>
  );
}