<?php

function get_rfc($variable)
{
    // Eliminar guiones si están presentes
    $variable = trim(str_replace('-', '', $variable));

    // Persona moral

    if (strlen($variable) == 12) {

        $nombreEmpresa = strtoupper(substr($variable, 0, 3));

        $fechaConstitucion = substr($variable, 3, 6);

        $homoclave = substr($variable, 9);

        $rfcMoral = $nombreEmpresa . ' -' . $fechaConstitucion . '-' . $homoclave;

        return $rfcMoral;

        // Persona física

    } elseif (strlen($variable) == 13) {

        $apellidoPaterno = strtoupper(substr($variable, 0, 2));

        $apellidoMaterno = strtoupper(substr($variable, 2, 1));

        $primerLetraNombre = strtoupper(substr($variable, 3, 1));

        $fechaNacimiento = substr($variable, 4, 6);

        $homoclave = substr($variable, 10);

        $rfcFisica = $apellidoPaterno . $apellidoMaterno . $primerLetraNombre . '-' . $fechaNacimiento . '-' . $homoclave;

        return $rfcFisica;

    } else {

        return "XAXX-010101-000";
    }
}
