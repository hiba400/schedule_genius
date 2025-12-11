-- ============================
-- RESET COMPLET
-- ============================

DROP DATABASE IF EXISTS ensa_timetable;

CREATE DATABASE ensa_timetable
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE ensa_timetable;

-- ============================
-- TABLES
-- ============================

CREATE TABLE modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  NOT NULL UNIQUE,
  type        VARCHAR(50)  NULL,
  nature      VARCHAR(50)  NULL,
  hours_cm    INT          DEFAULT 0,
  hours_td    INT          DEFAULT 0,
  hours_tp    INT          DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE professors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  specialties VARCHAR(255) NULL,
  max_hours   INT          DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(50)  NULL,          -- TD / TP / AMPHI
  capacity    INT          DEFAULT 0,
  equipment   VARCHAR(255) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  level      VARCHAR(50)  NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  size       INT          DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_groups_program
    FOREIGN KEY (program_id) REFERENCES programs(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professor_id INT NOT NULL,
  day_of_week  TINYINT NOT NULL,   -- 1=lundi ... 7=dimanche
  slot_index   INT NOT NULL,       -- numéro de créneau
  available    BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_availability_prof
    FOREIGN KEY (professor_id) REFERENCES professors(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE timetable_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id     INT NOT NULL,
  module_id    INT NOT NULL,
  professor_id INT NOT NULL,
  room_id      INT NOT NULL,
  day_of_week  TINYINT NOT NULL,
  slot_index   INT NOT NULL,
  semester     VARCHAR(20) NOT NULL,  -- S1, S2...
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_te_group
    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_te_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_te_professor
    FOREIGN KEY (professor_id) REFERENCES professors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_te_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE constraints_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type       VARCHAR(100) NOT NULL,  -- ex: ROOM_CAPACITY, NO_CONFLICT
  params     JSON         NULL,      -- détails de la contrainte
  priority   INT          DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- DONNÉES D'EXEMPLE
-- ============================

-- Programs
INSERT INTO programs (name, level) VALUES
  ('GSEA', '1ère année'),
  ('GSEA', '2ème année');

-- Groups
INSERT INTO groups (program_id, name, size) VALUES
  (1, 'GSEA1-A', 30),
  (1, 'GSEA1-B', 28),
  (2, 'GSEA2-A', 26);

-- Professors
INSERT INTO professors (name, email, specialties, max_hours) VALUES
  ('Pr. El Amrani', 'elamrani@ensa.ma', 'Maths, Stats', 12),
  ('Pr. Berrada',   'berrada@ensa.ma',  'Informatique', 14);

-- Rooms
INSERT INTO rooms (name, type, capacity, equipment) VALUES
  ('Amphi A', 'AMPHI', 120, 'Vidéo-projecteur'),
  ('Salle TD 101', 'TD', 40, 'Tableau blanc'),
  ('Salle TP Info', 'TP', 25, 'PC, Réseau');

-- Modules
INSERT INTO modules (name, code, type, nature, hours_cm, hours_td, hours_tp) VALUES
  ('Analyse 1', 'MATH101', 'Maths', 'Obligatoire', 24, 16, 0),
  ('Programmation C++', 'INFO201', 'Informatique', 'Obligatoire', 20, 10, 20);

-- Disponibilités
INSERT INTO availability (professor_id, day_of_week, slot_index, available) VALUES
  (1, 1, 1, TRUE),
  (1, 3, 2, TRUE),
  (2, 2, 1, TRUE),
  (2, 4, 3, TRUE);

-- Emploi du temps
INSERT INTO timetable_entries
(group_id, module_id, professor_id, room_id, day_of_week, slot_index, semester)
VALUES
  (1, 1, 1, 1, 1, 1, 'S1'),
  (1, 2, 2, 3, 2, 1, 'S1');

