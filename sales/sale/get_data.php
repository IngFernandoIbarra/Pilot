<?php

include "C:/laragon/www/PILOT/connection/includes.php";

error_reporting(0);

try {

    $sql = "SELECT * FROM $Webhook WHERE datos_correctos = 'N' AND estatus = 'aprobada'";

    $result = mysqli_query($dbConn, $sql);

    if ($result->num_rows > 0) {

        while ($fila = $result->fetch_assoc()) {

            $get_id = $fila['id'];
            $get_bid = $fila['bid'];
        }
    }
} catch (Exception $e) {
    // Manejar excepciones
    echo "Error: " . $e->getMessage();
}

// Crea un array asociativo con los datos
$data = array(
    'id' => $get_id,
    'bid' => $get_bid

);

// Convierte el array a formato JSON y lo devuelve
echo json_encode($data);

mysqli_close($dbConn);
