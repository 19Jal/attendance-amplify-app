/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateFaceIndex = /* GraphQL */ `
  subscription OnCreateFaceIndex(
    $filter: ModelSubscriptionFaceIndexFilterInput
  ) {
    onCreateFaceIndex(filter: $filter) {
      StudentID
      FaceID
      ImageID
      Name
      Date
      Time
      attendanceRecords {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateFaceIndex = /* GraphQL */ `
  subscription OnUpdateFaceIndex(
    $filter: ModelSubscriptionFaceIndexFilterInput
  ) {
    onUpdateFaceIndex(filter: $filter) {
      StudentID
      FaceID
      ImageID
      Name
      Date
      Time
      attendanceRecords {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteFaceIndex = /* GraphQL */ `
  subscription OnDeleteFaceIndex(
    $filter: ModelSubscriptionFaceIndexFilterInput
  ) {
    onDeleteFaceIndex(filter: $filter) {
      StudentID
      FaceID
      ImageID
      Name
      Date
      Time
      attendanceRecords {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateAttendance = /* GraphQL */ `
  subscription OnCreateAttendance(
    $filter: ModelSubscriptionAttendanceFilterInput
  ) {
    onCreateAttendance(filter: $filter) {
      id
      StudentID
      Date
      Image
      Name
      Time
      faceIndex {
        StudentID
        FaceID
        ImageID
        Name
        Date
        Time
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateAttendance = /* GraphQL */ `
  subscription OnUpdateAttendance(
    $filter: ModelSubscriptionAttendanceFilterInput
  ) {
    onUpdateAttendance(filter: $filter) {
      id
      StudentID
      Date
      Image
      Name
      Time
      faceIndex {
        StudentID
        FaceID
        ImageID
        Name
        Date
        Time
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteAttendance = /* GraphQL */ `
  subscription OnDeleteAttendance(
    $filter: ModelSubscriptionAttendanceFilterInput
  ) {
    onDeleteAttendance(filter: $filter) {
      id
      StudentID
      Date
      Image
      Name
      Time
      faceIndex {
        StudentID
        FaceID
        ImageID
        Name
        Date
        Time
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
