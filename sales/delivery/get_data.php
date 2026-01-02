<?php

//Entregado

include "C:/laragon/www/PILOT/connection/includes.php";

error_reporting(0);

try {

    if (is_dir($directoryToCheck)) {

        $iterator = new RecursiveIteratorIterator(

            new RecursiveDirectoryIterator($directoryToCheck)
        );

        $sql = "SELECT * FROM $Webhook WHERE facturado = 'S'";

        $result = mysqli_query($dbConn, $sql);

        foreach ($iterator as $file) {

            if (strpos($file->getPathname(), '_FechaEntrega') !== False) {

                if ($result->num_rows > 0) {

                    while ($fila = $result->fetch_assoc()) {

                        if (strpos($file->getPathname(), $fila['vin'])) {

                            //Archivo Comentario

                            $fileComment = str_replace('_FechaEntrega', '_Comentario', $file->getPathname());

                            $jsonStatus = json_decode(file_get_contents($file->getPathname()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                            $get_id = $fila['id'];
                            $get_inv = $fila['inventario'];
                            $get_idStock = $fila['id_stock'];
                            $get_bid = $fila['bid'];
                            $jsonComment = json_decode(file_get_contents($fileComment), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                            //Eliminar archivo de servidor local

                            unlink($file->getPathname());

                            unlink($fileComment);

                            break;
                        } 
                    }
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
    'id' => $get_id,
    'inv' => $get_inv,
    'idStock' => $get_idStock,
    'bid' => $get_bid,
    'jsonComment' => $jsonComment

);

// Convierte el array a formato JSON y lo devuelve
echo json_encode($data);

mysqli_close($dbConn);
