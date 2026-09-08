/*
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    try {
        const respuesta = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        if (respuesta.ok) {
            // ÉXITO
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión correcto. Redirigiendo...',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // En tu lógica de login exitoso
                document.cookie = "token=usuario_autenticado; path=/; max-age=86400";
                window.location.href = "dashboard.html";
            });
        } else {
            // ERROR DE VALIDACIÓN O CREDENCIALES
            const datos = await respuesta.json();
            let mensajeError = datos.message || 'Correo o contraseña incorrectos.';

            if (datos.errors) {
                mensajeError = Object.values(datos.errors).flat().join('<br>');
            }

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                html: mensajeError,
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Intenta más tarde.',
            confirmButtonText: 'Aceptar'
        });
    }
});
*/

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('Freno activado, iniciando fetch...');

    const formData = new FormData(loginForm);

    try {
        const respuesta = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        if (respuesta.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión correcto. Redirigiendo...',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                document.cookie = 'token=usuario_autenticado; path=/; max-age=86400';
                window.location.href = 'dashboard.html';
            });
        } else {
            const datos = await respuesta.json();
            let mensajeError = datos.message || 'Correo o contraseña incorrectos.';

            if (datos.errors) {
                mensajeError = Object.values(datos.errors).flat().join('<br>');
            }

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                html: mensajeError,
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Intenta más tarde.',
            confirmButtonText: 'Aceptar'
        });
    }
});