
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "https://employee-attendance-backend-1-bjsb.onrender.com";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const regularEmployees = employees.filter(
    (item) => item.role !== "admin"
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const [employeeResponse, shiftResponse] = await Promise.all([
        fetch(`${API_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/shifts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const employeeData = await employeeResponse.json();
      const shiftData = await shiftResponse.json();

      if (employeeResponse.ok && Array.isArray(employeeData)) {
        const employeesWithShifts = employeeData.map((employee) => {
          const assignedShift = (shiftData.shifts || []).find((shift) =>
            (shift.employees || []).some(
              (item) => item._id === employee._id
            )
          );

          return {
            ...employee,
            assignedShift: assignedShift || null,
          };
        });

        setEmployees(employeesWithShifts);
      } else {
        console.log("Employees Error:", employeeData);
      }
    } catch (error) {
      console.log("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewAttendance = (employee) => {
    router.push({
      pathname: "/employeeAttendance",
      params: {
        employeeId: employee._id,
        employeeName: employee.name,
      },
    });
  };

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#172554" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>ADMINISTRATION</Text>
            <Text style={styles.heading}>Manage Employees</Text>
            <Text style={styles.headerSubtitle}>
              Employee directory and shift details
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>♙</Text>
          </View>
        </View>

        {/* Employee count */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>👥</Text>
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>TOTAL EMPLOYEES</Text>
            <Text style={styles.total}>
              {loading ? "—" : regularEmployees.length}
            </Text>
          </View>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>Employees</Text>
          </View>
        </View>

        {/* List heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Employee Directory</Text>
          {!loading && (
            <Text style={styles.sectionCount}>
              {regularEmployees.length} records
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.stateText}>Loading employees...</Text>
          </View>
        ) : regularEmployees.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyIcon}>♙</Text>
            <Text style={styles.emptyTitle}>No employees found</Text>
            <Text style={styles.stateText}>
              Registered employees will appear here.
            </Text>
          </View>
        ) : (
          regularEmployees.map((item) => (
            <View
              key={item._id || item.employeeId}
              style={styles.employeeCard}
            >
              {/* Employee identity */}
              <View style={styles.employeeHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.name)}
                  </Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{item.name}</Text>
                  <Text style={styles.employeeId}>
                    ID: {item.employeeId}
                  </Text>
                  {item.email ? (
                    <Text style={styles.employeeEmail}>{item.email}</Text>
                  ) : null}
                </View>

                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Employee</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Shift details */}
              <View style={styles.shiftHeader}>
                <View style={styles.shiftIcon}>
                  <Text style={styles.shiftIconText}>◷</Text>
                </View>
                <Text style={styles.shiftHeading}>Assigned Shift</Text>
              </View>

              {item.assignedShift ? (
                <View style={styles.shiftDetails}>
                  <Text style={styles.shiftName}>
                    {item.assignedShift.name}
                  </Text>

                  <View style={styles.timeRow}>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>START TIME</Text>
                      <Text style={styles.timeValue}>
                        {item.assignedShift.startTime}
                      </Text>
                    </View>

                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>END TIME</Text>
                      <Text style={styles.timeValue}>
                        {item.assignedShift.endTime}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noShiftBox}>
                  <Text style={styles.noShiftText}>
                    No shift assigned yet
                  </Text>
                </View>
              )}

              {/* Attendance history */}
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={() => viewAttendance(item)}
              >
                <Text style={styles.buttonText}>
                  View Attendance History
                </Text>
                <Text style={styles.buttonArrow}>›</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Employee Attendance & Monitoring System
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F6FC",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  header: {
    backgroundColor: "#172554",
    paddingTop: 35,
    paddingHorizontal: 21,
    paddingBottom: 53,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLabel: {
    color: "#93C5FD",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 11,
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 7,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#60A5FA",
    marginLeft: 10,
  },
  headerIconText: {
    color: "#FFFFFF",
    fontSize: 28,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: -25,
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    elevation: 4,
    shadowColor: "#172554",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  summaryIconText: {
    fontSize: 23,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  total: {
    fontSize: 26,
    fontWeight: "900",
    color: "#172554",
    marginTop: 3,
  },
  summaryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },
  summaryBadgeText: {
    color: "#1D4ED8",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: 27,
    marginBottom: 14,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172554",
  },
  sectionCount: {
    fontSize: 11,
    color: "#64748B",
  },
  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginHorizontal: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    elevation: 2,
    shadowColor: "#172554",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#1D4ED8",
    fontSize: 17,
    fontWeight: "900",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172554",
  },
  employeeId: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  employeeEmail: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 6,
    marginLeft: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginRight: 5,
  },
  activeText: {
    color: "#047857",
    fontSize: 9,
    fontWeight: "800",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#EDF1F7",
    marginVertical: 17,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shiftIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  shiftIconText: {
    color: "#2563EB",
    fontSize: 19,
    fontWeight: "800",
  },
  shiftHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  shiftDetails: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDF1F7",
  },
  shiftName: {
    color: "#172554",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    gap: 10,
  },
  timeBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
  timeLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeValue: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  noShiftBox: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  noShiftText: {
    color: "#C2410C",
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 9,
    lineHeight: 23,
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
  stateText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  emptyIcon: {
    color: "#94A3B8",
    fontSize: 34,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#172554",
    fontSize: 16,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 14,
    marginHorizontal: 20,
  },
});
