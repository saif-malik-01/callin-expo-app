import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditContactModalProps {
  visible: boolean;
  onClose: () => void;
  contact: { id: string; name: string; phone: string };
  onSave: (id: string, name: string, phone: string) => void;
  onDelete: (id: string) => void;
}

const EditContactModal = ({
  visible,
  onClose,
  contact,
  onSave,
  onDelete,
}: EditContactModalProps) => {
  const [name, setName] = useState(contact.name);
  const [phone, setPhone] = useState(contact.phone);

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number.');
      return;
    }
    onSave(contact.id, name, phone);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => onDelete(contact.id) },
    ]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>Edit Contact</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
            </View>
        

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity></View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#183B4E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: '#27548A70',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
   
   
  },
  cancelButton: {
    backgroundColor: '#DDA85370',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditContactModal;