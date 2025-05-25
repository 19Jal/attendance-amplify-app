import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllAttendanceRecords, getAllAlerts } from '../services/api';
import { BellRing, Clock, Users, Calendar, AlertTriangle, Download, Search, ChevronRight, CheckCircle, X } from 'lucide-react';

// Mobile-optimized Avatar Component
const Avatar = ({ name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div 
      className="flex items-center justify-center rounded-full text-white font-medium flex-shrink-0"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: colors[colorIndex],
        fontSize: `${size / 2.5}px`
      }}
    >
      {initials}
    </div>
  );
};

// Data transformation functions
const transformAttendanceData = (attendanceRecords, students) => {
  return attendanceRecords.map(record => {
    const student = students.find(s => s.id === record.studentID);
    const timestamp = new Date(record.timestamp);
    
    return {
      id: record.id,
      name: student ? student.name : 'Unknown Student',
      studentIDNumber: student ? student.studentIDNumber : 'N/A',
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      status: record.status === 'PRESENT' ? 'Present' : 
              record.status === 'LATE' ? 'Late' : 'Absent',
      confidence: record.confidence,
      studentId: record.studentID
    };
  });
};

const transformAlertsData = (alerts) => {
  return alerts.map(alert => {
    const timestamp = new Date(alert.timestamp);
    
    return {
      id: alert.id,
      message: alert.message,
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      alertType: alert.alertType,
      acknowledged: alert.acknowledged,
      imageUrl: alert.imageUrl
    };
  });
};

// Generate chart data from attendance records
const generateChartData = (attendanceRecords, students) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const chartData = [];
  
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toLocaleDateString('en-US'),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayIndex: date.getDay()
    });
  }

  const weekdays = last7Days.filter(day => day.dayIndex >= 1 && day.dayIndex <= 5);

  weekdays.forEach(dayInfo => {
    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp).toLocaleDateString('en-US');
      return recordDate === dayInfo.date;
    });

    const presentStudents = new Set();
    const lateStudents = new Set();
    const absentStudents = new Set();

    dayAttendance.forEach(record => {
      if (record.status === 'PRESENT') {
        presentStudents.add(record.studentID);
      } else if (record.status === 'LATE') {
        lateStudents.add(record.studentID);
      } else if (record.status === 'ABSENT') {
        absentStudents.add(record.studentID);
      }
    });

    const totalStudents = students.length;
    const studentsWithRecords = new Set([...presentStudents, ...lateStudents, ...absentStudents]);
    const actualAbsent = totalStudents - studentsWithRecords.size + absentStudents.size;

    chartData.push({
      name: dayInfo.dayName,
      present: presentStudents.size,
      absent: Math.max(0, actualAbsent),
      late: lateStudents.size
    });
  });

  if (chartData.length < 5) {
    const remainingDays = 5 - chartData.length;
    for (let i = 0; i < remainingDays; i++) {
      chartData.push({
        name: days[chartData.length],
        present: Math.floor(Math.random() * 50) + 30,
        absent: Math.floor(Math.random() * 10) + 2,
        late: Math.floor(Math.random() * 8) + 2
      });
    }
  }

  return chartData.slice(0, 5);
};

// Mobile-optimized Stat Card
const StatCard = ({ title, value, icon, bgColor, textColor = "text-gray-800" }) => {
  return (
    <div className={`${bgColor} rounded-xl p-3 sm:p-4 shadow-sm w-full min-w-0`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${textColor} truncate`}>{value}</p>
        </div>
        <div className="ml-2 sm:ml-3 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized Attendance Card
const AttendanceCard = ({ attendance }) => {
  const statusColor = 
    attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
    attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 w-full max-w-full">
      <div className="flex items-center justify-between mb-2 min-w-0">
        <div className="flex items-center min-w-0 flex-1">
          <Avatar name={attendance.name} size={36} />
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{attendance.name}</p>
            <p className="text-xs text-gray-500 truncate">ID: {attendance.studentIDNumber}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusColor}`}>
          {attendance.status}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 min-w-0">
        <span className="truncate">Time: {attendance.time}</span>
        <span className="flex-shrink-0">Confidence: {Math.round(attendance.confidence * 100)}%</span>
      </div>
    </div>
  );
};

// Mobile-optimized Chart Component
const AttendanceChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.present, item.absent, item.late)));
  
  if (!data || data.length === 0 || maxValue === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    );
  }

  // Generate y-axis labels
  const yAxisLabels = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    yAxisLabels.push(Math.round((maxValue / steps) * (steps - i)));
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex justify-center mb-3 flex-wrap gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-xs">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-xs">Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className="text-xs">Late</span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <div className="flex w-full h-full">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between pr-2 py-6" style={{ width: '40px' }}>
            {yAxisLabels.map((label, index) => (
              <div key={index} className="flex items-center justify-end">
                <span className="text-xs text-gray-500 text-right">
                  {label}
                </span>
                <div className="w-1 h-px bg-gray-300 ml-1"></div>
              </div>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Bars container */}
            <div className="flex-1 flex items-end justify-between pb-2">
              {data.map((item, index) => {
                const barContainerHeight = 100; // Use percentage of available height
                const presentHeight = Math.max((item.present / maxValue) * barContainerHeight, item.present > 0 ? 5 : 0);
                const absentHeight = Math.max((item.absent / maxValue) * barContainerHeight, item.absent > 0 ? 5 : 0);
                const lateHeight = Math.max((item.late / maxValue) * barContainerHeight, item.late > 0 ? 5 : 0);
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 h-full">
                    <div className="flex justify-center items-end gap-0.5 mb-1 relative group flex-1">
                      {/* Present bar */}
                      <div 
                        className="bg-green-500 rounded-t cursor-pointer hover:bg-green-600 transition-colors" 
                        style={{ 
                          height: `${presentHeight}%`,
                          width: '8px'
                        }}
                        title={`Present: ${item.present}`}
                      />
                      {/* Absent bar */}
                      <div 
                        className="bg-red-500 rounded-t cursor-pointer hover:bg-red-600 transition-colors" 
                        style={{ 
                          height: `${absentHeight}%`,
                          width: '8px'
                        }}
                        title={`Absent: ${item.absent}`}
                      />
                      {/* Late bar */}
                      <div 
                        className="bg-yellow-500 rounded-t cursor-pointer hover:bg-yellow-600 transition-colors" 
                        style={{ 
                          height: `${lateHeight}%`,
                          width: '8px'
                        }}
                        title={`Late: ${item.late}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Day labels */}
            <div className="flex justify-between flex-shrink-0 pt-1">
              {data.map((item, index) => (
                <div key={index} className="flex-1 text-center">
                  <span className="text-xs text-gray-600 truncate block">
                    {item.name.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Main Dashboard Component
const Dashboard = ({ activeTab = 'dashboard' }) => {
  // State for real data
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transformed data for display
  const [displayAttendance, setDisplayAttendance] = useState([]);
  const [displayAlerts, setDisplayAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [studentsData, attendanceData, alertsData] = await Promise.all([
          getAllStudents(),
          getAllAttendanceRecords(),
          getAllAlerts()
        ]);
        
        setStudents(studentsData || []);
        setAttendanceRecords(attendanceData || []);
        setAlerts(alertsData || []);

        const transformedAttendance = transformAttendanceData(attendanceData || [], studentsData || []);
        const transformedAlerts = transformAlertsData(alertsData || []);
        const generatedChartData = generateChartData(attendanceData || [], studentsData || []);

        setDisplayAttendance(transformedAttendance);
        setDisplayAlerts(transformedAlerts);
        setChartData(generatedChartData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        
        setStudents([]);
        setAttendanceRecords([]);
        setAlerts([]);
        setDisplayAttendance([]);
        setDisplayAlerts([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDashboardStats = (students, displayAttendance) => {
    const totalStudents = students.length;
    const today = new Date().toLocaleDateString('en-US');
    const todaysAttendance = displayAttendance.filter(record => record.date === today);
    
    const uniquePresentStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Present')
        .map(record => record.studentId)
    );
    const presentToday = uniquePresentStudents.size;
    
    const uniqueLateStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Late')
        .map(record => record.studentId)
    );
    const lateToday = uniqueLateStudents.size;
    
    const absentToday = totalStudents - presentToday - lateToday;
    
    return {
      totalStudents,
      presentToday,
      lateToday,
      absentToday: Math.max(0, absentToday)
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-full">
        {activeTab === 'dashboard' && (
          <DashboardContent 
            students={students}
            displayAttendance={displayAttendance}
            displayAlerts={displayAlerts}
            chartData={chartData}
            calculateDashboardStats={calculateDashboardStats}
          />
        )}
        {activeTab === 'attendance' && <AttendanceContent displayAttendance={displayAttendance} />}
        {activeTab === 'alerts' && <AlertsContent displayAlerts={displayAlerts} />}
        {activeTab === 'reports' && <ReportsContent chartData={chartData} />}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ students, displayAttendance, displayAlerts, chartData, calculateDashboardStats }) => {
  const stats = calculateDashboardStats(students, displayAttendance);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />} 
          bgColor="bg-blue-100" 
        />
        <StatCard 
          title="Present Today" 
          value={stats.presentToday.toString()} 
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />} 
          bgColor="bg-green-100" 
        />
        <StatCard 
          title="Late Today" 
          value={stats.lateToday.toString()} 
          icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />} 
          bgColor="bg-yellow-100" 
        />
        <StatCard 
          title="Absent Today" 
          value={stats.absentToday.toString()} 
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />} 
          bgColor="bg-red-100" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
          <h3 className="text-base md:text-lg font-semibold mb-4">Attendance Chart</h3>
          <div className="flex-1 relative">
            <AttendanceChart data={chartData} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Attendances</h3>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
          </div>
          {displayAttendance.length > 0 ? (
            <div className="space-y-3 w-full">
              {displayAttendance.slice(0, 3).map((attendance) => (
                <AttendanceCard key={attendance.id} attendance={attendance} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No attendance records found
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Alerts</h3>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
          </div>
          {displayAlerts.length > 0 ? (
            <AlertsList alerts={displayAlerts.slice(0, 3)} />
          ) : (
            <div className="text-gray-500 text-center py-8">
              No alerts found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Attendance Content Component
const AttendanceContent = ({ displayAttendance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAttendance = displayAttendance.filter(attendance =>
    attendance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.studentIDNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Records</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="p-4 md:p-6">
          {filteredAttendance.length > 0 ? (
            <div className="space-y-3">
              {filteredAttendance.map((attendance) => (
                <AttendanceCard key={attendance.id} attendance={attendance} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
              <p>No attendance records found. Records will appear here once students check in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alerts Content Component
const AlertsContent = ({ displayAlerts }) => {
  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Unknown Face Alerts</h2>
        <div className="text-sm text-gray-600">
          All alerts are for unrecognized faces detected in the classroom
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="p-4 md:p-6">
          {displayAlerts.length > 0 ? (
            <AlertsList alerts={displayAlerts} />
          ) : (
            <div className="text-gray-500 text-center py-12">
              <BellRing size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Alerts</h3>
              <p>No unknown face alerts found. This is good news!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reports Content Component
const ReportsContent = ({ chartData }) => {
  const reports = [
    { title: 'Daily Attendance', description: 'Complete daily records', icon: Calendar },
    { title: 'Weekly Summary', description: 'Weekly statistics', icon: Calendar },
    { title: 'Monthly Report', description: 'Monthly trends', icon: Calendar },
    { title: 'Absence Report', description: 'Details of absences', icon: AlertTriangle },
    { title: 'Late Arrivals', description: 'Analysis of late arrivals', icon: Clock },
    { title: 'Custom Report', description: 'Create customized report', icon: Download }
  ];

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Reports</h2>
        <div>
          <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
          <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Attendance</h3>
          <AttendanceChart data={chartData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Attendance Rate</h3>
          <div className="flex justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-green-500 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-green-500">87%</p>
                <p className="text-gray-500">Overall Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full">
        <h3 className="text-base md:text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => (
            <ReportCard key={index} title={report.title} description={report.description} icon={<report.icon />} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Alerts List Component
const AlertsList = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No alerts to display
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 w-full">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-3 md:p-4 border rounded-lg bg-red-50 border-red-200 w-full">
          <AlertTriangle className="h-8 w-8 md:h-12 md:w-12 text-red-500 mr-3 md:mr-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:justify-between">
              <p className="font-medium text-red-800 text-sm md:text-base truncate">{alert.message}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-0 flex-shrink-0">{alert.time}</p>
            </div>
            <p className="text-xs md:text-sm text-gray-500">{alert.date}</p>
            <div className="flex items-center mt-2">
              {alert.acknowledged ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Acknowledged
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  Unacknowledged
                </span>
              )}
            </div>
          </div>
          <button className="ml-2 text-gray-400 hover:text-gray-500 flex-shrink-0">
            <span className="sr-only">Dismiss</span>
            <X size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Report Card Component
const ReportCard = ({ title, description, icon }) => {
  return (
    <div className="border rounded-lg p-3 md:p-4 flex items-start hover:bg-blue-50 cursor-pointer w-full">
      <div className="p-2 md:p-3 bg-blue-100 rounded-lg mr-3 md:mr-4 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm md:text-base font-medium truncate">{title}</h4>
        <p className="text-xs md:text-sm text-gray-600 truncate">{description}</p>
      </div>
    </div>
  );
};

export default Dashboard;