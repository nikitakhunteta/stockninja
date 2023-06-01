import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

import Context from './context';
export default GlobalState = (props) => {
    const [wallet, setWallet] = useState();

    const deductWalletAmount = (amount) => {
        setWallet(wallet - amount)
    };

    useEffect(() => {
        try {
            async function getData() {
                if (props.uid) {
                    const userWallet = await firestore().collection('wallet').where('userId', '==', props.uid).get();
                    setWallet(userWallet._docs[0]._data.amount);
                }
            }
            getData()
        } catch (e) {
            // setLoading(false);
        }
    }, [props.uid]);

    return (
        <Context.Provider
            value={{
                walletAmount: wallet,
                deductWalletAmount: deductWalletAmount,
            }}
        >
            {props.children}
        </Context.Provider>
    );
}


