import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function App() {

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState([]);

  const db = SQLite.openDatabaseSync('itemsdb');

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS item (id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT, amount TEXT);
        `);
      await updateList();
    } catch (error) {
      console.error('Could not open database', error);
    }
  }

  useEffect(() => { initialize() }, []);

  const addItem = async () => {
    try {
      await db.runAsync('INSERT INTO item VALUES (?, ?, ?)', null, product, amount);
      await updateList();
      console.log(items);
      setProduct(''); 
      setAmount('');
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from item');
      setItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await db.runAsync('DELETE FROM item WHERE id=?', id);
      await updateList();

    } catch (error) {
      console.error('Could not delete item', error);
    }
  }


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Product"
        value={product}
        onChangeText={setProduct}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="Add to list" onPress={addItem} />
      <FlatList
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.product}</Text>
            <Text style={styles.itemText}>{item.amount} </Text>
            <Text style={styles.boughtText} onPress={() => deleteItem(item.id)}>bought</Text>
          </View>}
        data={items}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#dee2e6',
  },
  itemText: {
    fontSize: 18,
    color: '#212529',
    flex: 1, 
  },
  boughtText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
});