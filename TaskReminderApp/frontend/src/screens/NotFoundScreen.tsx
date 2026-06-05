import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={56} color={COLORS.textMuted} />
      <Text style={styles.title}>Page Not Found</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.btnText}>Go to Tasks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.textSecondary },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
