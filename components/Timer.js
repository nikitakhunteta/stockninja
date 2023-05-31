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
import { useCountdown } from './../Hooks/useCountdown';

const DateTimeDisplay = ({ value, type }) => {
    return (
        <View  style={{flexGrow:1,  flexDirection:'row'}}><Text>{value} </Text>
            <Text>{type}</Text></View>
    );
};
const ShowCounter = ({ days, hours, minutes, seconds }) => {
    return (
        <View style={{flexGrow:1,  flexDirection:'row'}}>
            <DateTimeDisplay value={days} type={'Days'} />
            <Text> : </Text>
            <DateTimeDisplay value={hours} type={'H'} />
            <Text> : </Text>
            <DateTimeDisplay value={minutes} type={'M'} />
            <Text> : </Text>
            <DateTimeDisplay value={seconds} type={'S'} />
        </View>

    );
};
const ExpiredNotice = () => {
    return (
        <View>
            <Text>Please select a future date and time.</Text>
        </View>
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