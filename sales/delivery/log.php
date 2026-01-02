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

create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile);
create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile);

//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_unidad_entregada.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_entrega.json", $arrayJson[3]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_fecha_entrega_unidad.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_estado_entregada.json", $arrayJson[5]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_estado_entregada.json", $arrayJson[6]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_unidad_entregada.json", $arrayJson[7]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_entrega.json", $arrayJson[8]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_fecha_entrega_unidad.json", $arrayJson[9]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_estado_entregada.json", $arrayJson[10]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_estado_entregada.json", $arrayJson[11]);

$sql = "UPDATE $Webhook SET facturado = 'N', entregado = 'S' WHERE cancelada = 'N' AND inventario = '$nameFile' AND bid = '$bidFile'";

mysqli_query($dbConn, $sql);

mysqli_close($dbConn);
