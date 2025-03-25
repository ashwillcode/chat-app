import { StyleSheet, View, Text } from 'react-native';

/**
 * Chat Screen Component
 * The main chat interface where users can send and receive messages
 * @param {object} route - Contains route params including name and backgroundColor
 * @returns {React.Component} A React component that renders the chat screen
 */
const Chat = ({ route }) => {
  // Get the background color from navigation params
  const { backgroundColor } = route.params;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>Chat Screen</Text>
    </View>
  );
}

// Styles for the Chat screen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#333',
  },
});

export default Chat; 