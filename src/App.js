import React from 'react';
// import './App.css'; 
import Dashboard from './components/Dashboard';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

function App() {
  return (
    // Remove any wrapper divs with their own styles
    <Dashboard />
  );
}

export default App;