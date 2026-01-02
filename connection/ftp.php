<?php
// Configurar las credenciales FTP

    $ftpHost = '201.158.150.180';
    
    $ftpUsername = 'Usuario1';  
    
    $ftpPassword = 'Americas2497';
    
    $ftp_conn = ftp_connect($ftpHost) or die("Couldn't connect to $ftpHost");

    $ftpLogin = ftp_login($ftp_conn, $ftpUsername, $ftpPassword);
    
?>


