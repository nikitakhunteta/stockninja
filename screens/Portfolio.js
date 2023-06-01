import React, { useEffect, useState, useContext } from 'react';

import {
    View, Text, Button,
    TextInput, StyleSheet, TouchableOpacity,
    ActivityIndicator, FlatList, Alert
} from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';

import { TOTAL_PORTFOLIO_ALLOWED, COINS_IN_EACH_LEAGUE } from './../constants';
import { CheckBox } from 'react-native-elements';
import { Theme } from './../theme';

export default Portfolio = ({ navigation, route }) => {

    const { uid, portfolioId, league } = route.params;
    const [portfolios, setPortfolios] = useState([]);
    const [addPortfolio, setAddPortfolio] = useState(false);
    const [portfolioName, onChangePortfolioName] = useState();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = React.useState('');
    const [selectedPortfolio, setSelectedPortfolio] = React.useState(null);
    const userContext = useContext(Context);

    //TODO: optmiize this with local state of data
    useEffect(() => {
        setLoading(true)
        //get the total number of available portfolios for user
        async function getPortfolios() {
            const portfolios = await firestore().collection('portfolios')
                .where('userId', '==', uid).where('isAvailable', '==', true)
                .get();
            let data = portfolios?._docs?.map(portfolio => ({ ...portfolio, isSelected: false, id: portfolio?._ref._documentPath._parts[1] }))
            setPortfolios(data);
        }
        getPortfolios()
        setLoading(false)
    }, [addPortfolio]);

    const fetchData = async () => {
        try {
            // const resp = await fetch('https://randomuser.me/api/?&results=1');
            const resp = await fetch('http://10.0.2.2:3000/?symbol=RELIANCE');
            const data = await resp.json();
            // // setData(data);
        } catch (err) {
            console.log('err', err)
        }

    };
    const savePortfolio = async () => {
        setAddPortfolio(false);
        try {
            const documentRef = await firestore().collection('portfolios').add({
                name: portfolioName,
                stocksAllowed: 30,
                userId: uid,
                isAvailable: true,
                coinsAvailable: COINS_IN_EACH_LEAGUE
            });

            const newPortfolio = await firestore()
                .collection('portfolios')
                .doc(documentRef._documentPath._parts[1]).get();
            let newPortfolioId = documentRef._documentPath._parts[1];
            // const leagueJoinedDoc = await firestore()
            //     .collection('leaguesJoined')
            //     .add({
            //         leagueId: league?.leagueId,
            //         portfolioId: newPortfolioId,
            //         rank: null,
            //         userId: uid,
            //     });

            // let leagueJoinedDocId = leagueJoinedDoc._documentPath._parts[1]

            // userContext?.updateSelectedPortfolio({
            //     ...newPortfolio?._data,
            //     portfolioId: documentRef._documentPath._parts[1]
            // });

            // navigation.navigate('BuildPortfolio', {
            //     name: portfolioName,
            //     portfolioId: documentRef._documentPath._parts[1],
            //     leagueId: league?.leagueId,
            //     leagueJoinedId: leagueJoinedDocId
            //     // leagueJoinedId: league?.leagueJoinedId,
            // });

        } catch (err) {
            console.log('err', err)
        }
    }

    const getPortfolioDetails = (name, portfolioId) => {
        if (league?.leagueJoinedId) {
            navigation.navigate('BuildPortfolio', {
                name, portfolioId,
                leagueJoinedId: league?.leagueJoinedId,
                leagueId: league?.leagueId
            });
        }
    }
    /*
     select portfolio id, send to league page 
        // activate the league for the user
        // for joining, need to deduct amount from the wallet worth game price 
        // if not sufficient balance, need to add money 
        // also, lock the seat and reduce available seats by 1
        // later need to add websocket to update number of seats available
         */
    const joinLeague = async () => {
        //check the amount in wallet of user 
        const walletAmount = userContext.wallet?.amount;
        console.log('walletAmount', walletAmount)
        if (league?.entryFee > walletAmount) {
            Alert.alert('Insufficient balance');
            return;
        }
        try {
            console.log('entryFee', league?.entryFee)
            userContext?.deductWalletAmount(league?.entryFee);
            //reduce free slots in league
            await firestore().collection('leagues').doc(league?.leagueId).update({
                freeSlots: league?.freeSlots - 1
            }).then(() => {
            });
            const leagueJoinedDoc = await firestore().collection('leaguesJoined').add({
                leagueId: league?.leagueId,
                userId: uid,
                portfolioId: checked,
                rank: null
            });
            await firestore()
                .collection('portfolios')
                .doc(checked)
                .update({
                    isAvailable: false,
                    coinsAvailable: COINS_IN_EACH_LEAGUE
                })
                .then(() => {
                });
            userContext?.updateSelectedPortfolio(selectedPortfolio);
            navigation.replace('BuildPortfolio', {
                ...selectedPortfolio,
                leagueJoinedId: leagueJoinedDoc?._documentPath._parts[1],
                leagueId: league?.leagueId
            });
        } catch (er) {
            Alert.alert(er)
        }
    }
    const Item = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => getPortfolioDetails(item?._data?.name, item?._ref?._documentPath?._parts[1])}
            ><View
                style={{
                    marginBottom: 10,
                    flexDirection: 'row',
                    borderColor: Theme.light.primary,
                    borderBottomWidth: 1,
                    alignItems: 'center',
                    borderStyle: 'solid'
                }}
                key={item._data.name}>
                    <CheckBox
                        // style={styles.checkbox}
                        color={checked === item?._ref?._documentPath?._parts[1] ? 'red' : undefined}

                        checked={checked === item?._ref?._documentPath?._parts[1]}
                        onPress={() => {
                            let id = item?._ref?._documentPath?._parts[1]
                            setChecked(id);
                            setSelectedPortfolio({
                                portfolioId: id,
                                entryFee: league?.entryFee,
                                ...item._data
                            });

                            if (userContext.wallet?.amount < league?.entryFee) {
                                //TODO: show error and disable the join button
                                // show add money button 
                            }
                        }}
                        center
                        iconRight
                        iconType='material'
                        checkedIcon='clear'
                        uncheckedIcon='add'
                        checkedColor='black'
                    />
                    <Text style={[styles.label, {}]}>{item._data.name}</Text></View>
            </TouchableOpacity>
        )
    };

    return <View style={[styles.screen]} >
        {loading && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
        </View>}
        <FlatList
            data={portfolios}
            renderItem={({ item }) => <Item item={item} />}
            keyExtractor={item => item.id}
        />
        {portfolios?.length > 0 && <View style={styles.buttonContainer}>
            <Button color={Theme.light.primary}
                title='Join'
                disabled={!checked}
                onPress={joinLeague} />
        </View>}
        {portfolios.length < TOTAL_PORTFOLIO_ALLOWED && !addPortfolio ? <View style={styles.buttonContainer}>
            <Button title="Add Portfolio" color={Theme.light.primary}
                onPress={() => { setAddPortfolio(true) }}>
            </Button></View> : null
        }

        {addPortfolio && <View style={{ alignItems: 'center' }} >
            <TextInput style={styles.input} onChangeText={onChangePortfolioName} placeholder='Portfolio Name'></TextInput>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Button color={Theme.light.primary} title='save' onPress={savePortfolio}></Button>
                <Button color={Theme.light.primary} title='Cancel' onPress={() => { setAddPortfolio(false) }}></Button>
            </View></View>}
    </View>
}

const styles = StyleSheet.create({
    input: {
        // height: 40,
        // borderColor: 'gray',
        borderWidth: 1,
        margin: 20,
        borderColor: Theme.light.borderColorDark,
        width: '80%'
    },
    screen: {
        width: '100%'

    },
    checkbox: {
        // alignSelf: 'center',
        // borderColor: 'red',
        // borderWidth: 1,
    },
    buttonContainer: {
        alignItems: 'center', margin: 10
    }, label: {
        margin: 8,
    },
});