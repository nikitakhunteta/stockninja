import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    useColorScheme, Button, FlatList, StyleSheet,
    ScrollView, useWindowDimensions
} from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { SearchBar } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';
import { Theme } from '../../theme';
import ExpandableCard from '../components/ExpandableCard';
import CustomText from '../components/CustomText';


export default function BuildPortfolio({ navigation, route }) {
    const { name, leagueId, leagueJoinedId, portfolioId, uid, ...rest } = route.params;
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'stocks', title: 'Stocks' },
        { key: 'orders', title: 'Orders' },
    ]);

    const userContext = useContext(Context);
    const colorTheme = useColorScheme();
    const theme = Theme[colorTheme];
    const [loading, setLoading] = useState(false);
    const [masterStocks, setMasterStocks] = useState([]);
    const [masterStocksData, setMasterStocksData] = useState([]);
    const [portfolioStocks, setPortfolioStocks] = useState([]);
    const [error, setError] = useState(null);
    const [filterValue, setFilterValue] = useState('');
    const [distinctStocks, setDistinctStocks] = useState(0);

    const StocksRoute = () => {
        if (loading) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (
            <View style={{ flex: 1, width: '100%', }}>

                <View style={{ flexDirection: 'row', padding: 10, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <CustomText style={{ fontSize: 16 }} > Coins: </CustomText>
                        <CustomText bold style={{ fontSize: 16 }}> {userContext?.selectedPortfolio?.coinsAvailable}</CustomText>
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <CustomText bold style={{ fontSize: 16 }}> {portfolioStocks.length ? 30 - distinctStocks : 30} </CustomText>
                        <CustomText style={{ fontSize: 16 }}>stocks remaining out of</CustomText>
                        <CustomText style={{ fontSize: 16 }}> {30}</CustomText>

                    </View>
                </View>
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
        );
    }
    const OrdersRoute = () => (
        <View style={{ flex: 1, width: '100%' }}>
            <FlatList
                data={portfolioStocks}
                renderItem={({ item }) => <Item item={item._data} />}
                keyExtractor={item => item.id}
                ListEmptyComponent={<CustomText medium style={{ margin: 10 }}>No orders yet!</CustomText>}
            />
        </View>
    );
    useEffect(() => {
        setLoading(true);
        async function getStocksData() {
            let randomNum = Math.floor(Math.random() * 1000)
            const topStocks = await firestore().collection('top-10-stocks').get();
            let data = topStocks?._docs?.map(s => ({
                ...s._data,
                id: s?._ref._documentPath._parts[1],
                price: Math.floor(Math.random() * randomNum)
            }));
            setMasterStocks(data);
            setError(null);
            setLoading(false);
            setMasterStocksData(data)
        }
        getStocksData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            async function getOrdersData() {
                //need to get by leagues joined id 
                const portfolioStocks = await firestore().collection('orders')
                    .where('userId', '==', uid).where('leagueJoinedId', '==', leagueJoinedId)
                    .get();
                setPortfolioStocks(portfolioStocks?._docs);
            }
            leagueJoinedId && getOrdersData();
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
                flexDirection: 'column',
                TouchableOpacity
            }]} >
                <CustomText style={[styles.content,
                ]}>{item.name}</CustomText>
                <CustomText style={[styles.content, {
                }]}>{item.ticker}</CustomText>
            </View></View>
    }

    const ExpandedBodyComponent = ({ item }) => {
        return (<View style={[{
            flexDirection: 'column',
            // backgroundColor: '#C4DFDF',
            borderStyle: 'solid',
            borderTopWidth: 0.5,
            borderColor: Theme.light.primary,

        }]} >
            <View style={[{ flexDirection: 'row', padding: 10, justifyContent: 'space-between' }]} >
                <CustomText>Price</CustomText>
                <CustomText style={[{

                }]}>{item.price}</CustomText>
            </View>

            <Button
                style={{
                    width: '100%'
                }}
                color={Theme.light.primary}
                onPress={() =>
                    navigation.navigate('PlaceOrder', {
                        ...item,
                        portfolio: { ...userContext?.selectedPortfolio },
                        leagueJoinedId,
                        leagueId
                    })} title="Buy"></Button>


        </View>
        )
    }

    const searchFilterFunction = async (text) => {
        setFilterValue(text);
        if (text) {
            const res = await fetch(`https://us-central1-stockninja-da767.cloudfunctions.net/app/instruments?filter=${text}`);
            res.json()
                .then((res) => {
                    let updatedData = res?.map(s => {
                        let randomNum = Math.floor(Math.random() * 1000);
                        return {
                            ...s,
                            price: Math.floor(Math.random() * randomNum)
                        }
                    })
                    setMasterStocks(updatedData);
                })
                .catch((err) => console.log(err));
        } else {
            setMasterStocks(masterStocksData);
        }
    };
    const Item = ({ item }) => (
        <View style={[styles.item]}>
            <CustomText style={styles.content}>{item.ticker} </CustomText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <CustomText>Quantity: </CustomText>
                    <CustomText bold>{item.quantity}</CustomText>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <CustomText>Price: </CustomText>
                    <CustomText bold>{item.price}</CustomText></View>
            </View>
        </View>
    );

    const renderScene = SceneMap({
        stocks: StocksRoute,
        orders: OrdersRoute,
    });
    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'black' }}
            activeColor={'black'}
            inactiveColor={'black'}
            pressColor={'white'}
            style={{ backgroundColor: 'white', fontWeight: 'bold' }}
        />
    );

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
        />
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        padding: 10,
        fontWeight: 'bold',
        fontSize: 16
    },
    item: {
        shadowColor: Theme.light.tertiary,
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        backgroundColor: Theme.light.fill,
        fontSize: 15,
        fontWeight: 'bold',
        elevation: 20,
        padding: 10,
        // height: 50, 
        margin: 5
    },
    title: {
        fontSize: 16,
    },
    content: {
        fontSize: 16
    }
});
