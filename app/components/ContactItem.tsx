import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // You can use react-native-vector-icons too

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
  onCallPress: (contact: Contact) => void;
}

const ContactItem = ({ contact, onPress, onCallPress }: ContactItemProps) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress}>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text>{contact.phone}</Text>
    </View>
    <Pressable
      onPress={() => onCallPress(contact)}
      style={styles.callIcon}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="call" size={24} color="#007AFF" />
    </Pressable>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "500",
  },
  callIcon: {
    padding: 8,
  },
});

export default ContactItem;
