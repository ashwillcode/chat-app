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
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Import screen components
import Start from './components/Start';
import Chat from './components/Chat';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create the navigation stack
const Stack = createNativeStackNavigator();

/**
 * Main App Component
 * Sets up the navigation structure for the app using React Navigation
 * Configures the navigation stack with Start and Chat screens
 * @returns {React.Component} The root component of the application
 */
export default function App() {
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
          component={(props) => <Chat {...props} db={db} />}
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
