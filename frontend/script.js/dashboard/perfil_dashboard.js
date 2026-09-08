document.addEventListener("DOMContentLoaded", function () {
  const inputFoto = document.getElementById("inputFotoPerfil");
  const previewFoto = document.getElementById("previewFotoPerfil");
  const avataresDashboard = document.querySelectorAll(
    ".avatar-dashboard-global"
  );

  const botonPassword = document.getElementById("btnVerPassword");
  const inputPassword = document.getElementById("contrasena");

  const botonGuardar = document.getElementById("btnGuardarPerfil");

  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const fecha = document.getElementById("fecha");
  const cargo = document.getElementById("cargo");

  const fotoGuardada = localStorage.getItem("fotoPerfilDashboard");

  if (fotoGuardada) {
    previewFoto.src = fotoGuardada;

    avataresDashboard.forEach(function (avatar) {
      avatar.src = fotoGuardada;
    });
  }

  inputFoto.addEventListener("change", function () {
    const archivo = this.files[0];

    if (!archivo) {
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      alert("Selecciona una imagen JPG, PNG o WEBP.");
      inputFoto.value = "";
      return;
    }

    const limiteBytes = 2 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      alert("La imagen no debe superar los 2 MB.");
      inputFoto.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = function (evento) {
      const nuevaFoto = evento.target.result;

      previewFoto.src = nuevaFoto;

      avataresDashboard.forEach(function (avatar) {
        avatar.src = nuevaFoto;
      });

      localStorage.setItem(
        "fotoPerfilDashboard",
        nuevaFoto
      );
    };

    lector.readAsDataURL(archivo);
  });

  botonPassword.addEventListener("click", function () {
    const passwordOculta =
      inputPassword.type === "password";

    inputPassword.type = passwordOculta
      ? "text"
      : "password";

    botonPassword.innerHTML = passwordOculta
      ? '<i class="bi bi-eye-slash"></i>'
      : '<i class="bi bi-eye"></i>';
  });

  botonGuardar.addEventListener("click", function () {
    const datosPerfil = {
      nombre: nombre.value.trim(),
      correo: correo.value.trim(),
      fechaNacimiento: fecha.value,
      cargo: cargo.value.trim()
    };

    localStorage.setItem(
      "datosPerfilDashboard",
      JSON.stringify(datosPerfil)
    );

    alert("Los datos del perfil se guardaron correctamente.");
  });

  const datosGuardados =
    localStorage.getItem("datosPerfilDashboard");

  if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);

    nombre.value = datos.nombre || "";
    correo.value = datos.correo || "";
    fecha.value = datos.fechaNacimiento || "";
    cargo.value = datos.cargo || "";
  }
});