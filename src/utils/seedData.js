// src/utils/seedData.js - Updated for minimal schema

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

// Main function to seed the database (minimal version)
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Add students (these will be stored in new Student table)
    console.log('Adding students...');
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
    
    // Note: No attendance records in minimal schema
    console.log('Attendance table not available in minimal schema - skipping attendance records');
    
    console.log('Database seeding completed successfully!');
    console.log(`Added ${addedStudents.length} students.`);
    
    return {
      students: addedStudents.length,
      attendanceRecords: 0 // No attendance table in minimal schema
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

// Function to check if database has data (minimal version)
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