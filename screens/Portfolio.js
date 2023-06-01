import React, { useEffect, useState, useContext } from 'react';

import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';

import { TOTAL_PORTFOLIO_ALLOWED } from './../constants';
import { CheckBox } from 'react-native-elements';

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
        //get the total number of portfolios for user
        async function getPortfolios() {
            const portfolios = await firestore().collection('portfolios').where('userId', '==', uid).get();
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
                userId: uid
            });
            navigation.navigate('BuildPortfolio', {
                name: portfolioName,
                portfolioId: documentRef._documentPath._parts[1],
                leagueId: league?.leagueId,
                leagueJoinedId: league?.leagueJoinedId
            })
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
        const walletAmount = userContext.walletAmount;
        //TODO: deduct money form wallet
        if (league?.entryFee > walletAmount) {
            Alert.alert('Insufficient balance');
            return;
        }
        userContext?.deductWalletAmount(selectedPortfolio.entryFee);
        const leagueJoinedDoc = await firestore().collection('leaguesJoined').add({
            leagueId: league?.leagueId,
            userId: uid,
            portfolioId: checked,
            rank: null
        });

        navigation.replace('BuildPortfolio', {
            ...selectedPortfolio,
            leagueJoinedId: leagueJoinedDoc?._documentPath._parts[1],
            leagueId: league?.leagueId
        })
    }
    const Item = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => getPortfolioDetails(item?._data?.name, item?._ref?._documentPath?._parts[1])}
            ><View
                style={{
                    marginBottom: 10,
                    flexDirection: 'row'
                }}
                key={item._data.name}>
                    <CheckBox
                        style={styles.checkbox}
                        checked={checked === item?._ref?._documentPath?._parts[1]}
                        onPress={() => {
                            let id = item?._ref?._documentPath?._parts[1]
                            setChecked(id);
                            setSelectedPortfolio({
                                name: item?._data?.name,
                                portfolioId: id,
                                entryFee: league?.entryFee
                            });

                            if (userContext.walletAmount < league?.entryFee) {
                                //TODO: show error and disable the join button
                                // show add money button 
                            }
                        }}
                    />
                    <Text style={styles.label}>{item._data.name}</Text></View>
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

        {portfolios.length < TOTAL_PORTFOLIO_ALLOWED ? <View style={styles.buttonContainer}><Button title="Build Portfolio"
            onPress={() => { setAddPortfolio(true) }}>
        </Button></View> : null
        }
        <View style={styles.buttonContainer}>
            <Button title='Join' disabled={!checked} onPress={joinLeague} />
        </View>
        {addPortfolio && <View style={{ alignItems: 'center' }} >
            <TextInput style={styles.input} onChangeText={onChangePortfolioName} placeholder='Portfolio Name'></TextInput>
            <Button title='save' onPress={savePortfolio}></Button>
        </View>}
    </View>
}

const styles = StyleSheet.create({
    input: {
        // height: 40,
        // borderColor: 'gray',
        borderWidth: 1,
        margin: 20,
        width: '80%'
    },
    screen: {
        width: '100%'
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    checkbox: {
        alignSelf: 'center',
        borderColor: 'red',
        borderWidth: 1,
    },
    buttonContainer: {
        alignItems: 'center', margin: 10
    }, label: {
        margin: 8,
    },
});