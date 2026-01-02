<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');

include "C:/laragon/www/PILOT/connection/includes.php";

$json = file_get_contents('php://input');

$arrayJson = json_decode($json, true);

$nameFile = $arrayJson[0]["nameFile"];
$bidFile = $arrayJson[1]["bid"];

//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "_error_integration.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "_nota_error_integration.json", $arrayJson[3]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "_error_integration.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "_nota_error_integration.json", $arrayJson[5]);

$sql = "UPDATE $Webhook SET estatus = 'error_integración' WHERE id = '$nameFile'";

mysqli_query($dbConn, $sql);

mysqli_close($dbConn);


