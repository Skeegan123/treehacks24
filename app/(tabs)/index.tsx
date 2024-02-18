import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { getLocation, getLocationName } from "../functions/location";
import DisplayMap from "@/components/DisplayMap";
import * as Location from "expo-location";
import MapView, { Region } from "react-native-maps";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [locationName, setLocationName] = useState<string>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      const tempLocation = await getLocation((_) => null);
      await getLocationName(
        setLocationName,
        tempLocation?.coords.latitude!,
        tempLocation?.coords.longitude!
      );
    };
    fetchData();
  }, []);

  useEffect(() => {
    const getUsername = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        if (username !== null) {
          setUsername(username);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getUsername();
  }, [AsyncStorage]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Welcome back, {username}!</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {locationName ? (
        <Text style={styles.locationTitle}>{locationName}</Text>
      ) : (
        <Text style={styles.title}>Loading...</Text>
      )}
      <DisplayMap width="90%" height="100%" />
      <Text style={styles.title}>My Memories</Text>
      <Text style={styles.title}>Explore Other Memories</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingLeft: 40,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 24,
    paddingTop: 24,
  },
  separator: {
    marginVertical: 24,
    height: 1,
    // width: "80%",
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 24,
  },
});
