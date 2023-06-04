import React from 'react';
import { View, StyleSheet, ImageBackground } from "react-native"
import { Theme } from '../../theme';
import images from './../assets'
import CustomText from './CustomText';
export default ({ item }) => {
    return <View style={{
        flexDirection: 'row', padding: 3,
        borderBottomColor: Theme.light.borderColorDark, borderBottomWidth: 0.5,
    }}>

        <ImageBackground source={item.rank < 4 ? images.badgeIcon : images.badge2Icon}
            resizeMode="contain" style={styles.image}>
            <CustomText style={{
                flex: 1,
                lineHeight: 30,
                alignSelf: 'center', textAlign: 'center'
            }}>{item.rank}</CustomText>

        </ImageBackground>
        <CustomText bold style={{
            flex: 1, alignSelf: 'center', textAlign: 'center',
        }}>{item.prize}</CustomText>
    </View>
}

const styles = StyleSheet.create({
    
    image: {
      height: 40,
      width: 40,
      marginLeft: 30
    },
});
