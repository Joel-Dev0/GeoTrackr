<?php
if (is_file(__DIR__ . '/public' . $_SERVER['REQUEST_URI'])) {
    return false;
}
require_once __DIR__ . '/public/index.php';