import { addStudent, addAttendanceRecord, addAlert } from '../services/api';

// Sample student data
const sampleStudents = [
  { name: 'John Smith', email: 'john@example.com', enrollmentNumber: 'EN001' },
  { name: 'Maria Garcia', email: 'maria@example.com', enrollmentNumber: 'EN002' },
  { name: 'Ahmed Khan', email: 'ahmed@example.com', enrollmentNumber: 'EN003' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', enrollmentNumber: 'EN004' },
  { name: 'Li Wei', email: 'li@example.com', enrollmentNumber: 'EN005' },
  { name: 'Olivia Brown', email: 'olivia@example.com', enrollmentNumber: 'EN006' },
  { name: 'Carlos Mendez', email: 'carlos@example.com', enrollmentNumber: 'EN007' }
];

// Generate random attendance records
const generateAttendanceRecords = (students) => {
  const records = [];
  const statuses = ['PRESENT', 'LATE', 'ABSENT'];
  const locations = ['Main Entrance', 'South Gate', 'North Entrance', 'Library Entrance'];
  
  students.forEach(student => {
    // Create 3-5 attendance records for each student over the past week
    const numRecords = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numRecords; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hours = Math.floor(Math.random() * 3) + 8; // Between 8-10 AM
      const minutes = Math.floor(Math.random() * 60);
      
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(hours, minutes, 0, 0);
      
      records.push({
        studentID: student.id,
        timestamp: timestamp.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        confidence: Math.random() * 0.3 + 0.7 // Between 0.7 and 1.0
      });
    }
  });
  
  return records;
};

// Generate sample alerts
const generateAlerts = () => {
  const alertMessages = [
    'Unrecognized person at entrance',
    'Unknown face detected at south gate',
    'System camera 2 disconnected',
    'Multiple faces detected for same person',
    'Low confidence detection at main entrance'
  ];
  
  const alertTypes = ['UNKNOWN_FACE', 'SYSTEM_ERROR', 'MULTIPLE_DETECTION'];
  const locations = ['Main Entrance', 'South Gate', 'North Entrance', 'Library Entrance'];
  
  const alerts = [];
  
  // Generate 5-8 alerts over the past few days
  const numAlerts = Math.floor(Math.random() * 4) + 5;
  
  for (let i = 0; i < numAlerts; i++) {
    const daysAgo = Math.floor(Math.random() * 3);
    const hours = Math.floor(Math.random() * 12) + 8; // Between 8 AM - 8 PM
    const minutes = Math.floor(Math.random() * 60);
    
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(hours, minutes, 0, 0);
    
    alerts.push({
      message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
      timestamp: timestamp.toISOString(),
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      acknowledged: Math.random() > 0.5 // Random acknowledged status
    });
  }
  
  return alerts;
};

// Main function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Step 1: Add students
    console.log('Adding students...');
    const addedStudents = [];
    for (const studentData of sampleStudents) {
      try {
        const student = await addStudent(studentData);
        addedStudents.push(student);
        console.log(`Added student: ${student.name}`);
      } catch (error) {
        console.error(`Error adding student ${studentData.name}:`, error);
      }
    }
    
    // Wait a bit to ensure students are saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Add attendance records
    console.log('Adding attendance records...');
    const attendanceRecords = generateAttendanceRecords(addedStudents);
    for (const record of attendanceRecords) {
      try {
        await addAttendanceRecord(record);
        console.log(`Added attendance record for student ${record.studentID}`);
      } catch (error) {
        console.error('Error adding attendance record:', error);
      }
    }
    
    // Step 3: Add alerts
    console.log('Adding alerts...');
    const alerts = generateAlerts();
    for (const alert of alerts) {
      try {
        await addAlert(alert);
        console.log(`Added alert: ${alert.message}`);
      } catch (error) {
        console.error('Error adding alert:', error);
      }
    }
    
    console.log('Database seeding completed successfully!');
    console.log(`Added ${addedStudents.length} students, ${attendanceRecords.length} attendance records, and ${alerts.length} alerts.`);
    
    return {
      students: addedStudents.length,
      attendanceRecords: attendanceRecords.length,
      alerts: alerts.length
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
    const { getAllStudents, getAllAttendanceRecords, getAllAlerts } = await import('../services/api');
    
    const [students, attendance, alerts] = await Promise.all([
      getAllStudents(),
      getAllAttendanceRecords(),
      getAllAlerts()
    ]);
    
    return {
      hasData: students.length > 0 || attendance.length > 0 || alerts.length > 0,
      counts: {
        students: students.length,
        attendance: attendance.length,
        alerts: alerts.length
      }
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return { hasData: false, counts: { students: 0, attendance: 0, alerts: 0 } };
  }
};