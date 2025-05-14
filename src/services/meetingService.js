const API_BASE_URL = 'http://localhost:5000/api';

export const meetingService = {
  getAllMeetings: async () => {
    const response = await fetch(`${API_BASE_URL}/meetings`);
    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }
    return response.json();
  },

  createMeeting: async (meeting) => {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });
    if (!response.ok) {
      throw new Error('Failed to create meeting');
    }
    return response.json();
  },

  updateMeeting: async (id, meeting) => {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });
    if (!response.ok) {
      throw new Error('Failed to update meeting');
    }
    return response.json();
  },

  deleteMeeting: async (id) => {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete meeting');
    }
  },
}; 