document.addEventListener("DOMContentLoaded", () => {
    const URL_API = "http://127.0.0.1:8000/noticias";
    const URL_IMAGENES = "http://127.0.0.1:8000/storage/imagenes/";

    const destacadaContainer = document.getElementById("noticia-destacada-container");
    const recientesContainer = document.getElementById("noticias-recientes-container");
    const paginacionContainer = document.getElementById("paginacion-container");

    let noticiasGlobales = []; 
    let paginaActual = 1;
    const NOTICIAS_POR_PAGINA = 3;

    function limitarPalabras(texto, maxPalabras) {
        if (!texto) return "";
        const palabras = texto.trim().split(/\s+/);
        if (palabras.length <= maxPalabras) return texto;
        return palabras.slice(0, maxPalabras).join(" ") + "...";
    }

    function separarFecha(fechaString) {
        if (!fechaString) return { dia: "00", mes: "AAA", anio: "0000" };
        const fecha = new Date(fechaString);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        return { dia, mes, anio };
    }

    fetch(URL_API)
        .then(response => {
            if (!response.ok) throw new Error("Error en el servidor");
            return response.json();
        })
        .then(data => {
            let noticiaDestacada = data.destacada;
            let listaRecientes = data.recientes || [];

            if (!noticiaDestacada && listaRecientes.length > 0) {
                noticiaDestacada = listaRecientes[0];
                listaRecientes = listaRecientes.slice(1);
            }

            if (noticiaDestacada) {
                const { dia, mes, anio } = separarFecha(noticiaDestacada.created_at);
                const cuerpoRecortado = limitarPalabras(noticiaDestacada.cuerpo, 25); 

                destacadaContainer.innerHTML = `
                    <div class="fila-destacada">
                        <div class="columna-imagen-destacada">
                            <img src="${URL_IMAGENES}${noticiaDestacada.imagen}" alt="${noticiaDestacada.titulo}">
                        </div>
                        <div class="columna-info-destacada">
                            <div class="contenedor-cabecera-destacada">
                                <div class="bloque-fecha">
                                    <span class="dia">${dia}</span>
                                    <span class="mes-anio">${mes}<br>${anio}</span>
                                </div>
                                <span class="etiqueta-destacada">NOTICIA DESTACADA</span>
                            </div>
                            <h3>${noticiaDestacada.titulo}</h3>
                            <p>${cuerpoRecortado}</p>
                            <a href="#" class="btn-leer-noticia-completa">Leer noticia completa →</a>
                        </div>
                    </div>
                `;
            } else {
                destacadaContainer.innerHTML = `<p class="text-center">No hay ninguna noticia publicada todavía.</p>`;
            }

            noticiasGlobales = listaRecientes;
            renderizarPaginaRecientes(paginaActual);
            construirBotonesPaginacion();
        })
        .catch(error => {
            console.error(error);
            destacadaContainer.innerHTML = `<p class="text-center" style="color: red; padding: 20px;">Error al conectar con el servidor.</p>`;
        });

    // --- RENDERIZADO CON DISEÑO EXCLUSIVO USANDO FONT-AWESOME ---
    function renderizarPaginaRecientes(pagina) {
        recientesContainer.innerHTML = "";
        const inicio = (pagina - 1) * NOTICIAS_POR_PAGINA;
        const fin = inicio + NOTICIAS_POR_PAGINA;
        const subLista = noticiasGlobales.slice(inicio, fin);

        if (subLista.length === 0) {
            recientesContainer.innerHTML = `<p class="text-center w-100">No hay noticias.</p>`;
            return;
        }

        subLista.forEach((noticia, index) => {
            const { dia, mes, anio } = separarFecha(noticia.created_at);
            const cuerpoTarjeta = limitarPalabras(noticia.cuerpo, 20);
            const numeroNoticia = inicio + index + 1; 

            recientesContainer.innerHTML += `
                <article class="tarjeta-noticia-reciente" style="position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                    
                    <div style="position: absolute; top: 0; left: 0; width: 80px; height: 80px; overflow: hidden; z-index: 10;">
                        <div style="position: absolute; top: 15px; left: -25px; width: 110px; background: #ffcc00; color: #111; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 0.7rem; text-align: center; padding: 4px 0; transform: rotate(-45deg); box-shadow: 0 2px 5px rgba(0,0,0,0.2); letter-spacing: 0.5px;">
                            <i class="fa-solid fa-hashtag" style="font-size: 0.65rem;"></i>${numeroNoticia}
                        </div>
                    </div>

                    <div class="imagen-tarjeta" style="width: 100%; height: 200px; overflow: hidden;">
                        <img src="${URL_IMAGENES}${noticia.imagen}" alt="${noticia.titulo}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div class="cuerpo-tarjeta" style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <span class="fecha-noticia" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #666; font-weight: 600;">
                                <i class="fa-regular fa-calendar-days" style="color: #0056b3;"></i> ${dia} ${mes} ${anio}
                            </span>
                            <h4 style="margin: 12px 0 8px 0; font-family: 'Montserrat', sans-serif; font-weight: 700; color: #002d62; font-size: 1.15rem; line-height: 1.4;">${noticia.titulo}</h4>
                            <p style="font-size: 0.9rem; color: #555; line-height: 1.5; margin-bottom: 15px;">${cuerpoTarjeta}</p>
                        </div>
                        <a href="#" class="enlace-leer-mas" style="font-weight: 700; font-size: 0.85rem; color: #0056b3; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                            Leer más <i class="fa-solid fa-arrow-right-long" style="font-size: 0.8rem;"></i>
                        </a>
                    </div>
                </article>
            `;
        });
    }

    function construirBotonesPaginacion() {
        if (!paginacionContainer) return;
        paginacionContainer.innerHTML = "";

        const totalPaginas = Math.ceil(noticiasGlobales.length / NOTICIAS_POR_PAGINA);
        if (totalPaginas <= 1) return;

        const btnAnt = document.createElement("button");
        btnAnt.className = "btn-pagina";
        btnAnt.innerHTML = "«";
        btnAnt.disabled = paginaActual === 1;
        btnAnt.addEventListener("click", () => cambiarPagina(paginaActual - 1));
        paginacionContainer.appendChild(btnAnt);

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement("button");
            btn.className = `btn-pagina ${i === paginaActual ? 'activo' : ''}`;
            btn.innerText = i;
            btn.addEventListener("click", () => cambiarPagina(i));
            paginacionContainer.appendChild(btn);
        }

        const btnSig = document.createElement("button");
        btnSig.className = "btn-pagina";
        btnSig.innerHTML = "»";
        btnSig.disabled = paginaActual === totalPaginas;
        btnSig.addEventListener("click", () => cambiarPagina(paginaActual + 1));
        paginacionContainer.appendChild(btnSig);
    }

    function cambiarPagina(nuevaPagina) {
        paginaActual = nuevaPagina;
        renderizarPaginaRecientes(paginaActual);
        construirBotonesPaginacion();
        document.querySelector(".seccion-noticias-recientes").scrollIntoView({ behavior: "smooth" });
    }
});