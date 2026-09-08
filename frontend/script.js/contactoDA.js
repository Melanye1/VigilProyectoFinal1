document.addEventListener('DOMContentLoaded', () => {
    cargarMensajes();
    setupEventListeners();
});

function cargarMensajes() {
    fetch('http://127.0.0.1:8000/mensajes')
        .then(response => {
            if (!response.ok) throw new Error('Error en el servidor: ' + response.status);
            return response.json();
        })
        .then(mensajes => {
            console.log("Mensajes recibidos:", mensajes);
            const contenedor = document.getElementById('lista-mensajes-dinamica');
            contenedor.innerHTML = ''; 

            // 1. Actualizar contadores
            actualizarContadores(mensajes);

            // 2. Renderizar lista
            if (mensajes.length === 0) {
                contenedor.innerHTML = '<div class="text-center text-muted p-4">No hay mensajes disponibles.</div>';
                return;
            }

            mensajes.forEach(msg => {
                const item = document.createElement('div');
                item.className = 'tarjeta-mensaje-horizontal';
                
                const badgeClass = msg.estado === 'Pendiente' ? 'badge-pendiente' : 'badge-respondido';
                const badgeIcono = msg.estado === 'Pendiente' ? '🟡' : '🟢';
                
                const msgJson = JSON.stringify(msg).replace(/"/g, '&quot;');
                
                item.innerHTML = `
                    <div class="msg-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="msg-datos-usuario">
                        <p class="msg-nombre">${msg.nombre}</p>
                        <p class="msg-correo">${msg.correo}</p>
                        <p class="msg-fecha">${new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="msg-cuerpo-resumen">
                        <p class="msg-asunto-tag">Asunto: ${msg.asunto}</p>
                        <p class="msg-extracto">${msg.mensaje}</p>
                    </div>
                    <div class="msg-acciones-derecha">
                        <span class="${badgeClass}">${badgeIcono} ${msg.estado}</span>
                        <button class="btn-accion-icono btn-leer-mensaje" data-mensaje='${JSON.stringify(msg)}' title="Ver Detalle">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                `;
                contenedor.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error al cargar los mensajes:', error);
            actualizarContadores([]); 
        });
}

function actualizarContadores(mensajes) {
    const total = mensajes.length || 0;
    const pendientes = mensajes.filter(m => m.estado === 'Pendiente').length || 0;
    const respondidos = mensajes.filter(m => m.estado === 'Respondido').length || 0;

    document.getElementById('txt-total-mensajes').innerText = total;
    document.getElementById('txt-pendientes-mensajes').innerText = pendientes;
    document.getElementById('txt-respondidos-mensajes').innerText = respondidos;
}

function abrirDetalle(msg) {
    Swal.fire({
        title: 'DETALLE DEL MENSAJE',
        html: `
            <div style="text-align: left;">
                <p><strong>Nombre:</strong> ${msg.nombre}</p>
                <p><strong>Correo:</strong> ${msg.correo}</p>
                <p><strong>Fecha:</strong> ${new Date(msg.created_at).toLocaleDateString()}</p>
                <p><strong>Asunto:</strong> ${msg.asunto}</p>
                <hr>
                <p><strong>Mensaje:</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">${msg.mensaje}</div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        confirmButtonText: '<i class="fa-brands fa-google"></i> Responder en Gmail',
        confirmButtonColor: '#00204a',
        width: '600px'
    }).then((result) => {
        if (result.isConfirmed) {
            // Abrir Gmail con los datos listos
            const asuntoEncoded = encodeURIComponent("Respuesta: " + msg.asunto);
            const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${msg.correo}&su=${asuntoEncoded}`;
            window.open(url, '_blank');
        }
    });
}

function setupEventListeners() {
    // Delegación de eventos para botones de leer mensaje
    const contenedor = document.getElementById('lista-mensajes-dinamica');
    
    if (contenedor) {
        contenedor.addEventListener('click', (e) => {
            const boton = e.target.closest('.btn-leer-mensaje');
            if (boton) {
                const dataString = boton.getAttribute('data-mensaje');
                try {
                    const msg = JSON.parse(dataString);
                    abrirDetalle(msg);
                } catch (error) {
                    console.error("Error al procesar el mensaje:", error);
                }
            }
        });
    }

    // Buscador
    const inputBuscar = document.getElementById('input-buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            cargarMensajes(); // Recargar con filtro (implementar filtro en backend)
        });
    }
}