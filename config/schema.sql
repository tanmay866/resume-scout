-- Create database if not exists
CREATE DATABASE IF NOT EXISTS resume_scout;
USE resume_scout;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  profile_picture VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  location VARCHAR(100) DEFAULT NULL,
  job_title VARCHAR(100) DEFAULT NULL,
  company VARCHAR(100) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  linkedin VARCHAR(255) DEFAULT NULL,
  github VARCHAR(255) DEFAULT NULL,
  skills TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NULL,
  file_size INT NULL,
  file_type VARCHAR(50) NULL,
  status ENUM('pending', 'processing', 'processing_limited', 'processed', 'processed_with_errors', 'error') DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create resume_data table for parsed information
CREATE TABLE IF NOT EXISTS resume_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  location TEXT,
  summary TEXT,
  parsed_json JSON,
  parsed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Create resume_skills junction tablea
CREATE TABLE IF NOT EXISTS resume_skills (
  resume_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (resume_id, skill_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(100),
  location VARCHAR(100),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create job_skills junction table
CREATE TABLE IF NOT EXISTS job_skills (
  job_id INT NOT NULL,
  skill_id INT NOT NULL,
  weight FLOAT DEFAULT 1.0,
  PRIMARY KEY (job_id, skill_id),
  FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Create resume_job_matches table
CREATE TABLE IF NOT EXISTS resume_job_matches (
  resume_id INT NOT NULL,
  job_id INT NOT NULL,
  match_score FLOAT NOT NULL,
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (resume_id, job_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  resume_strength INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
); 