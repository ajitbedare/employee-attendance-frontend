
import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://employee-attendance-backend-1-bjsb.onrender.com";

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = async () => await AsyncStorage.getItem("token");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${await token()}` };
      const [e, s] = await Promise.all([
        fetch(`${API_URL}/api/employees`, { headers }),
        fetch(`${API_URL}/api/shifts`, { headers })
      ]);
      const employeesData = await e.json();
      const shiftsData = await s.json();
      if (!e.ok) throw new Error(employeesData.message || "Employees failed to load");
      if (!s.ok) throw new Error(shiftsData.message || "Shifts failed to load");
      setEmployees(Array.isArray(employeesData) ? employeesData : employeesData.employees || []);
      setShifts(Array.isArray(shiftsData) ? shiftsData : shiftsData.shifts || []);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const resetForm = () => {
    setName(""); setStartTime(""); setEndTime("");
    setSelectedEmployees([]); setEditingId(null);
  };

  const toggleEmployee = (id) =>
    setSelectedEmployees(old => old.includes(id)
      ? old.filter(x => x !== id) : [...old, id]);

  const editShift = shift => {
    setEditingId(shift._id);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setSelectedEmployees((shift.employees || []).map(e =>
      typeof e === "string" ? e : e._id
    ));
  };

  const saveShift = async () => {
    if (!name.trim() || !startTime.trim() || !endTime.trim())
      return Alert.alert("Validation", "Enter all shift details.");
    if (!selectedEmployees.length)
      return Alert.alert("Validation", "Select at least one employee.");

    try {
      setLoading(true);
      const editing = Boolean(editingId);
      const response = await fetch(
        `${API_URL}/api/shifts/${editing ? `update/${editingId}` : "create"}`,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await token()}`
          },
          body: JSON.stringify({
            name: name.trim(), startTime: startTime.trim(),
            endTime: endTime.trim(), employeeIds: selectedEmployees
          })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save shift");
      Alert.alert("Success", data.message || "Shift saved successfully");
      resetForm();
      await loadData();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, value, setter, placeholder) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input} value={value} onChangeText={setter}
        placeholder={placeholder} placeholderTextColor="#94A3B8"
      />
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <View style={styles.header}>
        <Text style={styles.eyebrow}>ADMIN PANEL</Text>
        <Text style={styles.title}>Shift Management</Text>
        <Text style={styles.subtitle}>Create shifts and assign your team.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>{editingId ? "✏️ Update Shift" : "＋ Create Shift"}</Text>
        {field("Shift Name", name, setName, "e.g. Morning Shift")}
        {field("Start Time", startTime, setStartTime, "09:00 AM")}
        {field("End Time", endTime, setEndTime, "06:00 PM")}

        <Text style={styles.label}>Assign Employees ({selectedEmployees.length})</Text>
        {employees.filter(e => e.role !== "admin").map(employee => {
          const selected = selectedEmployees.includes(employee._id);
          return (
            <TouchableOpacity key={employee._id}
              style={[styles.employee, selected && styles.selected]}
              onPress={() => toggleEmployee(employee._id)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(employee.name || "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.muted}>{employee.employeeId}</Text>
              </View>
              <Text style={[styles.check, selected && styles.checked]}>
                {selected ? "✓" : "+"}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.primary} onPress={saveShift} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : editingId ? "Update Shift" : "Create Shift"}
          </Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={styles.cancel} onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel Editing</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Existing Shifts · {shifts.length}</Text>
      {shifts.map(shift => (
        <View key={shift._id} style={styles.shiftCard}>
          <View style={styles.shiftTop}>
            <View style={styles.shiftIcon}><Text>◷</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shiftName}>{shift.name}</Text>
              <Text style={styles.muted}>{shift.startTime} – {shift.endTime}</Text>
            </View>
            <Text style={styles.count}>{shift.employees?.length || 0} staff</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => editShift(shift)}>
            <Text style={styles.editText}>✎  Edit Shift</Text>
          </TouchableOpacity>
        </View>
      ))}
      {!shifts.length && <Text style={styles.empty}>No shifts created yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 18, paddingBottom: 45 },
  header: { backgroundColor: "#172554", padding: 24, borderRadius: 20, marginBottom: 20 },
  eyebrow: { color: "#93C5FD", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#CBD5E1", marginTop: 6, fontSize: 13 },
  card: { backgroundColor: "#FFF", padding: 18, borderRadius: 18, marginBottom: 25 },
  heading: { fontSize: 19, fontWeight: "800", color: "#172554", marginBottom: 20 },
  label: { color: "#334155", fontSize: 13, fontWeight: "700", marginBottom: 7, marginTop: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 11, padding: 13, fontSize: 15, marginBottom: 10, color: "#0F172A" },
  employee: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8, gap: 10 },
  selected: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  avatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#1D4ED8", fontSize: 17, fontWeight: "800" },
  employeeName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  muted: { color: "#64748B", fontSize: 12, marginTop: 4 },
  check: { fontSize: 20, color: "#64748B", paddingHorizontal: 5 },
  checked: { color: "#2563EB", fontWeight: "900" },
  primary: { backgroundColor: "#2563EB", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 18 },
  buttonText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  cancel: { padding: 13, alignItems: "center", marginTop: 5 },
  cancelText: { color: "#64748B", fontWeight: "700" },
  sectionTitle: { color: "#0F172A", fontSize: 20, fontWeight: "800", marginBottom: 13 },
  shiftCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  shiftTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  shiftIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center" },
  shiftName: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
  count: { backgroundColor: "#F1F5F9", color: "#475569", padding: 7, borderRadius: 8, fontSize: 11, fontWeight: "700" },
  editButton: { borderWidth: 1, borderColor: "#BFDBFE", backgroundColor: "#EFF6FF", borderRadius: 10, padding: 11, alignItems: "center", marginTop: 14 },
  editText: { color: "#1D4ED8", fontWeight: "800" },
  empty: { textAlign: "center", color: "#64748B", padding: 25 }
});
