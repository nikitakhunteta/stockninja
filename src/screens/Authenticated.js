import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  StyleSheet, Text, View, Button, useColorScheme,
  TouchableOpacity, ActivityIndicator, DrawerLayoutAndroid, Pressable, Image

} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import ExpandableCard from '../components/ExpandableCard';
import Timer from '../components/Timer';
import { Theme } from '../../theme';
import CustomText from '../components/CustomText';
import PrizePool from '../components/PrizePool';
import images from './../assets'
import Context from '../Context/context';

export default function Authenticated({ navigation, route }) {
  const { leagueId, portfolioId, uid } = route.params;
  const drawer = useRef(null);

  const [leagues, setLeagues] = useState([]);
  const [prizePool, setPrizePool] = useState({});
  const colorTheme = useColorScheme();
  const theme = Theme[colorTheme];
  const [loading, setLoading] = useState(false);
  const userContext = useContext(Context);

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
      console.log('uid',uid)
      const leaguesJoined = await firestore().collection('leaguesJoined').where('userId', '==', uid).get();
      console.log('leaguesJoined',leaguesJoined._docs.length)
      massageData(leaguesData, leaguesJoined);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('calling foe',uid)

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
        rankingInfo: []
      };
      let prizeInfo = v?._data.prizeInfo
      for (let pi in prizeInfo) {
        prizePoolMapping[leagueId].rankingInfo.push({ rank: pi, prize: prizeInfo[pi] })
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
      <CustomText style={styles.headerText}>{item.name}</CustomText>
      <View style={[{
        flexDirection: 'row', TouchableOpacity,
        justifyContent: 'space-between'
      }]} >
        <CustomText >Free Slots/Total</CustomText>
        <CustomText bold>{item.freeSlots}/{item.totalSlots} </CustomText>
      </View></View>
  }
  const participateInContest = (item) => {
    navigation.navigate('Portfolio', {
      league: {
        leagueId: item.leagueId,
        leagueJoinedId: item.leagueJoinedId,
        entryFee: item.entryFee,
        freeSlots: item.freeSlots,
        slotsFilled: item.slotsFilled
      },
      leagueId: item.leagueId,
      leagueJoinedId: item.leagueJoinedId
    })
    // call lock seat api 
    // select the portfolio to be used 
  }
  const viewContestPortfolio = (item) => {
    console.log('sending', item)
    navigation.navigate('ViewContestPortfolio', { league: item })
  }
  const ExpandedBodyComponent = ({ item }) => {

    return <View style={[{
      flexDirection: 'column',
      borderStyle: 'solid',
      borderColor: theme?.primary,
      borderTopWidth: 1,
      padding: 10
      // backgroundColor: '#C4DFDF'
    }]} >
      <View style={styles.cardInnerContent} >
        <CustomText >Entry Fee</CustomText>
        <CustomText bold>{item.entryFee}</CustomText>
      </View>
      {!item.hasStarted && <View style={styles.cardInnerContent} >
        <CustomText>Starts In</CustomText>
        <CustomText>
          <Timer targetDate={item.startDateTime?.seconds * 1000}></Timer>
        </CustomText>


      </View>}
      {item.hasStarted && !item.isOver && <View style={styles.cardInnerContent} >
        <CustomText>Ends in</CustomText>
        <Text>
          <Timer targetDate={item.endDateTime?.seconds * 1000}></Timer>
        </Text>


      </View>}
      {
        prizePool[item.leagueId]?.rankingInfo &&
        <View style={{
          padding: 10, width: '70%', alignSelf: 'center',
        }}>
          <CustomText bold style={{
            flex: 1,
            fontSize: 20, marginBottom: 10, textAlign: 'center'
          }}>Rewards</CustomText>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, textAlign: 'center' }}>Rank</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>Prize</Text>
          </View>
          {prizePool[item.leagueId]?.rankingInfo?.map(item => {
            return <PrizePool item={item} key={item.rank} />
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
  const navigationView = (props) => {
    const closeDrawer = () => {
      auth().signOut();
      drawer.current.closeDrawer();
    }
    const redirectToAddMoney = (toWithdraw) => {
      drawer.current.closeDrawer();
      navigation.navigate('AddMoney', { toWithdraw })
    }
    return <View style={[styles.container, styles.navigationContainer]}>
      <CustomText bold large style={{ marginVertical: 10 }}>Hello {auth().currentUser.phoneNumber}</CustomText>

      <View style={{ flexDirection: 'row' }}>
        <CustomText large style={{ marginVertical: 10 }}>Balance</CustomText>
        <CustomText large bold style={{ marginVertical: 10, flex: 1, textAlign: 'right' }}>{userContext?.wallet?.amount}</CustomText>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => redirectToAddMoney(false)}>
          <Text style={styles.textStyle}>Add Money</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => redirectToAddMoney(true)}>
          <Text style={styles.textStyle}>WithDraw Money</Text>
        </Pressable>
      </View>
      <Button
        color={Theme.light.button}
        title="Signout"
        onPress={() => closeDrawer()}
      />
    </View>
  };
  const AppHeader = (props) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Pressable onPress={() => {
          drawer.current.openDrawer();
        }}>
          <Image source={images.menuIcon} style={{ height: 30, width: 30, margin: 4 }} />
        </Pressable>

      </View>
    )
  }
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      renderNavigationView={() => navigationView(uid)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <AppHeader></AppHeader>
        <Text style={[styles.text, { flex: 1, textAlign: 'center' }]}>Leagues</Text></View>
      <View style={styles.screen}>
        <ExpandableCard data={leagues} dataKeyExtractor='name'
          HeaderComponent={HeaderComponent}
          ExpandedBodyComponent={ExpandedBodyComponent}>
        </ExpandableCard>
      </View>
    </DrawerLayoutAndroid>
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
    justifyContent: 'space-between',
    // paddingLeft: 10,
    paddingTop: 10, paddingRight: 10
  }
  ,
  headerText: {
    fontSize: 20,
    color: Theme.light.primary,
    fontWeight: 'bold',
  },
  button: {
    color: Theme.light.button,
    height: 30,
    backgroundColor: Theme.light.primary,
    marginBottom: 10,
  },
  navigationContainer: {
    marginTop: 5,
    padding: 10,
  }, container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 16,
  },
  buttonOpen: {
    padding: 5,
    backgroundColor: Theme.light.primary,
    paddingLeft: 8,
    paddingRight: 8
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
