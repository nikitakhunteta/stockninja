import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View, Text, Pressable, DrawerLayoutAndroid, StyleSheet, Button, Image
} from 'react-native'
import auth from '@react-native-firebase/auth';
import PhoneNumber from './src/screens/PhoneNumber';
import VerifyCode from './src/screens/VerifyCode';
import Portfolio from './src/screens/Portfolio';
import BuildPortfolio from './src/screens/BuildPortfolio';
import AddMoney from './src/screens/AddMoney';
import PlaceOrder from './src/screens/PlaceOrder';
import ViewContestPortfolio from './src/screens/ViewContestPortfolio';
import Authenticated from './src/screens/Authenticated';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalState from './src/Context/GlobalState';
import { Theme } from './theme';
import Context from './src/Context/context'
const Stack = createNativeStackNavigator();

export default function App() {
  const drawer = useRef(null);
  const [confirm, setConfirm] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [uid, setUid] = useState();
  const userContext = useContext(Context);

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
    },
  };
  const headerStyle = {
    headerStyle: {
      // backgroundColor: Theme.light.tertiary,
    },
    headerTintColor: Theme.light.primary,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }
  
  
  return (

    <NavigationContainer theme={navTheme}>
      <GlobalState uid={uid}>
        {uid && authenticated ?
          // <DrawerLayoutAndroid
          //   ref={drawer}
          //   drawerWidth={300}
          //   renderNavigationView={() => navigationView(uid)}>
            <Stack.Navigator screenOptions={({ navigation }) => {
              return {
                ...headerStyle,
                // headerTitle: () => <AppHeader navigation={navigation} user={userContext?.wallet} />,
              }
            }}>
              <Stack.Screen
                name="Home"
                component={Authenticated}
                initialParams={{ uid }}
                options={{
                  title: 'Stock Ninja',
                  headerShown: false
                }
                }
              />
              <Stack.Screen name="Portfolio" options={{
                title: 'Portfolios'
              }} component={Portfolio} initialParams={{ uid }} />
              <Stack.Screen name="BuildPortfolio" component={BuildPortfolio} initialParams={{ uid }}
                options={({ route }) => ({ title: `Portfolio ${route?.params?.name}` })} />
              <Stack.Screen name="PlaceOrder" component={PlaceOrder} initialParams={{ uid }}
                options={{ title: 'Place Order' }}
              />
              <Stack.Screen name="AddMoney" component={AddMoney} initialParams={{ uid }}
                options={{ title: 'Wallet' }}
              />
              <Stack.Screen name="ViewContestPortfolio" component={ViewContestPortfolio}
                initialParams={{ uid }} options={({ route }) => ({ title: `Contest Details` })} />

            </Stack.Navigator>
          // </DrawerLayoutAndroid>
          :
          (confirm ? <VerifyCode onSubmit={confirmVerificationCode} /> :
            <PhoneNumber onSubmit={signIn} />)}
      </GlobalState></NavigationContainer >);
}


const styles = StyleSheet.create({


  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});