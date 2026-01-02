<?php

include "../connection/includes.php";

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');


$file = '../token/AuthorizationBearer.txt';

if (file_exists($file)) {

    $content = file_get_contents($file);

    if ($content !== false) {

        $token = $content;
    }
}

// Obtiene el encabezado "Authorization" de la solicitud entrante

$authorization = $_SERVER['HTTP_AUTHORIZATION'];

// Comprueba si el encabezado de autorización está presente y tiene el formato correcto

if ($authorization && preg_match('/Bearer (.+)/', $authorization, $matches)) {

    $auth = $matches[1];

    // Compara el token recibido con el token secreto

    if ($auth === $token) {

        //Extraer BID de la URL

        $bid = $_GET["bid"];

        if ($bid == "") {

            $bid = "M2041";
            
        }

        // El token es válido, procede a procesar los datos

        // Recibe los datos del webhook

        $json = file_get_contents('php://input');

        $data = json_decode($json, true);

        $topic = $data['topic'];

        $event = $data['event'];

        $id = $data['id'];

        date_default_timezone_set('America/Mexico_City');

        $fecha_actual = date("Y-m-d H:i:s");

        // Verificar si el id ya existe en la base de datos

        $sql = "SELECT * FROM Erp WHERE id = '$id'";

        $result = $dbConn->query($sql);

        if ($result->num_rows == 0) {

            $sql = "INSERT INTO Erp (topic, event, id, bid, fecha) VALUES ('$topic', '$event', '$id', '$bid', '$fecha_actual');";

            mysqli_query($dbConn, $sql);

            // Responde con un código de estado 200 para indicar que la solicitud fue recibida con éxito

            http_response_code(200);

            echo "200 OK";

        } else {

            $sql = "UPDATE Erp SET estatus = 'aprobada' WHERE id = '$id'";

            mysqli_query($dbConn, $sql);

            // Responde con un código de estado 200 para indicar que la solicitud fue recibida con éxito

            http_response_code(200);

            echo "200 OK";
        }
    } else {

        // El token es inválido, responde con un error 401 No Autorizado

        http_response_code(401);

        echo "Token inválido.";
    }
} else {

    // El encabezado de autorización no está presente o no tiene el formato correcto, responde con un error 401

    http_response_code(401);

    echo "Acceso no autorizado.";
}

mysqli_close($dbConn);