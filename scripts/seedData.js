// Simple Node.js script to seed the database
// Run this script with: node scripts/seedData.js

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../src/aws-exports.js';

// Configure Amplify
Amplify.configure(awsconfig);

const client = generateClient();

// GraphQL mutations
const createStudent = `
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id
      name
      studentIDNumber
    }
  }
`;

const createAttendanceRecord = `
  mutation CreateAttendanceRecord($input: CreateAttendanceRecordInput!) {
    createAttendanceRecord(input: $input) {
      id
      studentID
      timestamp
      status
    }
  }
`;

const createAlert = `
  mutation CreateAlert($input: CreateAlertInput!) {
    createAlert(input: $input) {
      id
      message
      timestamp
      alertType
    }
  }
`;

// Sample data
const sampleStudents = [
  { name: 'John Smith', studentIDNumber: 'STU001' },
  { name: 'Maria Garcia', studentIDNumber: 'STU002' },
  { name: 'Ahmed Khan', studentIDNumber: 'STU003' },
  { name: 'Sarah Johnson', studentIDNumber: 'STU004' },
  { name: 'Li Wei', studentIDNumber: 'STU005' },
  { name: 'Olivia Brown', studentIDNumber: 'STU006' },
  { name: 'Carlos Mendez', studentIDNumber: 'STU007' },
  { name: 'Emma Wilson', studentIDNumber: 'STU008' }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Add students
    console.log('Adding students...');
    const addedStudents = [];
    for (const studentData of sampleStudents) {
      const result = await client.graphql({
        query: createStudent,
        variables: { input: studentData }
      });
      addedStudents.push(result.data.createStudent);
      console.log(`Added student: ${result.data.createStudent.name} (ID: ${result.data.createStudent.studentIDNumber})`);
    }

    // Add attendance records
    console.log('Adding attendance records...');
    for (const student of addedStudents) {
      // Add 2-3 attendance records per student
      const numRecords = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numRecords; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));

        const statuses = ['PRESENT', 'LATE'];

        await client.graphql({
          query: createAttendanceRecord,
          variables: {
            input: {
              studentID: student.id,
              timestamp: timestamp.toISOString(),
              status: statuses[Math.floor(Math.random() * statuses.length)],
              confidence: Math.random() * 0.3 + 0.7
            }
          }
        });
      }
    }

    // Add unknown face alerts
    console.log('Adding unknown face alerts...');
    const alertMessages = [
      'Unknown person detected in classroom',
      'Unrecognized face detected during attendance',
      'Unknown individual entered classroom',
      'Face not recognized in student database',
      'Unfamiliar person detected'
    ];

    for (let i = 0; i < alertMessages.length; i++) {
      const daysAgo = Math.floor(Math.random() * 2);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

      await client.graphql({
        query: createAlert,
        variables: {
          input: {
            message: alertMessages[i],
            timestamp: timestamp.toISOString(),
            alertType: 'UNKNOWN_FACE',
            acknowledged: false
          }
        }
      });
      console.log(`Added alert: ${alertMessages[i]}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();