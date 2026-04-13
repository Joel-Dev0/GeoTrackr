<?php

$path = __DIR__ . '/public' . $_SERVER["REQUEST_URI"];

if (php_sapi_name() === 'cli-server' && file_exists($path)) {
    return false;
}

require_once __DIR__ . '/public/index.php';