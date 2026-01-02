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
$vin = $arrayJson[10]["vin"];

create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile);
create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile);

//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_anular_venta.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_venta_anulada.json", $arrayJson[3]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_estado_inventario.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_estado_inventario.json", $arrayJson[5]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_anular_venta.json", $arrayJson[6]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_venta_anulada.json", $arrayJson[7]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_estado_inventario.json", $arrayJson[8]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_estado_inventario.json", $arrayJson[9]);

$sql = "UPDATE $Webhook SET pedido = 'N', facturado = 'N', cancelada = 'S' WHERE inventario = '$nameFile' AND bid = '$bidFile'";

mysqli_query($dbConn, $sql);

//Eliminar archivo de servidor local de cliente y de la unidad enviado de PILOT, para que no se puede hacer pedido automatico

unlink($directoryToCheck . "/" . $bidFile . "/" . "Recibido" . "/" . $vin . "_unidad.txt");
unlink($directoryToCheck . "/" . $bidFile . "/" . "Recibido" . "/" . $vin . "_cliente.txt");

mysqli_close($dbConn);
