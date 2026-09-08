// checkAuth.js
(function() {
    // Busca si existe tu cookie de sesión
    const tieneSesion = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    // Si no tiene la cookie y no está en la página de login, lo expulsamos
    if (!tieneSesion && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    }
})();