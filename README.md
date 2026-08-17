# 🎯 Advanced Tactile Todo List

An advanced, premium MERN (MongoDB, Express, React, Node.js) stack Todo application featuring a stunning **Neomorphic (Tactile) Design System**, offline-first synchronization, interactive analytics, and productivity tools.

---

## ✨ Features

- **🎨 Premium Tactile & Neomorphic UI:** Satisfaction-driven interface with custom tactile buttons, switches, and components that animate beautifully using `framer-motion` and styled with Tailwind CSS v4.
- **⏱️ Integrated Pomodoro Timer:** Focus on your tasks using a customizable Pomodoro timer directly inside the app to boost productivity.
- **📊 Real-time Analytics & Dashboard:** Stay on top of your metrics with interactive charts (weekly completion rates, task distributions) and clean visual analytics.
- **🔄 Offline-First Synchronization:** Uses `Dexie.js` (IndexedDB wrapper) for client-side storage, allowing the app to remain fully functional offline and automatically sync with MongoDB when connection is restored.
- **🔒 Secure Authentication:** Complete JWT authentication system with hashed passwords using `bcryptjs` and stored safely via HttpOnly cookies.
- **⏳ History Timeline:** A complete timeline view that tracks all changes, completed tasks, and activity logs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **Bundler:** Vite 8 (using React Compiler for automated rendering optimization)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Local DB:** Dexie.js (IndexedDB)
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Security & Auth:** JWT (JSON Web Tokens), Bcrypt.js, Cookie Parser
- **Development Tooling:** Nodemon

---

## 📂 Project Structure

```text
Advanced_Todolist/
├── backend/
│   ├── src/
│   │   ├── middleware/      # Authentication & route protection middleware
│   │   ├── models/          # MongoDB schemas (User, Todo)
│   │   ├── routes/          # API endpoints (Auth, Todos)
│   │   └── server.js        # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & API client calls
│   │   ├── components/      # UI components (TactileButton, WeeklyChart, PomodoroTimer, etc.)
│   │   ├── db/              # Dexie local IndexedDB configuration
│   │   ├── utils/           # Helper functions & utilities
│   │   ├── App.tsx          # Main layout & component controller
│   │   ├── main.tsx         # React app mounting
│   │   └── index.css        # Main Tailwind CSS configurations
│   ├── package.json
│   └── vite.config.ts
└── README.md                # Project documentation (this file)
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### Setup & Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Gautam69-Coder/Advanced_Todolist.git
   cd Advanced_Todolist
   ```

2. **Backend Setup:**
   - Navigate to the `backend/` directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend/` folder (reference the settings below):
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/todo-app
     JWT_SECRET=your_super_secret_jwt_key
     ```
   - Start the backend server in development mode:
     ```bash
     npm run dev
     ```

3. **Frontend Setup:**
   - Open a new terminal and navigate to the `frontend/` directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the Vite development server:
     ```bash
     npm run dev
     ```

---

## 📝 License

This project is licensed under the MIT License.
