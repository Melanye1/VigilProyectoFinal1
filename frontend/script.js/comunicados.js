document.addEventListener("DOMContentLoaded", () => {
const API_URL = 'http://127.0.0.1:8000/comunicados';
  const contenedor = document.getElementById('contenedor-comunicados-api');
  const inputBuscar = document.getElementById('buscarComunicado');
  const contenedorPaginacion = document.getElementById('contenedor-paginacion');
  
  let comunicadosData = [];
  let datosFiltrados = [];
  let paginaActual = 1;
  const registrosPorPagina = 6; // Cantidad de filas por vista

  // Instancia única del Modal de Bootstrap para controlarlo por código
  let bootstrapModal = null;

async function cargarComunicados() {
    try {
        const response = await fetch(API_URL);
        
        // Verificamos si la respuesta es válida antes de procesar
        if (!response.ok) throw new Error('Error en el servidor');
        
        // Se lee el JSON una única vez y se guarda en la variable
        const data = await response.json(); 
        comunicadosData = data;
        datosFiltrados = [...comunicadosData];
        
        crearModalEnDocumento();
        irAPagina(1);
    } catch (error) {
        console.error("Error al cargar:", error);
        contenedor.innerHTML = `<div class="alert alert-danger text-center m-3">No se pudieron cargar los comunicados oficiales. Verifique la conexión.</div>`;
    }
}
  // 2. Controlar el cambio de página
  function irAPagina(pagina) {
    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;

    paginaActual = pagina;

    // Corte de datos (Slice) para la página activa
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const itemsPagina = datosFiltrados.slice(inicio, fin);

    renderizarComunicados(itemsPagina);
    renderizarControlesPaginacion(totalPaginas);
  }

  // 3. Pintar la lista de la página actual
  function renderizarComunicados(lista) {
    if (lista.length === 0) {
      contenedor.innerHTML = '<p class="text-center text-muted py-4">No se encontraron comunicados con ese criterio.</p>';
      return;
    }

    let html = '';
    lista.forEach(comunicado => {
      const fecha = comunicado.created_at || comunicado.fecha || "Reciente";

      html += `
        <div class="item-comunicado-fila row g-3 align-items-center py-3 border-bottom text-center text-md-start">
          <div class="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start">
            <div class="icono-archivo-tipo me-3 flex-shrink-0 text-danger fs-4">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <a href="#" data-id="${comunicado.id}" class="btn-abrir-comunicado titulo-comunicado-link text-break fw-semibold text-decoration-none text-dark">
              ${comunicado.titulo}
            </a>
          </div>
          <div class="col-12 col-sm-6 col-md-3 text-muted">
            <i class="fa-regular fa-calendar-days me-2"></i> ${formatearFechaSimple(fecha)}
          </div>
          <div class="col-12 col-sm-6 col-md-3 text-center d-flex justify-content-center gap-2">
            <button data-id="${comunicado.id}" class="btn-abrir-comunicado btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
              <i class="fa-regular fa-eye"></i> <span>Ver PDF</span>
            </button>
            <button data-id="${comunicado.id}" class="btn-generar-pdf btn btn-sm btn-danger d-flex align-items-center gap-1">
              <i class="fa-solid fa-download"></i> <span>Descargar</span>
            </button>
          </div>
        </div>
      `;
    });
    contenedor.innerHTML = html;

    // Evento para abrir Vista Previa (Modal)
    document.querySelectorAll('.btn-abrir-comunicado').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const comunicado = comunicadosData.find(c => c.id == id);
        if (comunicado) mostrarModalDinamico(comunicado);
      });
    });

    // Evento para Descarga Directa de tu plantilla de Impresión
    document.querySelectorAll('.btn-generar-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const comunicado = comunicadosData.find(c => c.id == id);
        if (comunicado) descargarPDF(comunicado);
      });
    });
  }

  // 4. Renderizar Paginador conservando el diseño CSS original
  function renderizarControlesPaginacion(totalPaginas) {
    if (!contenedorPaginacion) return;
    contenedorPaginacion.innerHTML = '';

    if (totalPaginas <= 1) return; // No se requiere paginar si es una sola hoja

    let htmlPaginador = '';

    // Generar números de página
    for (let i = 1; i <= totalPaginas; i++) {
      const claseActiva = i === paginaActual ? 'active' : '';
      htmlPaginador += `
        <li class="pag-item-custom ${claseActiva}">
          <a href="#" class="btn btn-sm btn-light de-paginacion" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Flecha Siguiente
    if (paginaActual < totalPaginas) {
      htmlPaginador += `
        <li class="pag-item-custom flecha-pag">
          <a href="#" class="btn btn-sm btn-light de-paginacion" data-page="${paginaActual + 1}">
            <i class="fa-solid fa-chevron-right"></i>
          </a>
        </li>
      `;
    }

    contenedorPaginacion.innerHTML = htmlPaginador;

    // Listeners para los botones del numerador
    document.querySelectorAll('.de-paginacion').forEach(boton => {
      boton.addEventListener('click', (e) => {
        e.preventDefault();
        const pagDestino = parseInt(boton.getAttribute('data-page'));
        irAPagina(pagDestino);
      });
    });
  }

  // 5. Crear el Modal base vacío en el DOM
  function crearModalEnDocumento() {
    if (document.getElementById('modalComunicadoDinamico')) return;
    
    const divModal = document.createElement('div');
    divModal.className = 'modal fade';
    divModal.id = 'modalComunicadoDinamico';
    divModal.setAttribute('tabindex', '-1');
    divModal.setAttribute('aria-hidden', 'true');
    
    divModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-comunicado-custom shadow-lg position-relative" id="contenido-modal-dinamico">
          <!-- Se inyecta dinámicamente al abrir -->
        </div>
      </div>
    `;
    document.body.appendChild(divModal);
    bootstrapModal = new bootstrap.Modal(divModal);
  }

  // 6. Rellenar y abrir el modal con tus estilos estéticos exactos
  function mostrarModalDinamico(comunicado) {
    const contenedorModal = document.getElementById('contenido-modal-dinamico');
    const fechaModal = formatearFechaCompleta(comunicado.created_at || comunicado.fecha);
    const creador = comunicado.usuario_creador || 'Dirección General';
    const cuerpo = comunicado.cuerpo || comunicado.contenido || '';

    contenedorModal.innerHTML = `
      <button type="button" class="btn-close-modal-comunicado position-absolute top-0 end-0 m-3 btn border-0 bg-transparent" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa-solid fa-xmark fs-4"></i>
      </button>
      <div class="modal-body p-4 p-md-5">
        <div class="encabezado-documento-modal d-flex align-items-center mb-4 flex-wrap text-center text-sm-start justify-content-center justify-content-sm-start">
          <img src="img/logo_enriquepaillardelle.png" alt="Logo Colegio" class="me-sm-3 mb-2 mb-sm-0" style="height: 65px;">
          <div>
            <h4 class="m-0 color-azul-ie">COLEGIO</h4>
            <h3 class="m-0 color-azul-ie fw-bold font-montserrat">ENRIQUE PAILLARDELLE</h3>
          </div>
        </div>
        <div class="linea-separadora-modal-amarilla mb-4"></div>
        <div class="contenido-documento-modal text-center">
          <h2 class="titulo-interno-documento fw-bold mb-2 fs-4">${comunicado.titulo}</h2>
          <p class="fecha-documento-modal text-end text-muted font-italic mb-4">Fecha: ${fechaModal}</p>
          <div class="texto-oficial-documento text-start mb-5">
            <p>${cuerpo}</p>
            <p class="mt-4">Atentamente,</p>
            <div class="firma-colegio-modal text-center mt-5">
              <p class="fw-bold m-0 text-uppercase">${creador}</p>
              <p class="text-muted small">Colegio Enrique Paillardelle</p>
            </div>
          </div>
          <div class="contenedor-boton-descarga-modal text-center">
            <button class="btn btn-primary btn-descargar-pdf-modal" id="btn-descarga-desde-modal">
              <i class="fa-solid fa-circle-down"></i> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    `;

    // Configurar acción del botón de descarga interno del modal
    document.getElementById('btn-descarga-desde-modal').addEventListener('click', () => {
      descargarPDF(comunicado);
    });

    bootstrapModal.show();
  }

  // 7. Tu Plantilla de Impresión Limpia
  function descargarPDF(comunicado) {
    const fechaFormateada = new Date(comunicado.created_at || comunicado.fecha).toLocaleDateString();
    const creador = comunicado.usuario_creador || 'Dirección General';
    const cuerpo = comunicado.cuerpo || comunicado.contenido || '';

    const htmlContenido = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>${comunicado.titulo}</title>
          <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 45px; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 15px; margin-bottom: 25px; }
              .header h1 { color: #003366; font-size: 22px; margin: 0; text-transform: uppercase; }
              .header p { margin: 5px 0 0 0; color: #666; font-size: 13px; }
              .meta-pdf { text-align: right; font-size: 12px; color: #555; margin-bottom: 25px; font-style: italic; }
              .titulo-comunicado { font-size: 18px; color: #111; font-weight: bold; margin-bottom: 20px; text-align: center; text-transform: uppercase; }
              .contenido { font-size: 14px; text-align: justify; white-space: pre-line; margin-bottom: 50px; color: #222; }
              .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Colegio Enrique Paillardelle</h1>
              <p>Comunicado Oficial Institucional</p>
          </div>
          <div class="meta-pdf">
              <strong>Publicado por:</strong> ${creador}<br>
              <strong>Fecha de emisión:</strong> ${fechaFormateada}
          </div>
          <div class="titulo-comunicado">${comunicado.titulo}</div>
          <div class="contenido">${cuerpo}</div>
          <div class="footer">
              Dirección General • Institución Educativa Enrique Paillardelle<br>
              Documento digital válido emitido desde el Panel Administrativo.
          </div>
          <script>
              window.onload = function() { window.print(); window.close(); }
          <\/script>
      </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(htmlContenido);
    ventanaImpresion.document.close();
  }

  // 8. Evento del Buscador Integrado con el Numerador
  if (inputBuscar) {
    inputBuscar.addEventListener('input', (e) => {
      const termino = e.target.value.toLowerCase().trim();
      
      datosFiltrados = comunicadosData.filter(c => 
        c.titulo.toLowerCase().includes(termino) || 
        (c.cuerpo && c.cuerpo.toLowerCase().includes(termino))
      );
      
      irAPagina(1); // Reinicia a la página 1 exponiendo los filtrados
    });
  }

  // Utilitarios de Fechas
  function formatearFechaSimple(fechaString) {
    if (!fechaString) return "Reciente";
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  }

  function formatearFechaCompleta(fechaString) {
    if (!fechaString) return "Fecha no disponible";
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  }

  cargarComunicados();
});