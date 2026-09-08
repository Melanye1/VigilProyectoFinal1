// ======================================================
// COMENTARIOS DE LA PÁGINA PÚBLICA
// ======================================================

const API_URL = "http://127.0.0.1:8000";

let todosLosComentarios = [];
let comentariosVisibles = 5;

// Elementos del DOM
const listaComentarios = document.getElementById("listaComentarios");
const btnVerMas = document.querySelector(
    ".enlace-ver-mas-comentarios"
);
const formComentario = document.getElementById("formComentario");
const txtContenido = document.getElementById("txtContenido");
const contador = document.getElementById("contador");

// ======================================================
// CARGAR COMENTARIOS DESDE LARAVEL
// ======================================================

async function cargarComentarios() {
    if (!listaComentarios) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/comentarios`, {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `No se pudieron cargar los comentarios. Código: ${response.status}`
            );
        }

        todosLosComentarios = await response.json();

        renderizarComentarios();
    } catch (error) {
        console.error("Error al obtener los comentarios:", error);

        listaComentarios.innerHTML = `
      <h3>Comentarios recientes</h3>
      <p class="no-comments">
        No fue posible cargar los comentarios.
      </p>
    `;
    }
}

// ======================================================
// MOSTRAR LOS COMENTARIOS
// ======================================================

function renderizarComentarios() {
    if (!listaComentarios) {
        return;
    }

    listaComentarios.innerHTML = `
    <h3>Comentarios recientes</h3>
  `;

    const comentariosAMostrar = todosLosComentarios.slice(
        0,
        comentariosVisibles
    );

    if (comentariosAMostrar.length === 0) {
        listaComentarios.innerHTML += `
      <p class="no-comments">
        No hay comentarios aún. ¡Sé el primero!
      </p>
    `;

        if (btnVerMas) {
            btnVerMas.style.display = "none";
        }

        return;
    }

    comentariosAMostrar.forEach(function (comentario) {
        const divComentario = document.createElement("div");

        divComentario.classList.add(
            "tarjeta-comentario-premium"
        );

        let respuestaAdministrador = "";

        if (comentario.respuesta_admin) {
            respuestaAdministrador = `
        <div class="caja-respuesta-admin-publica">
          <div class="avatar-admin-icono">
            <i class="fa-solid fa-user-shield"></i>
          </div>

          <div class="contenido-respuesta-admin">
            <div class="meta-comentario-admin">
              <strong class="nombre-admin">
                Administrador
              </strong>

              <span class="badge-oficial">
                Oficial
              </span>
            </div>

            <div class="texto-respuesta-admin">
              <p>${comentario.respuesta_admin}</p>
            </div>
          </div>
        </div>
      `;
        }

        const fecha = comentario.created_at
            ? new Date(comentario.created_at).toLocaleDateString(
                "es-PE"
            )
            : "";

        divComentario.innerHTML = `
      <div class="comentario-avatar-premium">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>

      <div class="comentario-bloque-derecho">

        <div class="comentario-encabezado-meta">

          <span class="autor-nombre-premium">
            Invitado Paillardelino
          </span>

          <span class="comentario-fecha-derecha">
            <i class="fa-regular fa-clock"></i>
            ${fecha}
          </span>

        </div>

        <div class="comentario-cuerpo-texto">
          <p>${comentario.content}</p>
        </div>

        ${respuestaAdministrador}

      </div>
    `;

        listaComentarios.appendChild(divComentario);
    });

    if (btnVerMas) {
        btnVerMas.style.display =
            comentariosVisibles >= todosLosComentarios.length
                ? "none"
                : "inline-block";
    }
}

// ======================================================
// VER MÁS COMENTARIOS
// ======================================================

if (btnVerMas) {
    btnVerMas.addEventListener("click", function (evento) {
        evento.preventDefault();

        comentariosVisibles += 5;

        renderizarComentarios();
    });
}

// ======================================================
// CONTADOR DE CARACTERES
// ======================================================

if (txtContenido && contador) {
    txtContenido.addEventListener("input", function () {
        contador.textContent = `${this.value.length} / 500`;
    });
}

// ======================================================
// ENVIAR COMENTARIO AL BACKEND
// ======================================================

if (formComentario && txtContenido) {
    formComentario.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            const contenido = txtContenido.value.trim();

            if (!contenido) {
                alert("Escribe un comentario antes de enviarlo.");
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/comentarios/anonimo`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json"
                        },
                        body: JSON.stringify({
                            content: contenido
                        })
                    }
                );

                const datos = await response.json();

                if (!response.ok) {
                    throw new Error(
                        datos.message ||
                        "No se pudo guardar el comentario."
                    );
                }

                const nuevoComentario =
                    datos.comentario || datos;

                todosLosComentarios.unshift(nuevoComentario);

                txtContenido.value = "";

                if (contador) {
                    contador.textContent = "0 / 500";
                }

                renderizarComentarios();

                alert("Comentario publicado correctamente.");
            } catch (error) {
                console.error(
                    "Error al enviar el comentario:",
                    error
                );

                alert(error.message);
            }
        }
    );
}

// ======================================================
// INICIAR
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    cargarComentarios
);