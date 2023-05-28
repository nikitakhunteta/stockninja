import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
// import { db } from './../firebase-config';
import firestore from '@react-native-firebase/firestore';
import ExpandableCard from '../components/ExpandableCard';

export default function Authenticated() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    async function getData() {
      const leagues = await firestore().collection('leagues').get();
      setLeagues(leagues?._docs);
    }
    getData()
  }, []);

  const ItemView = ({ item }) => {
    return (

      // Flat List Item
      // <Text
      //   style={styles.item}>
      //   {item._data.name}
      // </Text>

    <ExpandableCard item={item._data}></ExpandableCard>

    );
  };


  const EmptyListMessage = ({ item }) => {
    return (
      <Text
        style={styles.emptyListStyle}
      >
        No Data Found
      </Text>
    );
  };
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>You're Logged in</Text>
      <Text style={styles.phoneNumber}>{auth().currentUser.displayName + ' ' + auth().currentUser.phoneNumber}</Text>
      <ExpandableCard data={leagues}/>
      <View style={{ marginTop: 30 }}>
        <Button title="Signout" onPress={() => auth().signOut()} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: 300,
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
  phoneNumber: {
    fontSize: 21,
    marginTop: 20,
  },
   container: {
    width: '100%',
    flex: 1,
    paddingTop: 22,
  },
  item: {
    padding: 10,
    fontSize: 18,
    // height: 44,
    borderWidth: 1,
    borderColor: 'black'
  },
  list: {
    borderWidth: 1,
    borderColor: 'black'
  },
  emptyListStyle: {
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
  },

});
