import React, { useState, useRef, useEffectoka } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase"; // adjust path

const { width, height } = Dimensions.get("window");



type ViewMode = "year" | "month" | "day";

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string>("2025-09-02");
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(8); // September (0-indexed)

  // State to hold sessions from Supabase
  const [sessions, setSessions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*");

      if (error) {
        console.error("Error fetching sessions:", error.message);
      } else {
        // Group sessions by date string (YYYY-MM-DD)
        const grouped: Record<string, any[]> = {};
        data.forEach((s) => {
          const dateStr = new Date(s.date).toISOString().split("T")[0];
          if (!grouped[dateStr]) grouped[dateStr] = [];
          grouped[dateStr].push({
            id: s.id,
            time: `${s.start_time} - ${s.end_time}`,
            location: s.location,
            coach: s.coach_id,
          });
        });
        setSessions(grouped);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  // Animations
  const translateX = useRef(new Animated.Value(0)).current; // month drag
  const fadeMonth = useRef(new Animated.Value(1)).current;

  const fadeDay = useRef(new Animated.Value(0)).current;
  const translateDayY = useRef(new Animated.Value(height)).current;
  const translateDayX = useRef(new Animated.Value(0)).current; // day drag

  const fadeYear = useRef(new Animated.Value(0)).current;
  const translateYearX = useRef(new Animated.Value(0)).current; // year drag

  // Helpers
  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();

  const formatDate = (d: Date) => d.toISOString().split("T")[0]; // yyyy-mm-dd

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // ---------------- Month ↔ Day ----------------
  const goToDay = (dateStr: string) => {
    setSelectedDate(dateStr);

    Animated.timing(fadeMonth, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("day");
      translateDayY.setValue(height);
      fadeDay.setValue(0);
      translateDayX.setValue(0);

      Animated.parallel([
        Animated.timing(translateDayY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeDay, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const backToMonth = () => {
    Animated.parallel([
      Animated.timing(translateDayY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeDay, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setViewMode("month");
      fadeMonth.setValue(0);
      Animated.timing(fadeMonth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  // ---------------- Day ↔ Day ----------------
  const goToAdjacentDay = (direction: "next" | "prev") => {
    const offset = direction === "next" ? -width : width;

    Animated.timing(translateDayX, {
      toValue: offset,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const current = new Date(selectedDate);
      current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
      const newDateStr = formatDate(current);
      setSelectedDate(newDateStr);

      translateDayX.setValue(-offset);

      Animated.timing(translateDayX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // ---------------- Month ↔ Year ----------------
  const goToYear = () => {
    Animated.timing(fadeMonth, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("year");
      fadeYear.setValue(0);
      translateYearX.setValue(0);
      Animated.timing(fadeYear, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const goToMonthFromYear = (m: number) => {
    setMonth(m);
    Animated.timing(fadeYear, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setViewMode("month");
      fadeMonth.setValue(0);
      Animated.timing(fadeMonth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  // ---------------- Month ↔ Month ----------------
  const commitMonthChange = (direction: "next" | "prev") => {
    let newMonth = month;
    let newYear = year;
    if (direction === "next") {
      if (month === 11) {
        newMonth = 0;
        newYear++;
      } else newMonth++;
    } else {
      if (month === 0) {
        newMonth = 11;
        newYear--;
      } else newMonth--;
    }
    setMonth(newMonth);
    setYear(newYear);
    translateX.setValue(direction === "next" ? width : -width);
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

  // ---------------- Year ↔ Year ----------------
  const commitYearChange = (direction: "next" | "prev") => {
    const newYear = direction === "next" ? year + 1 : year - 1;
    setYear(newYear);
    translateYearX.setValue(direction === "next" ? width : -width);
    Animated.spring(translateYearX, { toValue: 0, useNativeDriver: true }).start();
  };

  // ---------------- Responders ----------------
  const daySwipeResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      viewMode === "day" && (Math.abs(g.dy) > 20 || Math.abs(g.dx) > 20),
    onPanResponderMove: (_, g) => {
      if (Math.abs(g.dx) > Math.abs(g.dy)) {
        translateDayX.setValue(g.dx);
      } else {
        translateDayY.setValue(g.dy);
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 100) {
        backToMonth();
      } else if (g.dx < -width / 3) {
        goToAdjacentDay("next");
      } else if (g.dx > width / 3) {
        goToAdjacentDay("prev");
      } else {
        Animated.spring(translateDayX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(translateDayY, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const monthSwipeResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      viewMode === "month" && Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      translateX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -width / 3) {
        Animated.timing(translateX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => commitMonthChange("next"));
      } else if (g.dx > width / 3) {
        Animated.timing(translateX, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => commitMonthChange("prev"));
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const yearSwipeResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      viewMode === "year" && Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      translateYearX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -width / 3) {
        Animated.timing(translateYearX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => commitYearChange("next"));
      } else if (g.dx > width / 3) {
        Animated.timing(translateYearX, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => commitYearChange("prev"));
      } else {
        Animated.spring(translateYearX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  // ---------------- Views ----------------
  const renderMonthView = () => {
    const days = Array.from(
      { length: getDaysInMonth(year, month) },
      (_, i) => i + 1
    );

    return (
      <Animated.View
        {...monthSwipeResponder.panHandlers}
        style={{
          opacity: fadeMonth,
          transform: [{ translateX }],
        }}
      >
        <Pressable onPress={goToYear}>
          <Text style={styles.monthTitle}>
            {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
            {year}
          </Text>
        </Pressable>
        <FlatList
          contentContainerStyle={styles.monthGrid}
          data={days}
          numColumns={7}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => {
            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(item).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            return (
              <Pressable
                style={[
                  styles.dayBox,
                  selectedDate === dateStr && styles.selectedDay,
                  isToday && styles.todayHighlight,
                ]}
                onPress={() => goToDay(dateStr)}
              >
                <Text style={styles.dayText}>{item}</Text>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    );
  };

  const renderDayView = () => {
    const daySessions = sessions[selectedDate] || [];
    return (
      <Animated.View
        {...daySwipeResponder.panHandlers}
        style={{
          opacity: fadeDay,
          transform: [
            { translateY: translateDayY },
            { translateX: translateDayX },
          ],
          flex: 1,
        }}
      >
        <Text style={styles.agendaTitle}>Sessions on {selectedDate}</Text>
        {daySessions.length === 0 ? (
          <Text style={styles.noSessions}>No sessions scheduled</Text>
        ) : (
          daySessions.map((s) => (
            <View key={s.id} style={styles.sessionBlock}>
              <Text style={styles.time}>{s.time}</Text>
              <Text style={styles.details}>
                📍 {s.location} | 👤 {s.coach}
              </Text>
            </View>
          ))
        )}
      </Animated.View>
    );
  };

  const renderYearView = () => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec",
    ];
    return (
      <Animated.View
        {...yearSwipeResponder.panHandlers}
        style={{
          opacity: fadeYear,
          transform: [{ translateX: translateYearX }],
          flex: 1,
          padding: 16,
        }}
      >
        <Text style={styles.yearTitle}>{year}</Text>
        <FlatList
          data={monthNames}
          numColumns={3}
          keyExtractor={(item) => item}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item, index }) => {
            const isCurrent = year === currentYear && index === currentMonth;
            return (
              <Pressable
                style={[
                  styles.monthBox,
                  isCurrent && { backgroundColor: "#3b82f6" },
                ]}
                onPress={() => goToMonthFromYear(index)}
              >
                <Text
                  style={[
                    styles.monthText,
                    isCurrent && { color: "#fff" },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    );
  };

  // 👇 THIS IS THE LOADING SCREEN
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Loading sessions...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {viewMode === "year" && renderYearView()}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "day" && renderDayView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  monthTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
  monthGrid: { alignItems: "center" },
  dayBox: {
    width: width / 9,
    height: width / 9,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  selectedDay: { backgroundColor: "#3b82f6" },
  todayHighlight: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  dayText: { fontSize: 16, color: "#111" },
  agendaTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  sessionBlock: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  time: { fontSize: 16, fontWeight: "bold" },
  details: { fontSize: 14, color: "#333" },
  noSessions: { marginTop: 12, fontStyle: "italic", color: "#777" },
  yearTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  monthBox: {
    width: width / 3 - 24,
    height: 80,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
  },
  monthText: { fontSize: 18, fontWeight: "bold", color: "#111" },
});
