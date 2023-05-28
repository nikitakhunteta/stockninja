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
} from 'react-native';

const ExpandableComponent = ({ item, onClickFunction }) => {

    console.log("item", item)
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

        <View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: '#0066ff' }}>
            {/*Header of the Expandable List Item*/}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClickFunction}
                style={styles.header}>
                <Text style={styles.headerText}>{item.name}</Text>
                <View style={[{ backgroundColor: '#3399ff', flexDirection: 'row' }]} >
                    <Text style={[styles.content,{backgroundColor: '#3399ff', padding:0}]}>Total Slots</Text>
                    <Text style={[styles.content, {
                        flexGrow: 1,
                        backgroundColor: '#3399ff',
                        textAlign: 'right', padding:0
                    }]}>{item.totalSlots}</Text>
                </View>
            </TouchableOpacity>
            <View
                style={{
                    height: layoutHeight,
                    overflow: 'hidden',
                }}>

               
                <View style={[{ backgroundColor: '#3399ff', flexDirection: 'row' }]} >
                    <Text style={styles.content}>Entry Fee</Text>
                    <Text style={[styles.content, {
                        flexGrow: 1,
                        textAlign: 'right'
                    }]}>Rs.{item.entryFee}</Text>

                </View>

            </View>
        </View>

    );
};

const ExpandableCard = ({ data }) => {
    // console.log("data",data)
    const [listDataSource, setListDataSource] = useState([]);
    const [multiSelect, setMultiSelect] = useState(true);

    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    useEffect(() => {
        let updatedData = data;
        if (updatedData && updatedData.length > 0) {
            updatedData = data.map(v => ({ ...v._data, isExpanded: false }))
        }
        console.log("updatedData", updatedData)
        setListDataSource(updatedData)

    }, [data])
    const updateLayout = (index) => {
        console.log("ccalled")
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
            <View style={styles.container}>
                <ScrollView>
                    {listDataSource?.map((item, key) => (
                        <ExpandableComponent
                            key={item.name}
                            onClickFunction={() => {
                                updateLayout(key);
                            }}
                            item={item}
                        />
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ExpandableCard;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleText: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#3399ff',
        padding: 10,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#fff',
    },
});
