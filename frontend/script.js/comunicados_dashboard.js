const API_URL = "http://127.0.0.1:8000"; // Cambia al puerto correcto de tu Laravel
let todosLosComunicados = [];
let idComunicadoEdicion = null; // Controla si creamos (null) o editamos (id)

// Mapeo de elementos del DOM
const listaComunicadosDash = document.getElementById('listaComunicadosDash');
const formNuevoComunicado = document.getElementById('formNuevoComunicado');
const comunicadoTitulo = document.getElementById('comunicadoTitulo');
const comunicadoCuerpo = document.getElementById('comunicadoCuerpo');
const formAccionTitulo = document.getElementById('formAccionTitulo');
const textBtnGuardar = document.getElementById('textBtnGuardar');
const iconBtnGuardar = document.getElementById('iconBtnGuardar');

// 1. Obtener y listar comunicados desde la API
async function cargarComunicados() {
    try {
        const response = await fetch(`${API_URL}/comunicados`);
        if (response.ok) {
            todosLosComunicados = await response.json();
            renderizarComunicados();
        } else {
            listaComunicadosDash.innerHTML = '<p class="text-center text-danger py-3">Error al conectar con el servidor.</p>';
        }
    } catch (error) {
        console.error("Error general:", error);
        listaComunicadosDash.innerHTML = '<p class="text-center text-danger py-3">No se pudo cargar la lista.</p>';
    }
}

// 2. Renderizar filas dinámicas con autor y fecha incorporados
function renderizarComunicados() {
    listaComunicadosDash.innerHTML = '';

    if (todosLosComunicados.length === 0) {
        listaComunicadosDash.innerHTML = '<p class="text-center text-muted py-3">No hay comunicados registrados.</p>';
        return;
    }

    todosLosComunicados.forEach((comunicado, index) => {
        const row = document.createElement('div');
        row.classList.add('comunicado-item-row');
        
        // Formatear fecha nativa de la base de datos
        const fechaFormateada = new Date(comunicado.created_at).toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        row.innerHTML = `
            <div class="comunicado-texto-box" style="display: flex; flex-direction: column;">
                <span style="font-weight: 600;">${index + 1}. ${comunicado.titulo}</span>
                <small style="font-size: 0.75rem; color: #777; margin-top: 3px;">
                    <i class="bi bi-person-fill"></i> Por: ${comunicado.usuario_creador} | <i class="bi bi-calendar-event"></i> ${fechaFormateada}
                </small>
            </div>
            <div class="comunicado-acciones">
                <button class="btn-accion-icon azul-claro" onclick="verComunicadoModal(${comunicado.id})" title="Ver Detalle"><i class="bi bi-eye"></i></button>
                <button class="btn-accion-icon azul-oscuro" onclick="prepararEdicion(${comunicado.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn-accion-icon azul-medio" onclick="descargarPDF(${comunicado.id})" title="Descargar PDF"><i class="bi bi-download"></i></button>
                <button class="btn-accion-icon celeste" onclick="eliminarComunicado(${comunicado.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
            </div>
        `;
        listaComunicadosDash.appendChild(row);
    });
}

// 3. Crear o Editar un comunicado (POST / PUT)
formNuevoComunicado.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Puedes jalar dinámicamente un campo de texto si tienes el nombre del admin logueado en la cabecera
    const nombreAdmin = "Administrador del Sistema"; 

    const datos = {
        titulo: comunicadoTitulo.value,
        cuerpo: comunicadoCuerpo.value,
        usuario_creador: nombreAdmin
    };

    const urlFinal = idComunicadoEdicion ? `${API_URL}/comunicados/${idComunicadoEdicion}` : `${API_URL}/comunicados`;
    const metodoHttp = idComunicadoEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetch(urlFinal, {
            method: metodoHttp,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            const resultado = await response.json();
            
            if (idComunicadoEdicion) {
                todosLosComunicados = todosLosComunicados.map(c => c.id === idComunicadoEdicion ? resultado : c);
                Swal.fire('¡Actualizado!', 'El comunicado ha sido modificado con éxito.', 'success');
            } else {
                todosLosComunicados.unshift(resultado);
                Swal.fire('¡Guardado!', 'El nuevo comunicado ha sido publicado.', 'success');
            }

            renderizarComunicados();
            resetearFormulario();
        } else {
            Swal.fire('Error', 'No se pudo procesar la solicitud en el servidor.', 'error');
        }
    } catch (error) {
        console.error("Error en el envío:", error);
        Swal.fire('Error', 'Hubo un fallo de conexión.', 'error');
    }
});

// 4. Cargar datos en el formulario para editar
async function prepararEdicion(id) {
    const comunicado = todosLosComunicados.find(c => c.id === id);
    if (!comunicado) return;

    comunicadoTitulo.value = comunicado.titulo;
    comunicadoCuerpo.value = comunicado.cuerpo;
    idComunicadoEdicion = id;

    // Cambios visuales dinámicos en la interfaz del formulario
    formAccionTitulo.textContent = "MODIFICAR COMUNICADO SELECCIONADO";
    textBtnGuardar.textContent = "ACTUALIZAR COMUNICADO";
    iconBtnGuardar.className = "bi bi-arrow-clockwise";

    formNuevoComunicado.scrollIntoView({ behavior: 'smooth' });
}

// 5. Eliminar comunicado con confirmación de SweetAlert2
async function eliminarComunicado(id) {
    Swal.fire({
        title: '¿Estás completamente seguro?',
        text: "Esta acción eliminará el comunicado de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#003366',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/comunicados/${id}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    todosLosComunicados = todosLosComunicados.filter(c => c.id !== id);
                    renderizarComunicados();
                    Swal.fire('¡Eliminado!', 'El comunicado fue borrado correctamente.', 'success');
                    if(idComunicadoEdicion === id) resetearFormulario();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión con la base de datos.', 'error');
            }
        }
    });
}

// 6. Modal elegante de SweetAlert2 para ver la Vista Previa del cuerpo completo
function verComunicadoModal(id) {
    const comunicado = todosLosComunicados.find(c => c.id === id);
    if (!comunicado) return;

    Swal.fire({
        title: `<strong>${comunicado.titulo}</strong>`,
        html: `<div style="text-align: justify; white-space: pre-line; max-height: 300px; overflow-y: auto; padding: 10px; border-top: 1px solid #eee;">${comunicado.cuerpo}</div>`,
        icon: 'info',
        confirmButtonText: 'Cerrar Vista Previa',
        confirmButtonColor: '#003366'
    });
}

// 7. Descargar el PDF corporativo al vuelo
function descargarPDF(id) {
    const comunicado = todosLosComunicados.find(c => c.id === id);
    if (!comunicado) return;

    const fecha = new Date(comunicado.created_at).toLocaleDateString('es-PE');

    const htmlContenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${comunicado.titulo}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; color: #333; line-height: 1.6; }
                .header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 15px; margin-bottom: 30px; }
                .header h1 { color: #003366; font-size: 24px; margin: 0; text-transform: uppercase; }
                .meta-datos { text-align: right; font-size: 12px; color: #666; margin-bottom: 30px; }
                .titulo { font-size: 18px; font-weight: bold; margin-bottom: 25px; text-align: center; text-transform: uppercase; color: #111; }
                .cuerpo { font-size: 14px; text-align: justify; white-space: pre-line; }
                .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Colegio Enrique Paillardelle</h1>
                <p>Comunicado Oficial Emitido por Dirección</p>
            </div>
            <div class="meta-datos">
                <strong>Emitido por:</strong> ${comunicado.usuario_creador}<br>
                <strong>Fecha:</strong> ${fecha}
            </div>
            <div class="titulo">${comunicado.titulo}</div>
            <div class="cuerpo">${comunicado.cuerpo}</div>
            <div class="footer">
                Institución Educativa Enrique Paillardelle - Tacna, Perú
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.open();
    ventana.document.write(htmlContenido);
    ventana.document.close();
}

// Auxiliar para limpiar formulario
function resetearFormulario() {
    formNuevoComunicado.reset();
    idComunicadoEdicion = null;
    formAccionTitulo.textContent = "PUBLICAR NUEVO COMUNICADO";
    textBtnGuardar.textContent = "GUARDAR COMUNICADO";
    iconBtnGuardar.className = "bi bi-send";
}

document.addEventListener('DOMContentLoaded', cargarComunicados);