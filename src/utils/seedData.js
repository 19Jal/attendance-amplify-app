import { addStudent, addAttendanceRecord, addAlert } from '../services/api';

export const seedDatabase = async () => {
  try {
    // Add sample students
    const students = [
      { name: 'John Smith', email: 'john@example.com', enrollmentNumber: 'EN001' },
      { name: 'Maria Garcia', email: 'maria@example.com', enrollmentNumber: 'EN002' },
      { name: 'Ahmed Khan', email: 'ahmed@example.com', enrollmentNumber: 'EN003' },
    ];

    const studentRecords = [];
    for (const student of students) {
      const record = await addStudent(student);
      studentRecords.push(record);
    }

    // Add sample attendance records
    for (const student of studentRecords) {
      await addAttendanceRecord({
        studentID: student.id,
        timestamp: new Date().toISOString(),
        status: 'PRESENT',
        location: 'Main Entrance',
        confidence: 0.95
      });
    }

    // Add sample alerts
    await addAlert({
      message: 'Unrecognized person at entrance',
      timestamp: new Date().toISOString(),
      alertType: 'UNKNOWN_FACE',
      location: 'Main Entrance',
      acknowledged: false
    });

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};