# Runtime Python para Producción (sin dependencia de PHP)

Este runtime ya no depende de `connection/*.php` ni de código JS para tokens.
Toda la configuración vive en archivos JSON editables.

## Archivos de configuración
- `python_runtime/config/runtime_config.json`
- `python_runtime/config/tokens.json`

## Interfaz gráfica
Ejecuta:
```bash
python -m python_runtime.gui_app
```

La interfaz permite:
- Ver eventos de envío en tiempo real.
- Botón **Iniciar envíos**.
- Botón **Detener envíos**.
- Agregar y eliminar tokens manualmente (guardados fuera del código).

## Modo consola
```bash
python -m python_runtime.run_production --once
python -m python_runtime.run_production
```

## Respaldo de archivos procesados
Los archivos se mueven a:
`{directory_to_check}/Respaldo/YYYYmmdd/...`

## Nota de migración
Si hoy usas valores en PHP, cópialos una sola vez al JSON y desde ahí opera todo Python.
