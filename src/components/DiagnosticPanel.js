import React, { useState } from 'react';
import { testGraphQLConnection, addStudent } from '../services/api';
import { Amplify } from 'aws-amplify';
import { AlertTriangle, CheckCircle, Settings, Database } from 'lucide-react';

const DiagnosticPanel = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, { test, success, message, details, timestamp: new Date() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Check Amplify Configuration
      addTestResult('Amplify Config', true, 'Checking Amplify configuration...');
      
      try {
        const config = Amplify.getConfig();
        if (config.API?.GraphQL?.endpoint) {
          addTestResult('Amplify Config', true, 'Amplify configuration found', {
            endpoint: config.API.GraphQL.endpoint,
            region: config.API.GraphQL.region
          });
        } else {
          addTestResult('Amplify Config', false, 'GraphQL endpoint not found in configuration');
        }
      } catch (error) {
        addTestResult('Amplify Config', false, 'Error reading Amplify config', error.message);
      }

      // Test 2: Test GraphQL Connection
      addTestResult('GraphQL Connection', true, 'Testing GraphQL connection...');
      
      try {
        const connectionTest = await testGraphQLConnection();
        if (connectionTest.success) {
          addTestResult('GraphQL Connection', true, 'GraphQL connection successful');
        } else {
          addTestResult('GraphQL Connection', false, 'GraphQL connection failed', connectionTest.error);
        }
      } catch (error) {
        addTestResult('GraphQL Connection', false, 'GraphQL connection error', error.message);
      }

      // Test 3: Test Create Student
      addTestResult('Create Student', true, 'Testing student creation...');
      
      try {
        const testStudent = {
          name: 'Test Student ' + Date.now(),
          studentIDNumber: 'TEST' + Date.now()
        };
        
        const result = await addStudent(testStudent);
        console.log('Student creation result:', result); // Debug log
        
        // Check if we got a valid result with required fields
        if (result?.id && result?.name) {
          addTestResult('Create Student', true, 'Student created successfully', {
            id: result.id,
            name: result.name,
            studentIDNumber: result.studentIDNumber || 'N/A'
          });
        } else {
          // This shouldn't happen based on your result, but let's see
          addTestResult('Create Student', false, 'Student creation returned incomplete result', {
            hasId: !!result?.id,
            hasName: !!result?.name,
            result: result
          });
        }
      } catch (error) {
        addTestResult('Create Student', false, 'Student creation failed', error.message);
      }

      // Test 4: Check aws-exports
      addTestResult('AWS Exports', true, 'Checking aws-exports file...');
      
      try {
        const awsExports = await import('../aws-exports.js');
        if (awsExports.default) {
          addTestResult('AWS Exports', true, 'aws-exports.js found and loaded');
        } else {
          addTestResult('AWS Exports', false, 'aws-exports.js exists but has no default export');
        }
      } catch (error) {
        addTestResult('AWS Exports', false, 'aws-exports.js not found or invalid', error.message);
      }

    } catch (error) {
      addTestResult('General Error', false, 'Diagnostic run failed', error.message);
    }
    
    setIsRunning(false);
  };

  const copyLogs = () => {
    const logText = testResults.map(result => 
      `[${result.timestamp.toISOString()}] ${result.test}: ${result.success ? 'PASS' : 'FAIL'} - ${result.message}${result.details ? ` (${JSON.stringify(result.details)})` : ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
    alert('Diagnostic logs copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Settings className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">System Diagnostics</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-semibold text-yellow-800">Troubleshooting Mode</span>
          </div>
          <p className="text-yellow-700 mt-1">
            Run these diagnostics to identify why the database seeding isn't working.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Database className={`h-5 w-5 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </button>

          {testResults.length > 0 && (
            <button
              onClick={copyLogs}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Copy Logs
            </button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Diagnostic Results:</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.test}
                  </span>
                </div>
                <p className={`mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                {result.details && (
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
                <span className="text-xs text-gray-500">
                  {result.timestamp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Common Issues & Solutions:</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li><strong>AWS Exports Missing:</strong> Run `amplify push` to generate aws-exports.js</li>
            <li><strong>GraphQL Not Deployed:</strong> Check that your API is deployed with `amplify status`</li>
            <li><strong>Permission Issues:</strong> Ensure your API allows public access or configure authentication</li>
            <li><strong>Network Issues:</strong> Check your internet connection and AWS service status</li>
            <li><strong>Schema Issues:</strong> Verify your GraphQL schema matches the mutations being used</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Manual Commands to Try:</h4>
          <div className="space-y-2">
            <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
              amplify status
            </code>
            <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
              amplify push
            </code>
            <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
              amplify console api
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPanel;