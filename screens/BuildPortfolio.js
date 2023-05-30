import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    useColorScheme, Button, FlatList, StyleSheet,
    ScrollView
} from "react-native"
import { } from 'react-native';
import { SearchBar } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { Theme } from './../theme';
import ExpandableCard from './../components/ExpandableCard';


export default BuildPortfolio = ({ navigation, route }) => {
    const { name, portfolioId, uid, ...rest } = route.params;
    const colorTheme = useColorScheme();
    const theme = Theme[colorTheme];
    const [loading, setLoading] = useState(false);
    const [masterStocks, setMasterStocks] = useState([]);
    const [masterStocksData, setMasterStocksData] = useState([]);
    const [portfolioStocks, setPortfolioStocks] = useState([]);
    const [error, setError] = useState(null);
    const [filterValue, setFilterValue] = useState('');
    const [distinctStocks, setDistinctStocks] = useState(0);

    useEffect(() => {
        setLoading(true);
        async function getData() {
            const topStocks = await firestore().collection('top-10-stocks').get();
            setMasterStocks(topStocks?._docs);
            setError(null);
            setLoading(false);
            setMasterStocksData(topStocks?._docs)
        }
        getData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            async function getData() {
                const portfolioStocks = await firestore().collection('orders')
                    .where('userId', '==', uid).where('portfolioId', '==', portfolioId)
                    .get();
                setPortfolioStocks(portfolioStocks?._docs);
            }
            getData();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        //check how many different stocks
        setDistinctStocks((new Set(portfolioStocks?.map((item) => item._data.ticker))).size);
    }, [portfolioStocks])

    const HeaderComponent = ({ item }) => {
        return <View>
            <View style={[{
                flexDirection: 'column', TouchableOpacity
            }]} >
                <Text style={[styles.content,
                { backgroundColor: theme.backgroundColor }]}>{item.name}</Text>
                <Text style={[styles.content, {
                }]}>{item.name}</Text>
            </View></View>
    }

    const ExpandedBodyComponent = ({ item }) => {
        return (
            <View style={[{ flexDirection: 'column' }]} >
                <View style={[{ flexDirection: 'row' }]} >
                    <Text>Price</Text>
                    <Text style={[{
                        flexGrow: 1,
                        textAlign: 'right'
                    }]}>{item.price}</Text>
                </View>
                <View style={[{ flexDirection: 'row' }]} >
                    <Button onPress={() =>
                        navigation.navigate('PlaceOrder', { ...item, portfolioId })} title="Buy"></Button>
                    <Text style={[{
                        flexGrow: 1,
                        textAlign: 'right'
                    }]}>{item.entryFee}</Text>
                </View>
            </View>)
    }

    const searchFilterFunction = async (text) => {
        setFilterValue(text);
        if (text) {
            const res = await fetch(`http://10.0.2.2:3000/instruments?filter=${text}`);
            res
                .json()
                .then((res) => {
                    setMasterStocks([...res]);
                })
                .catch((err) => console.log(err));
        } else {
            setMasterStocks(masterStocksData);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    const Item = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.ticker}: </Text>
            <Text style={styles.title}>{item.quantity}: </Text>
            <Text style={styles.title}>{item.price}</Text>
        </View>
    );

    return (

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flex: 1, width: '100%', }}>
                <Text> Portfolio {name} </Text>
                <Text> {portfolioStocks.length ? 30 - distinctStocks : 30} stocks left out of {30}</Text>
                <SearchBar
                    placeholder="Search Stock..."
                    searchIcon={null}
                    lightTheme
                    round
                    onChangeText={text => searchFilterFunction(text)}
                    autoCorrect={false}
                    value={filterValue}
                />
                <ExpandableCard data={masterStocks} dataKeyExtractor={filterValue ? null : '_data'}
                    HeaderComponent={HeaderComponent}
                    ExpandedBodyComponent={ExpandedBodyComponent}>
                </ExpandableCard>

            </View>
            <View style={{ flex: 1, width: '100%' }}>
                <Text style={styles.header}>Current Orders</Text>
                <FlatList
                    data={portfolioStocks}
                    renderItem={({ item }) => <Item item={item._data} />}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text>No orders yet!</Text>}
                />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        padding: 10,
        fontWeight: 'bold'
        // backgroundColor: themeColor.backgroundColor
    },

    item: {
        padding: 10,
        // marginVertical: 8,
        // marginHorizontal: 16,
        flexDirection: 'row',
        // justifyContent: 'center',
        // flexGrow: 1,
        // alignSelf: 'stretch',
        // alignItems:'stretch',
        // display: 'flex'
    },
    title: {
        fontSize: 12,
    },
});
