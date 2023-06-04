import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { Theme } from '../../theme';

export default function OTP(props) {
  const [code, setCode] = useState('');

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Verify OTP</Text>
      <Text style={styles.subText}>Please enter OTP received...</Text>

      <TextInput
        autoFocus
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button color={Theme.light.button} title="Confirm OTP" onPress={() => props.onSubmit(code)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor:  Theme.light.borderColorDark,
    width: 300,
    marginVertical: 15,
    fontSize: 20,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  subText: {
    marginTop: 5,
    fontSize: 18,
  },
});