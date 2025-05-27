import React, { useState } from 'react';
import { seedDatabase, checkDatabaseStatus } from '../utils/seedData';
import { 
  seedDatabaseImproved, 
  testAttendanceCreation, 
  validateDatabaseConnection 
} from '../utils/improvedSeedData';
import { checkGraphQLEndpoint } from '../services/enhancedApi';
import DiagnosticPanel from './DiagnosticPanel';
import ConnectionTest from './ConnectionTest';
import { Database, RefreshCw, CheckCircle, AlertCircle, Users, Clock, Settings, Wifi, Download, Upload, Search } from 'lucide-react';

const DatabaseAdmin = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [existingTablesInfo, setExistingTablesInfo] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('admin');
  
  // New state for enhanced testing
  const [validationResult, setValidationResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Original handlers
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedResult(null);
    
    try {
      const result = await seedDatabase();
      setSeedResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  // New enhanced handlers
  const handleValidateConnection = async () => {
    setIsValidating(true);
    setError(null);
    setValidationResult(null);
    console.log('🔍 Starting database connection validation...');
    
    try {
      const isValid = await validateDatabaseConnection();
      setValidationResult({ success: true, message: 'Database connection validated successfully!' });
      console.log('✅ Validation complete');
    } catch (error) {
      setValidationResult({ success: false, message: error.message });
      setError(`Validation failed: ${error.message}`);
      console.error('❌ Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestAttendance = async () => {
    setIsTesting(true);
    setError(null);
    setTestResult(null);
    console.log('🧪 Testing individual attendance creation...');
    
    try {
      const result = await testAttendanceCreation();
      setTestResult({ success: true, data: result });
      console.log('✅ Test attendance creation successful');
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      setError(`Test failed: ${error.message}`);
      console.error('❌ Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleEnhancedSeeding = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedResult(null);
    
    try {
      console.log('🚀 Starting enhanced database seeding...');
      const result = await seedDatabaseImproved();
      setSeedResult(result);
      console.log('🎉 Enhanced seeding completed successfully');
    } catch (error) {
      setError(error.message);
      console.error('❌ Enhanced seeding failed:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="inline h-5 w-5 mr-2" />
              Database Admin
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'diagnostics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="inline h-5 w-5 mr-2" />
              Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('connection')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'connection'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wifi className="inline h-5 w-5 mr-2" />
              Connection Test
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'admin' ? (
        <AdminContent 
          isSeeding={isSeeding}
          isChecking={isChecking}
          seedResult={seedResult}
          dbStatus={dbStatus}
          error={error}
          handleSeedDatabase={handleSeedDatabase}
          handleCheckStatus={handleCheckStatus}
          handleEnhancedSeeding={handleEnhancedSeeding}
          handleValidateConnection={handleValidateConnection}
          handleTestAttendance={handleTestAttendance}
          validationResult={validationResult}
          testResult={testResult}
          isValidating={isValidating}
          isTesting={isTesting}
        />
      ) : activeTab === 'diagnostics' ? (
        <DiagnosticPanel />
      ) : (
        <ConnectionTest />
      )}
    </div>
  );
};

// Enhanced Admin Content Component
const AdminContent = ({ 
  isSeeding, 
  isChecking, 
  seedResult, 
  dbStatus, 
  error, 
  handleSeedDatabase, 
  handleCheckStatus,
  handleEnhancedSeeding,
  handleValidateConnection,
  handleTestAttendance,
  validationResult,
  testResult,
  isValidating,
  isTesting
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Database Administration</h2>
      </div>

      <div className="space-y-6">
        {/* Enhanced Testing and Seeding Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2 mr-3">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Enhanced Database Seeding</h3>
              <p className="text-gray-600">Follow these steps in order for reliable data seeding</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1: Connection Validation */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</div>
                <h4 className="text-lg font-semibold text-blue-800">Validate Database Connection</h4>
              </div>
              <p className="text-blue-700 mb-3 text-sm">
                Test basic connectivity and permissions before seeding data. This creates test records to verify everything works.
              </p>
              
              <button
                onClick={handleValidateConnection}
                disabled={isValidating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Wifi className={`h-4 w-4 mr-2 ${isValidating ? 'animate-pulse' : ''}`} />
                {isValidating ? 'Validating Connection...' : 'Run Connection Test'}
              </button>
              
              {validationResult && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  validationResult.success 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-red-100 border-red-300 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {validationResult.success ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-medium">
                      {validationResult.success ? 'Connection Validated!' : 'Connection Failed'}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{validationResult.message}</p>
                  {validationResult.success && (
                    <div className="text-xs mt-2 bg-green-50 p-2 rounded border">
                      ✅ GraphQL endpoint accessible<br/>
                      ✅ Can create student records<br/>
                      ✅ Can create attendance records<br/>
                      Ready to proceed to Step 2!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Individual Test */}
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="flex items-center mb-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</div>
                <h4 className="text-lg font-semibold text-green-800">Test Single Attendance Record</h4>
              </div>
              <p className="text-green-700 mb-3 text-sm">
                Create one test attendance record to verify the process works correctly with proper timing and validation.
              </p>
              
              <button
                onClick={handleTestAttendance}
                disabled={isTesting || !validationResult?.success}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Clock className={`h-4 w-4 mr-2 ${isTesting ? 'animate-pulse' : ''}`} />
                {isTesting ? 'Testing Attendance...' : 'Run Single Test'}
              </button>
              
              {!validationResult?.success && (
                <p className="text-yellow-700 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please complete Step 1 first
                </p>
              )}
              
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-red-100 border-red-300 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? 'Test Successful!' : 'Test Failed'}
                    </span>
                  </div>
                  {testResult.success ? (
                    <div className="text-sm mt-1">
                      <p>✅ Test attendance record created successfully</p>
                      <div className="text-xs mt-2 bg-green-50 p-2 rounded border">
                        <strong>Record Details:</strong><br/>
                        ID: {testResult.data?.id}<br/>
                        Student: {testResult.data?.name}<br/>
                        Date: {testResult.data?.date}<br/>
                        Time: {testResult.data?.time}
                      </div>
                      <p className="text-green-600 font-medium mt-2">Ready to proceed to Step 3!</p>
                    </div>
                  ) : (
                    <p className="text-sm mt-1">{testResult.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Full Seeding */}
            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center mb-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</div>
                <h4 className="text-lg font-semibold text-purple-800">Enhanced Database Seeding</h4>
              </div>
              <p className="text-purple-700 mb-3 text-sm">
                Run the full seeding process with improved error handling, timing controls, and comprehensive logging.
              </p>
              
              <button
                onClick={handleEnhancedSeeding}
                disabled={isSeeding || !testResult?.success}
                className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
              >
                <Database className={`h-5 w-5 mr-2 ${isSeeding ? 'animate-pulse' : ''}`} />
                {isSeeding ? 'Running Enhanced Seeding...' : 'Run Full Seeding Process'}
              </button>
              
              {!testResult?.success && (
                <p className="text-yellow-700 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please complete Steps 1 and 2 first
                </p>
              )}

              {seedResult && (
                <div className="mt-4 p-4 bg-purple-100 border border-purple-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-800">Enhanced Seeding Completed!</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="font-medium">Students Added</div>
                      <div className="text-2xl font-bold text-purple-800">{seedResult.students}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="font-medium">Attendance Records</div>
                      <div className="text-2xl font-bold text-purple-800">{seedResult.attendanceRecords}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="font-medium">Errors</div>
                      <div className="text-2xl font-bold text-purple-800">{seedResult.errors?.length || 0}</div>
                    </div>
                  </div>
                  {seedResult.errors && seedResult.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium text-red-800 mb-2">Errors encountered:</div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {seedResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Status Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Database Status</h3>
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>
          </div>

          {dbStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-blue-600">{dbStatus.counts.students}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Attendance Records</p>
                    <p className="text-2xl font-bold text-green-600">{dbStatus.counts.attendance}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dbStatus && (
            <div className="mt-4 p-3 rounded-lg flex items-center">
              {dbStatus.hasData ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Database has data</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">Database is empty</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Legacy Seed Database Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Legacy Seeding (Backup Option)</h3>
          <p className="text-gray-600 mb-4 text-sm">
            This is the original seeding function. Use the enhanced version above for better reliability.
          </p>
          
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <Database className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-pulse' : ''}`} />
            {isSeeding ? 'Adding Sample Data...' : 'Run Legacy Seeding'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Error:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <div className="mt-3 text-sm text-red-600">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check the browser console (F12) for detailed error information</li>
                <li>Verify your internet connection is stable</li>
                <li>Try the Diagnostics tab for more detailed testing</li>
                <li>If connection issues persist, run <code className="bg-red-100 px-1 rounded">amplify push</code></li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How to Use This Tool</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>First Time Setup:</strong> Follow steps 1→2→3 in order for the most reliable experience.</p>
            <p><strong>Open Browser Console:</strong> Press F12 and click "Console" to see detailed progress information.</p>
            <p><strong>If Steps Fail:</strong> Use the Diagnostics tab to identify specific connection or permission issues.</p>
            <p><strong>Need Help?</strong> The console output will show exactly what went wrong and where.</p>
          </div>
        </div>
      </div>
    </div>
  );
};



export default DatabaseAdmin;