# Meeting Planner

A modern web application for efficiently scheduling team meetings by finding the best overlapping time slots based on team members' availability.

## Features

- 📅 Schedule meetings with 30-minute time slot precision
- 👥 Manage team members and their availability
- 🔍 Automatically find the best meeting times based on team availability
- 🔗 Share meeting plans with team members
- 💾 Persistent data storage with MongoDB
- 🎨 Modern and responsive user interface

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AbdullahShareef79/meeting-planner.git
cd meeting-planner
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## Running the Application (Development)

1. Start the backend server:
```bash
npm run server
```

2. In a separate terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Deployment Guide

### Backend Deployment

1. Requirements:
   - Node.js hosting environment (e.g., Heroku, DigitalOcean, AWS)
   - MongoDB production database (e.g., MongoDB Atlas)
   - SSL certificate for HTTPS (recommended)

2. Environment Variables for Production:
```
MONGODB_URI=your_production_mongodb_uri
PORT=your_production_port
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

3. Production Setup Steps:
   - Set up MongoDB Atlas cluster or equivalent production database
   - Configure production environment variables
   - Set up reverse proxy (e.g., Nginx) if needed
   - Enable HTTPS
   - Configure server firewall rules

### Frontend Deployment

1. Update Production API URL:
   - Before building, ensure the API URL points to your production backend
   - Update `REACT_APP_API_URL` in frontend `.env`:
```
REACT_APP_API_URL=https://your-api-domain.com
```

2. Build and Deploy:
```bash
cd client
npm run build
```

3. The project includes GitHub Pages configuration:
```bash
npm run deploy
```

### Security Considerations

1. Environment Variables:
   - Never commit `.env` files
   - Use environment variable management in production
   - Rotate sensitive credentials periodically

2. API Security:
   - Enable CORS with specific origins
   - Use HTTPS in production
   - Implement rate limiting
   - Add request validation

3. Database Security:
   - Use strong MongoDB user credentials
   - Enable MongoDB authentication
   - Configure IP whitelist
   - Regular backup strategy

## Features in Detail

### Meeting Management
- Create, edit, and delete meetings
- Set meeting duration and participant list
- View all scheduled meetings

### Team Member Management
- Add and remove team members
- Set individual availability schedules
- Update team member information

### Time Slot Management
- 30-minute precision time slots
- Automatic best time calculation
- Visual conflict detection

### Sharing Functionality
- Generate shareable links
- Collaborative meeting planning
- Real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
