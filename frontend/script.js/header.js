document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) return;

  if (!document.querySelector('link[href$="css/header.css"]')) {
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "css/header.css";
    document.head.appendChild(styles);
  }

  fetch("header.html")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el header.");
      return response.text();
    })
    .then((markup) => {
      headerContainer.innerHTML = markup;
      initializeHeader(headerContainer);
    })
    .catch((error) => console.error("Error al cargar el header:", error));
});

function initializeHeader(container) {
  const header = container.querySelector(".site-header");
  const panel = container.querySelector(".mobile-nav-panel");
  const stage = container.querySelector(".mobile-menu-stage");
  const hamburger = container.querySelector(".hamburger-menu");
  const closeButton = container.querySelector(".close-mobile-menu");
  const backButton = container.querySelector(".back-btn");
  const mainMenu = container.querySelector(".mobile-main-menu");
  const subMenu = container.querySelector(".mobile-sub-menu");
  const submenuTitle = container.querySelector(".submenu-title");

  if (!header || !panel || !stage || !hamburger) return;

  const updateScrolledState = () => {
    header.classList.toggle("header-scrolled", window.scrollY > 50);
  };

  const updateBodyOffset = () => {
    const isScrolled = header.classList.contains("header-scrolled");
    header.classList.remove("header-scrolled");
    const initialHeight = header.offsetHeight;
    if (isScrolled) header.classList.add("header-scrolled");
    document.body.style.paddingTop = `${initialHeight}px`;
  };

  window.addEventListener("scroll", updateScrolledState, { passive: true });
  window.addEventListener("resize", updateBodyOffset);
  requestAnimationFrame(updateBodyOffset);
  updateScrolledState();

  const submenuItems = {
    nosotros: [
      ["Bienvenida institucional", "bienvenida.html"],
      ["Reseña histórica", "historia.html"],
      ["Misión y Visión", "mision_vision.html"],
      ["Plana directiva", "plana_directiva.html"],
      ["Comunidad Paillardelina", "comunidad.html"],
      ["Formación integral", "formacion_integral.html"],
      ["Himno del colegio", "himno.html"],
      ["Organigrama institucional", "organigrama.html"],
    ],
    noticias: [
      ["Últimas noticias", "noticias.html"],
      ["Comunicados", "comunicados.html"],
    ],
    admision: [
      ["Proceso de matrícula", "admision.html"],
      ["Proceso e información", "proceso.html"],
      ["Niveles educativos", "niveles_educativos.html"],
    ],
    galeria: [
      ["Galería institucional", "galeria.html"],
      ["Instalaciones de la institución", "instalaciones.html"],
    ],
    contacto: [
      ["Formulario de contacto", "contacto.html"],
      ["Preguntas Frecuentes (FAQ)", "preguntas_frecuentes.html"],
    ],
  };

  const closeMobileMenu = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    header.classList.remove("menu-open");
    document.body.classList.remove("public-menu-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    stage.classList.remove("submenu-open");
  };

  const showSubmenu = (key) => {
    const items = submenuItems[key] || [];
    submenuTitle.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    subMenu.innerHTML = items
      .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
      .join("");
    stage.classList.add("submenu-open");
  };

  hamburger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = panel.classList.toggle("is-open");
    panel.setAttribute("aria-hidden", String(!isOpen));
    header.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("public-menu-open", isOpen);
    hamburger.classList.toggle("is-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) stage.classList.remove("submenu-open");
  });

  closeButton?.addEventListener("click", closeMobileMenu);
  backButton?.addEventListener("click", () => stage.classList.remove("submenu-open"));
  panel.addEventListener("click", (event) => {
    if (event.target === panel) closeMobileMenu();
  });

  mainMenu?.addEventListener("click", (event) => {
    const trigger = event.target.closest(".mobile-sub-trigger");
    if (trigger) showSubmenu(trigger.dataset.target);
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMobileMenu();
  });
}
