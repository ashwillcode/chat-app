import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const CustomMapView = ({ location }) => {
  if (!location || !location.latitude || !location.longitude) {
    return null;
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 13,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 5,
  },
  map: {
    width: Dimensions.get('window').width * 0.6,
    height: 150,
  },
});

export default CustomMapView; 