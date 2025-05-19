import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    
    <TouchableOpacity
      onPress={() => onCallPress(contact)}  
      style={{ padding: 8 }}  
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ContactItem;