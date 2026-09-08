document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("noticias-home-container");
  if (!container) return;

  const apiUrl = "http://127.0.0.1:8000/noticias";
  const imageBaseUrl = "http://127.0.0.1:8000/storage/imagenes/";

  const escapeHtml = (value) => {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Fecha no disponible";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const excerpt = (text, maxLength = 140) => {
    const normalized = String(text ?? "").trim();
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength).trim()}...`
      : normalized;
  };

  const renderNews = (payload) => {
    const source = Array.isArray(payload)
      ? payload
      : [
          ...(payload?.recientes ?? []),
          ...(payload?.destacada ? [payload.destacada] : []),
        ];

    const news = [...new Map(
      source
        .filter((item) => item && item.id != null)
        .map((item) => [item.id, item])
    ).values()]
      .sort((first, second) => {
        const firstDate = new Date(first.created_at ?? 0).getTime();
        const secondDate = new Date(second.created_at ?? 0).getTime();
        return secondDate - firstDate;
      })
      .slice(0, 3);

    if (news.length === 0) {
      container.innerHTML = '<p class="estado-noticias-home">No hay noticias publicadas todavía.</p>';
      return;
    }

    container.innerHTML = news.map((item) => {
      const title = escapeHtml(item.titulo || "Noticia");
      const body = escapeHtml(excerpt(item.cuerpo));
      const date = escapeHtml(formatDate(item.created_at));
      const image = item.imagen
        ? `${imageBaseUrl}${encodeURIComponent(item.imagen)}`
        : "img/logo_enriquepaillardelle.png";

      return `
        <article class="tarjeta-noticia-home">
          <div class="imagen-noticia-home">
            <img src="${image}" alt="${title}">
          </div>
          <div class="cuerpo-noticia-home">
            <span class="fecha-noticia-home">${date}</span>
            <h3>${title}</h3>
            <p>${body || "Conoce las novedades de nuestra institución."}</p>
            <a href="noticias.html" class="enlace-noticia-home">Leer más <span aria-hidden="true">→</span></a>
          </div>
        </article>
      `;
    }).join("");
  };

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      return response.json();
    })
    .then(renderNews)
    .catch((error) => {
      console.error("No se pudieron cargar las últimas noticias:", error);
      container.innerHTML = '<p class="estado-noticias-home">No fue posible cargar las noticias en este momento.</p>';
    });
});
