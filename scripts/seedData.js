// src/utils/seedData.js - Updated for existing FaceIndex and Attendance tables

import { addStudent, addAttendanceRecord } from '../services/api';

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

// Main function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Add students to FaceIndex table
    console.log('Adding students to FaceIndex table...');
    const addedStudents = [];
    for (const studentData of sampleStudents) {
      try {
        const student = await addStudent(studentData);
        addedStudents.push(student);
        console.log(`Added student: ${student.name} (ID: ${student.studentIDNumber})`);
      } catch (error) {
        console.error(`Error adding student ${studentData.name}:`, error);
      }
    }
    
    // Add attendance records
    console.log('Adding attendance records...');
    let attendanceCount = 0;
    
    for (const student of addedStudents) {
      // Add 2-3 attendance records per student
      const numRecords = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numRecords; i++) {
        try {
          const daysAgo = Math.floor(Math.random() * 7);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          
          const hour = 8 + Math.floor(Math.random() * 3); // Between 8-10 AM
          const minute = Math.floor(Math.random() * 60);
          const second = Math.floor(Math.random() * 60);
          
          const attendanceData = {
            studentID: student.studentIDNumber,
            name: student.name,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
            image: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
          };
          
          await addAttendanceRecord(attendanceData);
          attendanceCount++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error adding attendance for ${student.name}:`, error);
          console.error('Attendance data that failed:', attendanceData);
          // Continue to next record instead of stopping
        }
      }
    }
    
    console.log('Database seeding completed successfully!');
    console.log(`Added ${addedStudents.length} students and ${attendanceCount} attendance records.`);
    
    return {
      students: addedStudents.length,
      attendanceRecords: attendanceCount,
      alerts: 0 // No alerts table in current schema
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Function to clear all data (use with caution!)
export const clearDatabase = async () => {
  console.log('Warning: clearDatabase function is not implemented for safety reasons.');
  console.log('To clear data, use the AWS Console or Amplify Admin UI.');
};

// Function to check if database has data
export const checkDatabaseStatus = async () => {
  try {
    const { getAllStudents, getAllAttendanceRecords } = await import('../services/api');
    
    const [students, attendance] = await Promise.all([
      getAllStudents(),
      getAllAttendanceRecords()
    ]);
    
    return {
      hasData: students.length > 0 || attendance.length > 0,
      counts: {
        students: students.length,
        attendance: attendance.length
      }
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return { hasData: false, counts: { students: 0, attendance: 0 } };
  }
};