<?php

//Dar de alta unidad

include "C:/laragon/www/PILOT/connection/includes.php";

try {

    if (is_dir($directoryToCheck)) {

        $iterator = new RecursiveIteratorIterator(

            new RecursiveDirectoryIterator($directoryToCheck)
        );

        foreach ($iterator as $file) {

            if (strpos($file->getPathname(), 'Compras_Nuevos_') !== False) {

                $jsonStatus = json_decode(file_get_contents($file->getPathname()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                //Eliminar archivo de servidor local

                archive_input_file($file->getPathname(), $directoryToCheck);

                break;
            }
        }
    }
} catch (Exception $e) {
    // Manejar excepciones
    echo "Error: " . $e->getMessage();
}

// Crea un array asociativo con los datos
$data = array(
    'jsonStatus' => $jsonStatus
);

// Convierte el array a formato JSON y lo devuelve
echo json_encode($data);
