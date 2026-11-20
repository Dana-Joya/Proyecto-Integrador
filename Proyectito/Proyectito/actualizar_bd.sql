-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre patrimonia_db.
USE patrimonia_db;

ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS start_date DATE NULL,
  ADD COLUMN IF NOT EXISTS end_date DATE NULL,
  ADD COLUMN IF NOT EXISTS web_url VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS exhibition_history (
  id INT NOT NULL AUTO_INCREMENT,
  artwork_id VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_exhibition_artwork (artwork_id),
  KEY idx_exhibition_room (room_id),
  CONSTRAINT fk_exhibition_artwork FOREIGN KEY (artwork_id)
    REFERENCES artworks (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_exhibition_room FOREIGN KEY (room_id)
    REFERENCES rooms (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
