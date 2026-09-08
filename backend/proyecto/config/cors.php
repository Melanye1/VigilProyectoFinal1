<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // 🚀 Acepta cualquier ruta que empiece con noticias (como /noticias/2, /noticias/3, etc.)
    'paths' => ['api/*', 'noticias/*', 'noticias', '*'],

    'allowed_methods' => ['*'],

    // 🚀 Para que acepte todo sin dar error de credenciales, usamos '*' AQUÍ SÓLO si 'supports_credentials' es false
    'allowed_origins' => ['*'], 

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // 🚀 CAMBIO CLAVE: Lo cambiamos a false para que permita el '*' global sin restricciones
    'supports_credentials' => false,

];