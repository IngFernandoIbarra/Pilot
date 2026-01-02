<?php

    $host = '82.180.138.204';

    $usuariodb = 'u407931776_root';

    $passwdb = 'Americas1*';

    $nombredb = 'u407931776_Webhook';
    
    $dbConn = mysqli_connect($host,$usuariodb,$passwdb,$nombredb);

    if (!$dbConn) {

        die("Connection failed: " . mysqli_connect_error());

    }

?>