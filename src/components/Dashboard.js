import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllAttendanceRecords } from '../services/api';
import { Clock, Users, Calendar, AlertTriangle, Download, Search, ChevronRight, CheckCircle, X } from 'lucide-react';

// Helper function to generate weekly attendance data for the current week
const generateWeeklyAttendanceData = (attendanceRecords, totalStudents) => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekData = [];
  
  // Get current week's Monday
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Get Monday of current week
  
  // Generate data for each weekday
  weekdays.forEach((dayName, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    
    const dayData = {
      day: dayName,
      fullDate: date.toLocaleDateString('en-US'),
      present: 0,
      total: totalStudents,
      rate: 0
    };
    
    // Count unique students who were present on this day
    const presentStudents = new Set();
    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.timestamp).toLocaleDateString('en-US');
      if (recordDate === dayData.fullDate && record.status === 'Present') {
        presentStudents.add(record.studentId); // Use studentId to count unique students
      }
    });
    
    dayData.present = presentStudents.size;
    
    // Calculate attendance rate based on total students
    dayData.rate = totalStudents > 0 ? Math.round((dayData.present / totalStudents) * 100) : 0;
    
    weekData.push(dayData);
  });
  
  return weekData;
};

// Line Chart Component for Weekly Attendance
const WeeklyAttendanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No weekly data available
      </div>
    );
  }

  const maxRate = Math.max(...data.map(item => item.rate), 100);
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 50;

  const xStep = (chartWidth - padding * 2) / (data.length - 1);
  const yScale = (chartHeight - padding * 2) / 100; // Always scale to 100%

  // Generate path for the line
  const pathData = data.map((item, index) => {
    const x = padding + index * xStep;
    const y = chartHeight - padding - (item.rate * yScale);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-lg font-semibold mb-4">This Week's Attendance Trend</h4>
      <div className="flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = chartHeight - padding - (value * yScale);
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value}%
                </text>
              </g>
            );
          })}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + index * xStep;
            const y = chartHeight - padding - (item.rate * yScale);
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#3B82F6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-7 transition-all"
                >
                  <title>{`${item.day} (${item.fullDate}): ${item.rate}% (${item.present}/${item.total} students)`}</title>
                </circle>
                <text
                  x={x}
                  y={chartHeight - padding + 25}
                  textAnchor="middle"
                  className="text-sm fill-gray-600"
                >
                  {item.day.substring(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="font-medium">{item.day.substring(0, 3)}</div>
            <div className="text-blue-600 font-semibold">{item.rate}%</div>
            <div>({item.present}/{item.total} students)</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get relative date
const getRelativeDate = (dateString) => {
  const attendanceDate = new Date(dateString);
  const today = new Date();
  
  // Reset time to midnight for accurate day comparison
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const attendanceMidnight = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
  
  const diffTime = todayMidnight - attendanceMidnight;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays > 1) {
    return `${diffDays} days ago`;
  } else if (diffDays === -1) {
    return 'Tomorrow'; // Future date
  } else {
    return `In ${Math.abs(diffDays)} days`; // Future dates
  }
};

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
    // Handle both old (studentID) and new (faceIndexID) structures
    const studentId = record.studentID || record.faceIndexID;
    const student = students.find(s => s.id === studentId) || record.faceIndex;
    const timestamp = new Date(record.timestamp);
    
    return {
      id: record.id,
      name: student ? student.name : 'Unknown Student',
      studentIDNumber: student ? student.studentIDNumber : 'N/A',
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      timestamp: record.timestamp, // Preserve original timestamp for sorting
      status: record.status === 'PRESENT' ? 'Present' : 'Absent', // Removed LATE option
      confidence: record.confidence,
      studentId: studentId
    };
  });
};

// Generate chart data from attendance records (Present/Absent only)
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
    const absentStudents = new Set();

    dayAttendance.forEach(record => {
      if (record.status === 'PRESENT') {
        presentStudents.add(record.studentID);
      } else if (record.status === 'ABSENT') {
        absentStudents.add(record.studentID);
      }
    });

    const totalStudents = students.length;
    const studentsWithRecords = new Set([...presentStudents, ...absentStudents]);
    const actualAbsent = totalStudents - studentsWithRecords.size + absentStudents.size;

    chartData.push({
      name: dayInfo.dayName,
      present: presentStudents.size,
      absent: Math.max(0, actualAbsent)
    });
  });

  if (chartData.length < 5) {
    const remainingDays = 5 - chartData.length;
    for (let i = 0; i < remainingDays; i++) {
      chartData.push({
        name: days[chartData.length],
        present: Math.floor(Math.random() * 50) + 30,
        absent: Math.floor(Math.random() * 10) + 2
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

// Mobile-optimized Attendance Card - UPDATED to show relative date with time
const AttendanceCard = ({ attendance }) => {
  const statusColor = 
    attendance.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const relativeDate = getRelativeDate(attendance.date);

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
        <span className="truncate">{relativeDate} ({attendance.date}) at {attendance.time}</span>
      </div>
    </div>
  );
};

// Mobile-optimized Chart Component
const AttendanceChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.present, item.absent)));
  
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
          <div className="flex-1 flex flex-col h-full relative">
            {/* Grid lines - positioned to align with Y-axis labels */}
            <div className="absolute inset-0 py-6 pointer-events-none">
              <div className="h-full flex flex-col justify-between">
                {yAxisLabels.map((label, index) => (
                  <div key={index} className="w-full border-t border-gray-200" style={{ height: '1px' }}></div>
                ))}
              </div>
            </div>
            
            {/* Bars container */}
            <div className="flex-1 flex items-end justify-between pb-1 pt-6 relative z-10">
              {data.map((item, index) => {
                const barContainerHeight = 100; // Use percentage of available height
                const presentHeight = Math.max((item.present / maxValue) * barContainerHeight, 2); // Always show at least 2% height
                const absentHeight = Math.max((item.absent / maxValue) * barContainerHeight, item.absent > 0 ? 5 : 0);
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 h-full">
                    <div className="flex justify-center items-end gap-1 flex-1">
                      {/* Present bar */}
                      <div 
                        className="bg-green-500 rounded-t cursor-pointer hover:bg-green-600 transition-colors" 
                        style={{ 
                          height: `${presentHeight}%`,
                          width: '12px'
                        }}
                        title={`Present: ${item.present}`}
                      />
                      {/* Absent bar */}
                      <div 
                        className="bg-red-500 rounded-t cursor-pointer hover:bg-red-600 transition-colors" 
                        style={{ 
                          height: `${absentHeight}%`,
                          width: '12px'
                        }}
                        title={`Absent: ${item.absent}`}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transformed data for display
  const [displayAttendance, setDisplayAttendance] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [studentsData, attendanceData] = await Promise.all([
          getAllStudents(),
          getAllAttendanceRecords()
        ]);
        
        setStudents(studentsData || []);
        setAttendanceRecords(attendanceData || []);

        const transformedAttendance = transformAttendanceData(attendanceData || [], studentsData || []);
        const generatedChartData = generateChartData(attendanceData || [], studentsData || []);

        setDisplayAttendance(transformedAttendance);
        setChartData(generatedChartData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        
        setStudents([]);
        setAttendanceRecords([]);
        setDisplayAttendance([]);
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
    
    const absentToday = totalStudents - presentToday;
    
    return {
      totalStudents,
      presentToday,
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
            chartData={chartData}
            calculateDashboardStats={calculateDashboardStats}
          />
        )}
        {activeTab === 'attendance' && <AttendanceContent displayAttendance={displayAttendance} students={students} />}
        {activeTab === 'reports' && <ReportsContent chartData={chartData} />}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ students, displayAttendance, chartData, calculateDashboardStats }) => {
  const stats = calculateDashboardStats(students, displayAttendance);
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'today', 'past'

  // Filter attendance based on selected filter
  const getFilteredRecentAttendance = () => {
    const today = new Date().toLocaleDateString('en-US');
    
    switch (attendanceFilter) {
      case 'today':
        return displayAttendance.filter(attendance => attendance.date === today);
      case 'past':
        return displayAttendance.filter(attendance => attendance.date !== today);
      default:
        return displayAttendance;
    }
  };

  const filteredRecentAttendance = getFilteredRecentAttendance();

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
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
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full h-96 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Attendances</h3>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
          </div>
          
          {/* Filter buttons for Recent Attendances */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setAttendanceFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                attendanceFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAttendanceFilter('today')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                attendanceFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setAttendanceFilter('past')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                attendanceFilter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Past Attendances
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {filteredRecentAttendance.length > 0 ? (
              <div className="space-y-3 w-full overflow-y-auto">
                {filteredRecentAttendance
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((attendance) => (
                    <AttendanceCard key={attendance.id} attendance={attendance} />
                  ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
                <Clock size={48} className="mb-4 text-gray-400" />
                <div>
                  {attendanceFilter === 'today' 
                    ? "No attendance records for today" 
                    : attendanceFilter === 'past'
                    ? "No past attendance records found"
                    : "No attendance records found"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendance Content Component
const AttendanceContent = ({ displayAttendance, students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'today', 'past'
  
  // Generate weekly attendance data for the line chart
  const weeklyData = generateWeeklyAttendanceData(displayAttendance, students?.length || 0);
  
  const filteredAttendance = displayAttendance
    .filter(attendance => {
      // First apply date filter
      const today = new Date().toLocaleDateString('en-US');
      let dateMatch = true;
      
      if (attendanceFilter === 'today') {
        dateMatch = attendance.date === today;
      } else if (attendanceFilter === 'past') {
        dateMatch = attendance.date !== today;
      }
      
      // Then apply search filter
      const searchMatch = attendance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.studentIDNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return dateMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first

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
        </div>
      </div>

      {/* Weekly Attendance Trend Chart */}
      <WeeklyAttendanceChart data={weeklyData} />

      {/* Filter buttons for Attendance Records */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setAttendanceFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              attendanceFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setAttendanceFilter('today')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              attendanceFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setAttendanceFilter('past')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              attendanceFilter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Past Attendances
          </button>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {attendanceFilter === 'today' && 'Showing today\'s attendance records'}
          {attendanceFilter === 'past' && 'Showing past attendance records'}
          {attendanceFilter === 'all' && `Showing ${filteredAttendance.length} attendance records`}
          {searchTerm && ` matching "${searchTerm}"`}
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
              <p>
                {attendanceFilter === 'today' 
                  ? "No attendance records found for today." 
                  : attendanceFilter === 'past'
                  ? "No past attendance records found."
                  : searchTerm 
                  ? `No records found matching "${searchTerm}".`
                  : "No attendance records found. Records will appear here once students check in."}
              </p>
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
    { title: 'Student Overview', description: 'Individual student reports', icon: Users },
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