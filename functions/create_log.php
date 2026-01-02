<?php

function create_log($route, $arrayJson)
{
    $file = fopen($route,  "w+b");

    if ($file == true) {

        $json = json_encode($arrayJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        fwrite($file, $json);
    }

    fclose($file);
}
