/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFaceIndex = /* GraphQL */ `
  query GetFaceIndex($StudentID: String!) {
    getFaceIndex(StudentID: $StudentID) {
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
export const listFaceIndices = /* GraphQL */ `
  query ListFaceIndices(
    $StudentID: String
    $filter: ModelFaceIndexFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFaceIndices(
      StudentID: $StudentID
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAttendance = /* GraphQL */ `
  query GetAttendance($id: ID!) {
    getAttendance(id: $id) {
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
export const listAttendances = /* GraphQL */ `
  query ListAttendances(
    $filter: ModelAttendanceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAttendances(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        StudentID
        Date
        Image
        Name
        Time
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const attendancesByStudentID = /* GraphQL */ `
  query AttendancesByStudentID(
    $StudentID: String!
    $sortDirection: ModelSortDirection
    $filter: ModelAttendanceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    attendancesByStudentID(
      StudentID: $StudentID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        StudentID
        Date
        Image
        Name
        Time
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
