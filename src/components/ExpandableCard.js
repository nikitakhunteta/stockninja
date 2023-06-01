import React, { useEffect, useState } from 'react';
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
import { Theme } from '../../theme';

const ExpandableComponent = ({ item, onClickFunction, HeaderComponent, ExpandedBodyComponent }) => {
    const colorTheme = useColorScheme();
    const theme = Theme[colorTheme];
    //Custom Component for the Expandable List
    const [layoutHeight, setLayoutHeight] = useState(0);
    useEffect(() => {
        if (item.isExpanded) {
            setLayoutHeight(null);
        } else {
            setLayoutHeight(0);
        }
    }, [item.isExpanded]);

    return (

        <View style={{
            margin: 10,
            borderRadius: 15,
            borderStyle: 'solid',
            //  borderWidth: 1,
            // borderColor: theme.borderColorDark,
            shadowColor: theme.tertiary,
            shadowOffset: { width: -2, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 10,
        }}>
            {/*Header of the Expandable List Item*/}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClickFunction}
                style={styles(theme).header}>
                <HeaderComponent item={item} />
            </TouchableOpacity>
            <View
                style={{
                    height: layoutHeight,
                    overflow: 'hidden',
                }}>
                <ExpandedBodyComponent item={item} />
            </View>
        </View>

    );
};

const ExpandableCard = ({ data, HeaderComponent, ExpandedBodyComponent, dataKeyExtractor }) => {
    const colorTheme = useColorScheme();
    const theme = Theme[colorTheme];
    const [listDataSource, setListDataSource] = useState([]);
    const [multiSelect, setMultiSelect] = useState(true);

    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    useEffect(() => {
        let updatedData = data;
        if (updatedData && updatedData.length > 0) {
            if (dataKeyExtractor) {
                updatedData = data.map(v => ({ ...v, isExpanded: false }))
            } else {
                updatedData = data.map(v => ({ ...v, isExpanded: false }))
            }
        }
        setListDataSource(updatedData)

    }, [data]);
    const updateLayout = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const array = [...listDataSource];
        if (multiSelect) {
            // If multiple select is enabled
            array[index]['isExpanded'] = !array[index]['isExpanded'];
        } else {
            // If single select is enabled
            array.map((value, placeindex) =>
                placeindex === index
                    ? (array[placeindex]['isExpanded'] = !array[placeindex]['isExpanded'])
                    : (array[placeindex]['isExpanded'] = false)
            );
        }
        setListDataSource(array);
    };
    return (
        <SafeAreaView style={{ width: '98%', flex: 1 }}>
            <View style={styles(theme).container}>
                <ScrollView>
                    {listDataSource?.map((item, key) => {
                        return (
                            <ExpandableComponent
                                key={key}
                                onClickFunction={() => {
                                    updateLayout(key);
                                }}
                                item={item}
                                ExpandedBodyComponent={ExpandedBodyComponent}
                                HeaderComponent={HeaderComponent}
                            />
                        )
                    })}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ExpandableCard;
const styles = (themeColor) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 10,
        backgroundColor:Theme.light.fill
    }
});
