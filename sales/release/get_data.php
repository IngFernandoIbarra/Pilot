<?php

//Anular

include "C:/laragon/www/PILOT/connection/includes.php";

error_reporting(0);

try {

    if (is_dir($directoryToCheck)) {

        $iterator = new RecursiveIteratorIterator(

            new RecursiveDirectoryIterator($directoryToCheck)
        );

        $sql = "SELECT * FROM $Webhook WHERE pedido = 'S' OR facturado = 'S'";

        $result = mysqli_query($dbConn, $sql);

        foreach ($iterator as $file) {

            if (strpos($file->getPathname(), '_Liberar') !== False && strlen($file->getPathname()) > 54) {

                if ($result->num_rows > 0) {

                    while ($fila = $result->fetch_assoc()) {

                        if (strpos($file->getPathname(), $fila['vin'])) {

                            $get_id = $fila['id'];
                            $get_inv = $fila['inventario'];
                            $get_idStock = $fila['id_stock'];
                            $get_bid = $fila['bid'];
                            $get_vin = $fila['vin'];

                            //Eliminar archivo de servidor local

                            archive_input_file($file->getPathname(), $directoryToCheck);

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
    'id' => $get_id,
    'inv' => $get_inv,
    'idStock' => $get_idStock,
    'bid' => $get_bid,
    'vin' => $get_vin

);

// Convierte el array a formato JSON y lo devuelve
echo json_encode($data);

mysqli_close($dbConn);
