import React, { useEffect, useState, useContext } from 'react';
import {
    StyleSheet, Text, Pressable, View, Button, useColorScheme,
    TouchableOpacity, ActivityIndicator,
    TextInput
} from 'react-native';
import { } from 'react-native-gesture-handler';
import Context from '../Context/context';
import { Theme } from '../../theme';

export default AddMoney = ({ navigation }) => {
    const [amount, onChangeAmount] = useState();
    const userContext = useContext(Context);

    const addMoney = () => {
        userContext?.addWalletAmount(amount);
        navigation.goBack();
    }
    return <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 16 }}>Please add money to wallet</Text>
        <Text style={{ fontSize: 16 }}>Amount available in wallet: {userContext?.wallet.amount}</Text>
        <View style={{ flexDirection: 'row', marginBottom: 5, marginTop: 5 }}>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => onChangeAmount("100")}>
                <Text style={styles.textStyle}>100</Text>
            </Pressable>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => onChangeAmount("500")}>
                <Text style={styles.textStyle}>500</Text>
            </Pressable>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => onChangeAmount("1000")}>
                <Text style={styles.textStyle}>1000</Text>
            </Pressable></View>
        <TextInput
            style={styles.input}
            onChangeText={onChangeAmount}
            value={amount}
            placeholder="Custom Amount"
            keyboardType='numeric'></TextInput>
        <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: 'center' }}>

            <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1 }]}
                onPress={addMoney}>
                <Text style={styles.textStyle}>Add</Text>
            </Pressable>

            <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1, backgroundColor: Theme.light.tertiary }]}
                onPress={() => { navigation.goBack() }}>
                <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
            {/* <Button color={Theme.light.primary}  title='Add' onPress={}></Button>
        <Button color={Theme.light.tertiary} title='Cancel' onPress={ }}></Button> */}
        </View></View>
}
const styles = StyleSheet.create({
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
    }, textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderRadius: 5,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: Theme.light.primary,
        marginBottom: 10
    }
})