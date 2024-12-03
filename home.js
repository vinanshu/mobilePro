import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation }) {
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem('students');
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        }
      } catch (error) {
        console.error('Failed to load students from AsyncStorage', error);
      }
    };

    loadStudents();
  }, []);

  const addStudent = (student) => {
    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    saveStudentsToStorage(updatedStudents);
  };

  const updateStudent = (updatedStudent) => {
    const updatedStudents = students.map((student) =>
      student.idNumber === updatedStudent.idNumber ? updatedStudent : student
    );
    setStudents(updatedStudents);
    saveStudentsToStorage(updatedStudents);
    setModalVisible(false);
  };

  const removeStudent = async (idNumber) => {
    const updatedStudents = students.filter((student) => student.idNumber !== idNumber);
    setStudents(updatedStudents);
    if (updatedStudents.length === 0) {
      try {
        await AsyncStorage.removeItem('students');
      } catch (error) {
        console.error('Failed to remove students from AsyncStorage', error);
      }
    } else {
      saveStudentsToStorage(updatedStudents);
    }
  };

  const saveStudentsToStorage = async (students) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
      console.error('Failed to save students to AsyncStorage', error);
    }
  };

  const getStudentsByCourseAndYear = () => {
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return sections.map((section) => ({
      section,
      students: students.filter(
        (student) =>
          student.course === selectedCourse &&
          student.year === selectedYear &&
          student.section === section
      ),
    }));
  };

  const renderStudentCard = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentDetails}>
        <Text style={styles.cardText}>First Name: {item.firstName}</Text>
        <Text style={styles.cardText}>Last Name: {item.lastName}</Text>
        <Text style={styles.cardText}>ID Number: {item.idNumber}</Text>
        <Text style={styles.cardText}>Course: {item.course}</Text>
        <Text style={styles.cardText}>Year: {item.year}</Text>
        <Text style={styles.cardText}>Section: {item.section}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => {
            setEditStudent(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeStudent(item.idNumber)}
        >
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = ({ item }) => (
    <View style={styles.sectionContainer} key={item.section}>
      <Text style={styles.sectionHeader}>Section {item.section}</Text>
      {item.students.length > 0 ? (
        <FlatList
          data={item.students}
          keyExtractor={(student) => `${item.section}-${student.idNumber}`}
          renderItem={renderStudentCard}
        />
      ) : (
        <Text style={styles.noStudents}>No students in this section</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Student Management System</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Student"
          onPress={() => navigation.navigate('Add Student', { addStudent })}
          color="#3B6B91"
        />
      </View>

      {/* Course Selection */}
      <View style={styles.courseButtonContainer}>
        {['BSIT', 'BSTCM', 'BSEMT'].map((course) => (
          <TouchableOpacity
            key={course}
            style={[
              styles.courseButton,
              selectedCourse === course && styles.courseButtonSelected,
            ]}
            onPress={() => {
              setSelectedCourse(course);
              setSelectedYear(null);
            }}
          >
            <Text
              style={[
                styles.courseButtonText,
                selectedCourse === course && styles.courseButtonTextSelected,
              ]}
            >
              {course}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Year Selection */}
      {selectedCourse && (
        <View style={styles.yearButtonContainer}>
          {['1st year', '2nd year', '3rd year', '4th year'].map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.yearButtonSelected,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.yearButtonTextSelected,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Display Students */}
      {selectedCourse && selectedYear && (
        <FlatList
          data={getStudentsByCourseAndYear()}
          keyExtractor={(item) => `${selectedYear}-${item.section}`}
          renderItem={renderSection}
          contentContainerStyle={styles.courseContainer}
        />
      )}

      {/* Update Modal */}
      {editStudent && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Update Student</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={editStudent.firstName}
                onChangeText={(text) =>
                  setEditStudent((prev) => ({ ...prev, firstName: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={editStudent.lastName}
                onChangeText={(text) =>
                  setEditStudent((prev) => ({ ...prev, lastName: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="ID Number"
                value={editStudent.idNumber}
                onChangeText={(text) =>
                  setEditStudent((prev) => ({ ...prev, idNumber: text }))
                }
              />
              

              {/* Course Dropdown */}
              <Picker
                selectedValue={editStudent.course}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setEditStudent((prev) => ({ ...prev, course: itemValue }))
                }
              >
                <Picker.Item label="Select Course" value="" />
                <Picker.Item label="BSIT" value="BSIT" />
                <Picker.Item label="BSTCM" value="BSTCM" />
                <Picker.Item label="BSEMT" value="BSEMT" />
              </Picker>

              {/* Year Dropdown */}
              <Picker
                selectedValue={editStudent.year}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setEditStudent((prev) => ({ ...prev, year: itemValue }))
                }
              >
                <Picker.Item label="Select Year" value="" />
                <Picker.Item label="1st year" value="1st year" />
                <Picker.Item label="2nd year" value="2nd year" />
                <Picker.Item label="3rd year" value="3rd year" />
                <Picker.Item label="4th year" value="4th year" />
              </Picker>

              {/* Section Dropdown */}
              <Picker
                selectedValue={editStudent.section}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setEditStudent((prev) => ({ ...prev, section: itemValue }))
                }
              >
                <Picker.Item label="Select Section" value="" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="C" value="C" />
                <Picker.Item label="D" value="D" />
                <Picker.Item label="E" value="E" />
                <Picker.Item label="F" value="F" />
                <Picker.Item label="G" value="G" />
              </Picker>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => updateStudent(editStudent)}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E8F0F6', // Light muted blue
  },
  header: {
    fontSize: 25,
    backgroundColor:'#E8F0F6',
    fontWeight: 'bold',
    color: '#3B6B91', // Muted blue
    textAlign: 'center',
    marginTop: -15,
  },
  buttonContainer: {
    marginBottom: 5,
    alignSelf: 'center',
    width: 310,

  },
  courseButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  courseButton: {
    backgroundColor: '#3B6B91', // Default muted blue
    padding: 10,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
  },
  courseButtonSelected: {
    backgroundColor: '#5E8C64', // Vintage green when selected
    borderWidth: 2, // 1px border width
    borderColor: '#000000',
  },
  courseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  courseButtonTextSelected: {
    color: '#FFFFFF', // White text for selected button
  },
  yearButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  yearButton: {
    backgroundColor: '#3B6B91', // Muted gray for default year buttons
    padding: 10,
    borderRadius: 8,
    width: 75,
    alignItems: 'center',
  },
  yearButtonSelected: {
    backgroundColor: '#5E8C64', // Vintage green when selected
    borderWidth: 2, // 1px border width
    borderColor: '#000000',
  },

  yearButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  yearButtonTextSelected: {
    color: '#FFFFFF', // White text for selected button
  },
  courseContainer: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#E0F1E7', // Light vintage green for sections
    borderRadius: 8,
    borderWidth: 1, // 1px border width
    borderColor: '#000000',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    marginLeft:100,
  },
  noStudents: {
    fontStyle: 'italic',
    color: '#7A9DAE', // Muted text for empty states
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCE8F0', // Lighter muted blue
    borderWidth: 1,
    borderColor: '#A4B7C6', // Muted blue-gray for borders
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  studentDetails: {
    flex: 3,
  },
  buttonGroup: {
    flexDirection: 'column', // Stack buttons vertically
    justifyContent: 'space-between', // Add spacing between buttons
    alignItems: 'center', // Center align buttons
    flex: 1,
    marginRight:20,
  },
  updateButton: {
    backgroundColor: '#5E8C64', // Vintage green
    padding: 8,
    borderRadius: 20,
    marginVertical: 2, // Add vertical spacing
    width: 80, // Ensure buttons are uniform
    alignItems: 'center',
    marginBottom:10,
  },
  removeButton: {
    backgroundColor: '#D9534F', // Red for remove
    padding: 8,
    borderRadius: 20,
    marginVertical: 2, // Add vertical spacing
    width: 80, // Ensure buttons are uniform
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#E8F0F6', // Soft vintage blue for the modal background
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B6B91', // Muted vintage blue for text
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#A4B7C6', // Muted blue-gray for borders
    backgroundColor: '#FFFFFF', // White for input fields
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#5E8C64', // Vintage green for save button
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D9534F', // Red for cancel button
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginTop:10,
  },
  buttonText: {
    color: '#FFFFFF', // White text for buttons
    fontWeight: 'bold',
  },

});

