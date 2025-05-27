// src/utils/improvedSeedData.js - Enhanced seeding with better error handling and timing

import { addStudent, addAttendanceRecord, getAllStudents } from '../services/api';

// Sample student data
const sampleStudents = [
  { name: 'John Smith', studentIDNumber: 'STU001' },
  { name: 'Maria Garcia', studentIDNumber: 'STU002' },
  { name: 'Ahmed Khan', studentIDNumber: 'STU003' },
  { name: 'Sarah Johnson', studentIDNumber: 'STU004' },
  { name: 'Li Wei', studentIDNumber: 'STU005' },
  { name: 'Olivia Brown', studentIDNumber: 'STU006' },
  { name: 'Carlos Mendez', studentIDNumber: 'STU007' },
  { name: 'Emma Wilson', studentIDNumber: 'STU008' },
  { name: 'David Lee', studentIDNumber: 'STU009' },
  { name: 'Sophie Chen', studentIDNumber: 'STU010' }
];

// Utility function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to format date consistently
const formatDate = (date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Utility function to format time consistently
const formatTime = (date) => {
  return date.toTimeString().split(' ')[0]; // HH:MM:SS format
};

// Utility function to generate realistic attendance times
const generateAttendanceTime = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  // Set realistic class times (8 AM to 10 AM)
  const hour = 8 + Math.floor(Math.random() * 3);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  
  date.setHours(hour, minute, second, 0);
  
  return {
    date: formatDate(date),
    time: formatTime(date),
    fullDate: date
  };
};

// Enhanced function to add a single student with validation
const addStudentSafely = async (studentData, retryCount = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`Adding student ${studentData.name} (attempt ${attempt}/${retryCount})`);
      
      // Validate student data before sending
      if (!studentData.name || !studentData.studentIDNumber) {
        throw new Error(`Invalid student data: missing name or studentIDNumber`);
      }
      
      const result = await addStudent(studentData);
      
      // Validate the response
      if (!result || !result.id || !result.name) {
        throw new Error(`Invalid response from addStudent: ${JSON.stringify(result)}`);
      }
      
      console.log(`✓ Successfully added student: ${result.name} (ID: ${result.studentIDNumber})`);
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`✗ Attempt ${attempt} failed for student ${studentData.name}:`, error.message);
      
      if (attempt < retryCount) {
        console.log(`Waiting 2 seconds before retry...`);
        await delay(2000);
      }
    }
  }
  
  throw new Error(`Failed to add student ${studentData.name} after ${retryCount} attempts: ${lastError.message}`);
};

// Enhanced function to add attendance record with validation
const addAttendanceRecordSafely = async (attendanceData, retryCount = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`Adding attendance for ${attendanceData.name} (attempt ${attempt}/${retryCount})`);
      
      // Validate attendance data before sending
      const requiredFields = ['studentID', 'name', 'date', 'time'];
      for (const field of requiredFields) {
        if (!attendanceData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(attendanceData.date)) {
        throw new Error(`Invalid date format: ${attendanceData.date}. Expected YYYY-MM-DD`);
      }
      
      // Validate time format (HH:MM:SS)
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(attendanceData.time)) {
        throw new Error(`Invalid time format: ${attendanceData.time}. Expected HH:MM:SS`);
      }
      
      console.log(`Attendance data being sent:`, JSON.stringify(attendanceData, null, 2));
      
      const result = await addAttendanceRecord(attendanceData);
      
      // Validate the response
      if (!result || !result.id) {
        throw new Error(`Invalid response from addAttendanceRecord: ${JSON.stringify(result)}`);
      }
      
      console.log(`✓ Successfully added attendance: ${result.name} at ${result.date} ${result.time}`);
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`✗ Attempt ${attempt} failed for attendance ${attendanceData.name}:`, error.message);
      console.error('Failed attendance data:', JSON.stringify(attendanceData, null, 2));
      
      if (attempt < retryCount) {
        console.log(`Waiting 3 seconds before retry...`);
        await delay(3000);
      }
    }
  }
  
  throw new Error(`Failed to add attendance for ${attendanceData.name} after ${retryCount} attempts: ${lastError.message}`);
};

// Main enhanced seeding function
export const seedDatabaseImproved = async () => {
  console.log('🚀 Starting enhanced database seeding...');
  
  const results = {
    students: 0,
    attendanceRecords: 0,
    errors: []
  };
  
  try {
    // Step 1: Check existing data
    console.log('📊 Checking existing database content...');
    const existingStudents = await getAllStudents();
    console.log(`Found ${existingStudents.length} existing students`);
    
    // Step 2: Add students with proper error handling
    console.log('👥 Adding students to FaceIndex table...');
    const addedStudents = [];
    
    for (const studentData of sampleStudents) {
      try {
        // Check if student already exists
        const existingStudent = existingStudents.find(s => 
          s.studentIDNumber === studentData.studentIDNumber || 
          s.name === studentData.name
        );
        
        if (existingStudent) {
          console.log(`⚠️ Student ${studentData.name} already exists, skipping...`);
          addedStudents.push(existingStudent);
          continue;
        }
        
        const student = await addStudentSafely(studentData);
        addedStudents.push(student);
        results.students++;
        
        // Add delay between student creations to avoid rate limiting
        await delay(500);
        
      } catch (error) {
        console.error(`❌ Failed to add student ${studentData.name}:`, error.message);
        results.errors.push(`Student ${studentData.name}: ${error.message}`);
      }
    }
    
    console.log(`✅ Student phase complete: ${addedStudents.length} students ready for attendance records`);
    
    // Step 3: Wait for students to be fully committed
    console.log('⏳ Waiting 5 seconds for student records to be fully committed...');
    await delay(5000);
    
    // Step 4: Verify students are accessible
    console.log('🔍 Verifying student records are accessible...');
    const verifyStudents = await getAllStudents();
    console.log(`Verification: Found ${verifyStudents.length} total students in database`);
    
    // Step 5: Add attendance records with enhanced error handling
    console.log('📝 Adding attendance records...');
    
    for (const student of addedStudents) {
      try {
        // Generate 2-4 attendance records per student
        const numRecords = Math.floor(Math.random() * 3) + 2;
        console.log(`Generating ${numRecords} attendance records for ${student.name}...`);
        
        for (let i = 0; i < numRecords; i++) {
          try {
            const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
            const timeInfo = generateAttendanceTime(daysAgo);
            
            const attendanceData = {
              studentID: student.studentIDNumber, // Use the exact ID from the student record  
              name: student.name, // Use the exact name from the student record
              date: timeInfo.date,
              time: timeInfo.time,
              image: `capture_${student.studentIDNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
            };
            
            console.log(`Creating attendance record ${i + 1}/${numRecords} for ${student.name}:`);
            console.log(`  - Date: ${attendanceData.date}`);
            console.log(`  - Time: ${attendanceData.time}`);
            console.log(`  - StudentID: ${attendanceData.studentID}`);
            
            await addAttendanceRecordSafely(attendanceData);
            results.attendanceRecords++;
            
            // Add delay between attendance records to avoid overwhelming the API
            await delay(1000);
            
          } catch (error) {
            console.error(`❌ Failed to add attendance record for ${student.name}:`, error.message);
            results.errors.push(`Attendance for ${student.name}: ${error.message}`);
          }
        }
        
        // Add delay between students
        await delay(2000);
        
      } catch (error) {
        console.error(`❌ Failed to process attendance for student ${student.name}:`, error.message);
        results.errors.push(`Student ${student.name} attendance processing: ${error.message}`);
      }
    }
    
    // Step 6: Final summary
    console.log('🎉 Database seeding completed!');
    console.log(`📊 Final Results:`);
    console.log(`   - Students added: ${results.students}`);
    console.log(`   - Attendance records added: ${results.attendanceRecords}`);
    console.log(`   - Errors encountered: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors encountered:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 Critical error during database seeding:', error);
    results.errors.push(`Critical error: ${error.message}`);
    throw error;
  }
};

// Debug function to test attendance record creation individually
export const testAttendanceCreation = async (studentId = 'STU001', studentName = 'Test Student') => {
  console.log('🧪 Testing individual attendance record creation...');
  
  try {
    const timeInfo = generateAttendanceTime(0); // Today
    
    const testAttendanceData = {
      studentID: studentId,
      name: studentName,
      date: timeInfo.date,
      time: timeInfo.time,
      image: `test_capture_${Date.now()}.jpg`
    };
    
    console.log('Test attendance data:', JSON.stringify(testAttendanceData, null, 2));
    
    const result = await addAttendanceRecordSafely(testAttendanceData);
    console.log('✅ Test attendance creation successful:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test attendance creation failed:', error);
    throw error;
  }
};

// Function to validate database connectivity before seeding
export const validateDatabaseConnection = async () => {
  console.log('🔗 Validating database connection...');
  
  try {
    // Test reading students
    const students = await getAllStudents();
    console.log(`✅ Can read students: ${students.length} found`);
    
    // Test creating a test student
    const testStudent = {
      name: `Test Student ${Date.now()}`,
      studentIDNumber: `TEST${Date.now().toString().slice(-6)}`
    };
    
    const createdStudent = await addStudentSafely(testStudent);
    console.log('✅ Can create students:', createdStudent.name);
    
    // Test creating a test attendance record
    const testAttendance = await testAttendanceCreation(
      createdStudent.studentIDNumber, 
      createdStudent.name
    );
    console.log('✅ Can create attendance records:', testAttendance.id);
    
    console.log('🎉 Database connection validation successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection validation failed:', error.message);
    throw error;
  }
};