import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const DialerModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [number, setNumber] = useState('');

  const handlePress = (val: string) => {
    setNumber(prev => prev + val);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    console.log('Calling:', number);
    // Native call logic here
    onClose();
    setNumber('');
  };

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.display}>{number || 'Enter Number'}</Text>

          {/* Dial Pad */}
          <View style={styles.pad}>
            {dialPad.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.key}
                    onPress={() => handlePress(key)}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Text style={styles.actionText}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCall} style={styles.callBtn}>
              <Text style={styles.callText}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
              <Text style={styles.actionText}>✖</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', 
      },
      
      modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40, 
        alignItems: 'center',
      },
      
  display: {
    fontSize: 28,
    marginBottom: 20,
    letterSpacing: 2,
    color: '#333',
  },
  pad: {
    width: '100%',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  key: {
    backgroundColor: '#e6e6e6',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionBtn: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 50,
  },
  actionText: {
    fontSize: 22,
  },
  callBtn: {
    backgroundColor: '#28a745',
    padding: 20,
    borderRadius: 50,
  },
  callText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default DialerModal;