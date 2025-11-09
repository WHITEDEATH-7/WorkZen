
````markdown
# 🧠 WorkZen – Smart Human Resource Management System

**WorkZen** is an innovative HRMS (Human Resource Management System) designed to simplify and modernize HR operations for smarter workplaces.  
It provides a unified, role-based platform that integrates Attendance, Leave, Payroll, and Analytics — empowering organizations to manage their workforce efficiently, transparently, and intelligently.

---

## 🚩 Hackathon Problem Statement

**Theme:** *Simplifying HR Operations for Smarter Workplaces*  

Organizations, especially startups and SMEs, face challenges in managing human resources due to fragmented tools, manual processes, and poor data visibility.  
The challenge was to **design and develop a modular HRMS** with:

- User & Role Management  
- Attendance & Leave Tracking  
- Payroll & Salary Processing  
- Admin Dashboard and Analytics  

The solution must include:
- CRUD operations for users and records  
- Role-based workflows (Employee / HR Officer / Payroll Officer / Admin)  
- Realistic HR logic for leaves, salary, and reports  
- Scalable architecture with clear module communication  
- Modern, user-friendly UI

---

## 🎯 Vision & Mission

> *Empowering organizations with a modern, transparent HR ecosystem that reduces manual dependency and enhances employee experience.*

WorkZen’s mission is to:
- Simplify complex HR operations through automation  
- Provide real-time data insights for smart decision-making  
- Build an intuitive, role-based system for smooth HR collaboration  

---

## 💡 Solution Overview

WorkZen is a **full-stack HRMS** platform developed using modern web technologies, designed to handle all major HR functions from a single dashboard.

| Module | Description |
|--------|--------------|
| 👤 **User & Role Management** | Registration, authentication, and assigning user roles (Admin, HR Officer, Payroll Officer, Employee). |
| 🕒 **Attendance & Leave Management** | Employees mark attendance, apply for leave; HR and Payroll officers manage requests. |
| 💰 **Payroll Management** | Salary breakdown, deductions (PF, Professional Tax), and automated payrun generation. |
| 📊 **Dashboard & Analytics** | Real-time visualization of attendance, leaves, and payroll metrics. |

---

## 🏗️ System Architecture

### 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + TypeScript |
| **Backend** | Spring Boot |
| **Database** | MySQL |
| **Version Control** | Git & GitHub |
| **Design Tools** | Excalidraw for mockups |

### 🧩 Architecture Flow

```text
Employee → Attendance → Payroll → Dashboard
HR Officer ↔ Employee Management ↔ Admin ↔ Payroll Officer
````

📎 **Diagram Reference:**
![HRMS Flow](./HRMS%20Flow.svg)

---

## 👥 Roles & Responsibilities

### 👑 Admin

* Manage all user accounts and roles
* Full access to all modules and settings
* Oversee system operations

### 👷 Employee

* Mark attendance and view logs
* Apply for leave and track approval status
* View personal records only

### 🧾 Payroll Officer

* Approve/reject leave requests
* Generate monthly payslips and reports
* Manage payroll data and deductions

### 🧍 HR Officer

* Create and update employee details
* Monitor attendance and allocate leaves
* Cannot access payroll or settings

---

## 📘 Key Terminologies

| Term                 | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| **Payroll**          | Salary calculation based on attendance and deductions.           |
| **Payrun**           | Payroll cycle in which salaries are processed and distributed.   |
| **Payslip**          | Employee salary breakdown for a given payrun.                    |
| **Time-Off**         | Approved absence such as vacation or sick leave.                 |
| **PF Contribution**  | 12% of basic salary contributed monthly toward employee savings. |
| **Professional Tax** | Mandatory state-level tax deducted from gross salary.            |

---

## 🧭 Why This Problem Matters

* Provides real-world **ERP and HR workflow experience**.
* Encourages understanding of **module communication** (Employees → Attendance → Payroll).
* Strengthens problem-solving through **business logic implementation**.
* Builds collaboration between team members with **role-based system design**.

---

## 💻 Tech Stack Summary

| Layer               | Tools Used        |
| ------------------- | ----------------- |
| **Frontend**        | React, TypeScript |
| **Backend**         | Spring Boot       |
| **Database**        | MySQL             |
| **Version Control** | Git & GitHub      |

---

## 🏗️ Project Structure

```
workzen-hrms/
│
├── frontend/        # React + TypeScript UI
├── backend/         # Spring Boot APIs
├── docs/            # Schema, diagrams, documentation
├── screenshots/     # Project images
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites

* Node.js & npm
* Java 17+ and Maven
* MySQL Server

### 2️⃣ Clone Repository

```bash
git clone https://github.com/WHITEDEATH-7/WorkZen.git
cd WorkZen
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4️⃣ Backend Setup

```bash
cd backend
# Configure MySQL connection in application.properties
./mvnw spring-boot:run
```

### 5️⃣ Database Setup

* Import `/backend/docs/schema.sql` into MySQL.

### 6️⃣ Environment Variables

* `.env` → Frontend
* `application.properties` → Backend

---

## 📊 Dashboard Preview

Add screenshots of UI components below:

```markdown
![Dashboard](./screenshots/dashboard.png)
![Payroll Summary](./screenshots/payroll.png)
```

---

## 🧱 Hackathon Deliverables

* ✅ GitHub repository with commits
* ✅ Working prototype demo
* ✅ Documentation and architecture diagram
* ✅ Role-based user flows implemented
* ✅ Mockups and schema diagrams included

---

## 🧑‍💻 Team Details

| Name                | Role                         |
| ------------------- | ---------------------------- |
| **Kishan Patel**    | Frontend Developer           |
| **Ayush Prajapati** | Backend & Database Developer |
| **Tushar Jadav**    | Backend & Database Developer |

**Team Name:** *WorkZen Team*
**Repository:** [GitHub – WHITEDEATH-7/WorkZen](https://github.com/WHITEDEATH-7/WorkZen.git)
**Contact:** [tusharjadav009@gmail.com](mailto:tusharjadav009@gmail.com)

---

## 🧠 Future Enhancements

* Automated payroll notifications via email
* Integration with biometric attendance systems
* AI-driven employee performance insights
* Multi-language and multi-currency support

---

## 💬 How to Contribute

1. Fork this repository
2. Create a new branch for your feature
3. Commit with descriptive messages
4. Submit a Pull Request

Example:

```bash
git commit -m "Added attendance approval workflow"
```

---

## 📣 Mockups & Wireframes

* [Excalidraw Wireframe](https://link.excalidraw.com/l/65VNwvy7c4X/7gxoB8JymIS)

---

## 🏆 Conclusion

**WorkZen** provides a robust, modern, and scalable approach to human resource management.
By combining **React**, **Spring Boot**, and **MySQL**, the system delivers a comprehensive HR experience — from attendance tracking to payroll generation — under one unified dashboard.

