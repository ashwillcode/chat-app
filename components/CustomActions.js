import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ onSend, user, storage }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  
  // Upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      console.log('Starting image upload for URI:', uri);
      
      // Create blob from image URI
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create unique filename
      const imageName = `${user._id}-${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${imageName}`);
      
      // Upload blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Upload successful, URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image');
      return null;
    }
  };

  // Handle picking image from library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5, // Reduced quality to save storage space
        });

        if (!result.canceled && result.assets[0].uri) {
          const imageUrl = await uploadImage(result.assets[0].uri);
          if (imageUrl) {
            onSend({
              image: imageUrl,
              createdAt: new Date(),
              user: user,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('Error', 'Failed to pick and upload image');
    }
  };

  // Handle taking photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync({
          quality: 0.5, // Reduced quality to save storage space
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled && result.assets[0].uri) {
          const imageUrl = await uploadImage(result.assets[0].uri);
          if (imageUrl) {
            onSend({
              image: imageUrl,
              createdAt: new Date(),
              user: user,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in takePhoto:', error);
      Alert.alert('Error', 'Failed to take and upload photo');
    }
  };

  // Handle sharing location
  const getLocation = async () => {
    try {
      console.log('Starting location request...');
      // First check if location services are enabled
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      console.log('Location services enabled:', serviceEnabled);
      
      if (!serviceEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to share your location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if permissions are already granted
      let { status } = await Location.getForegroundPermissionsAsync();
      console.log('Initial permission status:', status);
      
      // If not granted, show explanation before requesting permission
      if (status !== 'granted') {
        console.log('Requesting location permission...');
        Alert.alert(
          'Location Access Required',
          'This app needs access to your location to share it in the chat. Please grant location access when prompted.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => console.log('Location permission request cancelled')
            },
            {
              text: 'Continue',
              onPress: async () => {
                console.log('Requesting permission after user confirmation...');
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                console.log('New permission status:', newStatus);
                if (newStatus === 'granted') {
                  console.log('Permission granted, getting location...');
                  await getCurrentAndSendLocation();
                } else {
                  console.log('Permission denied by user');
                  Alert.alert(
                    'Permission Denied',
                    'Location sharing is not available without location permission.'
                  );
                }
              }
            }
          ]
        );
        return;
      }

      console.log('Permission already granted, getting location...');
      await getCurrentAndSendLocation();

    } catch (error) {
      console.error('Error in getLocation:', error);
      Alert.alert(
        'Location Error',
        'Failed to get location. Please make sure location services are enabled and try again.'
      );
    }
  };

  // Helper function to get and send location
  const getCurrentAndSendLocation = async () => {
    try {
      console.log('Getting current location...');
      // Show loading indicator
      Alert.alert('Getting Location', 'Please wait while we fetch your location...', 
        [{ text: 'Cancel', style: 'cancel' }], 
        { cancelable: true }
      );

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0
      });

      console.log('Location received:', location);

      if (location && location.coords) {
        console.log('Sending location to chat...');
        onSend({
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
          createdAt: new Date(),
          user: user,
        });
      } else {
        throw new Error('Location data is incomplete');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please try again.'
      );
    }
  };

  const onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Share Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            break;
          case 1:
            takePhoto();
            break;
          case 2:
            getLocation();
            break;
          default:
            break;
        }
      },
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <FontAwesome name="plus" size={24} color="#757083" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomActions; 