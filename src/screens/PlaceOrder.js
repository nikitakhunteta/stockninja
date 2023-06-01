import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, TextInput, useColorScheme, StyleSheet, Alert } from "react-native"
import firestore from '@react-native-firebase/firestore';
import { Theme } from '../../theme';
import Context from '../Context/context';


export default PlaceOrder = ({ route, navigation }) => {
    const { ticker, name, uid, portfolioId, leagueJoinedId, leagueId, price = 0 } = route.params;
    const [quantity, onChangeQuantity] = useState('');
    const [currentPortfolio, setCurrentPortfolio] = useState(route?.params?.portfolio?.coinsAvailable);
    const [quantityError, setQuantityError] = useState("");

    let updatedPortfolio = currentPortfolio;
    // const colorTheme = useColorScheme();
    const userContext = useContext(Context);

    const placeOrder = async () => {
        // add this stock to portfolio
        // get the portfolio value, deduct the amount based on the price *qty 
        // if value is more than available, error
        try {

            await firestore().collection('orders').add({
                ticker,
                price,
                quantity,
                userId: uid,
                portfolioId: route.params?.portfolio?.portfolioId,
                leagueJoinedId: leagueJoinedId ?? null
            });

            userContext?.updateSelectedPortfolioData({
                coinsAvailable: (currentPortfolio - quantity * price)
            });
            route?.params?.portfolio?.portfolioId && await firestore().collection('portfolios')
                .doc(route.params?.portfolio?.portfolioId)
                .update({
                    coinsAvailable: (currentPortfolio - quantity * price)
                })
                .then(() => {
                });
            // update the contest chips available
            navigation.goBack();

            []
        } catch (err) {
            console.log('err', err);
            Alert.alert(err);
        }

    }
    const updatePortfolio = (text) => {
        onChangeQuantity(text);
        let orderValue = text * price;
        updatedPortfolio = currentPortfolio - orderValue;
        if (updatedPortfolio < 0) {
            setQuantityError('Quantity is more than purchase power!!')
        } else {
            setQuantityError('');
        }
    }

    return <View>
        <View style={[{
            flexDirection: 'column',
            padding: 10,
        }]} >
            <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.contentHeading]}>Remaining Coins: </Text>
                <Text style={[styles.content]}> {currentPortfolio} </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.contentHeading]}>Stock: </Text>
                <Text style={[styles.content]}>{name}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.contentHeading]}>Price:</Text>
                <Text style={[styles.content]}> {price} </Text>
            </View>
            {/* <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.content]}>Quantity:</Text>
                <Text style={[styles.content]}> {quantity} </Text>
            </View> */}
            <TextInput
                style={styles.input}
                onChangeText={updatePortfolio}
                value={quantity.toString()}
                inputMode="numeric"
                placeholder="Quantity"
                keyboardType="numeric"
            />
            {quantityError.length > 0 &&
                <Text style={{ color: 'red', paddingLeft: 12, paddingBottom: 10 }}>{quantityError}</Text>
            }
            <Button 
                color={Theme.light.primary}
                disabled={quantityError.length > 0 || quantity == 0}
                onPress={placeOrder}
                title="Buy"></Button>
        </View></View>
}


const styles = StyleSheet.create({
    input: {
        borderStyle: 'solid',
        borderWidth: 1,
        // height: 40,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        borderColor: Theme.light.borderColorDark
    },
    content: {
        fontSize: 16
    },
    contentHeading: {
        fontWeight: 'bold',
        fontSize: 18

    }

});
