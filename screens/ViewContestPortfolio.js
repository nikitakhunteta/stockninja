import React, { useEffect, useState, useContext } from 'react';

import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';

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
    return <View style={[styles.screen, {
        width: '100%'
    }]} ><Text>Portfolio Details</Text>

        <TouchableOpacity
            activeOpacity={1}
            onPress={() => getPortfolioDetails(portfolio?._data?.name, portfolio?._ref?._documentPath?._parts[1])}
        ><View
            style={[styles.shadowProp, {
                margin: 10,
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 8,
                borderColor: 'gray', borderColor: 'skyblue', flexDirection: 'row'
            }]}
            // portfolio?._ref?._documentPath?._parts[1]
            key={portfolio?._data.name}>
                <Text>{portfolio?._data.name} </Text></View>
        </TouchableOpacity>
        <Text> Contest Details</Text>
        <Text> if ended, show user rank and top 10 rankers</Text>
    </View>
}

const styles = StyleSheet.create({
    shadowProp: {
        shadowColor: 'skyblue',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        backgroundColor: 'white',
        height: 50,
        fontSize: 15,
        fontWeight: 'bold',
        elevation: 20
    }
});