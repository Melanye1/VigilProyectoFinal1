
const API_URL = 'http://127.0.0.1:8000';
document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btnAbrirModalAgregar');

    if (btnAbrir) {
        btnAbrir.addEventListener('click', mostrarFormularioSwal);
    }
});

async function mostrarFormularioSwal() {
    const { value: formValues } = await Swal.fire({
        title: 'Agregar fotografía',
        html: `
            <input id="swal-titulo" class="swal2-input" placeholder="Título de la foto">
            <input id="swal-imagen" type="file" class="swal2-file" accept="image/*">
        `,
        focusConfirm: false,
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const titulo = document.getElementById('swal-titulo').value;
            const imagen = document.getElementById('swal-imagen').files[0];
            if (!titulo || !imagen) {
                Swal.showValidationMessage('Debes ingresar un título y seleccionar una imagen');
                return false;
            }
            return { titulo, imagen };
        }
    });

    if (formValues) {
        enviarAlServidor(formValues);
    }
}

async function enviarAlServidor(data) {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('imagen', data.imagen);

    try {
        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

        // URL absoluta al puerto 8000
        const response = await fetch('http://127.0.0.1:8000/galeria', {
            method: 'POST',
            body: formData
            // Temporalmente quitamos el CSRF para ver si el servidor responde
        });

        const resultado = await response.json();

        if (response.ok) {
            Swal.fire('¡Éxito!', 'Fotografía guardada', 'success');
            cargarGaleria(); // Recargar tras guardar
        } else {
            Swal.fire('Error', resultado.message || 'Error en servidor', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo de conexión', 'error');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    cargarGaleria();
});

async function cargarGaleria() {
    const contenedor = document.getElementById('gridGaleriaDashboard');
    const estadoVacio = document.getElementById('estadoVacioGaleria');

    try {
        const response = await fetch(`${API_URL}/obtener-galeria`);
        const fotos = await response.json();

        console.log("Datos recibidos del servidor:", fotos); // <-- MIRA ESTO EN LA CONSOLA

        if (!fotos || fotos.length === 0) {
            console.log("No hay fotos para mostrar.");
            if (estadoVacio) estadoVacio.style.display = 'block';
            return;
        }

        if (estadoVacio) estadoVacio.style.display = 'none';
        
       // Busca esta línea dentro de tu función cargarGaleria
contenedor.innerHTML = fotos.map(foto => `
    <div class="tarjeta-foto-estilo">
        <div class="imagen-wrapper">
            <!-- CAMBIA ESTO -->
            <img src="${API_URL}/storage/galeria/${foto.imagen}" alt="${foto.titulo}">
        </div>
        <div class="info-foto">
            <h4>${foto.titulo}</h4>
        </div>
    </div>
`).join('');
    } catch (error) {
        console.error("Error al cargar la galería:", error);
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', cargarGaleria);