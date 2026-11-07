# 🏫 Jhansi Sai Laxmi – School Fee Payment Management System

A web-based School Fee Payment Management System developed to simplify student fee management, payment tracking, and fee report generation.

## 📌 Project Overview

The **Jhansi Sai Laxmi School Fee Payment Management System** is designed to help school administrators manage student information, assign fees, record payments, and monitor pending fee balances through a modern dashboard.

The application uses HTML, CSS, JavaScript, Express.js, and MySQL.

## ✨ Features

- **Dashboard:** View total students, assigned fees, collected fees, and pending fees.
- **Student Management:** Add, view, edit, and delete student records.
- **Fee Management:** Assign fees to students.
- **Payment Management:** Record payments with date and payment method.
- **Receipt Generation:** Generate unique payment receipt numbers.
- **Fee Status:** Track Paid, Partial, and Pending payments.
- **Student Fee Reports:** View and print individual student fee reports.
- **Modern Interface:** Responsive dark-themed admin dashboard.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and dashboard design |
| JavaScript | Frontend functionality |
| Node.js | Server-side runtime |
| Express.js | Backend framework |
| MySQL | Database |
| MySQL2 | Database connectivity |

## 📂 Project Structure

```text
Jhansi_Sai_Laxmi_School_Fee_Management/
│
├── database.sql
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
│
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jhansi-2/Jhansi-School-Fee-Management.git
```

### 2. Open the Project

```bash
cd Jhansi-School-Fee-Management
```

Open the folder in Visual Studio Code.

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up MySQL Database

1. Open MySQL Workbench.
2. Open the `database.sql` file.
3. Execute the SQL script.
4. Verify that the database and tables have been created.

### 5. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a template.

Configure your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_fee_management
PORT=3000
```

Replace `your_mysql_password` with your actual MySQL password.

**Important:** Never upload your `.env` file or database password to GitHub.

### 6. Start the Application

```bash
npm start
```

### 7. Open in Browser

Visit:

```text
http://localhost:3000
```

## 🗄️ Database Design

The application uses three main relational database tables:

### 1. Students
Stores student information such as student ID, name, class, phone number, and email.

### 2. Fee Details
Stores fee information such as fee ID, student ID, academic year, fee type, total amount, and due date.

### 3. Payments
Stores payment information such as payment ID, fee ID, amount paid, payment date, payment method, and receipt number.

**Database Relationships:**
- One student can have multiple fee records.
- One fee record can have multiple payment records.

## 🎯 Project Objectives

- Reduce manual fee management.
- Maintain accurate student fee records.
- Simplify payment tracking.
- Identify pending fee balances.
- Generate student-wise fee reports.
- Improve administrative efficiency.


## 👩‍💻 Developer

**Project Name:** Jhansi Sai Laxmi – School Fee Payment Management System

**GitHub:** [Jhansi-2](https://github.com/Jhansi-2)

**Repository:** [Jhansi-School-Fee-Management](https://github.com/Jhansi-2/Jhansi-School-Fee-Management)

## 📜 License

This project is developed for educational and academic purposes.
