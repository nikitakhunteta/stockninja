// import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    LayoutAnimation,
    StyleSheet,
    View,
    Text,
    ScrollView,
    UIManager,
    TouchableOpacity,
    Platform,
    useColorScheme
} from 'react-native';

import React from 'react';
import { useCountdown } from '../Hooks/useCountdown';
import CustomText from './CustomText';

const DateTimeDisplay = ({ value, type }) => {
    return (
        <View  style={{flexGrow:1,  flexDirection:'row'}}><CustomText bold>{value} </CustomText>
            <CustomText bold>{type}</CustomText></View>
    );
};
const ShowCounter = ({ days, hours, minutes, seconds }) => {
    return (
        <View style={{flexGrow:1,  flexDirection:'row'}}>
            <DateTimeDisplay value={days} type={'Days'} />
            <CustomText bold> : </CustomText>
            <DateTimeDisplay value={hours} type={'H'} />
            <CustomText bold> : </CustomText>
            <DateTimeDisplay value={minutes} type={'M'} />
            <CustomText bold> : </CustomText>
            <DateTimeDisplay value={seconds} type={'S'} />
        </View>

    );
};
const ExpiredNotice = () => {
    return (
        null
    );
};

const CountdownTimer = ({ targetDate }) => {
    const [days, hours, minutes, seconds] = useCountdown(targetDate);

    if (days + hours + minutes + seconds <= 0) {
        return <ExpiredNotice />;
    } else {
        return (
            <ShowCounter
                days={days}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
            />
        );
    }
};

export default CountdownTimer