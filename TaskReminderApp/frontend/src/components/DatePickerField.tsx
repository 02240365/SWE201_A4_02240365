import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

type PickerMode = "date" | "time";

/**
 * Date & time picker using @react-native-community/datetimepicker.
 * On Android: shows native spinner dialogs sequentially (date then time).
 * On iOS: shows inline picker in a modal.
 */
export default function DatePickerField({ value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<PickerMode>("date");
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const openDatePicker = () => {
    setTempDate(value || new Date());
    setMode("date");
    setShow(true);
  };

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) {
      // User dismissed on Android
      setShow(false);
      return;
    }

    if (Platform.OS === "android") {
      setShow(false);
      if (mode === "date") {
        // Date selected — now open time picker
        setTempDate(selectedDate);
        setMode("time");
        setShow(true);
      } else {
        // Time selected — done
        onChange(selectedDate);
      }
    } else {
      // iOS: update continuously
      setTempDate(selectedDate);
    }
  };

  const confirmIOS = () => {
    setShow(false);
    onChange(tempDate);
  };

  const clearDate = () => onChange(null);

  const formattedDate = value
    ? value.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <View>
      <TouchableOpacity style={styles.picker} onPress={openDatePicker}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={value ? COLORS.primary : COLORS.textMuted}
        />
        <Text style={[styles.pickerText, !value && styles.placeholder]}>
          {formattedDate || "Select date & time"}
        </Text>
        {value && (
          <TouchableOpacity
            onPress={clearDate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Android: native dialog shown directly */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          minimumDate={mode === "date" ? new Date() : undefined}
          is24Hour={false}
          onChange={handleChange}
        />
      )}

      {/* iOS: modal with inline picker */}
      {Platform.OS === "ios" && (
        <Modal transparent visible={show} animationType="slide">
          <View style={styles.iosOverlay}>
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.iosBtnCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={styles.iosBtnDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleChange}
                textColor={COLORS.text}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: { flex: 1, fontSize: 15, color: COLORS.text },
  placeholder: { color: COLORS.textMuted },
  // iOS modal styles
  iosOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosBtnCancel: { fontSize: 16, color: COLORS.textMuted, fontWeight: "600" },
  iosBtnDone: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },
  iosPicker: { backgroundColor: COLORS.surface },
});
