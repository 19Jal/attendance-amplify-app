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
      email
      enrollmentNumber
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
  { name: 'John Smith', email: 'john@example.com', enrollmentNumber: 'EN001' },
  { name: 'Maria Garcia', email: 'maria@example.com', enrollmentNumber: 'EN002' },
  { name: 'Ahmed Khan', email: 'ahmed@example.com', enrollmentNumber: 'EN003' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', enrollmentNumber: 'EN004' },
  { name: 'Li Wei', email: 'li@example.com', enrollmentNumber: 'EN005' }
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
      console.log(`Added student: ${result.data.createStudent.name}`);
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
        const locations = ['Main Entrance', 'South Gate', 'North Entrance'];

        await client.graphql({
          query: createAttendanceRecord,
          variables: {
            input: {
              studentID: student.id,
              timestamp: timestamp.toISOString(),
              status: statuses[Math.floor(Math.random() * statuses.length)],
              location: locations[Math.floor(Math.random() * locations.length)],
              confidence: Math.random() * 0.3 + 0.7
            }
          }
        });
      }
    }

    // Add alerts
    console.log('Adding alerts...');
    const alertData = [
      {
        message: 'Unrecognized person at entrance',
        alertType: 'UNKNOWN_FACE',
        location: 'Main Entrance'
      },
      {
        message: 'System camera disconnected',
        alertType: 'SYSTEM_ERROR',
        location: 'South Gate'
      }
    ];

    for (const alert of alertData) {
      await client.graphql({
        query: createAlert,
        variables: {
          input: {
            ...alert,
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        }
      });
      console.log(`Added alert: ${alert.message}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();