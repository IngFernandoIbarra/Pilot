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

create_folder($directoryToLog . "/" . $bidFile . "/" . "Unidades" . "/" . "enviados" . "/" . $nameFile);
create_folder($directoryToLog . "/" . $bidFile . "/" . "Unidades" . "/" . $nameFile);
    
//Respuestas de PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Unidades" . "/" . "enviados" . "/" . $nameFile . "/" . $nameFile . "_unidad_creada.json", $arrayJson[2]);

//Informacion enviada a PILOT
create_log($directoryToLog . "/" . $bidFile . "/" . "Unidades" . "/" . $nameFile . "/" . $nameFile . "_unidad_creada.json", $arrayJson[3]);

//Insertar unidad nuevo en BD local para referencias

$num_inv = $nameFile;

$id_pilot = $arrayJson[3]["stockResult"]["result"]["entitydata"]["id"];

$vin = $arrayJson[3]["stockResult"]["result"]["entitydata"]["vin"];

$bid = $arrayJson[3]["stockResult"]["result"]["entitydata"]["owner_branch_code"]["code"];

$type_code = $arrayJson[3]["stockResult"]["result"]["entitydata"]["business_channel"];

$availability_status = $arrayJson[3]["stockResult"]["result"]["entitydata"]["availability_status"]["name"];

$status_code = $arrayJson[3]["stockResult"]["result"]["entitydata"]["status"]["name"];

date_default_timezone_set('America/Mexico_City');

$fecha_actual = date("Y-m-d H:i:s");

$sql = "INSERT INTO $Inventario (num_inv, id_pilot, bid, vin, type_code, availability_status, status_code, fecha) VALUES ('$num_inv' , '$id_pilot', '$bid', '$vin', '$type_code', '$availability_status', '$status_code', '$fecha_actual');";

mysqli_query($dbConn, $sql);

mysqli_close($dbConn);