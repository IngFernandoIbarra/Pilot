<?php

//Dar de alta unidad

include "C:/laragon/www/PILOT/connection/includes.php";

if (is_dir($directoryToCheck)) {

    $iterator = new RecursiveIteratorIterator(

        new RecursiveDirectoryIterator($directoryToCheck)
    );

    foreach ($iterator as $file) {

        if (strpos($file->getPathname(), 'Carga_Nuevos') !== False) {

            // Ruta al archivo que contiene los JSON
            $archivo = $file->getPathname();

            // Inicializar el array asociativo
            $arrayAsociativo = [];

            // Abrir el archivo en modo lectura
            $archivoHandle = fopen($archivo, 'r');

            // Verificar si el archivo se abrió correctamente
            if ($archivoHandle) {
                $json = '';
                $lineaActual = 0;

                // Leer el archivo línea por línea
                while (($linea = fgets($archivoHandle)) !== false) {
                    $lineaActual++;

                    // Concatenar la línea al JSON
                    $json .= $linea;

                    if ($lineaActual % 43 === 0) {

                        $datos = json_decode($json, false, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                        if ($datos) {

                            $arrayAsociativo[] = $datos;
                        }

                        // Reiniciar la variable para el próximo JSON
                        $json = '';
                    }
                }

                fclose($archivoHandle);
            }

            // Crea un array asociativo con los datos
            $data = array(
                'jsonStatus' => $arrayAsociativo
            );

            // Convierte el array a formato JSON y lo devuelve
            echo json_encode($data);

            //Eliminar archivo de servidor local

            unlink($file->getPathname());
        }
    }
}
