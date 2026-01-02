<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');

error_reporting(0);

//Json con los datos de la unidad

include "C:/laragon/www/PILOT/connection/includes.php";

$json = file_get_contents('php://input');

$arrayJson = json_decode($json, true);

$id_stock = $arrayJson["result"]["entitydata"]["id"];

$vin = $arrayJson["result"]["entitydata"]["vin"];

$bid = $arrayJson["result"]["entitydata"]["owner_branch_code"]["code"];

$inventario = $arrayJson["result"]["entitydata"]["integration_reference_code"];

$arrayJson["result"]["entitydata"]["payment"] = '"'. $arrayJson["result"]["entitydata"]["payment"].'"';

create_log("U:/VENTAS/Pilot/" . $bid . "/" . "Recibido/" . $vin . "_unidad.txt", $arrayJson);

if ($id_stock != null) {

    $sql = "UPDATE $Webhook SET vin ='$vin', inventario ='$inventario' WHERE id_stock = '$id_stock'";

    mysqli_query($dbConn, $sql);
}

mysqli_close($dbConn);
