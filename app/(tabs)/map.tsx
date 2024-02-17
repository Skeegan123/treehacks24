import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import MapView from "react-native-maps";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});