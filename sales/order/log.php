<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');

include "C:/laragon/www/PILOT/connection/includes.php";

error_reporting(0);

$json = file_get_contents('php://input');

$arrayJson = json_decode($json, true);

$nameFile = $arrayJson[0]["nameFile"];
$bidFile = $arrayJson[1]["bid"];

create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile);
create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile);
    
//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_orden_venta_creada.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_numero_orden_venta.json", $arrayJson[3]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_orden_venta.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_unidad_asignada.json", $arrayJson[5]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_unidad_asignada.json", $arrayJson[6]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_unidad_pedida.json", $arrayJson[7]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_unidad_pedida.json", $arrayJson[8]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_orden_venta_creada.json", $arrayJson[9]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_numero_orden_venta.json", $arrayJson[10]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_orden_venta.json", $arrayJson[11]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_unidad_asignada.json", $arrayJson[12]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_unidad_asignada.json", $arrayJson[13]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_unidad_pedida.json", $arrayJson[14]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_unidad_pedida.json", $arrayJson[15]);

//Actualizar Estado de Pedido
$sql = "UPDATE $Webhook SET pedido = 'S' WHERE facturado = 'N' AND entregado = 'N' AND cancelada = 'N' AND inventario = '$nameFile' AND bid = '$bidFile'";

mysqli_query($dbConn, $sql);

mysqli_close($dbConn);
