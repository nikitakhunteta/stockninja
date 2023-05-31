import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import firestore from '@react-native-firebase/firestore';

export default ViewContestPortfolio = ({ navigation, route }) => {

    const { uid, leagueId, leagueJoinedId, portfolioId } = route.params;
    const [portfolio, setPortfolio] = useState();
    const [loading, setLoading] = useState(false);

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
    }]} ><Text>Portfolio {portfolio?._data?.name}</Text>

        <TouchableOpacity
            activeOpacity={1}
            onPress={() => getPortfolioDetails(portfolio?._data?.name, portfolio?._ref?._documentPath?._parts[1])}
        ><View
            style={{
                margin: 10,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'gray', color: 'black', flexDirection: 'row'
            }}
            // portfolio?._ref?._documentPath?._parts[1]
            key={portfolio?._data.name}>
                <Text>{portfolio?._data.name} </Text></View>
        </TouchableOpacity>

    </View>
}

const styles = StyleSheet.create({

});