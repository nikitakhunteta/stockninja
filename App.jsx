import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import PhoneNumber from './screens/PhoneNumber';
import VerifyCode from './screens/VerifyCode';
import Portfolio from './screens/Portfolio';
import BuildPortfolio from './screens/BuildPortfolio';
import PlaceOrder from './screens/PlaceOrder';
import ContestParticipate from './screens/ContestParticipate';
import Authenticated from './screens/Authenticated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [confirm, setConfirm] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [uid, setUid] = useState();

  async function signIn(phoneNumber) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      alert(error);
    }
  }

  async function confirmVerificationCode(code) {
    try {
      await confirm.confirm(code);
      setConfirm(null);
    } catch (error) {
      alert('Invalid code');
    }
  }

  auth().onAuthStateChanged((user, auth) => {
    if (user) {
      setAuthenticated(true);
      setUid(user.uid);
    } else {
      setAuthenticated(false);
    }
  })


  return (<NavigationContainer>

    {authenticated ? <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Authenticated}
        initialParams={{uid}}
      />
      <Stack.Screen name="Portfolio" component={Portfolio} initialParams={{uid}} />
      <Stack.Screen name="BuildPortfolio" component={BuildPortfolio} initialParams={{uid}}/>
      <Stack.Screen name="PlaceOrder" component={PlaceOrder} initialParams={{uid}}/>
      <Stack.Screen name="ContestParticipate" component={ContestParticipate} initialParams={{uid}}/>

    </Stack.Navigator> :
      (confirm ? <VerifyCode onSubmit={confirmVerificationCode} /> :
        <PhoneNumber onSubmit={signIn} />)}
  </NavigationContainer>);
}