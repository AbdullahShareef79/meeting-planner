import React, { useState, useEffect } from "react";
import { meetingService } from './services/meetingService.js';
import { teamMemberService } from './services/teamMemberService.js';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
// Generate time slots from 8:00 to 20:00 with 30-minute intervals
const timeSlots = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
});

// Helper function to format time for display
const formatTimeDisplay = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const AdvancedMeetingPlanner = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [dateRange, setDateRange] = useState([]);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    duration: 60,
    dates: []
  });
  
  const [activeTab, setActiveTab] = useState("availability"); // "availability" or "events"
  const [activeEvent, setActiveEvent] = useState(null);
  
  const [meetings, setMeetings] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    participants: '',
  });
  const [error, setError] = useState('');
  
  // Generate date range when dates change
  useEffect(() => {
    const start = new Date(selectedPeriod.startDate);
    const end = new Date(selectedPeriod.endDate);
    const dates = [];
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setDateRange(dates);
    
    // Initialize empty availability for all team members
    const updatedMembers = teamMembers.map(member => {
      const availability = { ...member.availability };
      dates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        if (!availability[dateStr]) {
          availability[dateStr] = Array(timeSlots.length).fill(false);
        }
      });
      return { ...member, availability };
    });
    
    setTeamMembers(updatedMembers);
  }, [selectedPeriod]);

  useEffect(() => {
    loadMeetings();
    loadTeamMembers();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await meetingService.getAllMeetings();
      setMeetings(data);
    } catch (err) {
      setError('Failed to load meetings');
      console.error(err);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const data = await teamMemberService.getAllTeamMembers();
      setTeamMembers(data);
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    }
  };

  const handleEditMember = (memberId) => {
    const member = teamMembers.find(m => m._id === memberId);
    if (member) {
      setEditingMemberId(member._id);
      setEditMemberName(member.name);
    }
  };

  const handleSaveEdit = async () => {
    if (editMemberName.trim()) {
      try {
        const member = teamMembers.find(m => m._id === editingMemberId);
        if (!member) return;

        const updatedMember = await teamMemberService.updateTeamMember(editingMemberId, {
          name: editMemberName.trim()
        });

        setTeamMembers(prev => prev.map(m => 
          m._id === editingMemberId ? updatedMember : m
        ));
        
        setEditingMemberId(null);
        setEditMemberName("");
      } catch (err) {
        setError('Failed to update team member');
        console.error(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditMemberName("");
  };

  const handleAddMember = async () => {
    if (newMemberName.trim()) {
      try {
        const newMember = {
          name: newMemberName,
          availability: {}
        };
        
        // Initialize availability for the new member
        dateRange.forEach(date => {
          const dateStr = date.toISOString().split('T')[0];
          newMember.availability[dateStr] = Array(timeSlots.length).fill(false);
        });
        
        const savedMember = await teamMemberService.createTeamMember(newMember);
        setTeamMembers(prev => [...prev, savedMember]);
        setNewMemberName("");
      } catch (err) {
        setError('Failed to create team member');
        console.error(err);
      }
    }
  };

  const toggleAvailability = async (memberId, dateStr, timeSlot) => {
    try {
      const member = teamMembers.find(m => m._id === memberId);
      if (!member) {
        console.error('Member not found:', memberId);
        return;
      }

      const newAvailability = { ...member.availability };
      if (!newAvailability[dateStr] || !Array.isArray(newAvailability[dateStr])) {
        newAvailability[dateStr] = Array(timeSlots.length).fill(false);
      }

      const timeIndex = timeSlots.indexOf(timeSlot);
      if (timeIndex === -1) {
        console.error('Invalid time slot:', timeSlot);
        return;
      }

      newAvailability[dateStr] = [...newAvailability[dateStr]];
      newAvailability[dateStr][timeIndex] = !newAvailability[dateStr][timeIndex];

      const updatedMember = await teamMemberService.updateAvailability(memberId, newAvailability);
      
      setTeamMembers(prev => prev.map(m => 
        m._id === memberId ? { ...m, availability: updatedMember.availability } : m
      ));
    } catch (err) {
      setError(`Failed to update availability: ${err.message}`);
      console.error('Error updating availability:', err);
    }
  };

  const getAvailableTimeSlots = (member, dateStr) => {
    if (!member.availability || !member.availability[dateStr]) return [];
    return timeSlots.filter((_, index) => member.availability[dateStr][index]);
  };

  const getOverlap = () => {
    const overlap = {};
    
    if (teamMembers.length === 0) {
      console.log('No team members to calculate overlap');
      return overlap;
    }

    try {
      dateRange.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        overlap[dateStr] = Array(timeSlots.length).fill(true);
        
        timeSlots.forEach((_, timeIndex) => {
          const membersAvailable = teamMembers.filter(member => {
            return member.availability?.[dateStr]?.[timeIndex] === true;
          });

          overlap[dateStr][timeIndex] = membersAvailable.length === teamMembers.length;
        });
      });

      console.log('Calculated overlap:', overlap);
      return overlap;
    } catch (error) {
      console.error('Error calculating overlap:', error);
      return {};
    }
  };

  const getBestMeetingTimes = () => {
    try {
      const overlap = getOverlap();
      const bestTimes = [];
      
      dateRange.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        if (!overlap[dateStr]) return;

        let currentStreak = [];
        
        timeSlots.forEach((time, index) => {
          if (overlap[dateStr][index]) {
            currentStreak.push({ time, index });
          } else if (currentStreak.length > 0) {
            if (currentStreak.length >= 2) { // At least 1 hour (2 x 30-min slots)
              bestTimes.push({
                date: dateStr,
                startTime: currentStreak[0].time,
                endTime: timeSlots[currentStreak[currentStreak.length - 1].index],
                duration: currentStreak.length * 30,
                startIndex: currentStreak[0].index,
                endIndex: currentStreak[currentStreak.length - 1].index
              });
            }
            currentStreak = [];
          }
        });

        // Check the last streak
        if (currentStreak.length >= 2) {
          bestTimes.push({
            date: dateStr,
            startTime: currentStreak[0].time,
            endTime: timeSlots[currentStreak[currentStreak.length - 1].index],
            duration: currentStreak.length * 30,
            startIndex: currentStreak[0].index,
            endIndex: currentStreak[currentStreak.length - 1].index
          });
        }
      });

      // Sort by date and then by duration (prefer longer slots)
      const sortedTimes = bestTimes
        .sort((a, b) => {
          const dateCompare = new Date(a.date) - new Date(b.date);
          if (dateCompare !== 0) return dateCompare;
          return b.duration - a.duration;
        })
        .slice(0, 5); // Top 5 options

      console.log('Calculated best meeting times:', sortedTimes);
      return sortedTimes;
    } catch (error) {
      console.error('Error calculating best meeting times:', error);
      return [];
    }
  };

  const handleCreateEvent = () => {
    if (newEvent.title.trim() && newEvent.dates.length > 0) {
      const event = {
        id: events.length + 1,
        ...newEvent,
        votes: {},
        created: new Date().toISOString()
      };
      
      // Initialize votes structure
      teamMembers.forEach(member => {
        event.votes[member._id] = newEvent.dates.reduce((acc, date) => {
          acc[date] = false;
          return acc;
        }, {});
      });
      
      setEvents([...events, event]);
      setNewEvent({
        title: "",
        description: "",
        duration: 60,
        dates: []
      });
    }
  };

  const toggleEventDateSelection = (date) => {
    setNewEvent(prev => {
      const newDates = [...prev.dates];
      const index = newDates.indexOf(date);
      
      if (index === -1) {
        newDates.push(date);
      } else {
        newDates.splice(index, 1);
      }
      
      return { ...prev, dates: newDates };
    });
  };

  const toggleEventVote = (eventId, memberId, date) => {
    setEvents(prev => {
      return prev.map(event => {
        if (event.id === eventId) {
          const newVotes = { ...event.votes };
          if (!newVotes[memberId]) {
            newVotes[memberId] = {};
          }
          newVotes[memberId] = { ...newVotes[memberId] };
          newVotes[memberId][date] = !newVotes[memberId][date];
          return { ...event, votes: newVotes };
        }
        return event;
      });
    });
  };

  const getEventVoteCounts = (event) => {
    const counts = {};
    
    event.dates.forEach(date => {
      let count = 0;
      Object.values(event.votes).forEach(memberVotes => {
        if (memberVotes[date]) {
          count++;
        }
      });
      counts[date] = count;
    });
    
    return counts;
  };

  const getBestDate = (event) => {
    const counts = getEventVoteCounts(event);
    let bestDate = null;
    let highestCount = -1;
    
    Object.entries(counts).forEach(([date, count]) => {
      if (count > highestCount) {
        highestCount = count;
        bestDate = date;
      }
    });
    
    return { date: bestDate, count: highestCount };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const overlap = getOverlap();
  const bestMeetingTimes = getBestMeetingTimes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingData = {
        ...formData,
        participants: formData.participants.split(',').map(p => p.trim()),
      };
      await meetingService.createMeeting(meetingData);
      setFormData({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        participants: '',
      });
      loadMeetings();
    } catch (err) {
      setError('Failed to create meeting');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await meetingService.deleteMeeting(id);
      loadMeetings();
    } catch (err) {
      setError('Failed to delete meeting');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await teamMemberService.deleteTeamMember(memberId);
      setTeamMembers(prev => prev.filter(member => member._id !== memberId));
      setError('');
    } catch (err) {
      setError('Failed to delete team member');
      console.error('Error deleting team member:', err);
    }
  };

  const renderAvailabilitySection = () => (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Availability</h2>
      
      <div className="space-y-8">
        {teamMembers.map(member => (
          <div key={member._id} className="border rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-4">{member.name}</h3>
            <div className="space-y-4">
              {dateRange.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const availableSlots = getAvailableTimeSlots(member, dateStr);
                
                return (
                  <div key={dateStr} className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-40 font-medium">{formatDate(dateStr)}</div>
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          multiple
                          className="w-full p-2 border rounded min-h-[100px] bg-white"
                          value={availableSlots}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                            timeSlots.forEach(timeSlot => {
                              const isSelected = selectedOptions.includes(timeSlot);
                              const isCurrentlySelected = availableSlots.includes(timeSlot);
                              if (isSelected !== isCurrentlySelected) {
                                toggleAvailability(member._id, dateStr, timeSlot);
                              }
                            });
                          }}
                        >
                          {timeSlots.map(timeSlot => (
                            <option 
                              key={timeSlot} 
                              value={timeSlot}
                              className={`p-1 ${
                                availableSlots.includes(timeSlot) 
                                  ? 'bg-blue-100' 
                                  : 'bg-white'
                              }`}
                            >
                              {formatTimeDisplay(timeSlot)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {availableSlots.length > 0 
                          ? `Available: ${availableSlots.map(formatTimeDisplay).join(', ')}` 
                          : 'No availability set'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverlapSection = () => (
    <div className="space-y-6">
      {dateRange.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        
        // Only show dates that have at least one overlapping time slot
        const hasOverlap = overlap[dateStr] && overlap[dateStr].some(slot => slot);
        
        if (!hasOverlap) return null;
        
        return (
          <div key={dateStr} className="mb-2">
            <div className="font-medium mb-2">{formatDate(dateStr)}</div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={timeIndex}
                  className={`text-xs p-2 rounded text-center ${
                    overlap[dateStr] && overlap[dateStr][timeIndex] 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-100"
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBestMeetingTimes = () => {
    const bestTimes = getBestMeetingTimes();
    
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Best Meeting Times</h2>
        {teamMembers.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded">
            Add team members to see best meeting times
          </div>
        ) : bestTimes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestTimes.map((time, index) => (
              <div key={index} className="border rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
                <div className="font-medium text-gray-900">{formatDate(time.date)}</div>
                <div className="text-lg font-bold text-green-700">
                  {formatTimeDisplay(time.startTime)} - {formatTimeDisplay(time.endTime)}
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {time.duration} minutes
                </div>
                <div className="text-sm text-green-600 mt-1">
                  All {teamMembers.length} team members available
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded">
            No times found where everyone is available. Try adjusting the date range or adding more availability.
          </div>
        )}
      </div>
    );
  };

  const renderTeamMembersSection = () => (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Team Members</h2>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="Add new team member"
          className="flex-1 p-2 border rounded"
        />
        <button 
          onClick={handleAddMember}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div key={member._id} className="border rounded-lg p-3 bg-gray-50">
            {editingMemberId === member._id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="flex-1 p-1 border rounded"
                />
                <button 
                  onClick={handleSaveEdit} 
                  className="text-green-600 hover:text-green-700"
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit} 
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="font-medium">{member.name}</div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditMember(member._id)}
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member._id)}
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ahead& Meeting Planner</h1>
        <div className="space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === "availability" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("availability")}
          >
            Availability
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === "events" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("events")}
          >
            Events
          </button>
        </div>
      </div>

      {activeTab === "availability" && (
        <>
          {renderTeamMembersSection()}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={selectedPeriod.startDate}
                  onChange={(e) => setSelectedPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={selectedPeriod.endDate}
                  onChange={(e) => setSelectedPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {renderAvailabilitySection()}

          {teamMembers.length > 0 && (
            <>
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">Team Overlap</h2>
                {renderOverlapSection()}
              </div>
              
              {renderBestMeetingTimes()}
            </>
          )}
        </>
      )}

      {activeTab === "events" && (
        <>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Weekly Team Meeting"
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Discuss project updates and blockers"
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Duration (minutes)</label>
                <select
                  value={newEvent.duration}
                  onChange={e => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Select Possible Dates</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dateRange.map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    return (
                      <div 
                        key={dateStr} 
                        className={`p-2 border rounded cursor-pointer ${
                          newEvent.dates.includes(dateStr) ? "bg-blue-100 border-blue-400" : ""
                        }`}
                        onClick={() => toggleEventDateSelection(dateStr)}
                      >
                        {formatDate(dateStr)}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={handleCreateEvent}
                disabled={!newEvent.title || newEvent.dates.length === 0}
                className={`w-full p-2 rounded ${
                  !newEvent.title || newEvent.dates.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
              >
                Create Event
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            {events.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded">
                No events yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <button
                        onClick={() => setActiveEvent(activeEvent === event.id ? null : event.id)}
                        className="text-blue-600"
                      >
                        {activeEvent === event.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-2">{event.description}</div>
                    
                    {activeEvent === event.id && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Vote for dates</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.dates.map(dateStr => {
                              const votesCount = Object.values(event.votes).filter(vote => vote[dateStr]).length;
                              return (
                                <div key={dateStr} className="border rounded p-3">
                                  <div className="font-medium">{formatDate(dateStr)}</div>
                                  <div className="text-sm text-gray-500 mb-2">{votesCount} votes</div>
                                  
                                  <div className="space-y-2">
                                    {teamMembers.map(member => (
                                      <div 
                                        key={member._id}
                                        className="flex items-center"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={event.votes[member._id] && event.votes[member._id][dateStr] || false}
                                          onChange={() => toggleEventVote(event.id, member._id, dateStr)}
                                          className="mr-2"
                                          id={`vote-${event.id}-${member._id}-${dateStr}`}
                                        />
                                        <label 
                                          htmlFor={`vote-${event.id}-${member._id}-${dateStr}`}
                                          className="text-sm"
                                        >
                                          {member.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Best Date</h4>
                          {(() => {
                            const best = getBestDate(event);
                            if (!best.date) return <div>No votes yet</div>;
                            
                            return (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="font-medium">{formatDate(best.date)}</div>
                                <div className="text-sm">
                                  {best.count} out of {teamMembers.length} members available
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Meeting Title"
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="participants"
            value={formData.participants}
            onChange={handleInputChange}
            placeholder="Participants (comma-separated)"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Meeting Description"
            className="border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Meeting
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting) => (
          <div key={meeting._id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{meeting.title}</h2>
            <p className="text-gray-600">Date: {new Date(meeting.date).toLocaleDateString()}</p>
            <p className="text-gray-600">Time: {meeting.startTime} - {meeting.endTime}</p>
            <p className="text-gray-600">Description: {meeting.description}</p>
            <p className="text-gray-600">
              Participants: {meeting.participants.join(', ')}
            </p>
            <button
              onClick={() => handleDelete(meeting._id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedMeetingPlanner;