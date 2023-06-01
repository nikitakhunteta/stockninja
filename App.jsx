import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import PhoneNumber from './screens/PhoneNumber';
import VerifyCode from './screens/VerifyCode';
import Portfolio from './screens/Portfolio';
import BuildPortfolio from './screens/BuildPortfolio';
import PlaceOrder from './screens/PlaceOrder';
import ContestParticipate from './screens/ViewContestPortfolio';
import Authenticated from './screens/Authenticated';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalState from './Context/GlobalState';
import { Theme } from './theme';

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

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Theme.light.backgroundColor,
      primary: Theme.light.primary,
      text: Theme.light.primary
    },
  };
  const headerStyle = {
    headerStyle: {
      backgroundColor: Theme.light.tertiary,
    },
    headerTintColor: Theme.light.primary,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }
  return (
    <NavigationContainer theme={navTheme}>
      <GlobalState uid={uid}>
        {uid && authenticated ? <Stack.Navigator >
          <Stack.Screen
            name="Home"
            component={Authenticated}
            initialParams={{ uid }}
            options={{
              title: 'Stock Ninja',
              ...headerStyle
            }
            }
          />
          <Stack.Screen name="Portfolio" options={{
            title: 'Portfolios', ...headerStyle
          }} component={Portfolio} initialParams={{ uid }} />
          <Stack.Screen name="BuildPortfolio" component={BuildPortfolio} initialParams={{ uid }}
            options={({ route }) => ({ title: `Portfolio ${route?.params?.name}`, ...headerStyle })} />
          <Stack.Screen name="PlaceOrder" component={PlaceOrder} initialParams={{ uid }}
            options={{ title: 'Place Order', ...headerStyle }}
          />
          <Stack.Screen name="ViewContestPortfolio" component={ViewContestPortfolio}
            initialParams={{ uid }} options={({ route }) => ({ title: `Contest Details`, ...headerStyle })} />

        </Stack.Navigator> :
          (confirm ? <VerifyCode onSubmit={confirmVerificationCode} /> :
            <PhoneNumber onSubmit={signIn} />)}
      </GlobalState></NavigationContainer>);
}