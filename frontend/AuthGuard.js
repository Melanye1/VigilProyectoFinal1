(function() {
    // 1. Verificamos si existe la cookie llamada 'token'
    const tieneSesion = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    // 2. Rutas protegidas
    const urlActual = window.location.pathname;
    const esPaginaProtegida = urlActual.includes('dashboard') || urlActual.includes('DA');

    // 3. Lógica de redirección
    // Si la página es protegida Y NO tiene sesión, mándalo al login
    if (esPaginaProtegida && !tieneSesion) {
        window.location.href = 'login.html';
    }
    
    // OPCIONAL: Si ya tiene sesión y trata de entrar al login, mándalo al dashboard
    if (tieneSesion && urlActual.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
})();