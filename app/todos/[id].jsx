import { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colorScheme } = useContext(ThemeContext);
  const [todo, setTodo] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Create styles based on theme and colorScheme
  const styles = createStyles(theme, colorScheme);

  // Load the specific todo from AsyncStorage
  useEffect(() => {
    const loadTodo = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('TodoApp');
        const todos = jsonValue ? JSON.parse(jsonValue) : [];
        const foundTodo = todos.find(t => t.id.toString() === id);
        
        if (foundTodo) {
          setTodo(foundTodo);
          setTitle(foundTodo.title);
        }
      } catch (error) {
        console.log('Error loading todo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodo();
  }, [id]);

  // Update the todo in AsyncStorage
  const updateTodo = async () => {
    if (!title.trim()) return;

    try {
      const jsonValue = await AsyncStorage.getItem('TodoApp');
      const todos = jsonValue ? JSON.parse(jsonValue) : [];
      
      const updatedTodos = todos.map(t => 
        t.id.toString() === id ? { ...t, title: title.trim() } : t
      );
      
      await AsyncStorage.setItem('TodoApp', JSON.stringify(updatedTodos));
      router.back();
    } catch (error) {
      console.log('Error updating todo:', error);
    }
  };

  // Delete the todo from AsyncStorage
  const deleteTodo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('TodoApp');
      const todos = jsonValue ? JSON.parse(jsonValue) : [];
      
      const filteredTodos = todos.filter(t => t.id.toString() !== id);
      await AsyncStorage.setItem('TodoApp', JSON.stringify(filteredTodos));
      router.back();
    } catch (error) {
      console.log('Error deleting todo:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error if todo not found
  if (!todo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Todo not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Edit Todo</Text>
      
      {/* Text input for editing todo */}
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Edit your todo..."
        placeholderTextColor="gray"
        multiline
      />

      {/* Button container for actions */}
      <View style={styles.buttonContainer}>
        {/* Save changes button */}
        <Pressable 
          onPress={updateTodo} 
          style={[styles.button, styles.saveButton]}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>

        {/* Delete todo button */}
        <Pressable 
          onPress={deleteTodo} 
          style={[styles.button, styles.deleteButton]}
        >
          <Text style={styles.deleteButtonText}>Delete Todo</Text>
        </Pressable>

        {/* Cancel button */}
        <Pressable 
          onPress={() => router.back()} 
          style={[styles.button, styles.cancelButton]}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Styles function
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.text,
      textAlign: 'center',
    },
    input: {
      borderWidth: 2,
      borderColor: 'gray',
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      color: theme.text,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    buttonContainer: {
      gap: 12,
    },
    button: {
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
    cancelButton: {
      backgroundColor: '#8E8E93',
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 50,
      color: theme.text,
    },
    errorText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 50,
      marginBottom: 20,
      color: theme.text,
    },
    backButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 50,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}