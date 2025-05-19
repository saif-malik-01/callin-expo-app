import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const FAB = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <Text style={styles.fabText}>+</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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

export default FAB;