import React from 'react';
import { Text, StyleSheet } from "react-native"

export default (props) => {
    const { style, bold, large, medium, ...rest } = props
    return <Text style={[styles.text, style, bold && styles.bold,
    medium && styles.medium, large && styles.large]} {...rest}></Text >
}
const styles = StyleSheet.create({
    text: {
        color: 'black',
        fontSize: 14
    },
    bold: {
        fontWeight: 'bold'
    },
    medium: {
        fontSize: 16

    },
    large: {
        fontSize: 18

    }
});
