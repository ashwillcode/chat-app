import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';

/**
 * Start Screen Component
 * The initial screen of the chat app that users see when they open the application
 * Allows users to enter their name and choose a background color for the chat screen
 * @param {object} navigation - Navigation object provided by React Navigation
 * @returns {React.Component} A React component that renders the start screen
 */
const Start = ({ navigation }) => {
  // State for user's name and selected background color
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#090C08');

  // Background color options
  const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

  return (
    <ImageBackground
      source={require('../assets/chatapp-assets/Background Image.png')}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chat</Text>
        </View>
        <View style={styles.whiteBox}>
          {/* Input field for user's name */}
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Icon name="user" size={20} color="#757083" />
            </View>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="rgba(117, 112, 131, 0.5)"
            />
          </View>

          {/* Color picker section */}
          <Text style={styles.colorPickerText}>Choose Background Color:</Text>
          
          <View style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  selectedColor === color && styles.selectedColor
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <View 
                  style={[
                    styles.colorInner,
                    { backgroundColor: color }
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Button to enter chat */}
          <TouchableOpacity 
            style={[styles.button, !name && styles.buttonDisabled]}
            disabled={!name}
            onPress={() => {
              navigation.navigate('Chat', { 
                name: name,
                backgroundColor: selectedColor
              });
            }}
          >
            <Text style={styles.buttonText}>
              Start Chatting
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

// Styles for the Start screen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: '6%', // To achieve the 88% width for content
    paddingBottom: '15%', // Add some padding at the bottom
    justifyContent: 'space-between', // This will push the white box to the bottom
  },
  titleContainer: {
    marginTop: '35%', // Use margin instead of flex and padding
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  whiteBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    height: '44%', // As per design spec
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#757083',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  iconContainer: {
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#757083',
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    paddingLeft: 15,
  },
  colorPickerText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 15,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderColor: '#757083',
    borderWidth: 2,
    padding: 2, // Add padding to create white space
  },
  colorInner: {
    width: 32, // Smaller to account for padding in selected state
    height: 32, // Smaller to account for padding in selected state
    borderRadius: 16, // Half of width/height
  },
  button: {
    backgroundColor: '#757083',
    padding: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Start; 