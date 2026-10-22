import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Image,
} from "react-native";

import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

const API_URL = "https://employee-attendance-backend-1-bjsb.onrender.com";

export default function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [selfieUri, setSelfieUri] = useState(null);
  const [isMarking, setIsMarking] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);
  const markingRef = useRef(false);

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEmployees(data);
      } else {
        console.log("Employees Error:", data);
      }
    } catch (error) {
      console.log("Employees Error:", error.message);
    }
  };
  
  const fetchLoggedInEmployee = async () => {
    try {
      const data = await AsyncStorage.getItem("employee");

      if (data) {
        setEmployee(JSON.parse(data));
      }
    } catch (error) {
      console.log("Employee Error:", error.message);
    }
  };

  const fetchTodayAttendance = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/attendance/my-attendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      const today = new Date().toISOString().split("T")[0];

      const todayRecord = data.find(
        (item) => item.date === today
      );

      setHasCheckedIn(!!todayRecord);
    }
  } catch (error) {
    console.log("Today Attendance Error:", error.message);
  }
};

  useEffect(() => {
    fetchEmployees();
    fetchLoggedInEmployee();
    fetchTodayAttendance();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("employee");

    router.replace("/login");
  };

  const openSelfieCamera = async () => {
    if (markingRef.current) return;

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera permission to take a selfie."
        );
        return;
      }
    }

    setSelfieUri(null);
    setCameraVisible(true);
  };

  const handleMarkAttendance = async () => {
    if (markingRef.current) return;

    if (!selfieUri) {
      Alert.alert(
        "Selfie Required",
        "Please capture a selfie first."
      );
      return;
    }

    markingRef.current = true;
    setIsMarking(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Please allow location permission to mark attendance."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Login Required", "Please log in again.");
        return;
      }

      const formData = new FormData();

      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));

      const selfieFile = new File(selfieUri);
      formData.append("selfie", selfieFile);

      const response = await expoFetch(
        `${API_URL}/api/attendance/mark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Attendance Response:", data);

      if (response.ok) {
        setSelfieUri(null);
        setHasCheckedIn(true);

        Alert.alert(
          "Success",
          "Attendance marked successfully."
        );
      } else {
        Alert.alert(
          "Failed",
          data.message || "Unable to mark attendance."
        );
      }
    } catch (error) {
      console.log("Attendance Error:", error);

      Alert.alert(
        "Error",
        "Unable to get your location or connect to server."
      );
    } finally {
      markingRef.current = false;
      setIsMarking(false);
    }
  };

  const handleCheckOut = async () => {
  if (isCheckingOut) return;

  setIsCheckingOut(true);

  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/attendance/checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      Alert.alert("Success", "Check-out recorded successfully.");
      await fetchTodayAttendance();
    } else {
      Alert.alert("Check-out Failed", data.message || "Unable to check out.");
    }
  } catch (error) {
    console.log("Check-out Error:", error.message);
    Alert.alert("Error", "Unable to connect to server.");
  } finally {
    setIsCheckingOut(false);
  }
};

return (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>EMPLOYEE PORTAL</Text>
        <Text style={styles.welcome}>Welcome, {employee?.name || "Employee"}</Text>
        <Text style={styles.subtitle}>Manage your daily attendance</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(employee?.name || "E").charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>

    <View style={styles.statusCard}>
      <View>
        <Text style={styles.cardLabel}>TODAY'S ATTENDANCE</Text>
        <Text style={styles.statusTitle}>
          {hasCheckedIn ? "Attendance Marked" : "Not Checked In"}
        </Text>
        <Text style={styles.subtitle}>
          {hasCheckedIn ? "Your check-in is recorded" : "Please mark your attendance"}
        </Text>
      </View>
      <Text style={styles.statusIcon}>{hasCheckedIn ? "✓" : "◷"}</Text>
    </View>

    {selfieUri && (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Confirm Your Selfie</Text>
        <Image source={{ uri: selfieUri }} style={styles.selfie} />
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleMarkAttendance}
          disabled={isMarking}
        >
          <Text style={styles.buttonText}>
            {isMarking ? "Marking..." : "Confirm Attendance"}
          </Text>
        </TouchableOpacity>
      </View>
    )}

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Employee Directory</Text>
      <Text style={styles.count}>{employees.length} employees</Text>
    </View>

    {employees.map((item) => (
      <View key={item.employeeId} style={styles.employeeCard}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeAvatarText}>
            {(item.name || "E").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeId}>{item.employeeId}</Text>
        </View>
        {employee?.employeeId === item.employeeId && (
          <TouchableOpacity
            style={styles.markButton}
            onPress={openSelfieCamera}
            disabled={isMarking}
          >
            <Text style={styles.markButtonText}>Mark</Text>
          </TouchableOpacity>
        )}
      </View>
    ))}

    {hasCheckedIn && (
      <TouchableOpacity
        style={[styles.primaryButton, isCheckingOut && styles.disabled]}
        onPress={handleCheckOut}
        disabled={isCheckingOut}
      >
        <Text style={styles.buttonText}>
          {isCheckingOut ? "Checking Out..." : "Check Out"}
        </Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={styles.historyButton}
      onPress={() => router.push("/employeeAttendance")}
    >
      <Text style={styles.buttonText}>View Attendance History</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Log Out</Text>
    </TouchableOpacity>

    <Modal
      visible={cameraVisible}
      animationType="slide"
      onRequestClose={() => setCameraVisible(false)}
    >
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            try {
              if (!cameraRef.current) {
                return Alert.alert("Error", "Camera is not ready.");
              }
              const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
              if (photo?.uri) {
                setSelfieUri(photo.uri);
                setCameraVisible(false);
                Alert.alert("Selfie Captured", "Selfie captured successfully.");
              }
            } catch (error) {
              console.log("Camera Error:", error);
              Alert.alert("Error", "Unable to capture selfie.");
            }
          }}
        >
          <Text style={styles.buttonText}>Take Selfie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setCameraVisible(false)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  </ScrollView>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 35 },
  header: {
    backgroundColor: "#172554", borderRadius: 22, padding: 22,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 22,
  },
  greeting: { color: "#93C5FD", fontSize: 11, fontWeight: "bold", letterSpacing: 1.5 },
  welcome: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginTop: 8 },
  subtitle: { color: "#64748B", fontSize: 13, marginTop: 6 },
  avatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: "#3B82F6",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  statusCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 25, borderWidth: 1, borderColor: "#E2E8F0",
  },
  cardLabel: { color: "#64748B", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  statusTitle: { color: "#0F172A", fontSize: 19, fontWeight: "bold", marginTop: 9 },
  statusIcon: { fontSize: 30, color: "#2563EB" },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12, marginTop: 5,
  },
  sectionTitle: { fontSize: 19, fontWeight: "bold", color: "#172554" },
  count: { color: "#64748B", fontSize: 12 },
  employeeCard: {
    backgroundColor: "#FFFFFF", borderRadius: 15, padding: 14,
    marginBottom: 12, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  employeeAvatar: {
    width: 45, height: 45, borderRadius: 14, backgroundColor: "#DBEAFE",
    alignItems: "center", justifyContent: "center",
  },
  employeeAvatarText: { color: "#1D4ED8", fontSize: 20, fontWeight: "bold" },
  employeeInfo: { flex: 1, marginLeft: 12 },
  employeeName: { color: "#0F172A", fontSize: 16, fontWeight: "bold" },
  employeeId: { color: "#64748B", fontSize: 13, marginTop: 4 },
  markButton: { backgroundColor: "#2563EB", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 9 },
  markButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, marginBottom: 20 },
  selfie: { width: 180, height: 220, borderRadius: 12, alignSelf: "center", marginVertical: 15 },
  primaryButton: {
    backgroundColor: "#2563EB", padding: 15, borderRadius: 12,
    alignItems: "center", marginTop: 12,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  historyButton: {
    backgroundColor: "#059669", padding: 15, borderRadius: 12,
    alignItems: "center", marginTop: 14,
  },
  logoutButton: {
    backgroundColor: "#FFFFFF", padding: 14, borderRadius: 12,
    alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#FECACA",
  },
  logoutText: { color: "#DC2626", fontWeight: "bold", fontSize: 15 },
  disabled: { opacity: 0.5 },
  cameraContainer: { flex: 1, backgroundColor: "#000000" },
  cancelButton: { backgroundColor: "#475569", padding: 15, alignItems: "center" },
});