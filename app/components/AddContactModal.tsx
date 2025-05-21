import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
} from "@react-native-firebase/firestore";

interface Props {
  visible: boolean;
  onClose: () => void;
  newName: string;
  newPhone: string;
  newEmail: string;
  setNewName: (text: string) => void;
  setNewPhone: (text: string) => void;
  setNewEmail: (text: string) => void;
  nameInputRef: React.RefObject<TextInput | null>;
}

const AddContactModal = ({
  visible,
  onClose,
  newName,
  newPhone,
  newEmail,
  setNewName,
  setNewPhone,
  setNewEmail,
  nameInputRef,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore();

  const handleSave = async () => {
    if (!newName.trim() || !newPhone.trim() || !newEmail.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "User not authenticated");
        setLoading(false);
        return;
      }

      const emailToCheck = newEmail.trim().toLowerCase();

      // Query users collection for email
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", emailToCheck), limit(1));
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        Alert.alert(
          "User Not Found",
          "No user with this email is registered. Please check the email or ask them to sign up first."
        );
        setLoading(false);
        return;
      }

      // Add contact document in current user's contacts subcollection
      const contactsRef = collection(firestore, "users", currentUser.uid, "contacts");
      await addDoc(contactsRef, {
        name: newName.trim(),
        phone: newPhone.trim(),
        email: emailToCheck,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Contact added successfully!");
      onClose();
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>Add New Contact</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            ref={nameInputRef}
            placeholder="Enter name"
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            placeholder="Enter phone number"
            style={styles.input}
            value={newPhone}
            keyboardType="phone-pad"
            onChangeText={setNewPhone}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter email address"
            style={styles.input}
            value={newEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setNewEmail}
            placeholderTextColor="#999"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.smallButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButtonSecondary}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 24,
    borderRadius: 20,
    elevation: 6,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#111",
  },
  label: {
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fafafa",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  smallButton: {
    backgroundColor: "#0066ff",
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#8fb3ff",
  },
  smallButtonSecondary: {
    backgroundColor: "#eee",
    flex: 1,
    marginLeft: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AddContactModal;
