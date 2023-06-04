import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image } from 'react-native';
import { Theme } from '../../theme';
import images from './../assets'
export default function PhoneNumber(props) {
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [phoneNumberValue, setPhoneNumberValue] = useState('');
  useEffect(() => {
    setPhoneNumberValue('+91' + phoneNumber)

  }, [phoneNumber]);

  return (
    <View style={styles.screen}>
      <Image style={styles.img} source={images.icon}></Image>
      <Text style={styles.text}>Welcome to StockNinja</Text>
      <Text style={styles.subText}>Sign in with phone number</Text>

      <View style={{
        flexDirection: 'row', borderWidth: 1,
        borderColor: Theme.light.borderColorDark, marginVertical: 15, borderRadius: 8,
      }}>
        <Text style={styles.inputText}>+91 | </Text>
        <TextInput
          autoFocus
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        /></View>
      <Button color={Theme.light.button}  title="Sign In" onPress={() => props.onSubmit(phoneNumberValue)} />
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
    width: 180,
    fontSize: 20,
    padding: 10,
    paddingLeft: 0,

  },
  inputText: {
    fontSize: 20,
    padding: 10,
    color: 'black',
    paddingRight: 0
  },
  text: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold'
  },
  subText: {
    marginTop: 5,
    fontSize: 18,
  },
  img: {
    marginTop: 20,
    // width:'70%',
    // conz
  }
});