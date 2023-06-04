import React, { useEffect, useState, useContext } from 'react';

import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';
import { Theme } from '../../theme';

const dateInPast = (firstDate, secondDate = new Date()) => {
    if (firstDate <= secondDate.getTime()) {
        return true;
    }
    return false;
};
export default ViewContestPortfolio = ({ navigation, route }) => {

    const { uid, league } = route.params;
    const [portfolio, setPortfolio] = useState();
    const [winnerInfo, setWinnerInfo] = useState();
    const [portfolioValue, setPortfolioValue] = useState(null);
    const [loading, setLoading] = useState(false);
    const userContext = useContext(Context);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);

            async function getData() {
                try {
                    const portfolioDoc = await firestore().collection('portfolios')
                        .where('userId', '==', uid).where(firestore.FieldPath.documentId(), '==', league?.portfolioId)
                        .get();
                    setPortfolio(portfolioDoc?._docs?.[0]);
                    if (league.isOver) {
                        const winnersInfo = await firestore().collection('winners')
                            .where('leagueId', '==', league?.leagueId)
                            .get();
                        setWinnerInfo(winnersInfo?._docs);

                        const leagueJoined = await firestore().collection('leaguesJoined')
                            .doc(league.leagueJoinedId)
                            .get();
                        setPortfolioValue(leagueJoined?._data);
                    }
                } catch (e) {

                }
                setLoading(false)
            }
            getData();
        });
        return unsubscribe;
    }, [navigation]);

    const Item = ({ item }) => (
        <View style={[styles.cardStyle]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                <View style={{ flexDirection: 'row' }}>
                    <Text>{item._data.rank}</Text></View>
                <View style={{ flexDirection: 'row' }}>
                    <Text>{item._data.userId}</Text>
                </View>
            </View>
        </View>
    );
    const PrizeItem = ({ item }) => (
        <View style={[styles.cardStyle]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text>{item.rank}</Text></View>
                <View style={{ flexDirection: 'row' }}>
                    <Text>{item.prize}</Text>
                </View>
            </View>
        </View>
    );
    const getPortfolioDetails = (name, portfolioId) => {
        userContext?.updateSelectedPortfolio({
            name, portfolioId, leagueJoinedId: league?.leagueJoinedId,
            leagueId: league?.leagueId, ...portfolio._data
        });
        navigation.navigate('BuildPortfolio', {
            name, portfolioId, leagueJoinedId: league?.leagueJoinedId,
            leagueId: league?.leagueId
        });
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }
    return <View style={[styles.screen]} >
        {league.isOver && <Text style={styles.headerText}>Portfolio {portfolio?._data.name} </Text>
        }
        {!league?.isOver && <View><Text style={styles.subHeader}>Portfolio isOver{league?.isOver.toString()}</Text><TouchableOpacity
            activeOpacity={1}
            onPress={() => getPortfolioDetails(portfolio?._data?.name, portfolio?._ref?._documentPath?._parts[1])}
        ><View
            style={[styles.portfolioContainer]}
            key={portfolio?._data.name}>
                <Text style={styles.headerText}>{portfolio?._data.name} </Text>
                <View style={[{
                    flexDirection: 'row',
                    TouchableOpacity,
                    justifyContent: 'space-between'
                }]} >
                    <Text>Coins Available</Text>
                    <Text>{portfolio?._data?.coinsAvailable}</Text>
                </View>
            </View>
        </TouchableOpacity></View>}
        {league.isOver && <View style={{ marginTop: 10 }}>
            <View style={styles.portfolioContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, padding: 5, fontWeight: 'normal' }}>Rank</Text>
                    <Text style={{ fontSize: 20, padding: 5, fontWeight: 'bold' }}>{portfolioValue?.rank}</Text>

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, padding: 5, fontWeight: 'normal' }}>Portfolio Value</Text>
                    <Text style={{ fontSize: 20, padding: 5, fontWeight: 'bold' }}>{portfolioValue?.portfolioValue}</Text>
                </View>
            </View>
            {winnerInfo?.length > 0 && <View>
                <Text style={[styles.subHeader, { marginTop: 15, marginBottom: 10 }]}>Winners</Text>
                <FlatList data={winnerInfo}
                    keyExtractor={item => item._data.userId}
                    renderItem={({ item }) => <Item item={item} />}
                /></View>}
        </View>}
        {!league.hasStarted && league?.prizePoolMapping?.rankingInfo?.length > 0 && <View style={{ marginTop: 10 }}>
            <Text style={[styles.subHeader]}>Prize Pool</Text>
            <FlatList data={league?.prizePoolMapping?.rankingInfo} renderItem={({ item }) => <PrizeItem item={item} />}
            />
        </View>}

    </View>
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        padding: 10

    },
    portfolioContainer: {
        shadowColor: Theme.light.tertiary,
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        backgroundColor: Theme.light.fill,
        fontSize: 15,
        fontWeight: 'bold',
        elevation: 20,
        padding: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        // margintTop: 10
    },
    cardStyle: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        margin: 10,
    }

});