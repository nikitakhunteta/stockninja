import React, { useEffect, useState, useContext } from 'react';

import {
    View, Text, Button,
    TextInput, StyleSheet, TouchableOpacity,
    ActivityIndicator, FlatList, Alert, Pressable,
    Modal
} from "react-native"
import firestore from '@react-native-firebase/firestore';
import Context from '../Context/context';

import { TOTAL_PORTFOLIO_ALLOWED, COINS_IN_EACH_LEAGUE } from '../../constants';
import { CheckBox } from 'react-native-elements';
import { Theme } from '../../theme';

export default Portfolio = ({ navigation, route }) => {

    const { uid, portfolioId, league } = route.params;
    const [portfolios, setPortfolios] = useState([]);
    const [addPortfolio, setAddPortfolio] = useState(false);
    const [portfolioName, onChangePortfolioName] = useState();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = React.useState('');
    const [selectedPortfolio, setSelectedPortfolio] = React.useState(null);
    const [modalVisible, setModalVisible] = useState(false);
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
        if (league?.entryFee > walletAmount) {
            setModalVisible(true)
            // Alert.alert('Insufficient balance');
            return;
        }
        try {
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
                    <Pressable style={{marginLeft: 10}}
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
                        }}>
                        <View style={[{
                            height: 16,
                            width: 16,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: Theme.light.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }]}>
                            {
                                checked === item?._ref?._documentPath?._parts[1] ?
                                    <View style={{
                                        height: 8,
                                        width: 8,
                                        borderRadius: 4,
                                        backgroundColor: Theme.light.primary,
                                    }} />
                                    : null
                            }
                        </View>
                    </Pressable>
                    <Text style={[styles.label, {}]}>{item._data.name}</Text></View>
            </TouchableOpacity>
        )
    };
    const redirectToAddMoney = () => {
        setModalVisible(!modalVisible);
        navigation.navigate('AddMoney')
    }

    return <View style={[styles.screen]} >
        {loading && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
        </View>}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Insufficient balance!! Please add money to proceed.</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => redirectToAddMoney()}>
                            <Text style={styles.textStyle}>Add Money</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.textStyle}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
        <Text>{userContext?.wallet.amount}</Text>
        <FlatList
            data={portfolios}
            renderItem={({ item }) => <Item item={item} />}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ fontSize: 18, margin: 10 }}>You have not created any portfolio yet! Let's get you started!!</Text>}
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

            <View style={{ flexDirection: 'row', margin: 25, marginTop: 5, justifyContent: 'center' }}>

                <Pressable
                    style={[styles.button, styles.buttonClose, { flex: 1 }]}
                    onPress={savePortfolio}>
                    <Text style={styles.textStyle}>Save</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.buttonClose, { flex: 1, backgroundColor: Theme.light.tertiary }]}
                    onPress={() => { setAddPortfolio(false) }}>
                    <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
            </View>
        </View>}
    </View>
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 2,
        margin: 20,
        borderColor: Theme.light.borderColorDark,
        width: '80%',
        marginVertical: 15,
        fontSize: 15,
        padding: 10,
        borderRadius: 8,
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'white',
        // opacity: 0.8
    },
    modalView: {
        margin: 20,
        // backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',

    },
    button: {
        borderRadius: 5,
        padding: 10,
        margin: 5
    },
    buttonOpen: {
        backgroundColor: Theme.light.primary,
    },
    buttonClose: {
        backgroundColor: Theme.light.primary,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 15
    },
});