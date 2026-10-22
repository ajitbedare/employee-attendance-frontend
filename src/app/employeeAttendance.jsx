
import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, Image,
  ActivityIndicator, ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://employee-attendance-backend-1-bjsb.onrender.com";

export default function Attendance() {
  const { employeeId, employeeName } = useLocalSearchParams();
  const [attendance, setAttendance] = useState([]);
  const [selfies, setSelfies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchAttendance(); }, [employeeId]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Please log in again.");

      const endpoint = employeeId
        ? `/api/attendance/employee/${encodeURIComponent(employeeId)}`
        : "/api/attendance/my-attendance";

      const res = await fetch(API_URL + endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load attendance.");
      if (!Array.isArray(data)) throw new Error("Unexpected attendance response.");

      setAttendance(data);
      data.forEach(item => {
        if (item.selfie) loadSelfie(item.selfie, token);
      });
    } catch (e) {
      setError(e.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const loadSelfie = async (file, token) => {
    try {
      const res = await fetch(
        `${API_URL}/api/attendance/selfie/${encodeURIComponent(file)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string")
          setSelfies(old => ({ ...old, [file]: reader.result }));
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.log("Selfie error:", e.message);
    }
  };

  const detail = (label, value) => (
    <View style={styles.detail} key={label}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value ?? "Not available")}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{item.date || "Attendance Record"}</Text>
          <Text style={styles.muted}>Attendance details</Text>
        </View>
        <View style={[styles.badge, {
          backgroundColor: item.status?.toLowerCase() === "present" ? "#DCFCE7" : "#F1F5F9"
        }]}>
          <Text style={[styles.badgeText, {
            color: item.status?.toLowerCase() === "present" ? "#15803D" : "#475569"
          }]}>{item.status || "Unknown"}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {detail("CHECK-IN", item.checkInTime || "Not available")}
        {detail("CHECK-OUT", item.checkOutTime || "Not checked out")}
        {detail("CITY", item.city || "Not available")}
        {detail("STATE", item.state || "Not available")}
        {detail("LATITUDE", item.latitude ?? "Not available")}
        {detail("LONGITUDE", item.longitude ?? "Not available")}
      </View>

      <Text style={styles.section}>Attendance Selfie</Text>
      {item.selfie && selfies[item.selfie] ? (
        <Image source={{ uri: selfies[item.selfie] }} style={styles.selfie} />
      ) : (
        <View style={styles.noSelfie}>
          <Text style={styles.muted}>
            {item.selfie ? "Loading selfie..." : "Selfie not available"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ATTENDANCE RECORDS</Text>
        <Text style={styles.title}>
          {employeeId ? `${employeeName || "Employee"}'s Attendance` : "My Attendance"}
        </Text>
        <Text style={styles.subtitle}>Review check-in, check-out and location details.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 35 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No attendance records found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { backgroundColor: "#172554", padding: 23, paddingTop: 58, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  eyebrow: { color: "#93C5FD", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 9 },
  subtitle: { color: "#CBD5E1", fontSize: 12, marginTop: 7 },
  list: { padding: 16, paddingBottom: 35, flexGrow: 1 },
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 17, marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 17 },
  date: { fontSize: 17, color: "#0F172A", fontWeight: "800" },
  muted: { color: "#64748B", fontSize: 12, marginTop: 5 },
  badge: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  detail: { width: "48%", backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, flexGrow: 1 },
  label: { color: "#64748B", fontSize: 10, fontWeight: "800" },
  value: { color: "#1E293B", fontSize: 13, fontWeight: "600", marginTop: 5 },
  section: { fontSize: 15, color: "#172554", fontWeight: "800", marginTop: 18, marginBottom: 10 },
  selfie: { width: 150, height: 150, borderRadius: 13, backgroundColor: "#E2E8F0" },
  noSelfie: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 15 },
  error: { color: "#DC2626", padding: 20 },
  empty: { color: "#64748B", textAlign: "center", marginTop: 35 }
});
