import React, { useState } from 'react';
import { Clock, Users, Calendar, AlertTriangle, Download, User, LogOut, ChevronDown, BellRing, Search } from 'lucide-react';

// Mock data for our static frontend
const mockAttendanceData = [
  { id: 1, name: 'John Smith', time: '08:32:15', date: '2025-05-07', status: 'Present', image: '/api/placeholder/50/50' },
  { id: 2, name: 'Maria Garcia', time: '08:45:22', date: '2025-05-07', status: 'Present', image: '/api/placeholder/50/50' },
  { id: 3, name: 'Ahmed Khan', time: '08:50:11', date: '2025-05-07', status: 'Present', image: '/api/placeholder/50/50' },
  { id: 4, name: 'Sarah Johnson', time: '09:05:44', date: '2025-05-07', status: 'Late', image: '/api/placeholder/50/50' },
  { id: 5, name: 'Li Wei', time: '09:15:30', date: '2025-05-07', status: 'Late', image: '/api/placeholder/50/50' },
  { id: 6, name: 'Olivia Brown', time: '08:30:05', date: '2025-05-07', status: 'Present', image: '/api/placeholder/50/50' },
  { id: 7, name: 'Carlos Mendez', time: '08:42:19', date: '2025-05-07', status: 'Present', image: '/api/placeholder/50/50' },
];

const mockAlerts = [
  { id: 1, message: 'Unrecognized person at entrance', time: '09:32:15', date: '2025-05-07', image: '/api/placeholder/50/50' },
  { id: 2, message: 'Unknown face detected at south gate', time: '08:15:22', date: '2025-05-07', image: '/api/placeholder/50/50' }
];

const mockChartData = [
  { name: 'Monday', present: 42, absent: 8, late: 5 },
  { name: 'Tuesday', present: 45, absent: 5, late: 5 },
  { name: 'Wednesday', present: 40, absent: 10, late: 5 },
  { name: 'Thursday', present: 48, absent: 2, late: 5 },
  { name: 'Friday', present: 38, absent: 12, late: 5 },
];

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Header />
        
        {/* Content area */}
        <main className="p-6">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'attendance' && <AttendanceContent />}
          {activeTab === 'alerts' && <AlertsContent />}
          {activeTab === 'reports' && <ReportsContent />}
          {activeTab === 'admin' && <AdminContent />}
        </main>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-blue-800 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">Smart Attendance</h1>
      </div>
      <nav className="mt-6">
        <SidebarLink 
          icon={<Users />} 
          title="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <SidebarLink 
          icon={<Clock />} 
          title="Attendance" 
          active={activeTab === 'attendance'} 
          onClick={() => setActiveTab('attendance')} 
        />
        <SidebarLink 
          icon={<AlertTriangle />} 
          title="Alerts" 
          active={activeTab === 'alerts'} 
          onClick={() => setActiveTab('alerts')} 
        />
        <SidebarLink 
          icon={<Calendar />} 
          title="Reports" 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
        />
        <SidebarLink 
          icon={<User />} 
          title="Admin Panel" 
          active={activeTab === 'admin'} 
          onClick={() => setActiveTab('admin')} 
        />
      </nav>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ icon, title, active, onClick }) => {
  return (
    <a 
      href="#" 
      className={`flex items-center px-6 py-3 hover:bg-blue-700 ${active ? 'bg-blue-700' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span className="mr-3">{icon}</span>
      <span>{title}</span>
    </a>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Face Recognition Attendance System</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <BellRing className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-center">
            <img src="/api/placeholder/32/32" alt="User" className="h-8 w-8 rounded-full" />
            <span className="ml-2 font-medium">Admin User</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard Content Component
const DashboardContent = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Students" value="55" icon={<Users className="h-8 w-8 text-blue-500" />} bgColor="bg-blue-100" />
        <StatCard title="Present Today" value="48" icon={<Clock className="h-8 w-8 text-green-500" />} bgColor="bg-green-100" />
        <StatCard title="Absent Today" value="7" icon={<AlertTriangle className="h-8 w-8 text-red-500" />} bgColor="bg-red-100" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Chart</h3>
          <AttendanceChart data={mockChartData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Attendances</h3>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">View All</a>
          </div>
          <AttendanceList attendances={mockAttendanceData.slice(0, 5)} compact={true} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">View All</a>
          </div>
          <AlertsList alerts={mockAlerts} />
        </div>
      </div>
    </div>
  );
};

// Attendance Content Component
const AttendanceContent = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Records</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <select className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 days</option>
            <option>This month</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <AttendanceList attendances={mockAttendanceData} compact={false} />
        </div>
      </div>
    </div>
  );
};

// Alerts Content Component
const AlertsContent = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Alerts</h2>
        <div className="flex space-x-4">
          <select className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Alerts</option>
            <option>Unrecognized Faces</option>
            <option>Multiple Attendance</option>
            <option>System Issues</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <AlertsList alerts={[
            ...mockAlerts,
            { id: 3, message: 'System camera 2 disconnected', time: '07:22:45', date: '2025-05-07', image: null },
            { id: 4, message: 'Unrecognized person at west entrance', time: '10:05:33', date: '2025-05-06', image: '/api/placeholder/50/50' },
          ]} />
        </div>
      </div>
    </div>
  );
};

// Reports Content Component
const ReportsContent = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Reports</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
          <AttendanceChart data={mockChartData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Rate</h3>
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full border-8 border-green-500 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-500">87%</p>
                <p className="text-gray-500">Overall Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard title="Daily Attendance" description="Complete daily attendance records" icon={<Calendar />} />
          <ReportCard title="Weekly Summary" description="Weekly attendance statistics" icon={<Calendar />} />
          <ReportCard title="Monthly Report" description="Monthly attendance trends" icon={<Calendar />} />
          <ReportCard title="Absence Report" description="Details of all absences" icon={<AlertTriangle />} />
          <ReportCard title="Late Arrivals" description="Analysis of late arrivals" icon={<Clock />} />
          <ReportCard title="Custom Report" description="Create a customized report" icon={<Download />} />
        </div>
      </div>
    </div>
  );
};

// Admin Content Component
const AdminContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Control Panel</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-4">
              <StatusItem label="Camera System" status="Online" statusColor="text-green-500" />
              <StatusItem label="Face Recognition Service" status="Online" statusColor="text-green-500" />
              <StatusItem label="Database Connection" status="Online" statusColor="text-green-500" />
              <StatusItem label="Alert System" status="Online" statusColor="text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recognition Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="75" 
                  className="w-full" 
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Less Strict</span>
                  <span>More Strict</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable Unknown Face Alerts</label>
                <div className="relative inline-block w-10 h-5">
                  <input type="checkbox" className="opacity-0 w-0 h-0" defaultChecked />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-green-500 rounded-full"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Auto-Generate Reports</label>
                <div className="relative inline-block w-10 h-5">
                  <input type="checkbox" className="opacity-0 w-0 h-0" defaultChecked />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Add New User
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Generate Report
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Backup Database
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                System Maintenance
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">System Information</h3>
            <div className="space-y-2">
              <InfoItem label="Version" value="v1.2.5" />
              <InfoItem label="Last Updated" value="May 5, 2025" />
              <InfoItem label="Storage" value="35% used" />
              <InfoItem label="Recognized Faces" value="55" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- Helper Components -----

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Attendance List Component
const AttendanceList = ({ attendances, compact }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {!compact && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            {!compact && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendances.map((attendance) => (
            <tr key={attendance.id}>
              {!compact && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.id}</td>}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={attendance.image} alt={attendance.name} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{attendance.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.time}</td>
              {!compact && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.date}</td>}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  attendance.status === 'Present' ? 'bg-green-100 text-green-800' : 
                  attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {attendance.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Alerts List Component
const AlertsList = ({ alerts }) => {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-4 border rounded-lg bg-red-50 border-red-200">
          {alert.image ? (
            <img src={alert.image} alt="Alert" className="h-12 w-12 rounded-full mr-4" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-red-500 mr-4" />
          )}
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-medium text-red-800">{alert.message}</p>
              <p className="text-sm text-gray-500">{alert.time}</p>
            </div>
            <p className="text-sm text-gray-500">{alert.date}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// Attendance Chart Component
const AttendanceChart = ({ data }) => {
  return (
    <div className="h-64">
      <div className="flex h-full items-end">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex justify-center space-x-1">
              <div 
                className="bg-green-500 w-5" 
                style={{ height: `${item.present}%` }}
                title={`Present: ${item.present}`}
              ></div>
              <div 
                className="bg-red-500 w-5" 
                style={{ height: `${item.absent}%` }}
                title={`Absent: ${item.absent}`}
              ></div>
              <div 
                className="bg-yellow-500 w-5" 
                style={{ height: `${item.late}%` }}
                title={`Late: ${item.late}`}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ title, description, icon }) => {
  return (
    <div className="border rounded-lg p-4 flex items-start hover:bg-blue-50 cursor-pointer">
      <div className="p-3 bg-blue-100 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, status, statusColor }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      <span className={`font-medium ${statusColor}`}>{status}</span>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

export default Dashboard;