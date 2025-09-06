import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase";

export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<"coach" | "admin">("coach");

  // Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [clubName, setClubName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchScreen = (next: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      next();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handle login
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Login error", error.message);
    } else {
      Alert.alert("✅ Success", "Logged in!");
    }
  };

  // Handle signup
  const handleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      const userId = data.user.id;

      if (role === "coach") {
        await supabase.from("users").insert([
          {
            id: userId,
            email,
            role: "coach",
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        ]);
        Alert.alert("✅ Success", "Coach account created!");
      } else {
        await supabase.from("users").insert([
          { id: userId, email, role: "admin", first_name: firstName, last_name: lastName },
        ]);
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        await supabase.from("clubs").insert([{ name: clubName, admin_id: userId, pin }]);
        Alert.alert("✅ Success", "Club and admin created!");
      }
    } catch (err: any) {
      Alert.alert("Signup error", err.message);
    }
  };

  // UI sections
  const renderLogin = () => (
    <>
      <Text style={styles.title}>Hockey Hours</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 16 }}
        onPress={() => switchScreen(() => setMode("signup"))}
      >
        <Text style={styles.link}>Don’t have an account? Sign up here</Text>
      </TouchableOpacity>
    </>
  );

  const renderRoleChoice = () => (
    <>
      <Text style={styles.sectionTitle}>Are you signing up as:</Text>
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() =>
          switchScreen(() => {
            setRole("coach");
            setSignupStep("form");
          })
        }
      >
        <Text style={styles.roleCardText}>Coach</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() =>
          switchScreen(() => {
            setRole("admin");
            setSignupStep("form");
          })
        }
      >
        <Text style={styles.roleCardText}>Club</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() =>
          switchScreen(() => {
            setMode("login");
            setSignupStep("role");
          })
        }
      >
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupForm = () => (
    <>
      <Text style={styles.sectionTitle}>
        {role === "coach" ? "Coach Signup" : "Club Signup"}
      </Text>

      {role === "coach" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Club Name"
            placeholderTextColor="#888"
            value={clubName}
            onChangeText={setClubName}
          />
          <TextInput
            style={styles.input}
            placeholder="Admin First Name"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Admin Last Name"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 16 }}
        onPress={() =>
          switchScreen(() => {
            setSignupStep("role"); // go back just one step, not to login
          })
        }
      >
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
            {mode === "login" && renderLogin()}
            {mode === "signup" && signupStep === "role" && renderRoleChoice()}
            {mode === "signup" && signupStep === "form" && renderSignupForm()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 12, color: "#111" },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 24, color: "#555" },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#111",
  },
  button: { backgroundColor: "#3b82f6", paddingVertical: 14, borderRadius: 8, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  link: { color: "#3b82f6", fontSize: 14, textAlign: "center", textDecorationLine: "underline" },
  sectionTitle: { fontSize: 22, fontWeight: "600", marginBottom: 20, textAlign: "center", color: "#111" },
  roleCard: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 30,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  roleCardText: { fontSize: 18, fontWeight: "600", color: "#111" },
});
