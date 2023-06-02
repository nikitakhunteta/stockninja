import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Button, useColorScheme,
  TouchableOpacity, ActivityIndicator

} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ExpandableCard from '../components/ExpandableCard';
import Timer from '../components/Timer';
import Portfolio from './Portfolio';
import { Theme } from '../../theme';

export default function Authenticated({ navigation, route }) {
  const { leagueId, portfolioId, uid } = route.params;

  const [leagues, setLeagues] = useState([]);
  const colorTheme = useColorScheme();
  const theme = Theme[colorTheme];
  const [loading, setLoading] = useState(false);

  const dateInPast = (firstDate, secondDate) => {
    if (firstDate <= secondDate.getTime()) {
      return true;
    }
    return false;
  };


  useFocusEffect(
    React.useCallback(() => {
      const intervalCall = setInterval(() => {
        getData();
      }, 30000);
      return () => {
        // clean up
        clearInterval(intervalCall);
      };
    }, [])
  );


  const getData = async () => {
    try {
      const leaguesData = await firestore().collection('leagues').get();
      const leaguesJoined = await firestore().collection('leaguesJoined').where('userId', '==', uid).get();
      massageData(leaguesData, leaguesJoined);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      try {
        async function getData() {
          // ToDO: to get those which are active or will start in 24hrs
          const leaguesData = await firestore().collection('leagues').get();
          const leaguesJoined = await firestore().collection('leaguesJoined').where('userId', '==', uid).get();
          massageData(leaguesData, leaguesJoined);
          setLoading(false);
        }
        getData();

      } catch (e) {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const massageData = (leaguesData, leaguesJoined) => {
    let currentDate = new Date();

    let leagueDocMapping = {};
    let leaguesJoinedIds = leaguesJoined?._docs?.map(x => {
      leagueDocMapping[x._data?.leagueId] = {
        leagueJoinedId: x._ref._documentPath._parts[1],
        portfolioId: x._data?.portfolioId,
      }
      return x._data?.leagueId
    });

    let data = leaguesData?._docs.map(v => {
      let leagueId = v._ref._documentPath._parts[1];
      return ({
        ...v._data,
        isOver: dateInPast(v?._data?.endDateTime?.seconds * 1000, currentDate),
        isOngoing: dateInPast(v?._data?.endDateTime?.seconds * 1000, currentDate),
        hasStarted: dateInPast(v?._data?.startDateTime?.seconds * 1000, currentDate),
        leagueId,
        hasUserJoined: leaguesJoinedIds?.includes(leagueId),
        leagueJoinedId: leagueDocMapping[leagueId]?.leagueJoinedId,
        portfolioId: leagueDocMapping[leagueId]?.portfolioId,
      })
    });
    setLeagues(data);
  }

  const HeaderComponent = ({ item }) => {
    return <View>
      <Text style={styles.headerText}>{item.name}</Text>
      <View style={[{
        flexDirection: 'row', TouchableOpacity,
        justifyContent: 'space-between'
      }]} >
        <Text style={[styles.content,
        {
        }]}>Free Slots/Total</Text>
        <Text style={[styles.content, {
        }]}>{item.freeSlots}/{item.totalSlots} </Text>
      </View></View>
  }
  const participateInContest = (item) => {
    navigation.navigate('Portfolio', {
      league: {
        leagueId: item.leagueId,
        leagueJoinedId: item.leagueJoinedId,
        entryFee: item.entryFee,
        freeSlots: item.freeSlots
      },
      leagueId: item.leagueId,
      leagueJoinedId: item.leagueJoinedId
    })
    // call lock seat api 
    // select the portfolio to be used 
  }
  const viewContestPortfolio = (item) => {
    navigation.navigate('ViewContestPortfolio', {
      leagueId: item.leagueId,
      leagueJoinedId: item.leagueJoinedId,
      portfolioId: item.portfolioId
    })
  }
  const ExpandedBodyComponent = ({ item }) => {

    return <View style={[{
      flexDirection: 'column',
      borderStyle: 'solid',
      borderColor: theme?.primary,
      borderTopWidth: 1,
      backgroundColor: '#C4DFDF'
    }]} >
      <View style={styles.cardInnerContent} >
        <Text>Entry Fee</Text>
        <Text>Rs.{item.entryFee} {item.hasUserJoined.toString()}</Text>
      </View>
      <View style={styles.cardInnerContent} >
        <Text>Starts In</Text>
        <Text>
          <Timer targetDate={item.startDateTime?.seconds * 1000}></Timer>
        </Text>


      </View>
      {!item.hasUserJoined &&

        <View style={{ marginTop: 10 }}>
          <Button color={Theme.light.button} title="Participate" disabled={item.hasStarted || item.freeSlots === 0}
            onPress={() => participateInContest(item)} />
        </View>
      }
      {item.hasUserJoined &&
        <View style={{ marginTop: 10 }}>
          <Button color={Theme.light.button} title="View" onPress={() => viewContestPortfolio(item)} />
        </View>
      }
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
      <Text style={styles.text}>Leagues</Text>
      {/* <Text style={styles.phoneNumber}>{auth().currentUser.displayName + ' ' + auth().currentUser.phoneNumber}</Text> */}
      <ExpandableCard data={leagues}
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
    width: 300,
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
    color: Theme.light.primary
  },
  phoneNumber: {
    fontSize: 21,
    marginTop: 20,
  },
  content: {
    // paddingLeft: 10,
    // paddingRight: 10,
  },
  cardInnerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between', paddingLeft: 10, paddingTop: 10, paddingRight: 10
  }
  ,
  headerText: {
    fontSize: 20,
    color: Theme.light.primary,
    fontWeight: 'bold',
  },
  button: {
    color: 'black',
    backgroundColor: Theme.light.primary,
  }
});
