# 🎓 CampusConnect - Campus Management & Student Collaboration Platform

Welcome to **CampusConnect**! This is a complete Full-Stack web application designed to digitalize and streamline campus operations, making collaboration between students, faculty, and administration easier and more efficient.

---

## 📖 About The Project

**CampusConnect** aims to be a one-stop portal for all college-related activities. Instead of using multiple platforms for different tasks, students and faculty can use this single platform for everything from marking attendance to sharing notes, asking doubts, and raising complaints. 

It is designed with **Role-Based Access Control (RBAC)**, ensuring that Admins, Faculty, and Students only see what they are authorized to see.

### 🌟 Key Features

1. **Role-Based Portals (Admin, Faculty, Student)**
   - Secure login using JWT (JSON Web Tokens).
   - Custom dashboards based on user roles.
2. **Attendance Management System**
   - Faculty can mark daily attendance.
   - Students can track their attendance percentage in real-time.
3. **Academic Resources & Notes Sharing**
   - Faculty can upload notes and study materials subject-wise.
   - Students can easily download and access these resources.
4. **Doubt Resolution Forum**
   - A collaborative space where students can post doubts and faculty/peers can reply with solutions.
5. **Complaint Helpdesk**
   - Students can raise complaints (e.g., infrastructure, hostel, Wi-Fi issues).
   - Admin/Faculty can track and resolve them.
6. **Notices & Events Board**
   - Official campus announcements and upcoming event details are broadcasted here.
7. **Lost & Found**
   - A dedicated section to report lost items or list found items on campus.
8. **Real-Time Notifications 🔔 (NEW)**
   - Instant broadcast of important updates and alerts using **WebSockets**.

---

## 🛠️ Technology Stack Used

This project is built using a modern and robust tech stack to ensure high performance and scalability.

### **Frontend (User Interface)**
The frontend is built using core web technologies to keep it lightweight and fast:
- **HTML5 & CSS3**: For semantic structure and beautiful, responsive styling.
- **Vanilla JavaScript (JS)**: For handling DOM manipulation, API calls (Fetch API), and frontend routing.
- **SockJS & STOMP.js**: For handling real-time WebSocket connections.

### **Backend (Server & API)**
The backend is a robust RESTful API built in Java:
- **Java 17**: Core programming language.
- **Spring Boot 3.x**: Framework used to build the backend REST APIs quickly.
- **Spring Security & JWT**: For securing endpoints and handling user authentication & authorization.
- **Spring Data JPA & Hibernate**: For Object-Relational Mapping (ORM) and database interactions.
- **Spring WebSockets**: For real-time bi-directional communication (Notifications).
- **Maven**: For dependency management and building the project.

### **Database**
- **MySQL**: Relational database used to securely store all users, attendance, notes, and complaints data.

---

## 📂 Project Structure

```text
CampusConnect/
├── Backend/                 # Spring Boot Backend API
│   ├── src/main/java/...    # Controllers, Models, Repositories, Services, Security, Config
│   ├── src/main/resources/  # application.properties (DB config)
│   └── pom.xml              # Maven dependencies
│
└── frontend/                # HTML/JS/CSS UI
    ├── index.html           # Main landing page / Student Dashboard
    ├── login.html           # Authentication Page
    ├── admin-index.html     # Admin Dashboard
    ├── faculty-index.html   # Faculty Dashboard
    ├── style.css            # Global Stylesheet
    ├── script.js            # Global API Calls & Logic
    └── ... (other pages like attendance, complaints, doubts, etc.)
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Install **Java 17** or higher.
- Install **Maven**.
- Install **MySQL Server** (and create a database named `campus_connect` or as configured in `application.properties`).

### Step 1: Run the Backend
1. Open the `Backend` folder in your IDE (IntelliJ IDEA, VS Code, or Eclipse).
2. Configure your MySQL username and password in `Backend/src/main/resources/application.properties`.
3. Run the `CampusConnectApplication.java` file.
4. The backend will start on `http://localhost:8080`.

### Step 2: Run the Frontend
1. Open the `frontend` folder.
2. You can use the **Live Server** extension in VS Code to run the frontend.
3. Simply right-click on `login.html` or `index.html` and select **"Open with Live Server"**.
4. Alternatively, you can just double-click `login.html` to open it in any web browser.

---

## 🌍 How to Deploy (Production Guide)

To make this project accessible on the internet, follow these deployment steps:

### 1. Database (Aiven / Render)
1. Create a free MySQL database on [Aiven.io](https://aiven.io/) or PostgreSQL on [Render.com](https://render.com/).
2. Update the database URL, username, and password in `application.properties`.

### 2. Backend API (Render)
1. Push the entire project to a **GitHub** repository.
2. Sign in to [Render.com](https://render.com/) and create a **New Web Service**.
3. Connect your GitHub repository and set the Root Directory to `Backend`.
4. Set Build Command: `./mvnw clean package -DskipTests`
5. Set Start Command: `java -jar target/campus-portal-1.0.0.jar`
6. Deploy! Render will provide a live API URL (e.g., `https://campusconnect-api.onrender.com`).

### 3. Frontend (Vercel)
1. Update all API fetch calls in the `frontend` folder (e.g., in `script.js`) from `http://localhost:8080` to your new Render API URL.
2. Sign in to [Vercel](https://vercel.com/) and create a **New Project**.
3. Import your GitHub repository and set the Root Directory to `frontend`.
4. Deploy! Vercel will give you a live frontend link to share with users.

---

## 🧠 Why we built this (Project Explanation for Presentation)

If you need to explain this project to a panel or an interviewer:

*"CampusConnect is designed to solve the communication gap in modern colleges. Typically, colleges use WhatsApp for notices, a separate portal for attendance, and drive links for notes. CampusConnect brings all these features under one roof.* 

*We used **Spring Boot** on the backend because it is highly scalable, secure, and an industry standard for enterprise applications. We secured it with **JWT tokens** so that data is protected and role hierarchies (Admin vs Faculty vs Student) are strictly maintained. For the frontend, we kept it clean and lightweight using **HTML, CSS, and Vanilla JS**. We also recently integrated **WebSockets** to push live notifications to users, making the platform highly interactive."*
