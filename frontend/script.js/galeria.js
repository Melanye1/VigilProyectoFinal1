document.addEventListener("DOMContentLoaded", function () {
    const filtros = document.querySelectorAll(".filtro-galeria");
    const tarjetas = [...document.querySelectorAll(".tarjeta-galeria")];
    const buscador = document.getElementById("buscarGaleria");
    const sinResultados = document.getElementById("sinResultadosGaleria");
    const paginacion = document.getElementById("paginacionGaleria");
    const visor = document.getElementById("visorGaleria");
    const imagenVisor = document.getElementById("imagenVisor");
    const tituloVisor = document.getElementById("tituloVisor");
    const categoriaVisor = document.getElementById("categoriaVisor");
    const fechaVisor = document.getElementById("fechaVisor");
    const cerrarVisor = document.getElementById("cerrarVisor");
    const fondoVisor = document.getElementById("fondoVisor");
    const anteriorVisor = document.getElementById("anteriorVisor");
    const siguienteVisor = document.getElementById("siguienteVisor");

    let categoriaActual = "todas";
    let paginaActual = 1;
    let indiceVisor = 0;
    let tarjetasFiltradas = [...tarjetas];
    const fotosPorPagina = 6;

    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function obtenerTarjetasFiltradas() {
        const texto = normalizar(buscador.value.trim());
        return tarjetas.filter(function (tarjeta) {
            const coincideCategoria = categoriaActual === "todas" || tarjeta.dataset.categoria === categoriaActual;
            const coincideTexto = normalizar(tarjeta.dataset.titulo).includes(texto);
            return coincideCategoria && coincideTexto;
        });
    }

    function subirASeccion() {
        const barra = document.querySelector(".barra-galeria");
        if (!barra) return;
        window.scrollTo({ top: barra.offsetTop - 120, behavior: "smooth" });
    }

    function renderizarGaleria() {
        tarjetasFiltradas = obtenerTarjetasFiltradas();
        const totalPaginas = Math.ceil(tarjetasFiltradas.length / fotosPorPagina);

        if (paginaActual > totalPaginas) {
            paginaActual = Math.max(totalPaginas, 1);
        }

        const inicio = (paginaActual - 1) * fotosPorPagina;
        const fin = inicio + fotosPorPagina;
        const visibles = tarjetasFiltradas.slice(inicio, fin);

        tarjetas.forEach(tarjeta => tarjeta.classList.add("oculta"));
        visibles.forEach(tarjeta => tarjeta.classList.remove("oculta"));

        sinResultados.classList.toggle("activo", tarjetasFiltradas.length === 0);
        renderizarPaginacion(totalPaginas);
    }

    function crearBotonPagina(contenido, clases, deshabilitado, accion, etiqueta) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = clases;
        boton.innerHTML = contenido;
        boton.disabled = deshabilitado;
        boton.setAttribute("aria-label", etiqueta);
        boton.addEventListener("click", accion);
        return boton;
    }

    function renderizarPaginacion(totalPaginas) {
        paginacion.innerHTML = "";

        if (totalPaginas <= 1) return;

        const anterior = crearBotonPagina(
            '<i class="fa-solid fa-chevron-left"></i>',
            "boton-pagina-galeria",
            paginaActual === 1,
            function () {
                paginaActual--;
                renderizarGaleria();
                subirASeccion();
            },
            "Página anterior"
        );

        paginacion.appendChild(anterior);

        for (let numero = 1; numero <= totalPaginas; numero++) {
            const boton = crearBotonPagina(
                String(numero),
                "boton-pagina-galeria" + (numero === paginaActual ? " activo" : ""),
                false,
                function () {
                    paginaActual = numero;
                    renderizarGaleria();
                    subirASeccion();
                },
                `Ir a la página ${numero}`
            );

            paginacion.appendChild(boton);
        }

        const siguiente = crearBotonPagina(
            '<i class="fa-solid fa-chevron-right"></i>',
            "boton-pagina-galeria",
            paginaActual === totalPaginas,
            function () {
                paginaActual++;
                renderizarGaleria();
                subirASeccion();
            },
            "Página siguiente"
        );

        paginacion.appendChild(siguiente);
    }

    filtros.forEach(function (filtro) {
        filtro.addEventListener("click", function () {
            filtros.forEach(boton => boton.classList.remove("activo"));
            this.classList.add("activo");
            categoriaActual = this.dataset.categoria;
            paginaActual = 1;
            renderizarGaleria();
        });
    });

    buscador.addEventListener("input", function () {
        paginaActual = 1;
        renderizarGaleria();
    });

    function mostrarEnVisor(indice) {
        if (!tarjetasFiltradas.length) return;

        indiceVisor = (indice + tarjetasFiltradas.length) % tarjetasFiltradas.length;

        const tarjeta = tarjetasFiltradas[indiceVisor];
        const imagen = tarjeta.querySelector("img");

        imagenVisor.src = imagen.src;
        imagenVisor.alt = imagen.alt;
        tituloVisor.textContent = tarjeta.querySelector("h3").textContent;
        categoriaVisor.textContent = tarjeta.querySelector(".categoria-galeria").textContent;
        fechaVisor.textContent = tarjeta.querySelector(".capa-tarjeta-galeria p").textContent.trim();
    }

    function abrirVisor(tarjeta) {
        tarjetasFiltradas = obtenerTarjetasFiltradas();
        indiceVisor = tarjetasFiltradas.indexOf(tarjeta);

        mostrarEnVisor(indiceVisor);

        visor.classList.add("activo");
        visor.setAttribute("aria-hidden", "false");
        document.body.classList.add("visor-abierto");
    }

    function cerrar() {
        visor.classList.remove("activo");
        visor.setAttribute("aria-hidden", "true");
        document.body.classList.remove("visor-abierto");
    }

    tarjetas.forEach(function (tarjeta) {
        const boton = tarjeta.querySelector(".abrir-imagen");

        boton.addEventListener("click", function () {
            abrirVisor(tarjeta);
        });
    });

    cerrarVisor.addEventListener("click", cerrar);
    fondoVisor.addEventListener("click", cerrar);

    anteriorVisor.addEventListener("click", function () {
        mostrarEnVisor(indiceVisor - 1);
    });

    siguienteVisor.addEventListener("click", function () {
        mostrarEnVisor(indiceVisor + 1);
    });

    document.addEventListener("keydown", function (evento) {
        if (!visor.classList.contains("activo")) return;

        if (evento.key === "Escape") cerrar();
        if (evento.key === "ArrowLeft") mostrarEnVisor(indiceVisor - 1);
        if (evento.key === "ArrowRight") mostrarEnVisor(indiceVisor + 1);
    });

    renderizarGaleria();
});