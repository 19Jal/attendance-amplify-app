// src/services/api.js - Updated for existing FaceIndex and Attendance tables

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// GraphQL queries matching the deployed AppSync schema
const listFaceIndices = /* GraphQL */ `
  query ListFaceIndices {
    listFaceIndices {
      items {
        StudentID
        FaceID
        ImageID
        Name
        Date
        Time
        createdAt
        updatedAt
      }
    }
  }
`;

const listAttendances = /* GraphQL */ `
  query ListAttendances {
    listAttendances {
      items {
        id
        StudentID
        Date
        Image
        Name
        Time
        createdAt
        updatedAt
      }
    }
  }
`;

const createFaceIndex = /* GraphQL */ `
  mutation CreateFaceIndex($input: CreateFaceIndexInput!) {
    createFaceIndex(input: $input) {
      StudentID
      FaceID
      ImageID
      Name
      Date
      Time
      createdAt
      updatedAt
    }
  }
`;

const createAttendance = /* GraphQL */ `
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
      id
      StudentID
      Date
      Image
      Name
      Time
      createdAt
      updatedAt
    }
  }
`;

// Debug function to test GraphQL connection
export const testGraphQLConnection = async () => {
  try {
    console.log('Testing GraphQL connection...');
    const result = await client.graphql({ query: listFaceIndices });
    console.log('GraphQL connection successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('GraphQL connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Student operations (using FaceIndex table)
export const getAllStudents = async () => {
  try {
    console.log('Fetching all students from FaceIndex...');
    const result = await client.graphql({ query: listFaceIndices });
    console.log('Students fetched successfully:', result.data.listFaceIndices.items);
    
    // Transform FaceIndex items to student format
    const students = result.data.listFaceIndices.items.map(item => ({
      id: item.StudentID,
      name: item.Name,
      studentIDNumber: item.StudentID,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    console.log('Adding student to FaceIndex:', studentData);
    
    const inputData = {
      StudentID: studentData.studentIDNumber || studentData.StudentID || generateStudentID(),
      Name: studentData.name,
      Date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      Time: new Date().toTimeString().split(' ')[0], // HH:MM:SS format
      FaceID: `face_${Date.now()}`, // Generate placeholder FaceID
      ImageID: `img_${Date.now()}` // Generate placeholder ImageID
    };
    
    // Validate required fields
    if (!inputData.Name || !inputData.StudentID) {
      throw new Error('Name and StudentID are required');
    }
    
    const result = await client.graphql({
      query: createFaceIndex,
      variables: { input: inputData }
    });
    
    console.log('Student added successfully:', result.data.createFaceIndex);
    
    // Transform back to student format
    const faceIndexItem = result.data.createFaceIndex;
    return {
      id: faceIndexItem.StudentID,
      name: faceIndexItem.Name,
      studentIDNumber: faceIndexItem.StudentID,
      createdAt: faceIndexItem.createdAt,
      updatedAt: faceIndexItem.updatedAt
    };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Attendance operations (using Attendance table)
export const getAllAttendanceRecords = async () => {
  try {
    console.log('Fetching all attendance records...');
    const result = await client.graphql({ query: listAttendances });
    console.log('Attendance records fetched successfully:', result.data.listAttendances.items);
    
    // Transform attendance items to expected format
    const attendanceRecords = result.data.listAttendances.items.map(item => ({
      id: item.id,
      studentID: item.StudentID,
      timestamp: `${item.Date}T${item.Time}:00.000Z`, // Combine date and time
      status: 'PRESENT', // Default status since not in schema
      confidence: 0.95, // Default confidence
      name: item.Name,
      date: item.Date,
      time: item.Time,
      image: item.Image
    }));
    
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  try {
    console.log('Adding attendance record:', attendanceData);
    
    const inputData = {
      StudentID: attendanceData.studentID || attendanceData.StudentID,
      Name: attendanceData.name || attendanceData.Name || 'Unknown',
      Date: attendanceData.date || attendanceData.Date || new Date().toISOString().split('T')[0],
      Time: attendanceData.time || attendanceData.Time || new Date().toTimeString().split(' ')[0],
      Image: attendanceData.image || attendanceData.Image || `capture_${Date.now()}.jpg`
    };
    
    console.log('Mapped input data:', inputData);
    
    // Validate required fields for GraphQL schema
    if (!inputData.StudentID || !inputData.Name || !inputData.Date || !inputData.Time) {
      throw new Error('Missing required fields: StudentID, Name, Date, and Time are required');
    }
    
    const result = await client.graphql({
      query: createAttendance,
      variables: { input: inputData }
    });
    
    console.log('Attendance record added successfully:', result.data.createAttendance);
    
    // Transform back to expected format
    const attendanceItem = result.data.createAttendance;
    return {
      id: attendanceItem.id,
      studentID: attendanceItem.StudentID,
      timestamp: `${attendanceItem.Date}T${attendanceItem.Time}:00.000Z`,
      status: 'PRESENT',
      confidence: 0.95,
      name: attendanceItem.Name,
      date: attendanceItem.Date,
      time: attendanceItem.Time,
      image: attendanceItem.Image
    };
  } catch (error) {
    console.error('Error creating attendance record:', error);
    console.error('Failed input data:', attendanceData);
    throw error;
  }
};

// Helper function to generate student ID
const generateStudentID = () => {
  return 'STU' + Date.now().toString().slice(-6);
};