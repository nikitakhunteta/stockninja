import React, { useEffect, useState } from 'react';

import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native"
import firestore from '@react-native-firebase/firestore';

import { TOTAL_PORTFOLIO_ALLOWED } from './../constants';

export default Portfolio = ({ navigation, route }) => {
    const { uid } = route.params;
    const [portfolios, setPortfolios] = useState([]);
    const [addPortfolio, setAddPortfolio] = useState(false);
    const [portfolioName, onChangePortfolioName] = useState();

    //TODO: optmiize this with local state of data
    useEffect(() => {
        //get the total number of portfolios for user
        async function getPortfolios() {
            const portfolios = await firestore().collection('portfolios').where('userId', '==', uid).get();
            setPortfolios(portfolios?._docs);
            // console.log('portfolios ref',portfolios?._docs[0]._ref._documentPath._parts[1])
        }
        getPortfolios()
    }, [addPortfolio]);

    // useEffect(()=>{
    //     Alert.alert('landed')
    // },[])

    const fetchData = async () => {
        try {
            console.log('started')
            // const resp = await fetch('https://randomuser.me/api/?&results=1');
            const resp = await fetch('http://10.0.2.2:3000/?symbol=RELIANCE');
            const data = await resp.json();
            // // setData(data);
            console.log(data)
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
    const Item = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => getPortfolioDetails(item._data.name, item._ref._documentPath._parts[1])}
            ><View
                style={{
                    padding: 10,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: 'gray', color: 'black'
                }}
                key={item.name}><Text>{item._data.name}</Text></View>
            </TouchableOpacity>
        )
    };

    return <View style={[styles.screen,{
         width: '100%'
    }]} ><Text>Portfolios</Text>

        <FlatList
            data={portfolios}
            renderItem={({ item }) => <Item item={item} />}
            keyExtractor={item => item.id}
        />

        {/* <Button title="Click Me" onPress={fetchData}></Button> */}
        {portfolios.length < TOTAL_PORTFOLIO_ALLOWED ? <View style={{alignItems:'center'}}><Button title="Build Portfolio"
            onPress={() => { setAddPortfolio(true) }}>
        </Button></View> : null}

        {addPortfolio && <View style={{alignItems:'center'}} >
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