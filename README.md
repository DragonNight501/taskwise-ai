# Taskwise AI 🚀

Taskwise AI is an AI-powered task planning app that turns any goal into a clear, organized task board.

## 🌐 Live Demo

https://mohamad-hadi-taskwise-ai.vercel.app/

## ✨ Features

- Generate actionable tasks from any goal using Gemini AI
- Organize tasks into To Do, In Progress, and Done columns
- Drag and drop tasks between columns
- Edit and delete tasks
- Clear all tasks
- LocalStorage persistence
- Smooth animations and typing effect
- Fallback system when AI limits are reached
- Responsive dark UI

## 🛠 Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Google Gemini API
- Vercel

## 🚀 Getting Started

bash npm install npm run dev 

Open:

http://localhost:3000

## 🔐 Environment Variables

Create a .env.local file in the project root:

GOOGLE_API_KEY=your_google_api_key_here

## 📦 Build

bash npm run build npm start 

## 🧠 How It Works

The user enters a goal, then Taskwise AI sends it to an API route.  
The API uses Gemini to generate structured tasks.  
If Gemini is unavailable or the limit is reached, the app uses a safe fallback.

## 📌 Project Status

This project is part of my frontend/fullstack portfolio and focuses on:

- AI integration
- Clean UI architecture
- Task management logic
- Drag and drop interaction
- Production deployment

## 👨‍💻 Author

Built by Mohamad Had
