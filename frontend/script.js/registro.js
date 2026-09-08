document.getElementById('form-registro').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const formData = new FormData(this);

    try {
        const respuesta = await fetch('http://127.0.0.1:8000/register', {
            method: 'POST',
            headers: {
                'Accept': 'application/json' 
            },
            body: formData 
        });

        const datos = await respuesta.json();

        if (respuesta.ok || respuesta.status === 201) {
            // ÉXITO
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada correctamente.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = 'dashboard.html';
            });
        } else {
            // ERROR DE VALIDACIÓN
            console.error('Errores de validación del servidor:', datos);
            
            let mensajeError = datos.message || 'Error desconocido en el servidor.';
            
            if (datos.errors) {
                // Junta todos los errores de Laravel en una sola cadena formateada
                mensajeError = Object.values(datos.errors).flat().join('<br>');
            }

            Swal.fire({
                icon: 'error',
                title: 'Error en el registro',
                html: mensajeError,
                confirmButtonText: 'Entendido'
            });
        }

    } catch (error) {
        console.error('Error en el proceso:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Ups...',
            text: 'Ocurrió un problema de conexión al procesar el registro.',
            confirmButtonText: 'Aceptar'
        });
    }
});