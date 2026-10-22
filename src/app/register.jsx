
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";

export default function Register() {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !employeeId.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      Alert.alert("Missing Details", "Please fill in all fields.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        "https://employee-attendance-backend-1-bjsb.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employeeId.trim(),
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Register Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Employee registered successfully");
        router.replace("/login");
      } else {
        Alert.alert(
          "Register Failed",
          data.message || "Unable to register employee."
        );
      }
    } catch (error) {
      console.log("Register Error:", error);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#172554" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>EA</Text>
          </View>

          <Text style={styles.brand}>EMPLOYEE PORTAL</Text>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Register to access the attendance system
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Employee Registration</Text>
          <Text style={styles.formSubtitle}>
            Enter your details to create an account.
          </Text>

          <Text style={styles.label}>Employee ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter employee ID"
            placeholderTextColor="#94A3B8"
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create a password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showText}>
                {showPassword ? "HIDE" : "SHOW"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Create Account  →"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>ALREADY REGISTERED?</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.loginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Employee Attendance & Monitoring System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F6FC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#172554",
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 58,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "#60A5FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  brand: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 11,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: -30,
    padding: 21,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    elevation: 5,
    shadowColor: "#172554",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  formTitle: {
    color: "#172554",
    fontSize: 21,
    fontWeight: "800",
  },
  formSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 7,
    marginBottom: 22,
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DCE3EF",
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#172554",
    marginBottom: 16,
  },
  passwordContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE3EF",
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
    marginBottom: 22,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#172554",
  },
  showButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  showText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },
  registerButton: {
    height: 51,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 17,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginHorizontal: 9,
  },
  loginButton: {
    height: 47,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 22,
    marginHorizontal: 20,
  },
});
