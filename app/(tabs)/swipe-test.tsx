import React from "react";
import { StyleSheet, Dimensions } from "react-native";
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
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function SwipeTest() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX; // follow finger
    },
    onEnd: (event) => {
      if (event.translationX < -100) {
        // swipe left → animate off screen, then reset
        translateX.value = withTiming(-width, { duration: 200 }, () => {
          translateX.value = withTiming(0);
        });
      } else if (event.translationX > 100) {
        // swipe right → animate off screen, then reset
        translateX.value = withTiming(width, { duration: 200 }, () => {
          translateX.value = withTiming(0);
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
          <Animated.View style={[styles.box, animatedStyle]} />
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center", alignItems: "center" },
  box: {
    width: 200,
    height: 200,
    backgroundColor: "skyblue",
    borderRadius: 12,
  },
});