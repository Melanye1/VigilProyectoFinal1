document.addEventListener("DOMContentLoaded", () => {
  const openMenuBtn = document.getElementById("openMenu");
  const closeMenuBtn = document.getElementById("closeMenu");
  const sidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("mobileOverlay");

  // Abrir menú lateral
  if (openMenuBtn && sidebar && overlay) {
    openMenuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  }

  // Cerrar menú lateral (desde la 'X' o haciendo clic fuera)
  const closeMenu = () => {
    if (sidebar && overlay) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }
  };

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", closeMenu);
  }
  
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // Controlar apertura de los submenús (Nosotros, etc.) estilo acordeón
  const dropdownToggles = document.querySelectorAll(".mobile-dropdown-toggle");
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const parentLi = toggle.parentElement;
      if (parentLi) {
        parentLi.classList.toggle("open");
      }
    });
  });
});