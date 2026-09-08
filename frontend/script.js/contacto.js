document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-contacto');

    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault(); // Previene que la página se recargue

            // Obtener los valores de los campos
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const asunto = document.getElementById('asunto').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            // Pequeña validación extra en el frontend antes de enviar
            if (!nombre || !correo || !asunto || !mensaje) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor, rellena todos los campos del formulario.',
                    confirmButtonColor: '#00204a'
                });
                return;
            }

            // Mostrar estado de "Enviando..."
            Swal.fire({
                title: 'Enviando mensaje...',
                text: 'Por favor, espera un momento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Estructura de datos a enviar al backend
            const datosMensaje = {
                nombre: nombre,
                correo: correo,
                asunto: asunto,
                mensaje: mensaje,
                estado: 'Pendiente' // Se inicializa como Pendiente para tus contadores del Dashboard
            };

            try {
                // Petición POST a tu API de Laravel
                const respuesta = await fetch('http://127.0.0.1:8000/mensajes', { // Modifica la URL si tu ruta difiere
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(datosMensaje)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok && resultado.success) {
                    // Alerta de éxito con SweetAlert2
                    Swal.fire({
                        icon: 'success',
                        title: '¡Mensaje enviado!',
                        text: 'Tu consulta ha sido registrada con éxito. Nos pondremos en contacto contigo pronto.',
                        confirmButtonColor: '#00204a'
                    });

                    // Limpiar el formulario para nuevos envíos
                    formulario.reset();
                } else {
                    throw new Error(resultado.error || 'Ocurrió un problema en el servidor.');
                }

            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                
                // Alerta en caso de que el backend falle o esté apagado
                Swal.fire({
                    icon: 'error',
                    title: 'Error de envío',
                    text: 'No se pudo conectar con el servidor. Por favor, inténtalo más tarde.',
                    confirmButtonColor: '#d33'
                });
            }
        });
    }
});