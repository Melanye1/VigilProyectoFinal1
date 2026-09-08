const URL_BASE = 'http://127.0.0.1:8000';
const contenedor = document.getElementById('contenedor-fotos-noticias');
const formulario = document.getElementById('form-noticias-dashboard');

let idNoticiaEnEdicion = null; 

// ========================================================
// 1. COMPRESIÓN DE IMÁGENES AUTOMÁTICA
// ========================================================
function comprimirImagen(archivo, maxAncho = 1200, calidad = 0.75) {
    return new Promise((resolve) => {
        const lector = new FileReader();
        lector.readAsDataURL(archivo);
        lector.onload = (evento) => {
            const img = new Image();
            img.src = evento.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let ancho = img.width;
                let alto = img.height;

                if (ancho > maxAncho) {
                    alto = Math.round((alto * maxAncho) / ancho);
                    ancho = maxAncho;
                }

                canvas.width = ancho;
                canvas.height = alto;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, ancho, alto);

                canvas.toBlob((blob) => {
                    const nombreBase = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;
                    const archivoComprimido = new File([blob], `${nombreBase}.webp`, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(archivoComprimido);
                }, 'image/webp', calidad);
            };
        };
    });
}

// ========================================================
// 2. CARGAR Y RENDERIZAR LA GALERÍA EN PANTALLA
// ========================================================
async function cargarNoticiasEnGaleria() {
    try {
        const respuesta = await fetch(`${URL_BASE}/noticias`, {
            headers: { 'Accept': 'application/json' }
        });
        const datos = await respuesta.json();

        if (respuesta.ok) {
            contenedor.innerHTML = '';
            let todasLasNoticias = [];
            
            if (datos.destacada) todasLasNoticias.push(datos.destacada);
            if (datos.recientes && datos.recientes.length > 0) {
                todasLasNoticias = todasLasNoticias.concat(datos.recientes);
            }

            if (todasLasNoticias.length === 0) {
                contenedor.innerHTML = '<p class="text-muted text-center w-100">No hay noticias publicadas.</p>';
                return;
            }

            todasLasNoticias.forEach(noticia => {
                const rutaImagen = noticia.imagen 
                    ? `${URL_BASE}/storage/imagenes/${noticia.imagen}` 
                    : 'https://via.placeholder.com/180x100?text=Sin+Imagen';

                // SOLUCIÓN AL ERROR DE FECHA: Formateamos usando la marca de tiempo nativa
                let fechaPublicacion = 'Fecha no disponible';
                if (noticia.created_at) {
                    const fechaObj = new Date(noticia.created_at);
                    fechaPublicacion = fechaObj.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });
                }

                const fotoItem = document.createElement('div');
                fotoItem.classList.add('foto-item');
                fotoItem.style.cursor = 'pointer';

                fotoItem.innerHTML = `
                    <img src="${rutaImagen}" alt="${noticia.titulo || 'Noticia'}" onerror="this.src='https://via.placeholder.com/180x100?text=Error+Imagen'">
                `;

                fotoItem.addEventListener('click', () => {
                    abrirModalDetalleNoticia(noticia, rutaImagen, fechaPublicacion);
                });

                contenedor.appendChild(fotoItem);
            });
        }
    } catch (error) {
        console.error("Error al cargar la galería:", error);
    }
}

// ========================================================
// 3. PANEL MODAL DE DETALLES (SWEETALERT2)
// ========================================================
function abrirModalDetalleNoticia(noticia, rutaImagen, fechaPublicacion) {
    Swal.fire({
        title: `<strong style="color: #0d6efd; font-family: sans-serif;">${noticia.titulo.toUpperCase()}</strong>`,
        html: `
            <div style="text-align: left; font-family: sans-serif;">
                <p style="color: #6c757d; font-size: 0.9rem; margin-bottom: 15px;">
                    <i class="bi bi-calendar-event"></i> Publicado el: <b>${fechaPublicacion}</b>
                </p>
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${rutaImagen}" style="max-width: 100%; max-height: 250px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                </div>
                <h5 style="border-bottom: 2px solid #ffc107; padding-bottom: 5px; font-size: 1.1rem; font-weight: bold;">CUERPO DE LA NOTICIA</h5>
                <p style="white-space: pre-wrap; color: #333; line-height: 1.5; font-size: 0.95rem;">${noticia.cuerpo}</p>
            </div>
            
            <div class="d-flex flex-wrap justify-content-center gap-2 mt-4">
                <a href="${rutaImagen}" download="${noticia.imagen || 'foto_noticia'}" class="btn btn-success btn-sm text-white px-3">
                    <i class="bi bi-download"></i> Descargar Foto
                </a>
                <button id="btn-swal-editar" class="btn btn-warning btn-sm text-dark px-3">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button id="btn-swal-eliminar" class="btn btn-danger btn-sm text-white px-3">
                    <i class="bi bi-trash-fill"></i> Eliminar
                </button>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar Vista',
        confirmButtonColor: '#6c757d',
        width: '600px',
        didOpen: () => {
            document.getElementById('btn-swal-editar').addEventListener('click', () => {
                Swal.close();
                ejecutarEdicionFrontend(noticia);
            });
            document.getElementById('btn-swal-eliminar').addEventListener('click', () => {
                Swal.close();
                ejecutarEliminacionBackend(noticia.id);
            });
        }
    });
}

// ========================================================
// 4. ACCIONES DE EDICIÓN Y ELIMINACIÓN (CON BORRADO REAL)
// ========================================================
function ejecutarEdicionFrontend(noticia) {
    idNoticiaEnEdicion = noticia.id;

    const btnTexto = document.querySelector('.btn-guardar-text');
    if (btnTexto) btnTexto.textContent = "ACTUALIZAR NOTICIA";

    document.getElementById('input-titulo').value = noticia.titulo;
    document.getElementById('input-cuerpo').value = noticia.cuerpo;
    
    document.getElementById('input-titulo').scrollIntoView({ behavior: 'smooth' });
    
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Modo edición activo. La imagen ahora es opcional.',
        showConfirmButton: false,
        timer: 4000
    });
}

function ejecutarEliminacionBackend(id) {
    Swal.fire({
        title: '¿Estás completamente seguro?',
        text: "Esta acción borrará la noticia y su archivo de imagen permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar de inmediato',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const respuesta = await fetch(`${URL_BASE}/noticias/${id}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' }
                });
                const datos = await respuesta.json();

                if (respuesta.ok) {
                    Swal.fire('¡Eliminado!', 'La noticia ha sido removida con éxito.', 'success');
                    cargarNoticiasEnGaleria(); 
                } else {
                    Swal.fire('Error', datos.message || 'No se pudo eliminar', 'error');
                }
            } catch (error) {
                console.error("Error en la solicitud de borrado:", error);
            }
        }
    });
}

// ========================================================
// 5. ENVIAR FORMULARIO (MÉTODO POST DINÁMICO)
// ========================================================
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formulario);
    const archivoImagen = document.getElementById('input-imagen').files[0];

    if (archivoImagen) {
        const imagenOptimizada = await comprimirImagen(archivoImagen);
        formData.set('imagen', imagenOptimizada);
    }

    let urlDestino = `${URL_BASE}/noticias`;
    if (idNoticiaEnEdicion !== null) {
        urlDestino = `${URL_BASE}/noticias/${idNoticiaEnEdicion}`;
    }

    try {
        const respuesta = await fetch(urlDestino, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            Swal.fire('Error', datos.message || 'Verifica los campos', 'error');
            return;
        }

        Swal.fire('¡Operación Exitosa!', idNoticiaEnEdicion ? 'Noticia modificada correctamente.' : 'Nueva noticia añadida.', 'success');
        
        formulario.reset();
        idNoticiaEnEdicion = null;
        
        const btnTexto = document.querySelector('.btn-guardar-text');
        if (btnTexto) btnTexto.textContent = "GUARDAR NOTICIA";

        cargarNoticiasEnGaleria();

    } catch (error) {
        console.error("Error en el envío de datos:", error);
    }
});

document.addEventListener('DOMContentLoaded', cargarNoticiasEnGaleria);