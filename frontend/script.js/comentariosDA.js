// ======================================================
// COMENTARIOS DEL DASHBOARD ADMINISTRATIVO
// ======================================================

const API_URL = "http://127.0.0.1:8000";

let todosLosComentarios = [];
let comentariosFiltrados = [];

let paginaActual = 1;
const comentariosPorPagina = 5;

let idComentarioAEliminar = null;

// ======================================================
// ESCAPAR TEXTO PARA EVITAR HTML INYECTADO
// ======================================================

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(fechaLaravel) {
    if (!fechaLaravel) {
        return "";
    }

    const fecha = new Date(fechaLaravel);

    const fechaFormateada = fecha.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const horaFormateada = fecha.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `${fechaFormateada} - ${horaFormateada}`;
}

// ======================================================
// CARGAR COMENTARIOS DESDE LARAVEL
// ======================================================

async function cargarComentariosDashboard() {
    const contenedor = document.getElementById(
        "contenedorComentariosDashboard"
    );

    if (!contenedor) {
        console.error(
            "No se encontró #contenedorComentariosDashboard"
        );
        return;
    }

    contenedor.innerHTML = `
        <p class="mensaje-cargando-comentarios">
            Cargando comentarios...
        </p>
    `;

    try {
        const response = await fetch(`${API_URL}/comentarios`, {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `No se pudieron cargar los comentarios. Código ${response.status}`
            );
        }

        const datos = await response.json();

        /*
         * Sirve tanto si Laravel devuelve directamente un arreglo:
         * [comentario, comentario]
         *
         * como si devuelve:
         * { comentarios: [...] }
         */
        todosLosComentarios = Array.isArray(datos)
            ? datos
            : datos.comentarios || [];

        aplicarFiltros();
        actualizarEstadisticas(datos);
    } catch (error) {
        console.error(
            "Error al cargar comentarios:",
            error
        );

        contenedor.innerHTML = `
            <p class="mensaje-error-comentarios">
                No fue posible cargar los comentarios.
            </p>
        `;
    }
}

// ======================================================
// BUSCADOR Y ORDENAMIENTO
// ======================================================

function aplicarFiltros() {
    const buscador = document.getElementById(
        "buscarComentario"
    );

    const selectorOrden = document.getElementById(
        "ordenComentarios"
    );

    const textoBuscado = buscador
        ? buscador.value.trim().toLowerCase()
        : "";

    const ordenSeleccionado = selectorOrden
        ? selectorOrden.value
        : "recientes";

    comentariosFiltrados = todosLosComentarios.filter(
        function (comentario) {
            const contenido = String(
                comentario.content || ""
            ).toLowerCase();

            const respuesta = String(
                comentario.respuesta_admin || ""
            ).toLowerCase();

            return (
                contenido.includes(textoBuscado) ||
                respuesta.includes(textoBuscado)
            );
        }
    );

    comentariosFiltrados.sort(function (a, b) {
        const fechaA = new Date(a.created_at).getTime();
        const fechaB = new Date(b.created_at).getTime();

        if (ordenSeleccionado === "antiguos") {
            return fechaA - fechaB;
        }

        return fechaB - fechaA;
    });

    paginaActual = 1;

    renderizarComentarios();
}

// ======================================================
// MOSTRAR LOS COMENTARIOS
// ======================================================

function renderizarComentarios() {
    const contenedor = document.getElementById(
        "contenedorComentariosDashboard"
    );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            comentariosFiltrados.length /
            comentariosPorPagina
        )
    );

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio =
        (paginaActual - 1) * comentariosPorPagina;

    const fin = inicio + comentariosPorPagina;

    const comentariosPagina =
        comentariosFiltrados.slice(inicio, fin);

    if (comentariosPagina.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-comentarios-dashboard">
                <i class="fa-regular fa-comment-dots"></i>
                <p>No se encontraron comentarios.</p>
            </div>
        `;

        actualizarTextoResultados(0, 0, 0);
        renderizarPaginacion();
        return;
    }

    comentariosPagina.forEach(function (comentario) {
        const wrapperGrupal =
            document.createElement("div");

        wrapperGrupal.className =
            "grupo-comentario-wrapper";

        wrapperGrupal.id =
            `grupo-comentario-${comentario.id}`;

        const contenidoSeguro = escaparHTML(
            comentario.content
        );

        const respuestaSegura = escaparHTML(
            comentario.respuesta_admin
        );

        let respuestaSeccionHTML = "";

        if (comentario.respuesta_admin) {
            respuestaSeccionHTML = `
                <div class="admin-reply-box">
                    <div class="avatar-admin-reply">
                        AD
                    </div>

                    <div class="comentario-cuerpo">
                        <p class="text-admin-reply-p">
                            <strong>Administrador:</strong>
                            ${respuestaSegura}
                        </p>
                    </div>
                </div>
            `;
        } else {
            respuestaSeccionHTML = `
                <form
                    class="form-responder-admin"
                    data-comentario-id="${comentario.id}"
                >
                    <input
                        type="text"
                        class="input-responder-admin"
                        maxlength="500"
                        placeholder="Responder de forma institucional a este invitado..."
                        required
                    >

                    <button
                        type="submit"
                        class="btn-responder-admin"
                    >
                        Responder
                    </button>
                </form>
            `;
        }

        wrapperGrupal.innerHTML = `
            <div
                class="comentario-item-row"
                id="comentario-${comentario.id}"
            >
                <div class="comentario-left-side">

                    <div class="avatar-generico-com">
                        <i class="fa-solid fa-user"></i>
                    </div>

                    <div class="comentario-cuerpo">

                        <div class="comentario-usuario">
                            Invitado
                        </div>

                        <p class="comentario-texto-p">
                            ${contenidoSeguro}
                        </p>

                        <div class="comentario-fecha-hora">
                            ${formatearFecha(
            comentario.created_at
        )}
                        </div>

                    </div>
                </div>

                <div class="comentario-right-side">

                    <button
                        type="button"
                        class="btn-opciones-com"
                        data-menu-id="menu-${comentario.id}"
                        aria-label="Opciones del comentario"
                    >
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    <div
                        class="menu-contextual-com"
                        id="menu-${comentario.id}"
                    >
                        <button
                            type="button"
                            class="btn-opcion-eliminar"
                            data-eliminar-id="${comentario.id}"
                        >
                            <i class="fa-regular fa-trash-can"></i>
                            Eliminar comentario
                        </button>
                    </div>

                </div>
            </div>

            <div id="zona-respuesta-${comentario.id}">
                ${respuestaSeccionHTML}
            </div>
        `;

        contenedor.appendChild(wrapperGrupal);
    });

    agregarEventosComentarios();

    actualizarTextoResultados(
        inicio + 1,
        Math.min(fin, comentariosFiltrados.length),
        comentariosFiltrados.length
    );

    renderizarPaginacion();
}

// ======================================================
// EVENTOS DE ELEMENTOS CREADOS DINÁMICAMENTE
// ======================================================

function agregarEventosComentarios() {
    const botonesOpciones = document.querySelectorAll(
        ".btn-opciones-com"
    );

    botonesOpciones.forEach(function (boton) {
        boton.addEventListener("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();

            const menuId = boton.getAttribute("data-menu-id");
            const menu = document.getElementById(menuId);

            if (!menu) {
                console.error(
                    "No se encontró el menú:",
                    menuId
                );
                return;
            }

            const yaEstabaAbierto =
                menu.classList.contains("activo");

            cerrarTodosLosMenus();

            if (!yaEstabaAbierto) {
                menu.classList.add("activo");
            }
        });
    });

    const botonesEliminar = document.querySelectorAll(
        ".btn-opcion-eliminar"
    );

    botonesEliminar.forEach(function (boton) {
        boton.addEventListener("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();

            const comentarioId = Number(
                boton.getAttribute("data-eliminar-id")
            );

            solicitarConfirmacion(comentarioId);
        });
    });

    const formulariosRespuesta = document.querySelectorAll(
        ".form-responder-admin"
    );

    formulariosRespuesta.forEach(function (formulario) {
        formulario.addEventListener(
            "submit",
            function (evento) {
                const comentarioId = Number(
                    formulario.getAttribute(
                        "data-comentario-id"
                    )
                );

                enviarRespuestaAdmin(
                    evento,
                    comentarioId
                );
            }
        );
    });
}

// ======================================================
// ABRIR Y CERRAR MENÚ DE TRES PUNTOS
// ======================================================

function cerrarTodosLosMenus() {
    document
        .querySelectorAll(".menu-contextual-com")
        .forEach(function (menu) {
            menu.classList.remove("activo");
        });
}

document.addEventListener("click", function (evento) {
    if (
        !evento.target.closest(".comentario-right-side")
    ) {
        cerrarTodosLosMenus();
    }
});

// ======================================================
// RESPONDER COMENTARIO
// ======================================================

async function enviarRespuestaAdmin(
    evento,
    comentarioId
) {
    evento.preventDefault();

    const formulario = evento.currentTarget;

    const inputRespuesta = formulario.querySelector(
        ".input-responder-admin"
    );

    const botonResponder = formulario.querySelector(
        ".btn-responder-admin"
    );

    const textoRespuesta =
        inputRespuesta.value.trim();

    if (!textoRespuesta) {
        alert("Escribe una respuesta.");
        return;
    }

    botonResponder.disabled = true;
    botonResponder.textContent = "Enviando...";

    try {
        const response = await fetch(
            `${API_URL}/comentarios/${comentarioId}/responder`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    respuesta_admin: textoRespuesta
                })
            }
        );

        const datos = await response.json().catch(
            function () {
                return {};
            }
        );

        if (!response.ok) {
            throw new Error(
                datos.message ||
                "No se pudo guardar la respuesta."
            );
        }

        const zonaRespuesta = document.getElementById(
            `zona-respuesta-${comentarioId}`
        );

        if (zonaRespuesta) {
            zonaRespuesta.innerHTML = `
                <div class="admin-reply-box">
                    <div class="avatar-admin-reply">
                        AD
                    </div>

                    <div class="comentario-cuerpo">
                        <p class="text-admin-reply-p">
                            <strong>Administrador:</strong>
                            ${escaparHTML(textoRespuesta)}
                        </p>
                    </div>
                </div>
            `;
        }

        const comentarioEncontrado =
            todosLosComentarios.find(
                function (comentario) {
                    return comentario.id === comentarioId;
                }
            );

        if (comentarioEncontrado) {
            comentarioEncontrado.respuesta_admin =
                textoRespuesta;
        }
    } catch (error) {
        console.error(
            "Error al enviar respuesta:",
            error
        );

        alert(error.message);

        botonResponder.disabled = false;
        botonResponder.textContent = "Responder";
    }
}

// ======================================================
// SOLICITAR CONFIRMACIÓN DE ELIMINACIÓN
// ======================================================

function solicitarConfirmacion(comentarioId) {
    idComentarioAEliminar = comentarioId;

    cerrarTodosLosMenus();

    const modal = document.getElementById(
        "modalConfirmarEliminacion"
    );

    if (!modal) {
        console.error(
            "No existe #modalConfirmarEliminacion"
        );

        const confirmar = window.confirm(
            "¿Está seguro de eliminar este comentario?"
        );

        if (confirmar) {
            eliminarComentario();
        }

        return;
    }

    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-abierto");
}

function cancelarEliminacion() {
    const modal = document.getElementById(
        "modalConfirmarEliminacion"
    );

    if (modal) {
        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("modal-abierto");

    idComentarioAEliminar = null;
}

// ======================================================
// ELIMINAR COMENTARIO
// ======================================================

async function eliminarComentario() {
    if (!idComentarioAEliminar) {
        return;
    }

    const id = idComentarioAEliminar;

    const botonConfirmar = document.getElementById(
        "btnConfirmarBorrado"
    );

    if (botonConfirmar) {
        botonConfirmar.disabled = true;
        botonConfirmar.textContent = "Eliminando...";
    }

    try {
        const response = await fetch(
            `${API_URL}/comentarios/${id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        const datos = await response.json().catch(
            function () {
                return {};
            }
        );

        if (!response.ok) {
            throw new Error(
                datos.message ||
                "No se pudo eliminar el comentario."
            );
        }

        todosLosComentarios =
            todosLosComentarios.filter(
                function (comentario) {
                    return comentario.id !== id;
                }
            );

        comentariosFiltrados =
            comentariosFiltrados.filter(
                function (comentario) {
                    return comentario.id !== id;
                }
            );

        cancelarEliminacion();

        renderizarComentarios();

        /*
         * Volvemos a consultar Laravel para actualizar
         * correctamente las estadísticas.
         */
        await cargarComentariosDashboard();
    } catch (error) {
        console.error(
            "Error al eliminar comentario:",
            error
        );

        alert(error.message);
    } finally {
        if (botonConfirmar) {
            botonConfirmar.disabled = false;
            botonConfirmar.textContent =
                "Sí, eliminar";
        }
    }
}

// ======================================================
// ESTADÍSTICAS
// ======================================================

function actualizarEstadisticas(datosServidor = {}) {
    /*
     * Estos IDs deben estar colocados en los números
     * de tus tarjetas estadísticas.
     */
    const elementoTotal = document.getElementById(
        "totalComentarios"
    );

    const elementoPublicados = document.getElementById(
        "comentariosPublicados"
    );

    /*
     * Si Laravel devuelve estadísticas, las usamos.
     * Ejemplo:
     *
     * {
     *   comentarios: [...],
     *   estadisticas: {
     *      total: 8,
     *      publicados: 6
     *   }
     * }
     */
    const estadisticas =
        datosServidor.estadisticas || {};

    const publicados =
        estadisticas.publicados ??
        todosLosComentarios.filter(
            function (comentario) {
                return (
                    comentario.estado !== "eliminado" &&
                    !comentario.deleted_at
                );
            }
        ).length;

    const total =
        estadisticas.total ??
        publicados;

    if (elementoTotal) {
        elementoTotal.textContent = total;
    }

    if (elementoPublicados) {
        elementoPublicados.textContent = publicados;
    }
}

// ======================================================
// TEXTO DE RESULTADOS
// ======================================================

function actualizarTextoResultados(
    desde,
    hasta,
    total
) {
    const textoResultados =
        document.getElementById("textoResultados");

    if (!textoResultados) {
        return;
    }

    if (total === 0) {
        textoResultados.textContent =
            "Mostrando 0 comentarios";

        return;
    }

    textoResultados.textContent =
        `Mostrando ${desde} - ${hasta} de ${total} comentarios`;
}

// ======================================================
// PAGINACIÓN
// ======================================================

function renderizarPaginacion() {
    const contenedorPaginacion =
        document.getElementById(
            "paginacionComentarios"
        );

    if (!contenedorPaginacion) {
        return;
    }

    contenedorPaginacion.innerHTML = "";

    const totalPaginas = Math.ceil(
        comentariosFiltrados.length /
        comentariosPorPagina
    );

    if (totalPaginas <= 1) {
        contenedorPaginacion.style.display = "none";
        return;
    }

    contenedorPaginacion.style.display = "flex";

    const botonAnterior = crearBotonPaginacion(
        "‹",
        paginaActual === 1,
        function () {
            cambiarPagina(paginaActual - 1);
        }
    );

    contenedorPaginacion.appendChild(
        botonAnterior
    );

    for (
        let numeroPagina = 1;
        numeroPagina <= totalPaginas;
        numeroPagina++
    ) {
        const botonPagina =
            document.createElement("button");

        botonPagina.type = "button";
        botonPagina.className =
            "btn-pagina-comentarios";

        botonPagina.textContent = numeroPagina;

        if (numeroPagina === paginaActual) {
            botonPagina.classList.add("activo");
        }

        botonPagina.addEventListener(
            "click",
            function () {
                cambiarPagina(numeroPagina);
            }
        );

        contenedorPaginacion.appendChild(
            botonPagina
        );
    }

    const botonSiguiente = crearBotonPaginacion(
        "›",
        paginaActual === totalPaginas,
        function () {
            cambiarPagina(paginaActual + 1);
        }
    );

    contenedorPaginacion.appendChild(
        botonSiguiente
    );
}

function crearBotonPaginacion(
    texto,
    deshabilitado,
    accion
) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "btn-pagina-comentarios";
    boton.textContent = texto;
    boton.disabled = deshabilitado;

    boton.addEventListener("click", accion);

    return boton;
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(
        comentariosFiltrados.length /
        comentariosPorPagina
    );

    if (
        nuevaPagina < 1 ||
        nuevaPagina > totalPaginas
    ) {
        return;
    }

    paginaActual = nuevaPagina;

    renderizarComentarios();

    const contenedor = document.getElementById(
        "contenedorComentariosDashboard"
    );

    if (contenedor) {
        contenedor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// ======================================================
// INICIAR EL DASHBOARD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const buscador = document.getElementById(
            "buscarComentario"
        );

        const selectorOrden =
            document.getElementById(
                "ordenComentarios"
            );

        const botonConfirmar =
            document.getElementById(
                "btnConfirmarBorrado"
            );

        const botonCancelar =
            document.getElementById(
                "btnCancelarBorrado"
            );

        const botonCerrarModal =
            document.getElementById(
                "btnCerrarModalBorrado"
            );

        if (buscador) {
            buscador.addEventListener(
                "input",
                aplicarFiltros
            );
        }

        if (selectorOrden) {
            selectorOrden.addEventListener(
                "change",
                aplicarFiltros
            );
        }

        if (botonConfirmar) {
            botonConfirmar.addEventListener(
                "click",
                eliminarComentario
            );
        }

        if (botonCancelar) {
            botonCancelar.addEventListener(
                "click",
                cancelarEliminacion
            );
        }

        if (botonCerrarModal) {
            botonCerrarModal.addEventListener(
                "click",
                cancelarEliminacion
            );
        }

        cargarComentariosDashboard();
    }
);