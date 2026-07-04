# Run Instructions

Follow these steps to get the E-Commerce Development Website running on your local machine.

## 📋 Prerequisites & Necessary Downloads

Before you begin, ensure you have the following installed:

1. **Node.js** (v18.0 or higher)
   - Download: [Node.js Official Website](https://nodejs.org/)
   - This will also install `npm` (Node Package Manager).
   
2. **Git**
   - Download: [Git Official Website](https://git-scm.com/downloads)
   - Required to clone the repository.

3. **MongoDB (Optional but Recommended)**
   - Download: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - *Note: If you do not have MongoDB installed locally, the backend is configured to automatically fall back to a temporary **in-memory database**. Your data will just reset when you restart the server.*

---

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/gunavardhanm6-hue/e-commerce-development-website.git
cd e-commerce-development-website
```

### 2. Install Dependencies
You need to install the Node packages for both the backend (server) and the frontend (client).

**For the Backend:**
```bash
cd server
npm install
```

**For the Frontend:**
```bash
cd ../client
npm install
```

### 3. Environment Variables
The backend requires environment variables to run securely. 
1. Navigate to the `server` folder.
2. Rename the `.env.example` file to `.env`.
   - On Windows Command Prompt: `copy .env.example .env`
   - On Mac/Linux/PowerShell: `cp .env.example .env`

---

## 🚀 Running the Project

You will need **two separate terminal windows/tabs** to run the frontend and backend simultaneously.

### Terminal 1: Start the Backend Server
```bash
cd server
npm run dev
```
*The backend API will start on **http://localhost:5000**.*

### Terminal 2: Start the Frontend Client
```bash
cd client
npm run dev
```
*The React frontend will start on **http://localhost:5173**.*

---

## 🎉 Access the Website
Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to view the live website!
