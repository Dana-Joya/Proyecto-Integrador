/**
 * ==============================================================================
 * PATRIMONIA - CONEXIÓN Y APROVISIONAMIENTO AUTOMÁTICO DE BASE DE DATOS (MYSQL)
 * Compatible con XAMPP / WampServer / phpMyAdmin estándar.
 * Genera el esquema de tablas directamente desde los Modelos del sistema
 * (Museum, Artist, Category, Room, Artwork, Tour).
 * ==============================================================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'patrimonia_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true
};

// Crear el pool de conexiones principal
const pool = mysql.createPool(dbConfig);

/**
 * Inicializa las tablas directamente desde las definiciones de los Modelos (POO / JPA)
 * @param {Object} connection - Conexión de base de datos MySQL
 */
async function createTablesFromModels(connection) {
  const Museum = require('./models/Museum');
  const Artist = require('./models/Artist');
  const Category = require('./models/Category');
  const Room = require('./models/Room');
  const Artwork = require('./models/Artwork');
  const Tour = require('./models/Tour');
  const ExhibitionHistory = require('./models/ExhibitionHistory');

  console.log('\x1b[36m%s\x1b[0m', ' [MySQL] Creando tablas desde los modelos de datos...');

  // Orden respetando integridad referencial
  await Museum.createTable(connection);
  await Artist.createTable(connection);
  await Category.createTable(connection);
  await Room.createTable(connection);
  await Artwork.createTable(connection);
  await Tour.createTable(connection);
  // Actualiza instalaciones anteriores sin eliminar los datos existentes.
  await connection.query(`
    ALTER TABLE tours
      ADD COLUMN IF NOT EXISTS description TEXT NULL,
      ADD COLUMN IF NOT EXISTS start_date DATE NULL,
      ADD COLUMN IF NOT EXISTS end_date DATE NULL,
      ADD COLUMN IF NOT EXISTS web_url VARCHAR(500) NULL
  `);
  await ExhibitionHistory.createTable(connection);

  console.log('\x1b[32m%s\x1b[0m', '✓ [MySQL] Tablas verificadas y creadas exitosamente desde los Modelos.');
}

/**
 * Si las tablas están vacías, aprovisiona datos iniciales desde database.sql
 */
async function seedInitialDataIfEmpty(connection) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM artworks;`);
  if (rows && rows[0] && rows[0].total === 0) {
    const sqlPath = path.join(__dirname, 'database.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('\x1b[36m%s\x1b[0m', '⏳ [MySQL] Población de datos patrimoniales iniciales...');
      const sqlScript = fs.readFileSync(sqlPath, 'utf8');
      await connection.query(sqlScript);
      console.log('\x1b[32m%s\x1b[0m', '✓ [MySQL] Datos patrimoniales iniciales sembrados con éxito.');
    }
  }
}

/**
 * Aprovisiona automáticamente la base de datos y sus tablas si aún no existen.
 */
async function autoProvisionDatabase() {
  const rootConn = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    multipleStatements: true
  });

  try {
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.query(`USE \`${dbConfig.database}\`;`);

    // Crear tablas desde los modelos
    await createTablesFromModels(rootConn);

    // Sembrar datos iniciales si está vacía
    await seedInitialDataIfEmpty(rootConn);
  } finally {
    await rootConn.end();
  }
}

/**
 * Verifica la conectividad con MySQL y la base de datos.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();

    // 1. Asegurar tablas desde modelos
    await createTablesFromModels(connection);

    // 2. Sembrar datos si es necesario
    await seedInitialDataIfEmpty(connection);

    console.log('\x1b[32m%s\x1b[0m', `✓ [MySQL] Conexión establecida con éxito a la base de datos: ${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      try {
        console.log('\x1b[33m%s\x1b[0m', `  [MySQL] La base de datos "${dbConfig.database}" no existía. Creándola automáticamente...`);
        await autoProvisionDatabase();
        return await testConnection();
      } catch (provisionErr) {
        console.warn('\x1b[31m%s\x1b[0m', `[MySQL] Error al aprovisionar automáticamente: ${provisionErr.message}`);
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'EACCES') {
      console.warn('\x1b[33m%s\x1b[0m', `  [MySQL] No se pudo conectar a MySQL en ${dbConfig.host}:${dbConfig.port}.`);
      console.warn('\x1b[33m%s\x1b[0m', ` Abre el panel de control de XAMPP y haz clic en "Start" en el módulo MySQL.`);
    } else {
      console.warn('\x1b[31m%s\x1b[0m', ` [MySQL] Error de base de datos: ${error.message}`);
    }
    return false;
  }
}

module.exports = {
  pool,
  dbConfig,
  testConnection,
  autoProvisionDatabase,
  createTablesFromModels
};
