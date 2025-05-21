import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import ContactsScreen from "./screens/ContactScreen";
import LoginScreen from "./screens/LoginScreen";
import PhoneScreen from "./screens/PhoneScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SignupScreen from "./screens/SignUpScreen";
import CallScreen from "./screens/CallScreen";
import { NavigationContainer } from '@react-navigation/native';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarActiveTintColor: "#F2C078",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Call" component={PhoneScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const requestMicrophonePermission = async () => {
      const permission =
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO;
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        console.log("Microphone permission granted");
      } else {
        console.warn("Microphone permission denied");
      }
    };

    requestMicrophonePermission();

    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <>
    
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
          <Stack.Screen name="Main" component={TabNavigator}   options={{ headerShown: false }} />
            <Stack.Screen name="CallScreen" component={CallScreen} />
            </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    
    </>
  );
}

export default App;
