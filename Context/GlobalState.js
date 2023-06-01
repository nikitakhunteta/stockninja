import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

import Context from './context';
export default GlobalState = (props) => {
    const [wallet, setWallet] = useState({
        amount:0,
        id:''
    });
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);

    const deductWalletAmount = async (amount) => {
        await firestore()
            .collection('wallet')
            .doc(wallet.id)
            .update({
                amount: wallet.amount-amount
            });
        setWallet({
            ...wallet,
            amount:  wallet.amount-amount
        });
    };

    const updateSelectedPortfolio = (portfolio) => {
        setSelectedPortfolio(portfolio);
    };

    const updateSelectedPortfolioData = (portfolioData) => {
        setSelectedPortfolio({ ...selectedPortfolio, ...portfolioData });
    };

    useEffect(() => {
        try {
            async function getData() {
                if (props.uid) {
                    const userWallet = await firestore().collection('wallet').where('userId', '==', props.uid).get();
                    setWallet({
                        amount: userWallet._docs[0]._data.amount,
                        id: userWallet._docs[0]?._ref?._documentPath?._parts[1]
                    });
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
                wallet,
                deductWalletAmount: deductWalletAmount,
                updateSelectedPortfolio,
                selectedPortfolio,
                updateSelectedPortfolioData
            }}
        >
            {props.children}
        </Context.Provider>
    );
}


