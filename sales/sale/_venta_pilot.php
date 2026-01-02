<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');

include "C:/laragon/www/PILOT/connection/includes.php";

$json = file_get_contents('php://input');

$arrayJson = json_decode($json, true);

//Json con los datos de la venta

$nameFile = $arrayJson[0]["nameFile"];
$bidFile = $arrayJson[1]["bid"];

$id_sale = $arrayJson[2]["saleResult"]["result"]["entitydata"]["id"];

$id_customer = $arrayJson[2]["saleResult"]["result"]["entitydata"]["customer"]["id"];

$id_stock = $arrayJson[2]["saleResult"]["result"]["entitydata"]["vehicle"]["id"];

$bid = $arrayJson[2]["saleResult"]["result"]["entitydata"]["branch"]["code"];

$sql = "UPDATE $Webhook SET datos_correctos = 'S', id_cliente = '$id_customer', id_stock = '$id_stock', bid = '$bid' WHERE id = '$id_sale'";

mysqli_query($dbConn, $sql);

create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile);
create_folder($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile);

//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_venta_pilot.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_unidad_pilot.json", $arrayJson[3]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_cliente_pilot.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_comentario_asesor.json", $arrayJson[5]);

//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_comentario_asesor.json", $arrayJson[6]);

mysqli_close($dbConn);
