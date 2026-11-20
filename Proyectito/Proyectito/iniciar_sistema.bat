@echo off
chcp 65001 > nul
title PATRIMONIA - Sistema de Administración de Museos
color 0B

echo ==============================================================================
echo        PATRIMONIA - SISTEMA DE ADMINISTRACIÓN DE MUSEOS Y PATRIMONIO
echo ==============================================================================
echo.

:: 1. Verificar e Iniciar MySQL de XAMPP si está instalado
echo [1/3] Verificando servicio de Base de Datos MySQL...
netstat -ano | findstr :3306 > nul
if %ERRORLEVEL% equ 0 (
    echo   ✓ MySQL ya está ejecutándose en el puerto 3306.
) else (
    echo   ⚠️ MySQL no está activo. Intentando iniciar servicio de XAMPP...
    if exist "C:\xampp\mysql_start.bat" (
        start /b "" "C:\xampp\mysql_start.bat"
        timeout /t 3 /nobreak > nul
        echo   ✓ XAMPP MySQL iniciado.
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /b "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak > nul
        echo   ✓ Motor MySQL iniciado.
    ) else (
        echo   ℹ️ XAMPP no detectado en ruta predeterminada.
        echo      Si usas XAMPP, asegúrate de presionar 'Start' en MySQL desde el Panel de XAMPP.
        echo      La aplicación continuará y guardará datos en Almacenamiento Persistente Local.
    )
)

echo.
:: 2. Instalar dependencias si faltan
if not exist "node_modules\" (
    echo [2/3] Instalando dependencias de Node.js...
    call npm install
) else (
    echo [2/3] Dependencias de Node.js verificadas.
)

echo.
:: 3. Iniciar el servidor Node.js y abrir la aplicación
echo [3/3] Iniciando Servidor PATRIMONIA en http://localhost:3000 ...
start "" "http://localhost:3000"
node server.js

pause

