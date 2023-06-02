// import React, { useEffect, useState } from 'react';
// import {
//   StyleSheet, Text, View, Button, useColorScheme,
//   TouchableOpacity, ActivityIndicator
//   , Alert
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import PhoneNumber from './src/screens/PhoneNumber';
// import VerifyCode from './src/screens/VerifyCode';
// import Portfolio from './src/screens/Portfolio';
// import BuildPortfolio from './src/screens/BuildPortfolio';
// import AddMoney from './src/screens/AddMoney';
// import PlaceOrder from './src/screens/PlaceOrder';
// import ContestParticipate from './src/screens/ViewContestPortfolio';
// import Authenticated from './src/screens/Authenticated';
// import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import GlobalState from './src/Context/GlobalState';
// import { Theme } from './theme';
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   NativeModuleError,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';
// import config from './config';
// const Stack = createNativeStackNavigator();
// const PROFILE_IMAGE_SIZE = 150;

// export default function App() {


//   const [confirm, setConfirm] = useState(null);
//   const [authenticated, setAuthenticated] = useState(false);
//   const [uid, setUid] = useState();
//   const [loading, setLoading] = useState(false);
//   const [requireSignIn, setRequireSignIn] = useState(false);


//   useEffect(() => {
//     // const settings = auth().settings;
//     // console.log(settings);
//     // settings.appVerificationDisabledForTesting = true;
//     GoogleSignin.configure({
//       webClientId: config.webClientId,
//       offlineAccess: false,
//       profileImageSize: PROFILE_IMAGE_SIZE,
//     });

//     const getUser = async () => {
//       try {
//         const userInfo = await GoogleSignin.signInSilently();
//         console.log('userInfo', userInfo);
//         const isSignedIn = await GoogleSignin.getTokens();
//         // Alert.alert('tokens', prettyJson(isSignedIn));
//         setAuthenticated(true);
//         setUid(userInfo.idToken);
//         // this.setState({ userInfo, error: undefined });
//       } catch (error) {
//         console.log('err', error)
//         const typedError = error;
//         if (typedError.code === statusCodes.SIGN_IN_REQUIRED) {
//           setRequireSignIn(true)
//           // this.setState({
//           //   error: new Error('User not signed it yet, please sign in :)'),
//           // });
//         } else {
//           // this.setState({ error: typedError });
//         }
//       }
//     }
//     getUser();
//   }, [])

//   async function signIn(phoneNumber) {
//     setLoading(true)
//     try {

//       const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       // const confirmation = await auth().createUserWithPhoneNumber(phoneNumber);
//       setConfirm(confirmation);
//     } catch (error) {
//       alert(error);
//     }
//     setLoading(false);
//   }


//   async function confirmVerificationCode(code) {
//     try {
//       await confirm.confirm(code);
//       setConfirm(null);
//     } catch (error) {
//       alert('Invalid code');
//     }
//   }

//   auth().onAuthStateChanged((user, auth) => {
//     if (user) {
//       setAuthenticated(true);
//       setUid(user.uid);
//     } else {
//       setAuthenticated(false);
//     }
//   })

//   const navTheme = {
//     ...DefaultTheme,
//     colors: {
//       ...DefaultTheme.colors,
//       background: Theme.light.backgroundColor,
//       primary: Theme.light.primary,
//       text: Theme.light.primary
//     },
//   };
//   const headerStyle = {
//     headerStyle: {
//       backgroundColor: Theme.light.tertiary,
//     },
//     headerTintColor: Theme.light.primary,
//     headerTitleStyle: {
//       fontWeight: 'bold',
//     },
//   }
//   const RenderIsSignedIn = () => {
//     return (
//       <Button
//         onPress={async () => {
//           const isSignedIn = await GoogleSignin.isSignedIn();
//           Alert.alert(String(isSignedIn));
//         }}
//         title="is user signed in?"
//       />
//     );
//   }
//   const RenderSignInButton = () => {
//     return (
//       <View style={styles.container}>
//         <GoogleSigninButton
//           size={GoogleSigninButton.Size.Standard}
//           color={GoogleSigninButton.Color.Dark}
//           onPress={_signIn}
//         />
//         {/* {renderError()} */}
//       </View>
//     );
//   }
//   const _signIn = async () => {
//     console.log('_signIn',_signIn)
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       console.log('userInfo _signIn',userInfo)
//       // this.setState({ userInfo, error: undefined });
//     } catch (error) {
//       const typedError = error;
//       console.log(error)
//       switch (typedError.code) {
//         case statusCodes.SIGN_IN_CANCELLED:
//           // sign in was cancelled
//           Alert.alert('cancelled');
//           break;
//         case statusCodes.IN_PROGRESS:
//           // operation (eg. sign in) already in progress
//           Alert.alert('in progress');
//           break;
//         case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//           // android only
//           Alert.alert('play services not available or outdated');
//           break;
//         default:
//           Alert.alert('Something went wrong', typedError.toString());
//           // this.setState({ error: typedError,
//           // });
//       }
//     }
//   };
//   return (
//     <NavigationContainer theme={navTheme}>
//       <GlobalState uid={uid}>
//         {uid && authenticated ? <Stack.Navigator >
//           <Stack.Screen
//             name="Home"
//             component={Authenticated}
//             initialParams={{ uid }}
//             options={{
//               title: 'Stock Ninja',
//               ...headerStyle
//             }
//             }
//           />
//           <Stack.Screen name="Portfolio" options={{
//             title: 'Portfolios', ...headerStyle
//           }} component={Portfolio} initialParams={{ uid }} />
//           <Stack.Screen name="BuildPortfolio" component={BuildPortfolio} initialParams={{ uid }}
//             options={({ route }) => ({ title: `Portfolio ${route?.params?.name}`, ...headerStyle })} />
//           <Stack.Screen name="PlaceOrder" component={PlaceOrder} initialParams={{ uid }}
//             options={{ title: 'Place Order', ...headerStyle }}
//           />
//           <Stack.Screen name="AddMoney" component={AddMoney} initialParams={{ uid }}
//             options={{ title: 'Add Money', ...headerStyle }}
//           />
//           <Stack.Screen name="ViewContestPortfolio" component={ViewContestPortfolio}
//             initialParams={{ uid }} options={({ route }) => ({ title: `Contest Details`, ...headerStyle })} />

//         </Stack.Navigator> :
//           <RenderSignInButton />
//           // (confirm ? <VerifyCode onSubmit={confirmVerificationCode} /> :
//           //   <PhoneNumber onSubmit={signIn} loading={loading} />)
//         }
//       </GlobalState>
//     </NavigationContainer>);
// }
// const styles = StyleSheet.create({
//   container: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   welcomeText: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: 'black' },
//   pageContainer: { flex: 1 },
// });