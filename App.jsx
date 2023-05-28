// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React, { useState } from 'react';
// import auth from '@react-native-firebase/auth';
// import PhoneNumber from './screens/PhoneNumber';

// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors
// } from 'react-native/Libraries/NewAppScreen';



// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   const [confirm, setConfirm] = useState(null);
//   const [authenticated, setAuthenticated] = useState(false);

//   async function signIn(phoneNumber) {
//     try {
//       const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       setConfirm(confirmation);
//     } catch (error) {
//       // alert(error);
//     }
//   }

//   async function confirmVerificationCode(code) {
//     try {
//       await confirm.confirm(code);
//       setConfirm(null);
//     } catch (error) {
//       // alert('Invalid code');
//     }
//   }

//   // auth().onAuthStateChanged((user) => {
//   //   if(user) {
//   //     setAuthenticated(true);
//   //   } else {
//   //     setAuthenticated(false);
//   //   }
//   // })

//   // if (authenticated) return <Authenticated />;

//   if (confirm) return <VerifyCode onSubmit={confirmVerificationCode} />;


//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         {/* <Header /> */}
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <PhoneNumber onSubmit={signIn} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import PhoneNumber from './screens/PhoneNumber';
import VerifyCode from './screens/VerifyCode';
import Authenticated from './screens/Authenticated';

export default function App() {
  const [confirm, setConfirm] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

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

  auth().onAuthStateChanged((user) => {
    if(user) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  })

  if (authenticated) return <Authenticated />;

  if (confirm) return <VerifyCode onSubmit={confirmVerificationCode} />;

  return <PhoneNumber onSubmit={signIn} />;
}