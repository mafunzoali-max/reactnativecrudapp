import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { data } from "@/data/todos";
import { StatusBar } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
// import for animations
import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const router=useRouter()

  // Load todos from AsyncStorage on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageTodos && storageTodos.length) {
          setTodos(storageTodos.sort((a, b) => b.id - a.id));
        } else {
          setTodos(data.sort((a, b) => b.id - a.id));
        }
      } catch (e) {
        console.log("Error loading todos:", e);
        // Fallback to default data if there's an error
        setTodos(data.sort((a, b) => b.id - a.id));
      }
    };

    fetchData();
  }, []);

  // Save todos to AsyncStorage whenever todos change
  useEffect(() => {
    const storeData = async () => {
      try { 
        const jsonValue = JSON.stringify(todos);
        await AsyncStorage.setItem('TodoApp', jsonValue);    
      } catch (e) {
        console.log("Error saving todos:", e);
      }
    };

    if (todos.length > 0) {
      storeData();
    }
  }, [todos]);

  // Add new todo function
  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;
      setTodos([{ id: newId, title: text, completed: false }, ...todos]);
      setText("");
    }
  };

  // Toggle todo completion status
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete todo function
  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

//let us use router here
  const handlepress=(id)=>{
router.push(`/todos/${id}`)

  }

  // Render each todo item
  const renderItem = ({ item }) => (
    <Animated.View 
      style={styles.todoItem}
      layout={LinearTransition}
    >
      {/* Pressable area for toggling completion status */}
      <Pressable
        style={styles.todoTextContainer}
         onPress={() => handlepress(item.id)}
        onLongPress={() => toggleTodo(item.id)}
      >
        <Text
          style={[
            styles.todoText,
            item.completed && styles.completedText,
          ]}
        >
          {item.title}
        </Text>
      </Pressable>

      {/* Delete button */}
      <Pressable onPress={() => removeTodo(item.id)} style={styles.deleteButton}>
        <MaterialCommunityIcons name="delete-circle" size={28} color="red" />
      </Pressable>
    </Animated.View>
  );

  const styles = createStyles(theme, colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Input container for adding new todos + theme toggle */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo"
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />

        {/* Add button */}
        <Pressable
          onPress={addTodo}
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>

        {/* Theme toggle button */}
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={styles.themeToggle}
        >
          {colorScheme === "dark" ? (
            <Octicons name="moon" size={28} color={theme.text} />
          ) : (
            <Octicons name="sun" size={28} color={theme.text} />
          )}
        </Pressable>
      </View>

      {/* Todo list with animations */}
      <Animated.FlatList 
        data={todos}
        renderItem={renderItem}
        keyExtractor={(todo) => todo.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No todos yet. Add a new one!</Text>
        }
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
      
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

// Styles
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: theme.background,
      padding: 10,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      width: "100%",
      maxWidth: 1025,
      marginHorizontal: "auto",
    },
    input: {
      flex: 1,
      borderColor: "gray",
      borderWidth: 2,
      padding: 12,
      borderRadius: 8,
      marginRight: 10,
      fontSize: 16,
      color: theme.text,
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
    },
    addButton: {
      backgroundColor: theme.button,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: "center",
      marginRight: 8,
    },
    addButtonText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "black" : "white",
      fontWeight: "600",
    },
    themeToggle: {
      padding: 6,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    todoItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
      borderBottomColor: "#333",
      borderBottomWidth: 1,
      width: "100%",
      maxWidth: 1024,
      marginHorizontal: "auto",
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
      marginVertical: 2,
      borderRadius: 6,
    },
    todoTextContainer: {
      flex: 1,
      paddingVertical: 4,
    },
    todoText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 22,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: "#888",
    },
    deleteButton: {
      padding: 4,
    },
    emptyText: {
      textAlign: "center",
      color: "#888",
      fontSize: 16,
      marginTop: 50,
      fontStyle: "italic",
    },
  });
}