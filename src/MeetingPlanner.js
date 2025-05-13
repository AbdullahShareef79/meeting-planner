import React, { useState, useEffect } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`); // 8:00 to 19:00

const AdvancedMeetingPlanner = () => {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Alex Smith", availability: {} },
    { id: 2, name: "Jamie Johnson", availability: {} }
  ]);
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
          availability[dateStr] = Array(hours.length).fill(false);
        }
      });
      return { ...member, availability };
    });
    
    setTeamMembers(updatedMembers);
  }, [selectedPeriod]);

  const handleEditMember = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setEditingMemberId(memberId);
      setEditMemberName(member.name);
    }
  };

  const handleSaveEdit = () => {
    if (editMemberName.trim()) {
      setTeamMembers(prev => {
        return prev.map(member => {
          if (member.id === editingMemberId) {
            return { ...member, name: editMemberName.trim() };
          }
          return member;
        });
      });
      setEditingMemberId(null);
      setEditMemberName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditMemberName("");
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const newMember = {
        id: teamMembers.length + 1,
        name: newMemberName,
        availability: {}
      };
      
      // Initialize availability for the new member
      dateRange.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        newMember.availability[dateStr] = Array(hours.length).fill(false);
      });
      
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberName("");
    }
  };

  const toggleAvailability = (memberId, dateStr, hourIndex) => {
    setTeamMembers(prev => {
      return prev.map(member => {
        if (member.id === memberId) {
          const newAvailability = { ...member.availability };
          newAvailability[dateStr] = [...newAvailability[dateStr]];
          newAvailability[dateStr][hourIndex] = !newAvailability[dateStr][hourIndex];
          return { ...member, availability: newAvailability };
        }
        return member;
      });
    });
  };

  const getOverlap = () => {
    const overlap = {};
    
    dateRange.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      overlap[dateStr] = Array(hours.length).fill(true);
      
      hours.forEach((_, hourIndex) => {
        teamMembers.forEach(member => {
          if (!member.availability[dateStr] || !member.availability[dateStr][hourIndex]) {
            overlap[dateStr][hourIndex] = false;
          }
        });
      });
    });
    
    return overlap;
  };

  const getBestMeetingTimes = () => {
    const overlap = getOverlap();
    const bestTimes = [];
    
    dateRange.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      
      hours.forEach((hour, hourIndex) => {
        if (overlap[dateStr] && overlap[dateStr][hourIndex]) {
          bestTimes.push({
            date: dateStr,
            hour,
            hourIndex
          });
        }
      });
    });
    
    return bestTimes.slice(0, 5); // Top 5 options
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
        event.votes[member.id] = newEvent.dates.reduce((acc, date) => {
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
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="border rounded-lg p-3 bg-gray-50">
                  {editingMemberId === member.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editMemberName}
                        onChange={(e) => setEditMemberName(e.target.value)}
                        className="flex-1 p-1 border rounded"
                      />
                      <button onClick={handleSaveEdit} className="text-green-600">Save</button>
                      <button onClick={handleCancelEdit} className="text-red-600">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{member.name}</div>
                      <button 
                        onClick={() => handleEditMember(member.id)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            
            <div className="space-y-8">
              {teamMembers.map(member => (
                <div key={member.id} className="border rounded-xl p-4 shadow">
                  <h3 className="font-semibold mb-4">{member.name}</h3>
                  <div className="space-y-6">
                    {dateRange.map(date => {
                      const dateStr = date.toISOString().split('T')[0];
                      return (
                        <div key={dateStr} className="mb-2">
                          <div className="font-medium mb-2">{formatDate(dateStr)}</div>
                          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                            {hours.map((hour, hourIndex) => (
                              <button
                                key={hourIndex}
                                className={`text-xs p-2 rounded ${
                                  member.availability[dateStr] && member.availability[dateStr][hourIndex] 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-200"
                                }`}
                                onClick={() => toggleAvailability(member.id, dateStr, hourIndex)}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Team Overlap</h2>
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
                      {hours.map((hour, hourIndex) => (
                        <div
                          key={hourIndex}
                          className={`text-xs p-2 rounded text-center ${
                            overlap[dateStr] && overlap[dateStr][hourIndex] 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-100"
                          }`}
                        >
                          {hour}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Best Meeting Times</h2>
            {bestMeetingTimes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bestMeetingTimes.map((time, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-green-50">
                    <div className="font-medium">{formatDate(time.date)}</div>
                    <div className="text-lg font-bold">{time.hour}</div>
                    <div className="text-sm text-gray-500">All team members available</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded">
                No times where everyone is available. Try adjusting the date range or adding more availability.
              </div>
            )}
          </div>
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
                                        key={member.id}
                                        className="flex items-center"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={event.votes[member.id] && event.votes[member.id][dateStr] || false}
                                          onChange={() => toggleEventVote(event.id, member.id, dateStr)}
                                          className="mr-2"
                                          id={`vote-${event.id}-${member.id}-${dateStr}`}
                                        />
                                        <label 
                                          htmlFor={`vote-${event.id}-${member.id}-${dateStr}`}
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
    </div>
  );
};

export default AdvancedMeetingPlanner;