document.addEventListener("DOMContentLoaded", function () {
  const btnMenuUsuario =
    document.getElementById("btnMenuUsuario");

  const menuUsuario =
    document.getElementById("menuUsuario");

  const btnSalirGlobal =
    document.getElementById("btnSalirGlobal");

  const avataresDashboard =
    document.querySelectorAll(".avatar-dashboard-global");

  const fotoGuardada =
    localStorage.getItem("fotoPerfilDashboard");

  if (fotoGuardada) {
    avataresDashboard.forEach(function (avatar) {
      avatar.src = fotoGuardada;
    });
  }

  if (!btnMenuUsuario || !menuUsuario) {
    return;
  }

  function cerrarMenuUsuario() {
    menuUsuario.classList.remove("show");

    btnMenuUsuario.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  btnMenuUsuario.addEventListener("click", function (evento) {
    evento.stopPropagation();

    const abierto =
      menuUsuario.classList.toggle("show");

    btnMenuUsuario.setAttribute(
      "aria-expanded",
      abierto ? "true" : "false"
    );
  });

  menuUsuario.addEventListener("click", function (evento) {
    evento.stopPropagation();
  });

  document.addEventListener("click", function () {
    cerrarMenuUsuario();
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      cerrarMenuUsuario();
    }
  });

  if (btnSalirGlobal) {
    btnSalirGlobal.addEventListener("click", function () {
      Swal.fire({
        title: '¿Cerrar sesión?',
        text: "¿Estás seguro que deseas salir del sistema?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, salir'
      }).then((result) => {
        if (result.isConfirmed) {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "login.html";
        }
      });
    });
  }

  // HAMBURGER MENU PARA SIDEBAR EN MÓVILES
  const sidebarDash = document.querySelector('.sidebar-dash');
  const sidebarMenuDash = document.querySelector('.sidebar-menu-dash');
  
  if (sidebarDash && sidebarMenuDash) {
    // Crear botón hamburguesa
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu-btn';
    hamburgerBtn.innerHTML = '☰';
    hamburgerBtn.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      color: white;
      cursor: pointer;
      background: none;
      border: none;
      z-index: 1001;
      display: none;
    `;
    
    sidebarDash.appendChild(hamburgerBtn);
    
    // Mostrar botón hamburguesa solo en móviles
    function checkMobile() {
      if (window.innerWidth <= 768) {
        hamburgerBtn.style.display = 'block';
      } else {
        hamburgerBtn.style.display = 'none';
        sidebarMenuDash.classList.remove('show');
      }
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Toggle menú
    hamburgerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebarMenuDash.classList.toggle('show');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
      if (!sidebarDash.contains(e.target) && sidebarMenuDash.classList.contains('show')) {
        sidebarMenuDash.classList.remove('show');
      }
    });
  }
});