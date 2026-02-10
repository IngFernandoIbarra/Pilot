# Runtime Python para Producción

Este runtime permite operar en Python con la misma base de configuración que PHP.

## Qué toma de `connection/` y `token/`
- `connection/routes.php`: `directoryToCheck` y `directoryToLog`.
- `connection/connection.php`: host/usuario/password/base de datos.
- `connection/tables.php`: nombres de tablas (`Customer`, `Stock`, `Erp`).
- `token/AuthorizationBearer.txt`: bearer para integración.

## Ejecución
```bash
python -m python_runtime.run_production --once
python -m python_runtime.run_production --interval 15
```

## Equivalencias con PHP
- Reglas de detección de archivos basadas en `functions/selection_module.php`.
- Respaldo de archivos procesados en `Respaldo/YYYYmmdd` (en lugar de borrado directo).
- Escaneo periódico cada 15 segundos (igual que el ciclo de la UI actual).

## Recomendación para pasar a producción
1. Mover credenciales a variables de entorno y dejar `connection/*.php` solo como fallback.
2. Ejecutar este runtime como servicio (systemd/supervisor).
3. Implementar handlers por ruta (`sales_order`, `stock_create`, etc.) para llamar API PILOT y DB.
