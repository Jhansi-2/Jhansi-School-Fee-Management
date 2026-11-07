-- Jhansi Sai Laxmi - School Fee Payment Management System
-- Import this file in MySQL Workbench (Server > Data Import), or run it in a SQL tab.

CREATE DATABASE IF NOT EXISTS school_fee_management;
USE school_fee_management;

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class_name VARCHAR(30) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS fee_details (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    CONSTRAINT fk_fee_student FOREIGN KEY (student_id)
        REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id)
        REFERENCES fee_details(fee_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Optional sample records. Remove this section if you want an empty database.
INSERT INTO students (name, class_name, phone, email) VALUES
('Aarav Kumar', '10th', '9876543210', 'aarav@example.com'),
('Priya Sharma', '9th', '9876501234', 'priya@example.com'),
('Rahul Reddy', '8th', '9123456780', 'rahul@example.com');

INSERT INTO fee_details (student_id, academic_year, fee_type, total_amount, due_date) VALUES
(1, '2026-2027', 'Tuition Fee', 25000.00, '2026-12-15'),
(1, '2026-2027', 'Transport Fee', 8000.00, '2026-12-15'),
(2, '2026-2027', 'Tuition Fee', 22000.00, '2026-12-15'),
(3, '2026-2027', 'Tuition Fee', 20000.00, '2026-12-15');

INSERT INTO payments (fee_id, amount_paid, payment_date, payment_method, receipt_no) VALUES
(1, 10000.00, '2026-11-01', 'UPI', 'JSL-2026-0001'),
(2, 3000.00, '2026-11-02', 'Cash', 'JSL-2026-0002'),
(3, 22000.00, '2026-11-03', 'Bank Transfer', 'JSL-2026-0003');
