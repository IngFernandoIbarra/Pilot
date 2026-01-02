<?php

function create_folder($route)
{
    if (!is_dir($route)) {

        mkdir($route, 0755, true);

    }
}
