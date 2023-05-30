import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, useColorScheme, StyleSheet, Alert } from "react-native"
import firestore from '@react-native-firebase/firestore';
import { Theme } from './../theme';


export default PlaceOrder = ({ route, navigation }) => {
    const { ticker,name, uid , portfolioId, price=0} = route.params;
    const [quantity, onChangeQuantity] = useState(0);
    const [currentPortfolio, setCurrentPortfolio] = useState(1000);
    const [availableValue, setAvailableValue] = useState(1000);
    const [quantityError, setQuantityError] = useState("");

    let updatedPortfolio = currentPortfolio;
    // const colorTheme = useColorScheme();

    const placeOrder = async () => {
        // add this stock to portfolio
        // get the portfolio value, deduct the amount based on the price *qty 
        // if value is more than available, error
        try {
            console.log('sending', ticker,
                price,
                quantity)
            const documentRef = await firestore().collection('orders').add({
                ticker,
                price,
                quantity,
                userId: uid,
                portfolioId

            })
            navigation.navigate('BuildPortfolio', { portfolioId })
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
            padding: 10
        }]} >
            <Text style={[styles.content,
            ]}>{name} </Text>
            <Text style={[styles.content, {
            }]}>Price: {price} </Text>
            <Text style={[styles.content, {
            }]}>Quantity: {quantity} </Text>
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
            <Button disabled={quantityError.length > 0 || quantity ==0 } onPress={placeOrder} title="Buy"></Button>

        </View></View>
}


const styles = StyleSheet.create({
    input: {
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5
    },

});
