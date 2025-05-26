import { generateClient } from 'aws-amplify/api';
import { listStudents, getStudent, listAttendanceRecords} from '../graphql/queries';
import { createStudent, createAttendanceRecord, createAlert } from '../graphql/mutations';

const client = generateClient();

// Debug function to test GraphQL connection
export const testGraphQLConnection = async () => {
  try {
    console.log('Testing GraphQL connection...');
    const result = await client.graphql({ query: listStudents });
    console.log('GraphQL connection successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('GraphQL connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Student operations with enhanced error handling
export const getAllStudents = async () => {
  try {
    console.log('Fetching all students...');
    const result = await client.graphql({ query: listStudents });
    console.log('Students fetched successfully:', result.data.listStudents.items);
    return result.data.listStudents.items;
  } catch (error) {
    console.error('Error fetching students:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      graphQLErrors: error.errors
    });
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    console.log('Adding student:', studentData);
    
    // Validate required fields
    if (!studentData.name || !studentData.studentIDNumber) {
      throw new Error('Name and student ID number are required');
    }
    
    const result = await client.graphql({
      query: createStudent,
      variables: { input: studentData }
    });
    
    console.log('Student added successfully:', result.data.createStudent);
    return result.data.createStudent;
  } catch (error) {
    console.error('Error creating student:', error);
    console.error('Input data was:', studentData);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      graphQLErrors: error.errors
    });
    throw error;
  }
};

// Attendance operations with enhanced error handling
export const getAllAttendanceRecords = async () => {
  try {
    console.log('Fetching all attendance records...');
    const result = await client.graphql({ query: listAttendanceRecords });
    console.log('Attendance records fetched successfully:', result.data.listAttendanceRecords.items);
    return result.data.listAttendanceRecords.items;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      graphQLErrors: error.errors
    });
    throw error;
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  try {
    console.log('Adding attendance record:', attendanceData);
    
    // Validate required fields
    if (!attendanceData.studentID || !attendanceData.timestamp || !attendanceData.status) {
      throw new Error('studentID, timestamp, and status are required');
    }
    
    const result = await client.graphql({
      query: createAttendanceRecord,
      variables: { input: attendanceData }
    });
    
    console.log('Attendance record added successfully:', result.data.createAttendanceRecord);
    return result.data.createAttendanceRecord;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    console.error('Input data was:', attendanceData);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      graphQLErrors: error.errors
    });
    throw error;
  }
};