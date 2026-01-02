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
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nuevo_cliente.json", $arrayJson[2]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_nota_nuevo_cliente.json", $arrayJson[3]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nuevo_cliente.json", $arrayJson[4]);
create_log($directoryToLog . "/" . $bidFile . "/" . "Ventas" . "/" . $nameFile . "/" . $nameFile . "_nota_nuevo_cliente.json", $arrayJson[5]);

//Insertar cliente nuevo en BD local para referencias

$id_pilot = $arrayJson[3]["customerResponseData"]["result"]["entitydata"]["id"];

$tax_identification = $arrayJson[3]["customerResponseData"]["result"]["entitydata"]["tax_identification"];

$nombre = $arrayJson[3]["customerResponseData"]["result"]["entitydata"]["name"];

$integration_reference_code = $arrayJson[3]["customerResponseData"]["result"]["entitydata"]["integration_reference_code"];

$sql = "INSERT INTO $Clientes (id_pilot, tax_identification, nombre, integration_reference_code) VALUES ('$id_pilot', '$tax_identification', '$nombre', '$integration_reference_code')";

mysqli_query($dbConn, $sql);

//Actualizar cliente nuevo en registro de venta

$sql1 = "UPDATE $Webhook SET id_cliente = '$id_pilot', nombre = '$nombre', rfc = '$tax_identification', codigo = '$integration_reference_code' WHERE inventario = '$nameFile' AND bid = '$bidFile'";

mysqli_query($dbConn, $sql1);

mysqli_close($dbConn);
