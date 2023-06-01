import React, { useEffect, useState, useContext } from 'react';

import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';
import { Theme } from '../theme';

export default ViewContestPortfolio = ({ navigation, route }) => {

    const { uid, leagueId, leagueJoinedId, portfolioId } = route.params;
    const [portfolio, setPortfolio] = useState();
    const [loading, setLoading] = useState(false);
    const userContext = useContext(Context);

    useEffect(() => {
        setLoading(true)
        async function getData() {
            try {
                const portfolioDoc = await firestore().collection('portfolios')
                    .where('userId', '==', uid).where(firestore.FieldPath.documentId(), '==', portfolioId)
                    .get();
                setPortfolio(portfolioDoc?._docs?.[0]);
            } catch (e) {

            }
            setLoading(false)
        }
        getData();
    }, [portfolioId]);

    
    const getPortfolioDetails = (name, portfolioId) => {
        userContext?.updateSelectedPortfolio({ name, portfolioId, leagueJoinedId, leagueId, ...portfolio._data });
        navigation.navigate('BuildPortfolio', { name, portfolioId, leagueJoinedId, leagueId });
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }
    return <View style={[styles.screen]} ><Text style={styles.subHeader}>League Portfolio</Text>
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => getPortfolioDetails(portfolio?._data?.name, portfolio?._ref?._documentPath?._parts[1])}
        ><View
            style={[styles.portfolioContainer]}
            key={portfolio?._data.name}>
                <Text style={styles.headerText}>{portfolio?._data.name} </Text>
                <View style={[{
                    flexDirection: 'row',
                    TouchableOpacity
                }]} >
                    <Text>Coins Available</Text>
                    <Text style={[styles.content]}>{portfolio?._data?.coinsAvailable}</Text>
                </View>
            </View>
        </TouchableOpacity>
        <View style={{ marginTop: 10}}>
        <Text style={[styles.subHeader]}> Contest Details</Text>
        <Text> if ended, show user rank and top 10 rankers</Text>
        </View>
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
        // margin: 10,
        padding: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Theme.light.borderColorDark,
    },
    headerText: {
        fontSize: 16,
        // color: Theme.light.primary,
        fontWeight: 'bold',
    },
    subHeader: {
        // padding: 10,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    content: {
        flexGrow: 1,
        textAlign: 'right',
        // paddingRight: 10
    }
});