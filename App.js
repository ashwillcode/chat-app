// Import necessary components and libraries
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screen components
import Start from './components/Start';
import Chat from './components/Chat';

// Create the navigator
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
        {/* Start Screen - Initial screen with no header */}
        <Stack.Screen 
          name="Start" 
          component={Start}
          options={{ headerShown: false }}
        />

        {/* Chat Screen - Main chat interface with custom header */}
        <Stack.Screen 
          name="Chat"
          component={Chat}
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
