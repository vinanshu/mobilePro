import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Student({ navigation, route }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [course, setCourse] = useState('others');
  const [year, setYear] = useState('others');
  const [section, setSection] = useState('others');
  const [existingIds, setExistingIds] = useState([]); // Track existing student IDs

  // Load existing student IDs from AsyncStorage when the component mounts
  useEffect(() => {
    const loadExistingIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem('existingIds');
        if (storedIds) {
          const parsedIds = JSON.parse(storedIds);
          setExistingIds(parsedIds);
          console.log('Loaded existing IDs:', parsedIds);
        }
      } catch (error) {
        console.error('Failed to load existing IDs from storage:', error);
      }
    };

    loadExistingIds();
  }, []);

  // Generate a unique ID number starting with "2025" and followed by 6 random digits
  const generateUniqueId = () => {
    const generateRandomId = () => {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 random digits
      return `2024${randomDigits}`;
    };

    let newId = generateRandomId();
    // Ensure the ID is unique by checking against existing IDs
    while (existingIds.includes(newId)) {
      console.log('Duplicate ID generated. Regenerating...');
      newId = generateRandomId(); // Regenerate ID if it already exists
    }
    console.log('Generated unique ID:', newId);
    return newId;
  };

  const handleAddStudent = async () => {
    // Validation: Check for required fields
    if (!firstName || !lastName || course === 'others' || year === 'others' || section === 'others') {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    const idNumber = generateUniqueId(); // Generate the unique ID number

    const newStudent = {
      firstName,
      lastName,
      idNumber,
      course,
      year,
      section,
    };

    console.log('New student details:', newStudent);

    if (route.params?.addStudent) {
      route.params.addStudent(newStudent);
    }

    // Update the list of existing IDs and save to AsyncStorage
    const updatedIds = [...existingIds, idNumber];
    setExistingIds(updatedIds);
    console.log('Updated list of IDs:', updatedIds);
    await AsyncStorage.setItem('existingIds', JSON.stringify(updatedIds));

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Student</Text>

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        placeholderTextColor="#A3B8C4"
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        placeholderTextColor="#A3B8C4"
      />

      <Text style={styles.label}>Course:</Text>
      <Picker
        selectedValue={course}
        onValueChange={(value) => setCourse(value)}
        style={styles.picker}
      >
        <Picker.Item label="Others" value="others" />
        <Picker.Item label="BSIT" value="BSIT" />
        <Picker.Item label="BSTCM" value="BSTCM" />
        <Picker.Item label="BSEMT" value="BSEMT" />
      </Picker>

      <Text style={styles.label}>Year:</Text>
      <Picker
        selectedValue={year}
        onValueChange={(value) => setYear(value)}
        style={styles.picker}
      >
        <Picker.Item label="Others" value="others" />
        <Picker.Item label="1st year" value="1st year" />
        <Picker.Item label="2nd year" value="2nd year" />
        <Picker.Item label="3rd year" value="3rd year" />
        <Picker.Item label="4th year" value="4th year" />
      </Picker>

      <Text style={styles.label}>Section:</Text>
      <Picker
        selectedValue={section}
        onValueChange={(value) => setSection(value)}
        style={styles.picker}
      >
        <Picker.Item label="Others" value="others" />
        <Picker.Item label="A" value="A" />
        <Picker.Item label="B" value="B" />
        <Picker.Item label="C" value="C" />
        <Picker.Item label="D" value="D" />
        <Picker.Item label="E" value="E" />
        <Picker.Item label="F" value="F" />
        <Picker.Item label="G" value="G" />
      </Picker>

      <Button color="#4A6A8C" title="Add Student" onPress={handleAddStudent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#DCE8F0', // Light vintage blue background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E5A6D', // Muted dark blue
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A3B8C4', // Muted light blue border
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#F4F9FB', // Soft light blue for input background
    color: '#3E5A6D', // Dark text for input
  },
  label: {
    fontSize: 16,
    color: '#3E5A6D', // Vintage blue text for labels
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#A3B8C4', // Light blue border for picker
    borderRadius: 5,
    backgroundColor: '#F4F9FB', // Same soft blue for picker background
    marginBottom: 15,
    padding: 10,
  },
});
