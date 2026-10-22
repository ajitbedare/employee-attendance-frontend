import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://employee-attendance-backend-1-bjsb.onrender.com";

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/attendance/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setAttendance(data);
      } else {
        setError(data.message || "Unable to load attendance.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
      console.log("Attendance Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Attendance Management</Text>
      <Text style={styles.total}>
        Total Attendance Records: {attendance.length}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : attendance.length === 0 ? (
        <Text>No attendance records found.</Text>
      ) : (
        attendance.map((item) => (
          <View
            key={item._id}
            style={styles.employeeCard}
          >
            <Text style={styles.employeeName}>
              {item.employeeId?.name || "Unknown Employee"}
            </Text>

            <Text style={styles.employeeId}>
              Employee ID: {item.employeeId?.employeeId || "N/A"}
            </Text>

            <Text style={styles.detail}>Date: {item.date}</Text>
            <Text style={styles.detail}>Status: {item.status}</Text>
            <Text style={styles.detail}>
              Check-in: {item.checkInTime || "N/A"}
            </Text>
            <Text style={styles.detail}>
              Check-out: {item.checkOutTime || "Not checked out"}
            </Text>
            <Text style={styles.detail}>
              Location: {[item.city, item.state].filter(Boolean).join(", ") || "Not available"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F3F6FB",
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  employeeCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  employeeId: {
    color: "#666",
    marginTop: 4,
    marginBottom: 8,
  },
  detail: {
    marginTop: 5,
    color: "#333",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
