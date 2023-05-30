import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Button, useColorScheme,
  TouchableOpacity,

} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ExpandableCard from '../components/ExpandableCard';
import Portfolio from './Portfolio';
import { Theme } from './../theme';

export default function Authenticated({ navigation }) {
  const [leagues, setLeagues] = useState([]);
  const colorTheme = useColorScheme();
  const theme = Theme[colorTheme];
  useEffect(() => {
    async function getData() {
      const leagues = await firestore().collection('leagues').get();
      setLeagues(leagues?._docs);
    }
    getData()
  }, []);

  const HeaderComponent = ({ item }) => {
    return <View>
      <Text style={styles.headerText}>{item.name}</Text>
      <View style={[{
        backgroundColor: theme.backgroundColor,
        flexDirection: 'row', TouchableOpacity
      }]} >
        <Text style={[styles.content,
        { backgroundColor: theme.backgroundColor }]}>Total Slots</Text>
        <Text style={[styles.content, {
          flexGrow: 1,
          backgroundColor: theme.backgroundColor,
          textAlign: 'right'
        }]}>{item.totalSlots}</Text>
      </View></View>
  }

  const ExpandedBodyComponent = ({ item }) => {
    return <View style={[{ flexDirection: 'row' }]} >
      <Text >Entry Fee</Text>
      <Text style={[{
        flexGrow: 1,
        textAlign: 'right'
      }]}>Rs.{item.entryFee}</Text>
    </View>
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>You're Logged in</Text>
      <Text style={styles.phoneNumber}>{auth().currentUser.displayName + ' ' + auth().currentUser.phoneNumber}</Text>
      <ExpandableCard data={leagues} dataKeyExtractor='_data'
        HeaderComponent={HeaderComponent}
        ExpandedBodyComponent={ExpandedBodyComponent}>
      </ExpandableCard>
      <Button
      title="Portfolio"
      onPress={() =>
        navigation.navigate('Portfolio')
      }
    />
     
      <View style={{ marginTop: 30 }}>
        <Button title="Signout" onPress={() => auth().signOut()} />
      </View>

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
    borderWidth: 2,
    borderColor: 'lightblue',
    width: 300,
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
  phoneNumber: {
    fontSize: 21,
    marginTop: 20,
  },
  content: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  }
  ,
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
