import { generateClient } from 'aws-amplify/api';
import { listStudents, getStudent, listAttendanceRecords, listAlerts } from '../graphql/queries';
import { createStudent, createAttendanceRecord, createAlert } from '../graphql/mutations';

const client = generateClient();

// Student operations
export const getAllStudents = async () => {
  try {
    const result = await client.graphql({ query: listStudents });
    return result.data.listStudents.items;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    const result = await client.graphql({
      query: createStudent,
      variables: { input: studentData }
    });
    return result.data.createStudent;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Attendance operations
export const getAllAttendanceRecords = async () => {
  try {
    const result = await client.graphql({ query: listAttendanceRecords });
    return result.data.listAttendanceRecords.items;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  try {
    const result = await client.graphql({
      query: createAttendanceRecord,
      variables: { input: attendanceData }
    });
    return result.data.createAttendanceRecord;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};

// Alert operations
export const getAllAlerts = async () => {
  try {
    const result = await client.graphql({ query: listAlerts });
    return result.data.listAlerts.items;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const addAlert = async (alertData) => {
  try {
    const result = await client.graphql({
      query: createAlert,
      variables: { input: alertData }
    });
    return result.data.createAlert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};