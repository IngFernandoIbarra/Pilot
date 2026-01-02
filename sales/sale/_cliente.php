<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('content-type: text/json; charset=utf-8');

error_reporting(0);

//Json con los datos del cliente

include "C:/laragon/www/PILOT/connection/includes.php";

$json = file_get_contents('php://input');

$arrayJson = json_decode($json, true);

$id = $arrayJson["result"]["entitydata"]["id"];

$nombre = strtoupper($arrayJson["result"]["entitydata"]["name"]);

$rfc = get_rfc($arrayJson["result"]["entitydata"]["tax_identification"]);

$arrayJson["result"]["entitydata"]["tax_identification"] = $rfc;

$codigo = $arrayJson["result"]["entitydata"]["integration_reference_code"];

$sql = "SELECT * FROM $Webhook WHERE id_cliente = '$id'";

$format = number_format($arrayJson["result"]["entitydata"]["payment"], 2, '.', '');

$arrayJson["result"]["entitydata"]["payment"] = $format;

$phone = strval($arrayJson["result"]["entitydata"]["phone"]);

$arrayJson["result"]["entitydata"]["phone"] = substr_replace($phone, ' ', 2, 0);

$cellphone = strval($arrayJson["result"]["entitydata"]["cellphone"]);

$arrayJson["result"]["entitydata"]["cellphone"] = substr_replace($cellphone, ' ', 2, 0);

$result = mysqli_query($dbConn, $sql);

if ($result->num_rows > 0) {

    while ($fila = $result->fetch_assoc()) {

        create_log("U:/VENTAS/Pilot/" . $fila['bid'] . "/" . "Recibido/" . $fila['vin'] . "_cliente.txt", $arrayJson);
    }
}

if ($id != null) {

    $sql = "UPDATE $Webhook SET nombre = '$nombre', rfc = '$rfc', codigo = '$codigo' WHERE id_cliente = '$id'";

    mysqli_query($dbConn, $sql);
}

mysqli_close($dbConn);
