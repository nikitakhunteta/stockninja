import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Button, useColorScheme,
  TouchableOpacity, ActivityIndicator

} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ExpandableCard from '../components/ExpandableCard';
import Timer from '../components/Timer';
import Portfolio from './Portfolio';
import { Theme } from './../theme';

export default function Authenticated({ navigation, route }) {
  const { leagueId, portfolioId, uid } = route.params;
  const [leagues, setLeagues] = useState([]);
  const colorTheme = useColorScheme();
  const theme = Theme[colorTheme];
  const [loading, setLoading] = useState(false);

  const dateInPast = (firstDate, secondDate) => {
    if (firstDate <= secondDate.getTime()) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    setLoading(true);
    let currentDate = new Date();
    // console.log('uid', uid)
    try {
      async function getData() {
        const leagues = await firestore().collection('leagues').get();
        let data = leagues?._docs.map(v => {
          return ({ _data: { ...v._data, hasStarted: dateInPast(v?._data?.startDateTime, currentDate), leagueId: v._ref._documentPath._parts[1] } })
        })
        setLeagues(data);
        setLoading(false);
      }
      getData()
    } catch (e) {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // console.log('focus on home screen', uid)
    });
    return unsubscribe;
  }, [navigation]);

  const HeaderComponent = ({ item }) => {
    return <View>
      <Text style={styles.headerText}>{item._data.name}</Text>
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
        }]}>{item._data.totalSlots}</Text>
      </View></View>
  }
  const participateInContest = (item) => {
    navigation.navigate('Portfolio', { leagueId: item._data.leagueId })
    // call lock seat api 
    // select the portfolio to be used 
  }
  const ExpandedBodyComponent = ({ item }) => {

    return <View style={[{ flexDirection: 'column' }]} >
      <View style={[{ flexDirection: 'row' }]} >
        <Text >Entry Fee</Text>
        <Text style={[{
          flexGrow: 1,
          textAlign: 'right'
        }]}>Rs.{item._data.entryFee}</Text>
      </View>
      <View style={[{ flexDirection: 'row' }]} >
        <Text >Starts In</Text>
        <Text style={[{
          flexGrow: 1,
          textAlign: 'right'
        }]}> <Timer targetDate={item._data.startDateTime?.seconds * 1000}></Timer></Text>


      </View>
      <View>
        <Button title="Participate" disabled={item.hasStarted} onPress={() => participateInContest(item)} />
      </View>
    </View>
  }
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
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
