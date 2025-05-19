import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactItem from '../components/ContactItem';
import DialerModal from '../components/DialerModal';
import SearchBar from '../components/SearchBar';

const PhoneScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialerOpen, setDialerOpen] = useState(false);
  const [contacts, setContacts] = useState<
    { id: string; name: string; number: string; timestamp?: string }[]
  >([]);

  useFocusEffect(
  React.useCallback(() => {
   
  }, [])
);


 

  const clearCallLogs = async () => {
    try {
      
      Alert.alert('Success', 'Call logs cleared.');
    } catch (err) {
      console.error('Failed to clear call logs:', err);
      Alert.alert('Error', 'Something went wrong while clearing call logs.');
    }
  };

  const filteredLogs = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <TouchableOpacity style={styles.clearButton} onPress={clearCallLogs}>
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={item => `${item.id}_${item.timestamp}`}
        renderItem={({ item }) => (
          <ContactItem
            contact={{
              id: item.id,
              name: item.name,
              phone: item.number,
              onPress: () => {
                console.log('Pressed contact:', item.name);
              },
            }}
            onPress={() => {
              console.log('Pressed:', item.name);
            }}
          />
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setDialerOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <DialerModal visible={isDialerOpen} onClose={() => setDialerOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FE5D26',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: { fontSize: 30, color: '#fff' },
});

export default PhoneScreen;