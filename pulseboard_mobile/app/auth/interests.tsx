import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import ClubCard from "../../src/components/ClubCard";


// Club type
type Club = {
  id: number;
  name: string;
  icon: string;
};

const clubs: Club[] = [
  { id: 1, name: "Robotics Society", icon: "🤖" },
  { id: 2, name: "DevIups", icon: "💻" },
  { id: 3, name: "E-Cell", icon: "💡" },
  { id: 4, name: "RAID", icon: "🎯" },
  { id: 5, name: "Photography Club", icon: "📷" },
  { id: 6, name: "Music Society", icon: "🎵" },
  { id: 7, name: "Drama Club", icon: "🎭" },
  { id: 8, name: "Sports Committee", icon: "⚽" },
];

export default function Interests() {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleClub = (id: number): void => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-14">

      {/* LOGO */}
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full border-2 border-green-400 items-center justify-center mb-3">
          <Text className="text-green-400 text-4xl font-extrabold">PB</Text>
        </View>
        <Text className="text-green-400 text-2xl font-bold">
          PulseBoard
        </Text>
      </View>

      <Text className="text-green-400 text-xl font-semibold text-center mb-1">
        Select Your Interests
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        Choose the clubs you'd like to follow
      </Text>

      {clubs.map((club) => (
        <ClubCard
          key={club.id}
          icon={club.icon}
          name={club.name}
          selected={selected.includes(club.id)}
          onPress={() => toggleClub(club.id)}
        />
      ))}

      {/* BUTTON */}
      <TouchableOpacity
        disabled={selected.length === 0}
        className={`mt-6 py-4 rounded-xl items-center ${
          selected.length === 0 ? "bg-gray-700" : "bg-green-500"
        }`}
      >
        <Text className="text-black font-bold text-lg">
          SELECT AT LEAST ONE CLUB
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center mb-10">
        <Text className="text-green-400">Skip for now</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}