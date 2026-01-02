<?php

//Actualizar unidad

include "C:/laragon/www/PILOT/connection/includes.php";

//Patrones en BID
$bids = ['M2041', 'M2042', 'M2032', 'M2095', 'M2105', 'M2112', 'M2142'];

// Crea una expresión regular con los patrones
$regex = '/(' . implode('|', $bids) . ')/';

try {

    if (is_dir($directoryToCheck)) {

        $iterator = new RecursiveIteratorIterator(

            new RecursiveDirectoryIterator($directoryToCheck)
        );

        foreach ($iterator as $file) {

            if (strpos($file->getPathname(), 'Update_Nuevos_') !== False) {

                // Realiza la búsqueda utilizando la expresión regular
                if (preg_match($regex, $file->getPathname(), $bid)) {

                    $name = explode('_',  pathinfo($file->getPathname(), PATHINFO_FILENAME));
                    $inv = end($name);

                    $jsonStatus = json_decode(file_get_contents($file->getPathname()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                    $get_bid = $bid[0];

                    $get_inv = $inv;

                    //Eliminar archivo de servidor local

                    unlink($file->getPathname());

                    break;
                }
            }
        }
    }
} catch (Exception $e) {
    // Manejar excepciones
    echo "Error: " . $e->getMessage();
}

// Crea un array asociativo con los datos
$data = array(
    'jsonStatus' => $jsonStatus,
    'bid' => $get_bid,
    'inv' => $get_inv

);

// Convierte el array a formato JSON y lo devuelve
echo json_encode($data);
