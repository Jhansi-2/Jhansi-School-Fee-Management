# Jhansi Sai Laxmi – School Fee Payment Management System

A full-stack mini project built with **HTML, CSS, JavaScript, Express.js and MySQL**.

## Features
- Dashboard showing student count, total assigned fees, collections and pending balance.
- Add, view, edit and delete student profiles.
- Assign academic-year fees to students.
- Record payments with date, payment method and unique receipt number.
- Prevents payments greater than the remaining fee balance.
- Fee status tracking: Paid, Partial and Pending.
- Generate and print an individual student fee report.
- Responsive admin dashboard.

## 1. Database setup in MySQL Workbench
1. Open MySQL Workbench and connect to your local MySQL server.
2. Select **File → Open SQL Script** and open `database.sql` from this project.
3. Click the lightning icon (Execute) to run the script.
4. In the Schemas panel, refresh and confirm that `school_fee_management` exists.
5. The script creates the three tables and inserts optional sample records.

### Database tables
- `students(student_id, name, class_name, phone, email)`
- `fee_details(fee_id, student_id, academic_year, fee_type, total_amount, due_date)`
- `payments(payment_id, fee_id, amount_paid, payment_date, payment_method, receipt_no)`

**Schema note:** The supplied field list described `class` as `DECIMAL(10,2)`. Since a class/grade is text such as `10th` or `Grade 5`, this project uses `class_name VARCHAR(30)`. The payments table is named `payments` to avoid confusion with the SQL keyword `payment`.

## 2. Configure the application
1. Install Node.js (LTS).
2. Open this project folder in VS Code.
3. Copy `.env.example` and rename the copy to `.env`.
4. Update `DB_USER` and `DB_PASSWORD` in `.env` to match your MySQL account.
5. Open the terminal in the project folder and run:

```bash
npm install
npm start
```

6. Open **http://localhost:3000** in your browser.

If PowerShell blocks npm scripts on Windows, use Command Prompt in VS Code (Terminal → Select Default Profile → Command Prompt), then run the commands above.

## 3. Project structure

```text
Jhansi_Sai_Laxmi_School_Fee_Management/
├── database.sql
├── server.js
├── package.json
├── .env.example
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## 4. API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Dashboard totals |
| GET, POST | `/api/students` | List / add students |
| PUT, DELETE | `/api/students/:id` | Edit / delete student |
| GET, POST | `/api/fees` | List / assign fees |
| DELETE | `/api/fees/:id` | Delete fee |
| GET, POST | `/api/payments` | List / record payments |
| GET | `/api/reports/student/:id` | Student fee report |

## 5. Upload to GitHub
1. Sign in at https://github.com and create a new repository named `jhansi-sai-laxmi-school-fee-management`.
2. Do not add a README or other files on GitHub (this project already contains a README).
3. In this project folder, open a terminal and run:

```bash
git init
git add .
git commit -m "Initial school fee management project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jhansi-sai-laxmi-school-fee-management.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Do **not** upload your real `.env` file or database password. Only `.env.example` is included in this ZIP.
