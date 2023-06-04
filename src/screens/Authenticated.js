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
  const [prizePool, setPrizePool] = useState({});
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

  useEffect(() => {
    async function calculate(obj) {
      console.log('starting')
      let leagueId = obj.leagueId
      const leagueDoc = await firestore().collection('leagues').doc(leagueId).get();
      let league = leagueDoc.data();
      const leagueJoinedIdsDoc = await firestore().collection('leaguesJoined')
        .where("leagueId", "==", leagueId)
        .get();
      let portfolioToBeFreed = []
      let ranking = [];
      let leagueJoinedIds = leagueJoinedIdsDoc._docs;
      async function processLeagueData() {
        for (const l of leagueJoinedIds) {
          let lj = { ...l?._data, id: l._ref._documentPath._parts[1] }
          portfolioToBeFreed.push(lj.portfolioId)
          let portfolioValue = 0;
          let oldPortfolioValue = 0;
          //generate stock price random
          //update lj with last portfolio value
          const ordersDoc = await firestore().collection('orders').where('leagueJoinedId', '==', lj.id).get();
          ordersDoc.forEach((order) => {
            let data = order.data();
            let oldPrice = data.price;
            let qty = Number(data.quantity);
            let newPrice = Math.floor(Math.random() * oldPrice * 2);
            console.log('newPrice', newPrice, oldPrice, qty)
            let value = qty * newPrice;
            portfolioValue += value;
            oldPortfolioValue += qty * oldPrice;
          });
          let delta = (portfolioValue - oldPortfolioValue) / oldPortfolioValue;
          ranking.push({
            portfolioValue: portfolioValue,
            oldPortfolioValue,
            leagueJoinedId: lj.id,
            userId: lj.userId,
            delta
          });
        }
      }
      await processLeagueData();
      ranking.sort((a, b) => b.delta - a.delta);
      async function processUserRank() {
        for (const index in ranking) {
          let rank = ranking[index];
          await firestore().collection('leaguesJoined').doc(rank.leagueJoinedId)
            .update({
              portfolioValue: rank.portfolioValue,
              oldPortfolioValue: rank.oldPortfolioValue,
              rank: Number(index) + 1,
              delta: rank.delta
            });
          let totalPrizePool = league.entryFee * league.slotsFilled * 0.7;
          let prize = league?.prizeInfo[Number(index) + 1] * totalPrizePool / 100;
          await firestore().collection('winners').add({
            userId: rank.userId,
            leagueId,
            prize,
            rank: Number(index) + 1
          });
        }
      }
      await processUserRank();

      async function processPortfolios() {
        for (const portfolio of portfolioToBeFreed) {
          console.log('portfolio', portfolio)
          await firestore().collection('portfolios').doc(portfolio)
            .update({
              coinsAvailable: 100000,
              isAvailable: true,
              stocksAllowed: 30
            });
        }
      }
      await processPortfolios();


    }
    // calculate({
    //   leagueId: 'C4qs5iArqKksfAvStuCv'
    // });
  }, [])

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
    let prizePoolMapping = {};

    let data = leaguesData?._docs.map(v => {
      let leagueId = v._ref._documentPath._parts[1];
      prizePoolMapping[leagueId] = {
        rankingInfo: [
          {
            rank: 1, prize: 500
          },
          {
            rank: 2, prize: 400
          }, {
            rank: 3, prize: 300
          }, {
            rank: 4, prize: 200
          }, {
            rank: 5, prize: 100
          },
        ]

      }
      let hasStarted = dateInPast(v?._data?.startDateTime?.seconds * 1000, currentDate)
      let isEndDateOver = dateInPast(v?._data?.endDateTime?.seconds * 1000, currentDate);
      let isOngoing = !isEndDateOver && hasStarted;

      return ({
        ...v._data,
        isOver: isEndDateOver,
        isOngoing: isOngoing,
        hasStarted,
        inFuture: !hasStarted,
        leagueId,
        hasUserJoined: leaguesJoinedIds?.includes(leagueId),
        leagueJoinedId: leagueDocMapping[leagueId]?.leagueJoinedId,
        portfolioId: leagueDocMapping[leagueId]?.portfolioId,
        prizePoolMapping: prizePoolMapping[leagueId]
      })
    });
    setLeagues(data);
    setPrizePool(prizePoolMapping);
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
    navigation.navigate('ViewContestPortfolio', { league: item })
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
        <Text>{item.entryFee}</Text>
      </View>
      {!item.hasStarted && <View style={styles.cardInnerContent} >
        <Text>Starts In</Text>
        <Text>
          <Timer targetDate={item.startDateTime?.seconds * 1000}></Timer>
        </Text>


      </View>}
      {item.hasStarted && !item.isOver && <View style={styles.cardInnerContent} >
        <Text>Ends in</Text>
        <Text>
          <Timer targetDate={item.endDateTime?.seconds * 1000}></Timer>
        </Text>


      </View>}
      {
        prizePool[item.leagueId]?.rankingInfo &&
        <View style={{ padding: 10 }}>
          <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 20, marginBottom: 10, textAlign: 'center' }}>Prize Pool</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Rank</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center', }}>Prize</Text>
          </View>
          {prizePool[item.leagueId]?.rankingInfo?.map(item => {
            return <View style={{ flexDirection: 'row', padding: 3 }}>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.rank}</Text><Text style={{ flex: 1, textAlign: 'center', }}>{item.prize}</Text>
            </View>
          })}
        </View>
      }


      {!item.hasUserJoined &&

        <View style={{ marginTop: 10 }}>
          <Button color={Theme.light.button} title="Participate"
            disabled={item.hasStarted || item.freeSlots === 0}
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
