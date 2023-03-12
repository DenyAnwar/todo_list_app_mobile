import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SQLite from "expo-sqlite";
import Items from "../Components/Items";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("todolistDatabase.db");
  return db;
}

const db = openDatabase();

export default function App() {
  const [text, setText] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const add = (text) => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) => 
          console.log(JSON.stringify(rows))
        );
      }, 
      null,
      forceUpdate
    );
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? 
        (
          <View 
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={styles.heading}>
              Expo SQLite is not supported on web!
            </Text>
          </View>
        ) : 
        (
          <>
            <View style={styles.flexRow}>
              <TextInput 
                style={styles.input}
                value={text}
                placeholder="what do you need to do?"
                onChangeText={(text) => setText(text)}
                onSubmitEditing={() => {
                  add(text);
                  setText(null);
                }}
              />
            </View>
            <ScrollView style={styles.listArea}>
              <Items
                key={`forceupdate-todo-${forceUpdateId}`}
                done={false}
                onPressItem={(id) =>
                  db.transaction(
                    (tx) => {
                      tx.executeSql("update items set done = 1 where id = ?;", [id]);
                    },
                    null,
                    forceUpdate
                  )
                }
              />
              <Items 
                key={`forceupdate-done-${forceUpdateId}`}
                done
                onPressItem={(id) =>
                  db.transaction(
                    (tx) => {
                      tx.executeSql("delete from items where id = ?;", [id]);
                    },
                    null,
                    forceUpdate
                  )  
                }
              />
            </ScrollView>
          </>
        )
      }
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#C0C0C0",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
});

