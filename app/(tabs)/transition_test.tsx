import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

type ViewMode = "month" | "day";

export default function TransitionTest() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const translateY = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  // PanResponder for swiping down on Day
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      viewMode === "day" && Math.abs(gesture.dy) > 20,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 50 && viewMode === "day") {
        // Day → Month
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setViewMode("month");
          translateY.setValue(0);
          fade.setValue(0);
          Animated.timing(fade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }
    },
  });

  // Trigger Month → Day when clicked
  const goToDay = () => {
    Animated.timing(fade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("day");
      translateY.setValue(height); // start Day below
      fade.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          { opacity: fade, transform: [{ translateY }] },
        ]}
      >
        {viewMode === "month" ? (
          <Pressable
            style={[styles.screen, { backgroundColor: "#93c5fd" }]}
            onPress={goToDay}
          >
            <Text style={styles.title}>📅 Month View</Text>
            <Text style={styles.subtitle}>Tap anywhere to go to Day</Text>
          </Pressable>
        ) : (
          <View style={[styles.screen, { backgroundColor: "#fda4af" }]}>
            <Text style={styles.title}>📆 Day View</Text>
            <Text style={styles.subtitle}>Swipe DOWN to go back</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  screen: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 12 },
  subtitle: { fontSize: 18, color: "#333" },
});
