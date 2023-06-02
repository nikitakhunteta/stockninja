import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

export default function CustomButton({title, onPress}) {
  const [isLoading, setIsLoading] = useState(false);

  // This function will be triggered when the button is pressed
  const toggleLoading = () => {
    setIsLoading(!isLoading);
    onPress && onPress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLoading} disabled={isLoading}>
        <View
          style={{
            ...styles.button,
            backgroundColor: isLoading ? "#067FD0" : "#067FD0",
          }}
        >
          {isLoading && <ActivityIndicator size="small" color="white" />}
          <Text style={styles.buttonText}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Just some styles
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 20
  },
});