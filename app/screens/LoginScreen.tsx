import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      // Redirect handled by onAuthStateChanged in App.tsx
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#FAEDCA',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#F2C078',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  switchText: {
    color: '#FE5D26',
    textAlign: 'center',
    marginTop: 10,
  },
});