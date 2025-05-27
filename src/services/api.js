// src/services/api.js - Updated for minimal schema (Student table only)

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// GraphQL queries for the minimal schema
const listStudents = /* GraphQL */ `
  query ListStudents {
    listStudents {
      items {
        id
        name
        studentIDNumber
        createdAt
        updatedAt
      }
    }
  }
`;

const createStudent = /* GraphQL */ `
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id
      name
      studentIDNumber
      createdAt
      updatedAt
    }
  }
`;

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

// Student operations (using new Student table)
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
    
    // Transform input data to match schema
    const inputData = {
      name: studentData.name,
      studentIDNumber: studentData.studentIDNumber || studentData.StudentID || generateStudentID()
    };
    
    // Validate required fields
    if (!inputData.name || !inputData.studentIDNumber) {
      throw new Error('Name and studentIDNumber are required');
    }
    
    const result = await client.graphql({
      query: createStudent,
      variables: { input: inputData }
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

// Helper function to generate student ID
const generateStudentID = () => {
  return 'STU' + Date.now().toString().slice(-6);
};

// Attendance operations (return empty array for now since we don't have attendance table)
export const getAllAttendanceRecords = async () => {
  try {
    console.log('No attendance table in minimal schema - returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  try {
    console.log('Attendance table not available in minimal schema');
    // For now, just return a mock response
    return {
      id: 'mock-' + Date.now(),
      studentID: attendanceData.studentID,
      timestamp: attendanceData.timestamp || new Date().toISOString(),
      status: 'PRESENT',
      confidence: 0.95
    };
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};