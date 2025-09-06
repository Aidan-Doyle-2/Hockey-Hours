import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function MonthTest() {
  const [month, setMonth] = useState(8); // September (0-indexed)
  const [year, setYear] = useState(2025);

  // shared value for swipe translation
  const translateX = useSharedValue(0);

  // style bound to translateX
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX; // follow finger
    },
    onEnd: (event) => {
      if (event.translationX < -100) {
        // swiped left → next month
        translateX.value = withTiming(-width, { duration: 200 }, () => {
          runOnJS(() => {
            if (month === 11) {
              setMonth(0);
              setYear((y) => y + 1);
            } else {
              setMonth((m) => m + 1);
            }
          })();
          translateX.value = 0; // reset
        });
      } else if (event.translationX > 100) {
        // swiped right → prev month
        translateX.value = withTiming(width, { duration: 200 }, () => {
          runOnJS(() => {
            if (month === 0) {
              setMonth(11);
              setYear((y) => y - 1);
            } else {
              setMonth((m) => m - 1);
            }
          })();
          translateX.value = 0; // reset
        });
      } else {
        // not enough swipe → snap back
        translateX.value = withTiming(0, { duration: 200 });
      }
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Text style={styles.monthTitle}>
              {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
              {year}
            </Text>
            <Text style={styles.instructions}>
              Swipe left/right to change months
            </Text>
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  monthTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  instructions: { fontSize: 16, color: "#555" },
});