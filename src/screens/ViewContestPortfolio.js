import React, { useEffect, useState, useContext } from 'react';

import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';
import { Theme } from '../../theme';
import CustomText from '../components/CustomText';
import PrizePool from '../components/PrizePool';

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
                    <CustomText>{item._data.rank}</CustomText></View>
                <View style={{ flexDirection: 'row' }}>
                    <CustomText>{item._data.userId}</CustomText>
                </View>
            </View>
        </View>
    );
    const PrizeItem = ({ item }) => (
        <View style={[styles.cardStyle, { borderWidth: 0.5 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <CustomText>{item.rank}</CustomText></View>
                <View style={{ flexDirection: 'row' }}>
                    <CustomText>{item.prize}</CustomText>
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
        {!league?.isOver && <View><CustomText bold style={styles.subHeader}>Portfolio</CustomText><TouchableOpacity
            activeOpacity={1}
            onPress={() => getPortfolioDetails(portfolio?._data?.name, portfolio?._ref?._documentPath?._parts[1])}
        ><View
            style={[styles.portfolioContainer]}
            key={portfolio?._data.name}>
                <CustomText bold large style={styles.headerText}>{portfolio?._data.name} </CustomText>
                <View style={[{
                    flexDirection: 'row',
                    TouchableOpacity,
                    justifyContent: 'space-between'
                }]} >
                    <CustomText medium >Coins Available</CustomText>
                    <CustomText medium bold>{portfolio?._data?.coinsAvailable}</CustomText>
                </View>
            </View>
        </TouchableOpacity></View>}
        {league.isOver && <View style={{ marginTop: 10 }}>
            <View style={styles.portfolioContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText style={{ fontSize: 15, padding: 5, fontWeight: 'normal' }}>Rank</CustomText>
                    <CustomText style={{ fontSize: 20, padding: 5, fontWeight: 'bold' }}>{portfolioValue?.rank}</CustomText>

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText style={{ fontSize: 15, padding: 5, fontWeight: 'normal' }}>Portfolio Value</CustomText>
                    <CustomText style={{ fontSize: 20, padding: 5, fontWeight: 'bold' }}>{portfolioValue?.portfolioValue}</CustomText>
                </View>
            </View>
            {winnerInfo?.length > 0 && <View>
                <CustomText style={[styles.subHeader, { marginTop: 15, marginBottom: 10 }]}>Winners</CustomText>
                <FlatList data={winnerInfo}
                    keyExtractor={item => item._data.userId}
                    renderItem={({ item }) => <Item item={item} />}
                /></View>}
        </View>}
        {!league.hasStarted && league?.prizePoolMapping?.rankingInfo?.length > 0 &&
            <View style={{ marginTop: 10, width: '70%', alignSelf: 'center' }}>
                <CustomText style={[styles.subHeader]}>Prize Pool</CustomText>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1, textAlign: 'center' }}>Rank</Text>
                    <Text style={{ flex: 1, textAlign: 'center' }}>Prize</Text>
                </View>
                {league?.prizePoolMapping?.rankingInfo?.map(item => {
                    return <PrizePool item={item} key={item.rank} />
                })}
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
        // fontSize: 20,
        // fontWeight: 'bold',
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
        borderColor: Theme.light.borderColorDark
    }

});