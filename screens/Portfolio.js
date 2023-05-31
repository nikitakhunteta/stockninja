import React, { useEffect, useState } from 'react';

import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native"
import firestore from '@react-native-firebase/firestore';

import { TOTAL_PORTFOLIO_ALLOWED } from './../constants';
import { CheckBox } from 'react-native-elements';

export default Portfolio = ({ navigation, route }) => {
    const { uid, leagueId } = route.params;
    const [portfolios, setPortfolios] = useState([]);
    const [addPortfolio, setAddPortfolio] = useState(false);
    const [portfolioName, onChangePortfolioName] = useState();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = React.useState('first');

    //TODO: optmiize this with local state of data
    useEffect(() => {
        setLoading(true)
        //get the total number of portfolios for user
        async function getPortfolios() {
            const portfolios = await firestore().collection('portfolios').where('userId', '==', uid).get();
            let data = portfolios?._docs?.map(portfolio => ({ ...portfolio, isSelected: false, id: portfolio?._ref._documentPath._parts[1] }))
            setPortfolios(data);
            // console.log('portfolios ref',portfolios?._docs[0]._ref._documentPath._parts[1])
        }
        getPortfolios()
        setLoading(false)
    }, [addPortfolio]);

    // useEffect(()=>{
    //     Alert.alert('landed')
    // },[])

    const fetchData = async () => {
        try {
            // console.log('started')
            // const resp = await fetch('https://randomuser.me/api/?&results=1');
            const resp = await fetch('http://10.0.2.2:3000/?symbol=RELIANCE');
            const data = await resp.json();
            // // setData(data);
            // console.log(data)
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
            })
            navigation.navigate('BuildPortfolio', { name: portfolioName, portfolioId: documentRef._documentPath._parts[1] })
        } catch (err) {
            console.log('err', err)
        }
    }

    const getPortfolioDetails = (name, portfolioId) => {
        navigation.navigate('BuildPortfolio', { name, portfolioId });
    }
    const joinLeague = () => {
        // select portfolio id, send to league page 
        // activate the league for the user
        // redirect to home pg
        // console.log('returning to Home', leagueId,checked)
        navigation.navigate('Home', { leagueId: leagueId, portfolioId: checked })

    }
    const Item = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => getPortfolioDetails(item?._data?.name, item?._ref?._documentPath?._parts[1])}
            ><View
                style={{
                    padding: 10,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: 'gray', color: 'black', flexDirection: 'row'
                }}
                // item?._ref?._documentPath?._parts[1]
                key={item._data.name}>
                    <CheckBox
                        value={item?._ref?._documentPath?._parts[1]}
                        checked={checked === item?._ref?._documentPath?._parts[1]}
                        onPress={() => setChecked(item?._ref?._documentPath?._parts[1])}
                    />
                    <Text>{item._data.name} {item.isSelected.toString()}</Text></View>
            </TouchableOpacity>
        )
    };

    return <View style={[styles.screen, {
        width: '100%'
    }]} ><Text>Portfolios</Text>

        {loading && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
        </View>}
        <FlatList
            data={portfolios}
            renderItem={({ item }) => <Item item={item} />}
            keyExtractor={item => item.id}
        />

        {/* <Button title="Click Me" onPress={fetchData}></Button> */}
        {portfolios.length < TOTAL_PORTFOLIO_ALLOWED ? <View style={{ alignItems: 'center' }}><Button title="Build Portfolio"
            onPress={() => { setAddPortfolio(true) }}>
        </Button></View> : null}
        <Button title='Join' onPress={joinLeague} />

        {addPortfolio && <View style={{ alignItems: 'center' }} >
            <TextInput style={styles.input} onChangeText={onChangePortfolioName} placeholder='Portfolio Name'></TextInput>
            <Button title='save' onPress={savePortfolio}></Button>
        </View>}
    </View>
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 20,
        width: '80%'
    },
    screen: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
});