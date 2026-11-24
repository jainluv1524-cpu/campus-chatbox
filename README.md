# Campus Chatbox

A private, secure college social networking & communication platform inspired by WhatsApp, Discord, and Slack.

## 🎯 Features

- **Private Messaging** - Real-time one-to-one chat with Socket.IO
- ** Campus Communities** - Groups, channels, and announcements
- **Student Profiles** - Complete profiles with bio, interests, and skills
- **Group Channels** - 5 default channels: General, Announcements, Academics, Placement, Events, Buy & Sell
- **Privacy Controls** - Configurable visibility settings
- **Safety Features** - Block/report functionality for user protection
- **Admin Dashboard** - Role-based moderation tools
- **Notifications** - Real-time alerts for new messages and activities
- **File Sharing** - Send and receive images and documents in chat
- **Message Reactions** - Add emoji reactions to messages
- **Message Replies** - Quote and reply to messages

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- SQLite Database (via sqlite3)
- JWT Authentication
- Socket.IO for real-time messaging
- Helmet & CORS for security
- bcrypt for password hashing

### Frontend
- React + Vite
- TypeScript
- Redux Toolkit for state management
- Socket.IO Client
- Tailwind CSS for styling
- React Router for navigation
- Zod for form validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd campus-chatbox
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

### Running the Application

**Terminal 1 - Backend Server (Port 3002):**
```bash
cd campus-chatbox
node src/server.js
```

**Terminal 2 - Frontend Dev Server (Port 3000):**
```bash
cd client
npm run dev
```

Open your browser to:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3002/api/health

## 📝 Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

## 🧪 Testing

```bash
# Register a new account
curl -X POST http://localhost:3002/api/auth/signup

# Login
curl -X POST http://localhost:3002/api/auth/login
```

## 📊 Project Structure

```
campus-chatbox/
├── src/                  # Express backend
│   ├── server.js         # Main Express server
│   ├── api/              # Route handlers
│   └── middleware/       # Express middleware
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/        # All UI pages
│   │   ├── components/   # Reusable UI components
│   │   ├── store/        # Redux Toolkit
│   │   ├── services/     # Socket.IO service
│   │   └── App.tsx       # Main App with routes
├── prisma/               # Database schema
└── dev.db               # Auto-created SQLite database
```

## 🛡️ Security Features

- bcrypt password hashing
- JWT authentication
- Helmet HTTP headers protection
- CORS configuration
- Input validation (Zod + Express)
- Rate limiting infrastructure
- Data protection
- XSS prevention

## 📈 Monitoring

The admin dashboard provides:
- User statistics
- Account verification
- Suspension tools
- Report management
- College management

## 🔐 Roles

1. **Student** - Basic user features
2. **Moderator** - Group moderation
3. **College Administrator** - College-level management
4. **Super Administrator** - Platform-wide stats

## 🎉 Getting Started with a New Student

1. **Register** - Complete profile with name, college, department
2. **Explore** - View Campus General, Announcements, and Communities
3. **Connect** - Message friends or join groups
4. **Engage** - Share in channels, attend events, apply for jobs

## 📜 License

MIT License

## 🤝 Contributing

Contributions welcome! Open a pull request.

## 📧 Issues & Bugs

Please report bugs and issues on GitHub Issues.

## 📞 Support

Email: support@campuschatbox.edu

## ⭐ Show Your Support

Give it a star if you find this project helpful!