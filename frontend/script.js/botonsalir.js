document.getElementById('btnSalir').addEventListener('click', function() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Tu sesión será cerrada y se borrarán tus datos de acceso.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, salir'
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. Borrar cookies (ejemplo: si tu cookie se llama 'token')
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // 2. Redirigir al login
            window.location.href = "login.html"; 
        }
    });
});