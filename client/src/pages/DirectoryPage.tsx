import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Input, Button, Badge } from '../components';
import { Sidebar } from '../components/Sidebar';

const DirectoryPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Sample student data - in production this comes from API
  useEffect(() => {
    const mockStudents = [
      {
        id: '1',
        displayName: 'Alice Chen',
        college: 'University of Example',
        department: 'Computer Science',
        academicYear: 'Junior',
        interests: 'coding, gaming, hiking',
        skills: 'JavaScript, Python, React',
        profilePictureUrl: '',
        isOnline: true,
        interestsList: ['coding', 'gaming', 'hiking'],
      },
      {
        id: '2',
        displayName: 'Bob Martinez',
        college: 'University of Example',
        department: 'Mathematics',
        academicYear: 'Senior',
        interests: 'puzzles, chess, music',
        skills: 'Linear Algebra, Statistics, Python',
        profilePictureUrl: '',
        isOnline: false,
        interestsList: ['puzzles', 'chess', 'music'],
      },
      {
        id: '3',
        displayName: 'Carol Williams',
        college: 'State University',
        department: 'Physics',
        academicYear: 'Freshman',
        interests: 'lab experiments, reading, art',
        skills: 'Research, Documentation, Critical Thinking',
        profilePictureUrl: '',
        isOnline: true,
        interestsList: ['lab experiments', 'reading', 'art'],
      },
      {
        id: '4',
        displayName: 'David Kim',
        college: 'University of Example',
        department: 'Engineering',
        academicYear: 'Sophomore',
        interests: 'robotics, coding, gaming',
        skills: 'CAD, C++, Arduino',
        profilePictureUrl: '',
        isOnline: false,
        interestsList: ['robotics', 'coding', 'gaming'],
      },
      {
        id: '5',
        displayName: 'Emma Davis',
        college: 'Community College',
        department: 'Business',
        academicYear: 'Junior',
        interests: 'marketing, networking, entrepreneurship',
        skills: 'Public Speaking, Excel, Marketing',
        profilePictureUrl: '',
        isOnline: true,
        interestsList: ['marketing', 'networking', 'entrepreneurship'],
      },
    ];
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  // Filter students based on search and college filter
  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesSearch = student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           student.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || student.college.toLowerCase() === selectedFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
    setFilteredStudents(filtered);
  }, [searchQuery, selectedFilter, students]);

  // Get unique colleges for filter
  const colleges = [...new Set(students.map(s => s.college))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-campus-secondary">Student Directory</h2>
            <p className="text-sm text-gray-500">Connect with {students.length} students at your college</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-4 h-4" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </Button>
            <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-4 h-4" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search students by name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-4 h-4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full rounded border border-gray-300 py-2 px-3 focus:outline-none focus:border-campus-primary"
            >
              <option value="all">All Colleges</option>
              {colleges.map((college) => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">{filteredStudents.length} students found</p>
        </div>

        {/* Student List */}
        <div className={`space-y-3 ${viewMode === 'list' ? 'flex flex-col' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}>
          {filteredStudents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-12 h-12" d="M43 17v-1a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2zM9 11l1 1 4-4 6 6 4-4 2 2l-6 6-4-4z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">No students found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer ${viewMode === 'list' ? 'flex items-center justify-between gap-4' : ''}`}
                onClick={() => {
                  // Navigate to student profile or start chat
                  window.location.href = `/campus/student/${student.id}`;
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {student.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{student.displayName}</div>
                    <div className="text-xs text-gray-500">{student.academicYear} • {student.department}</div>
                    <div className="text-xs text-gray-500">{student.college}</div>
                  </div>
                  <Badge variant={student.isOnline ? 'primary' : 'default'}>
                    {student.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                
                {viewMode !== 'list' && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Interests:</p>
                    <div className="flex gap-1 flex-wrap">
                      {student.interestsList.map((interest, index) => (
                        <Badge key={index} variant="default" className="text-xs px-2 py-1">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewMode === 'list' && (
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    Message
                  </Button>
                )}
              </div>
            ))}
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;