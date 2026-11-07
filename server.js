require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Root",
  database: process.env.DB_NAME || "school_fee_management",
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true
});

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/dashboard", asyncRoute(async (req, res) => {
  const [[students]] = await pool.query("SELECT COUNT(*) AS total FROM students");
  const [[fees]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM fee_details");
  const [[paid]] = await pool.query("SELECT COALESCE(SUM(amount_paid),0) AS total FROM payments");
  const [[pending]] = await pool.query(`
    SELECT COALESCE(SUM(GREATEST(f.total_amount - COALESCE(p.paid,0),0)),0) AS total
    FROM fee_details f LEFT JOIN
      (SELECT fee_id, SUM(amount_paid) paid FROM payments GROUP BY fee_id) p
    ON p.fee_id=f.fee_id`);
  res.json({ students: students.total, fees: fees.total, collected: paid.total, pending: pending.total });
}));

app.get("/api/students", asyncRoute(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.*, COALESCE(SUM(f.total_amount),0) AS assigned_fees,
      COALESCE(SUM(p.paid),0) AS paid_amount
    FROM students s
    LEFT JOIN fee_details f ON f.student_id=s.student_id
    LEFT JOIN (SELECT fee_id, SUM(amount_paid) paid FROM payments GROUP BY fee_id) p ON p.fee_id=f.fee_id
    GROUP BY s.student_id ORDER BY s.student_id DESC`);
  res.json(rows);
}));

app.post("/api/students", asyncRoute(async (req, res) => {
  const { name, class_name, phone, email } = req.body;
  if (!name || !class_name) return res.status(400).json({ error: "Student name and class are required." });
  const [result] = await pool.query(
    "INSERT INTO students (name,class_name,phone,email) VALUES (?,?,?,?)",
    [name.trim(), class_name.trim(), phone || null, email || null]);
  res.status(201).json({ student_id: result.insertId, message: "Student added." });
}));

app.put("/api/students/:id", asyncRoute(async (req, res) => {
  const { name, class_name, phone, email } = req.body;
  if (!name || !class_name) return res.status(400).json({ error: "Student name and class are required." });
  const [result] = await pool.query(
    "UPDATE students SET name=?,class_name=?,phone=?,email=? WHERE student_id=?",
    [name.trim(), class_name.trim(), phone || null, email || null, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Student not found." });
  res.json({ message: "Student updated." });
}));

app.delete("/api/students/:id", asyncRoute(async (req, res) => {
  const [result] = await pool.query("DELETE FROM students WHERE student_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Student not found." });
  res.json({ message: "Student and related fee/payment records deleted." });
}));

app.get("/api/fees", asyncRoute(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT f.*, s.name AS student_name, s.class_name,
      COALESCE(p.paid,0) AS amount_paid,
      GREATEST(f.total_amount-COALESCE(p.paid,0),0) AS balance
    FROM fee_details f JOIN students s ON s.student_id=f.student_id
    LEFT JOIN (SELECT fee_id,SUM(amount_paid) paid FROM payments GROUP BY fee_id) p ON p.fee_id=f.fee_id
    ORDER BY f.due_date ASC`);
  res.json(rows);
}));

app.post("/api/fees", asyncRoute(async (req, res) => {
  const { student_id, academic_year, fee_type, total_amount, due_date } = req.body;
  if (!student_id || !academic_year || !fee_type || !(Number(total_amount) > 0) || !due_date)
    return res.status(400).json({ error: "Please complete all fee fields with a valid amount." });
  const [result] = await pool.query(
    "INSERT INTO fee_details (student_id,academic_year,fee_type,total_amount,due_date) VALUES (?,?,?,?,?)",
    [student_id, academic_year, fee_type, total_amount, due_date]);
  res.status(201).json({ fee_id: result.insertId, message: "Fee assigned." });
}));

app.delete("/api/fees/:id", asyncRoute(async (req, res) => {
  const [result] = await pool.query("DELETE FROM fee_details WHERE fee_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Fee record not found." });
  res.json({ message: "Fee and its payment records deleted." });
}));

app.get("/api/payments", asyncRoute(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, f.fee_type, s.name AS student_name, f.academic_year
    FROM payments p JOIN fee_details f ON f.fee_id=p.fee_id
    JOIN students s ON s.student_id=f.student_id ORDER BY p.payment_date DESC,p.payment_id DESC`);
  res.json(rows);
}));

app.post("/api/payments", asyncRoute(async (req, res) => {
  const { fee_id, amount_paid, payment_date, payment_method, receipt_no } = req.body;
  if (!fee_id || !(Number(amount_paid) > 0) || !payment_date || !payment_method || !receipt_no)
    return res.status(400).json({ error: "Please complete all payment fields." });
  const [[fee]] = await pool.query("SELECT total_amount FROM fee_details WHERE fee_id=?", [fee_id]);
  if (!fee) return res.status(404).json({ error: "Fee record not found." });
  const [[paid]] = await pool.query("SELECT COALESCE(SUM(amount_paid),0) AS total FROM payments WHERE fee_id=?", [fee_id]);
  if (Number(amount_paid) > fee.total_amount - paid.total + 0.001)
    return res.status(400).json({ error: "Payment exceeds the remaining fee balance." });
  const [result] = await pool.query(
    "INSERT INTO payments (fee_id,amount_paid,payment_date,payment_method,receipt_no) VALUES (?,?,?,?,?)",
    [fee_id, amount_paid, payment_date, payment_method, receipt_no.trim()]);
  res.status(201).json({ payment_id: result.insertId, message: "Payment recorded." });
}));

app.get("/api/reports/student/:id", asyncRoute(async (req, res) => {
  const [[student]] = await pool.query("SELECT * FROM students WHERE student_id=?", [req.params.id]);
  if (!student) return res.status(404).json({ error: "Student not found." });
  const [fees] = await pool.query(`
    SELECT f.*,COALESCE(SUM(p.amount_paid),0) amount_paid,
      GREATEST(f.total_amount-COALESCE(SUM(p.amount_paid),0),0) balance
    FROM fee_details f LEFT JOIN payments p ON p.fee_id=f.fee_id
    WHERE f.student_id=? GROUP BY f.fee_id ORDER BY f.due_date`, [req.params.id]);
  res.json({ student, fees });
}));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Receipt number already exists." });
  if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Selected student or fee does not exist." });
  res.status(500).json({ error: "Server/database error. Check your MySQL connection and configuration." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`School Fee Management running at http://localhost:${port}`));
