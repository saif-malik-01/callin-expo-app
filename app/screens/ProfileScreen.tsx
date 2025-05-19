import auth from '@react-native-firebase/auth';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProfileScreen: React.FC = () => {
  const user = auth().currentUser;

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          auth().signOut().catch((error) => {
            Alert.alert('Logout Failed', error.message);
          });
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: user?.photoURL || 'https://i.pravatar.cc/150?img=12', // fallback avatar
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.displayName || 'Guest User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;