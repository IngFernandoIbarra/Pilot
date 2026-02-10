<?php

/**
 * Mueve un archivo de entrada a una carpeta de respaldo en lugar de eliminarlo.
 *
 * Estructura destino:
 *   {directoryToCheck}/Respaldo/{YYYYmmdd}/{ruta_relativa_desde_directoryToCheck}
 */
function archive_input_file($sourcePath, $directoryToCheck)
{
    if (!file_exists($sourcePath)) {
        return false;
    }

    $sourceReal = realpath($sourcePath);
    $baseReal = realpath($directoryToCheck);

    if ($sourceReal === false || $baseReal === false) {
        return false;
    }

    $relativePath = ltrim(str_replace($baseReal, '', $sourceReal), DIRECTORY_SEPARATOR);
    $backupRoot = $directoryToCheck . DIRECTORY_SEPARATOR . 'Respaldo' . DIRECTORY_SEPARATOR . date('Ymd');
    $backupPath = $backupRoot . DIRECTORY_SEPARATOR . $relativePath;

    $backupDir = dirname($backupPath);
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }

    if (@rename($sourceReal, $backupPath)) {
        return true;
    }

    // Fallback para escenarios donde rename no funciona (por ejemplo, distinto volumen).
    if (@copy($sourceReal, $backupPath)) {
        @unlink($sourceReal);
        return true;
    }

    return false;
}
