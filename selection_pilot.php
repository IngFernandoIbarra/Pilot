<?php

header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

include "C:/laragon/www/PILOT/connection/includes.php";

//Revisar si hay Venta compartida por Pilot

$sql = "SELECT * FROM $Webhook WHERE datos_correctos = 'N' AND estatus = 'aprobada'";

$result = mysqli_query($dbConn, $sql);

if ($result->num_rows > 0) {

    header($sale_url, TRUE, 302);
}

//Cierre de conexion a DB

mysqli_close($dbConn);

//Deteccion de archivos y clasificacion de envio

send_data($directoryToCheck);

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" type="image/jpg" href="img/fav.jpg" />
    <link rel="stylesheet" href="css/styles.css">
    <title>Pilot</title>
</head>

<body>
    <div class="container">
        <div class="row justify-content-center align-items-center vh-100">
            <div class="col-6 text-center">
                <div class="spinner-border text-info" role="status">
                    <span class="visually-hidden">Conectando...</span>
                </div>
                <p id="info" class="mt-3">Conectando...</p>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="connection/redirect.js"></script>
    <script>
        
        setInterval(function() {

            window.location.href = indexUrl;

            console.log("Conectando...");

        }, 15000);

    </script>
</body>

</html>