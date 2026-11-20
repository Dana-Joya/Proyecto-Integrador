<?php
/**
 * ==============================================================================
 * PATRIMONIA - INSTALADOR Y GENERADOR AUTOMÁTICO DE BASE DE DATOS (XAMPP / PHP)
 * Ejecutable tanto desde el navegador web (Apache) como desde la consola (CLI).
 * ==============================================================================
 */

// Configuración predeterminada de XAMPP / phpMyAdmin
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';
$dbPort = (int)(getenv('DB_PORT') ?: 3306);
$dbName = 'patrimonia_db';

$isCli = (php_sapi_name() === 'cli');

$results = [
    'success' => false,
    'messages' => [],
    'errors' => [],
    'tables' => []
];

try {
    // 1. Intentar conexión al motor MySQL
    $mysqli = @new mysqli($dbHost, $dbUser, $dbPass, '', $dbPort);

    if ($mysqli->connect_errno) {
        // Reintentar con 'localhost' si '127.0.0.1' falló por socket
        $mysqli = @new mysqli('localhost', $dbUser, $dbPass, '', $dbPort);
    }

    if ($mysqli->connect_errno) {
        throw new Exception("No se pudo conectar a MySQL (" . $mysqli->connect_errno . "): " . $mysqli->connect_error . 
            "\n👉 Verifica que en el panel de XAMPP el botón 'MySQL' esté en verde (Start).");
    }

    $results['messages'][] = "✓ Conexión establecida con MySQL en {$dbHost}:{$dbPort}.";

    // 2. Crear la base de datos si no existe
    $createDbSql = "CREATE DATABASE IF NOT EXISTS `{$dbName}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
    if (!$mysqli->query($createDbSql)) {
        throw new Exception("Error al crear la base de datos '{$dbName}': " . $mysqli->error);
    }
    $results['messages'][] = "✓ Base de datos '{$dbName}' verificada / creada exitosamente.";

    // 3. Seleccionar la base de datos
    if (!$mysqli->select_db($dbName)) {
        throw new Exception("No se pudo seleccionar la base de datos '{$dbName}': " . $mysqli->error);
    }

    // 4. Leer el archivo database.sql
    $sqlFile = __DIR__ . DIRECTORY_SEPARATOR . 'database.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("No se encontró el archivo 'database.sql' en la ruta: {$sqlFile}");
    }

    $sqlContent = file_get_contents($sqlFile);
    if (empty($sqlContent)) {
        throw new Exception("El archivo 'database.sql' está vacío.");
    }

    // 5. Ejecutar sentencias múltiples
    if ($mysqli->multi_query($sqlContent)) {
        do {
            if ($result = $mysqli->store_result()) {
                $result->free();
            }
        } while ($mysqli->more_results() && $mysqli->next_result());
    }

    if ($mysqli->errno) {
        throw new Exception("Error al ejecutar 'database.sql': " . $mysqli->error);
    }

    $results['messages'][] = "✓ Tablas y registros patrimoniales cargados correctamente desde database.sql.";

    // 6. Verificar conteo de registros por tabla
    $expectedTables = ['museums', 'artists', 'rooms', 'artworks', 'tours', 'tour_itineraries'];
    foreach ($expectedTables as $table) {
        $check = $mysqli->query("SELECT COUNT(*) AS total FROM `{$table}`");
        if ($check) {
            $row = $check->fetch_assoc();
            $results['tables'][$table] = (int)$row['total'];
            $check->free();
        } else {
            $results['tables'][$table] = 'Error / No creada';
        }
    }

    $results['success'] = true;
    $mysqli->close();

} catch (Exception $e) {
    $rawMsg = $e->getMessage();
    if (strpos($rawMsg, 'No connection could be made') !== false ||
        strpos($rawMsg, 'Intento de acceso a un socket') !== false ||
        strpos($rawMsg, 'Connection refused') !== false ||
        $e->getCode() === 2002) {
        $results['errors'][] = "No se pudo establecer conexión con el servidor MySQL (Puerto {$dbPort}).\n👉 Abre el Panel de Control de XAMPP y presiona el botón 'Start' al lado de MySQL.";
    } else {
        $results['errors'][] = $rawMsg;
    }
}

// ==============================================================================
// SALIDA EN MODO TERMINAL / CLI
// ==============================================================================
if ($isCli) {
    echo "\n==============================================================================\n";
    echo "       PATRIMONIA - INSTALACIÓN DE BASE DE DATOS EN XAMPP (PHP)\n";
    echo "==============================================================================\n\n";

    if ($results['success']) {
        foreach ($results['messages'] as $msg) {
            echo "  {$msg}\n";
        }
        echo "\n  RESUMEN DE TABLAS GENERADAS EN phpMyAdmin:\n";
        echo "  --------------------------------------------------\n";
        foreach ($results['tables'] as $tbl => $count) {
            printf("  • %-20s : %s registros creados\n", $tbl, $count);
        }
        echo "  --------------------------------------------------\n";
        echo "\n  🎉 ¡ÉXITO! La base de datos 'patrimonia_db' está lista en phpMyAdmin.\n";
        echo "  Ya puedes abrir tu navegador en: http://localhost/phpmyadmin\n";
        echo "  Y acceder a la aplicación en:   http://localhost:3000\n\n";
    } else {
        echo "  ❌ ERROR DURANTE LA INSTALACIÓN:\n";
        foreach ($results['errors'] as $err) {
            echo "  {$err}\n";
        }
        echo "\n";
    }
    exit($results['success'] ? 0 : 1);
}

// ==============================================================================
// SALIDA EN MODO NAVEGADOR WEB (HTML)
// ==============================================================================
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Instalador de Base de Datos - PATRIMONIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #8b5cf6;
      --primary-dark: #6d28d9;
      --bg-gradient: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --success: #10b981;
      --success-light: #ecfdf5;
      --danger: #ef4444;
      --danger-light: #fef2f2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .installer-card {
      background: var(--card-bg);
      max-width: 680px;
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 20px 40px -15px rgba(109, 40, 217, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1);
      padding: 40px;
      overflow: hidden;
    }
    .header-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #a78bfa, #8b5cf6);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 20px;
      box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.4);
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
      margin-bottom: 24px;
    }
    .status-alert {
      padding: 16px 20px;
      border-radius: 14px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 24px;
      font-size: 14.5px;
      line-height: 1.5;
    }
    .status-alert.success {
      background: var(--success-light);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #065f46;
    }
    .status-alert.danger {
      background: var(--danger-light);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #991b1b;
    }
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .table-item {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    .table-name {
      font-weight: 600;
      color: #334155;
    }
    .table-count {
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 12.5px;
      padding: 3px 10px;
      border-radius: 20px;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      flex: 1;
      min-width: 160px;
      padding: 13px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
  </style>
</head>
<body>

  <div class="installer-card">
    <div class="header-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        <path d="M4 10h16M4 14h16"/>
      </svg>
    </div>

    <h1>PATRIMONIA - Instalador de Base de Datos</h1>
    <p class="subtitle">Generador automático de esquema patrimonial para MySQL y phpMyAdmin en XAMPP.</p>

    <?php if ($results['success']): ?>
      <div class="status-alert success">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <strong>¡Base de Datos Creada y Poblada con Éxito!</strong><br>
          La base de datos <code>patrimonia_db</code> ya está completamente configurada en tu phpMyAdmin con todas sus tablas y datos iniciales.
        </div>
      </div>

      <h3 style="font-size: 15px; margin-bottom: 12px; color: #475569;">Tablas Verificadas en phpMyAdmin:</h3>
      <div class="tables-grid">
        <?php foreach ($results['tables'] as $tbl => $count): ?>
          <div class="table-item">
            <span class="table-name"><?= htmlspecialchars($tbl) ?></span>
            <span class="table-count"><?= htmlspecialchars($count) ?> registros</span>
          </div>
        <?php endforeach; ?>
      </div>

      <div class="actions">
        <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=patrimonia_db" target="_blank" class="btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Ver en phpMyAdmin
        </a>
        <a href="http://localhost:3000" target="_blank" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Abrir PATRIMONIA
        </a>
      </div>

    <?php else: ?>
      <div class="status-alert danger">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>Error al generar la base de datos:</strong><br>
          <?php foreach ($results['errors'] as $err): ?>
            <div><?= nl2br(htmlspecialchars($err)) ?></div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="actions">
        <button onclick="location.reload()" class="btn btn-primary">
          Reintentar Instalación
        </button>
      </div>
    <?php endif; ?>

  </div>

</body>
</html>
