// src/services/enhancedApi.js - Enhanced API with better debugging for attendance issues

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// Enhanced GraphQL queries with better error handling
const listFaceIndices = /* GraphQL */ `
  query ListFaceIndices {
    listFaceIndices {
      items {
        StudentID
        FaceID
        ImageID
        Name
      }
    }
  }
`;

const listAttendances = /* GraphQL */ `
  query ListAttendances {
    listAttendances {
      items {
        StudentID
        Date
        Image
        Name
        Time
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
    }
  }
`;

const createAttendance = /* GraphQL */ `
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
        StudentID
        Date
        Image
        Name
        Time
    }
  }
`;

// Enhanced debug function with detailed logging
export const testGraphQLConnection = async () => {
  console.log('🔍 Testing GraphQL connection with detailed diagnostics...');
  
  try {
    console.log('📡 Sending listFaceIndices query...');
    const result = await client.graphql({ query: listFaceIndices });
    
    console.log('✅ GraphQL connection successful');
    console.log('📊 Query result structure:', {
      hasData: !!result.data,
      hasListFaceIndices: !!result.data?.listFaceIndices,
      hasItems: !!result.data?.listFaceIndices?.items,
      itemCount: result.data?.listFaceIndices?.items?.length || 0
    });
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ GraphQL connection failed with detailed error info:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    
    // Check for common error patterns
    if (error.message.includes('Network Error')) {
      console.error('🌐 This appears to be a network connectivity issue');
    } else if (error.message.includes('Unauthorized') || error.message.includes('403')) {
      console.error('🔐 This appears to be an authentication/authorization issue');
    } else if (error.message.includes('GraphQL error')) {
      console.error('📝 This appears to be a GraphQL schema or query issue');
    }
    
    return { success: false, error: error.message, details: error };
  }
};

// Enhanced student operations with better validation
export const getAllStudents = async () => {
  console.log('👥 Fetching all students from FaceIndex with enhanced logging...');
  
  try {
    const result = await client.graphql({ query: listFaceIndices });
    
    console.log('📊 Raw FaceIndex query result:', {
      success: !!result.data,
      itemCount: result.data?.listFaceIndices?.items?.length || 0,
      hasNextToken: !!result.data?.listFaceIndices?.nextToken
    });
    
    if (!result.data?.listFaceIndices?.items) {
      console.warn('⚠️ No items found in listFaceIndices result');
      return [];
    }
    
    // Transform FaceIndex items to student format with validation
    const students = result.data.listFaceIndices.items.map((item, index) => {
      console.log(`Processing student ${index + 1}:`, {
        StudentID: item.StudentID,
        Name: item.Name,
        hasRequiredFields: !!(item.StudentID && item.Name)
      });
      
      return {
        id: item.StudentID,
        name: item.Name,
        studentIDNumber: item.StudentID,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });
    
    console.log(`✅ Successfully transformed ${students.length} students`);
    return students;
    
  } catch (error) {
    console.error('❌ Error fetching students with details:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  console.log('➕ Adding student to FaceIndex with enhanced validation...');
  console.log('📝 Input student data:', JSON.stringify(studentData, null, 2));
  
  try {
    // Validate input data thoroughly
    const validationErrors = [];
    
    if (!studentData.name) {
      validationErrors.push('Missing required field: name');
    }
    
    if (!studentData.studentIDNumber && !studentData.StudentID) {
      validationErrors.push('Missing required field: studentIDNumber or StudentID');
    }
    
    if (validationErrors.length > 0) {
      throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
    }
    
    const inputData = {
      StudentID: studentData.studentIDNumber || studentData.StudentID || generateStudentID(),
      Name: studentData.name,
      Date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      Time: new Date().toTimeString().split(' ')[0], // HH:MM:SS format
      FaceID: `face_${Date.now()}`, // Generate placeholder FaceID
      ImageID: `img_${Date.now()}` // Generate placeholder ImageID
    };
    
    console.log('🔧 Prepared GraphQL input:', JSON.stringify(inputData, null, 2));
    
    const result = await client.graphql({
      query: createFaceIndex,
      variables: { input: inputData }
    });
    
    console.log('📡 GraphQL response received:', JSON.stringify(result, null, 2));
    
    if (!result.data?.createFaceIndex) {
      throw new Error('GraphQL response missing createFaceIndex data');
    }
    
    const faceIndexItem = result.data.createFaceIndex;
    
    // Validate the returned data
    if (!faceIndexItem.StudentID || !faceIndexItem.Name) {
      throw new Error('GraphQL response missing required fields (StudentID or Name)');
    }
    
    console.log('✅ Student created successfully:', {
      StudentID: faceIndexItem.StudentID,
      Name: faceIndexItem.Name,
      createdAt: faceIndexItem.createdAt
    });
    
    // Transform back to student format
    const transformedStudent = {
      id: faceIndexItem.StudentID,
      name: faceIndexItem.Name,
      studentIDNumber: faceIndexItem.StudentID,
      createdAt: faceIndexItem.createdAt,
      updatedAt: faceIndexItem.updatedAt
    };
    
    console.log('🔄 Transformed student object:', JSON.stringify(transformedStudent, null, 2));
    
    return transformedStudent;
    
  } catch (error) {
    console.error('❌ Error creating student with full details:');
    console.error('Input data that failed:', JSON.stringify(studentData, null, 2));
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Log GraphQL-specific error details if available
    if (error.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.errors, null, 2));
    }
    
    throw error;
  }
};

// Enhanced attendance operations with comprehensive debugging
export const getAllAttendanceRecords = async () => {
  console.log('📝 Fetching all attendance records with enhanced logging...');
  
  try {
    const result = await client.graphql({ query: listAttendances });
    
    console.log('📊 Raw Attendance query result:', {
      success: !!result.data,
      itemCount: result.data?.listAttendances?.items?.length || 0,
      hasNextToken: !!result.data?.listAttendances?.nextToken
    });
    
    if (!result.data?.listAttendances?.items) {
      console.warn('⚠️ No items found in listAttendances result');
      return [];
    }
    
    // Transform attendance items to expected format with validation
    const attendanceRecords = result.data.listAttendances.items.map((item, index) => {
      console.log(`Processing attendance record ${index + 1}:`, {
        id: item.id,
        StudentID: item.StudentID,
        Name: item.Name,
        Date: item.Date,
        Time: item.Time,
        hasRequiredFields: !!(item.id && item.StudentID && item.Name && item.Date && item.Time)
      });
      
      return {
        id: item.id,
        studentID: item.StudentID,
        timestamp: `${item.Date}T${item.Time}:00.000Z`, // Combine date and time
        status: 'PRESENT', // Default status since not in schema
        confidence: 0.95, // Default confidence
        name: item.Name,
        date: item.Date,
        time: item.Time,
        image: item.Image
      };
    });
    
    console.log(`✅ Successfully transformed ${attendanceRecords.length} attendance records`);
    return attendanceRecords;
    
  } catch (error) {
    console.error('❌ Error fetching attendance records:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return []; // Return empty array instead of throwing to prevent dashboard crashes
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  console.log('📝 Adding attendance record with comprehensive validation...');
  console.log('📥 Input attendance data:', JSON.stringify(attendanceData, null, 2));
  
  try {
    // Enhanced input validation
    const validationErrors = [];
    const requiredFields = ['studentID', 'name', 'date', 'time'];
    
    requiredFields.forEach(field => {
      const value = attendanceData[field] || attendanceData[field.charAt(0).toUpperCase() + field.slice(1)];
      if (!value) {
        validationErrors.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate date format (YYYY-MM-DD)
    const dateValue = attendanceData.date || attendanceData.Date;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateValue && !dateRegex.test(dateValue)) {
      validationErrors.push(`Invalid date format: ${dateValue}. Expected YYYY-MM-DD`);
    }
    
    // Validate time format (HH:MM:SS)
    const timeValue = attendanceData.time || attendanceData.Time;
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (timeValue && !timeRegex.test(timeValue)) {
      validationErrors.push(`Invalid time format: ${timeValue}. Expected HH:MM:SS`);
    }
    
    if (validationErrors.length > 0) {
      throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
    }
    
    const inputData = {
      StudentID: attendanceData.studentID || attendanceData.StudentID,
      Name: attendanceData.name || attendanceData.Name,
      Date: attendanceData.date || attendanceData.Date,
      Time: attendanceData.time || attendanceData.Time,
      Image: attendanceData.image || attendanceData.Image || `capture_${Date.now()}.jpg`
    };
    
    console.log('🔧 Prepared GraphQL input for attendance:', JSON.stringify(inputData, null, 2));
    
    // Double-check that all required fields are present
    const finalValidation = ['StudentID', 'Name', 'Date', 'Time'];
    const missingFields = finalValidation.filter(field => !inputData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Final validation failed - missing fields: ${missingFields.join(', ')}`);
    }
    
    console.log('📡 Sending createAttendance mutation...');
    
    const result = await client.graphql({
      query: createAttendance,
      variables: { input: inputData }
    });
    
    console.log('📡 GraphQL response received:', JSON.stringify(result, null, 2));
    
    if (!result.data?.createAttendance) {
      throw new Error('GraphQL response missing createAttendance data');
    }
    
    const attendanceItem = result.data.createAttendance;
    
    // Validate the returned data
    if (!attendanceItem.id || !attendanceItem.StudentID) {
      throw new Error('GraphQL response missing required fields (id or StudentID)');
    }
    
    console.log('✅ Attendance record created successfully:', {
      id: attendanceItem.id,
      StudentID: attendanceItem.StudentID,
      Name: attendanceItem.Name,
      Date: attendanceItem.Date,
      Time: attendanceItem.Time,
      createdAt: attendanceItem.createdAt
    });
    
    // Transform back to expected format
    const transformedAttendance = {
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
    
    console.log('🔄 Transformed attendance object:', JSON.stringify(transformedAttendance, null, 2));
    
    return transformedAttendance;
    
  } catch (error) {
    console.error('❌ Error creating attendance record with full debugging info:');
    console.error('Input data that failed:', JSON.stringify(attendanceData, null, 2));
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Log GraphQL-specific error details if available
    if (error.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.errors, null, 2));
      
      // Analyze common GraphQL errors
      error.errors.forEach((gqlError, index) => {
        console.error(`GraphQL Error ${index + 1}:`);
        console.error('  Message:', gqlError.message);
        console.error('  Path:', gqlError.path);
        console.error('  Extensions:', gqlError.extensions);
      });
    }
    
    // Log network-related error details if available
    if (error.networkError) {
      console.error('Network error details:', error.networkError);
    }
    
    throw error;
  }
};

// Helper function to generate student ID
const generateStudentID = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `STU${timestamp}`;
};

// Utility function to check if GraphQL endpoint is accessible
export const checkGraphQLEndpoint = async () => {
  console.log('🌐 Checking GraphQL endpoint accessibility...');
  
  try {
    const result = await testGraphQLConnection();
    
    if (result.success) {
      console.log('✅ GraphQL endpoint is accessible and responding correctly');
      return true;
    } else {
      console.log('❌ GraphQL endpoint is not accessible:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ GraphQL endpoint check failed:', error.message);
    return false;
  }
};