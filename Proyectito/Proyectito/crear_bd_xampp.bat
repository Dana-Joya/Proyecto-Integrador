@echo off
chcp 65001 > nul
title PATRIMONIA - Creador de Base de Datos en phpMyAdmin / XAMPP
color 0A

echo ==============================================================================
echo        PATRIMONIA - GENERADOR DE BASE DE DATOS EN XAMPP / PHPMYADMIN
echo ==============================================================================
echo.

:: 1. Comprobar si XAMPP PHP existe
set PHP_BIN=
if exist "C:\xampp\php\php.exe" (
    set PHP_BIN=C:\xampp\php\php.exe
) else (
    where php >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        set PHP_BIN=php
    )
)

if "%PHP_BIN%"=="" (
    color 0C
    echo [ERROR] No se encontró el ejecutable de PHP en C:\xampp\php\php.exe ni en el PATH.
    echo Por favor asegúrate de tener XAMPP instalado.
    echo.
    pause
    exit /b 1
)

:: 2. Comprobar si el servicio MySQL está activo
echo [1/2] Verificando servicio de MySQL...
netstat -ano | findstr :3306 > nul
if %ERRORLEVEL% neq 0 (
    echo   ⚠️ MySQL no parece estar corriendo en el puerto 3306.
    echo   Intentando iniciar MySQL desde XAMPP...
    if exist "C:\xampp\mysql_start.bat" (
        start /b "" "C:\xampp\mysql_start.bat"
        timeout /t 3 /nobreak > nul
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /b "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak > nul
    )
) else (
    echo   ✓ Servicio MySQL detectado en el puerto 3306.
)

echo.
:: 3. Ejecutar el script PHP de aprovisionamiento
echo [2/2] Ejecutando generador de base de datos 'patrimonia_db'...
echo.
"%PHP_BIN%" "%~dp0instalar_bd.php"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==============================================================================
    echo  ¿Deseas abrir phpMyAdmin para ver las tablas creadas? (S/N)
    set /p OPEN_PMA="  > "
    if /i "%OPEN_PMA%"=="S" (
        start "" "http://localhost/phpmyadmin/index.php?route=/database/structure&db=patrimonia_db"
    )
)

echo.
pause

