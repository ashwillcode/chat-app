/**
 * Chat App - Main Application Component
 * 
 * This is the root component of the application that sets up:
 * 1. Firebase initialization and services
 * 2. Navigation structure
 * 3. Screen configurations
 */

// Import necessary components and libraries
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

// Import screen components
import Start from './components/Start';
import Chat from './components/Chat';

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Create the navigation stack
const Stack = createNativeStackNavigator();

/**
 * Main App Component
 * Sets up the navigation structure for the app using React Navigation
 * Configures the navigation stack with Start and Chat screens
 * @returns {React.Component} The root component of the application
 */
export default function App() {
  // Get network connection status
  const connectionStatus = useNetInfo();

  // Handle network status changes
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      console.log('Lost connection');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      console.log('Connected');
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  // Create a wrapper component for Chat inside the App component
  const ChatWrapper = ({ route, navigation }) => (
    <Chat
      route={route}
      navigation={navigation}
      db={db}
      auth={auth}
      isConnected={connectionStatus.isConnected}
    />
  );

  return (
    <NavigationContainer>
      {/* Configure the navigation stack */}
      <Stack.Navigator
        initialRouteName="Start"
      >
        {/* Start Screen - Initial screen for user setup and authentication */}
        <Stack.Screen 
          name="Start" 
          component={Start}
          options={{ headerShown: false }}
        />

        {/* Chat Screen - Main chat interface with Firestore integration */}
        <Stack.Screen 
          name="Chat"
          component={ChatWrapper}
          options={({ route }) => ({
            title: route.params?.name || 'Chat',
            headerStyle: {
              backgroundColor: '#757083',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          })}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

// Styles for the root app component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
