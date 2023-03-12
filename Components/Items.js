import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("todolistDatabase.db");

export default function Items({ done: doneHeading, onPressItem}) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql("select * from items where done = ?;", [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      )
    });
  }, []);

  const heading = doneHeading ? "Completed" : "Todo";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value}) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#C0C0C0",
            borderWidth: 1,
            padding: 8,
            margin: 8,
          }}
        >
          <Text style={{color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 16,
    marginBottom: 10,
    marginHorizontal: 10,
  },
});