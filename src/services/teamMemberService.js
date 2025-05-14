const API_BASE_URL = 'http://localhost:5000/api';

export const teamMemberService = {
  getAllTeamMembers: async () => {
    const response = await fetch(`${API_BASE_URL}/team-members`);
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    return response.json();
  },

  createTeamMember: async (teamMember) => {
    const response = await fetch(`${API_BASE_URL}/team-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamMember),
    });
    if (!response.ok) {
      throw new Error('Failed to create team member');
    }
    return response.json();
  },

  updateAvailability: async (id, availability) => {
    const response = await fetch(`${API_BASE_URL}/team-members/${id}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availability }),
    });
    if (!response.ok) {
      throw new Error('Failed to update availability');
    }
    return response.json();
  },

  deleteTeamMember: async (id) => {
    const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete team member');
    }
  },
}; 