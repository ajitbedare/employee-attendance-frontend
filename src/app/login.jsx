
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { router } from "expo-router";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeId.trim() || !password) {
      Alert.alert("Missing Details", "Please enter Employee ID and password.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        "https://employee-attendance-backend-1-bjsb.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employeeId.trim(),
            password,
          }),
        }
      );

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        Alert.alert("Server Error", "Server returned a non-JSON response.");
        return;
      }

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem(
          "employee",
          JSON.stringify(data.employee)
        );

        Alert.alert("Success", "Login successful");

        if (data.employee.role === "admin") {
          router.replace("/adminDashboard");
        } else {
          router.replace("/dashboard");
        }
      } else {
        Alert.alert("Login Failed", data.message || "Please try again.");
      }
    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert("Connection Error", "Unable to connect to server.");
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to manage your attendance
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Login to your account</Text>
          <Text style={styles.formSubtitle}>
            Enter your credentials to continue.
          </Text>

          <Text style={styles.label}>Employee ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your employee ID"
            placeholderTextColor="#94A3B8"
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
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
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing In..." : "Sign In  →"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>NEW TO THE PORTAL?</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/register")}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>
              Create an Account
            </Text>
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
    paddingTop: 45,
    paddingBottom: 65,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: "#60A5FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 1,
  },
  brand: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 13,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 9,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -35,
    padding: 23,
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
    fontSize: 22,
    fontWeight: "800",
  },
  formSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 7,
    marginBottom: 26,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DCE3EF",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#172554",
    marginBottom: 20,
  },
  passwordContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE3EF",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#172554",
  },
  showButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  showText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
  },
  loginButton: {
    height: 53,
    backgroundColor: "#2563EB",
    borderRadius: 13,
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
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
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
    letterSpacing: 1,
    marginHorizontal: 10,
  },
  registerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 25,
    marginHorizontal: 20,
  },
});
