import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const sessions = [
  {
    id: "1",
    date: "2025-09-02",
    time: "18:00",
    location: "Main Pitch",
    coach: "Aidan Murphy",
    status: "scheduled",
  },
  {
    id: "2",
    date: "2025-09-03",
    time: "17:30",
    location: "Indoor Hall",
    coach: "John Smith",
    status: "completed",
  },
  {
    id: "3",
    date: "2025-09-05",
    time: "19:00",
    location: "Training Ground",
    coach: "Emily Johnson",
    status: "missed",
  },
];

const statusColors: Record<string, string> = {
  scheduled: "#3b82f6", // blue
  completed: "#22c55e", // green
  missed: "#ef4444", // red
};

export default function SessionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏑 Coaching Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={[styles.status, { color: statusColors[item.status] }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.location}>📍 {item.location}</Text>
            <Text style={styles.coach}>👤 {item.coach}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  time: {
    fontSize: 16,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    marginTop: 2,
    color: "#555",
  },
  coach: {
    fontSize: 14,
    marginTop: 2,
    color: "#555",
  },
});