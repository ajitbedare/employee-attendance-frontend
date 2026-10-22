
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

export default function AdminDashboard() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#172554" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>EMPLOYEE PORTAL</Text>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, Admin!</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeIcon}>
          <Text style={styles.welcomeEmoji}>⚙</Text>
        </View>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Manage your workforce</Text>
          <Text style={styles.welcomeDescription}>
            Manage shifts, employees and attendance from one place.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Administration</Text>
        <Text style={styles.sectionSubtitle}>QUICK ACCESS</Text>
      </View>

    
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push("/shiftManagement")}
      >
        <View style={[styles.cardIcon, styles.blueIcon]}>
          <Text style={styles.iconText}>◷</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Shift Management</Text>
          <Text style={styles.cardDescription}>
            Create, edit and assign shifts to employees.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push("/employees")}
      >
        <View style={[styles.cardIcon, styles.greenIcon]}>
          <Text style={styles.iconText}>♙</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Manage Employees</Text>
          <Text style={styles.cardDescription}>
            View and manage employee information.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

    
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push("/register")}
      >
        <View style={[styles.cardIcon, styles.orangeIcon]}>
          <Text style={styles.iconText}>▤</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Employee Registration</Text>
          <Text style={styles.cardDescription}>
            View employee attendance records.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Employee Attendance & Monitoring System
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#172554",
    paddingTop: 35,
    paddingHorizontal: 22,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 7,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#60A5FA",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: -20,
    padding: 18,
    borderRadius: 18,
    elevation: 4,
    shadowColor: "#172554",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  welcomeEmoji: {
    fontSize: 25,
    color: "#1D4ED8",
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172554",
  },
  welcomeDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 5,
  },
  sectionHeader: {
    marginTop: 29,
    marginBottom: 14,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172554",
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#94A3B8",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginBottom: 13,
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    elevation: 2,
    shadowColor: "#172554",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  blueIcon: {
    backgroundColor: "#DBEAFE",
  },
  greenIcon: {
    backgroundColor: "#D1FAE5",
  },
  orangeIcon: {
    backgroundColor: "#FFEDD5",
  },
  iconText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#172554",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 5,
  },
  arrow: {
    fontSize: 30,
    color: "#94A3B8",
    marginLeft: 8,
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 18,
    marginHorizontal: 20,
  },
});
