const API_URL = 'http://127.0.0.1:8000'; // Asegúrate de apuntar a tu backend

async function cargarUsuarios() {
    const contenedor = document.getElementById('contenedor-usuarios');
    const res = await fetch(`${API_URL}/usuarios`);
    const usuarios = await res.json();

    contenedor.innerHTML = '';
    usuarios.forEach((user, index) => {
        const esActivo = user.activo == 1;
        const fila = document.createElement('div');
        // Aquí recuperamos tus clases originales
        fila.className = `usuario-item-row ${esActivo ? 'usuario-activo' : 'usuario-inactivo'}`;

        fila.innerHTML = `
            <div class="usuario-texto-box">
                ${index + 1}. ${user.name} <small>(${user.email})</small>
            </div>
            <div class="usuario-acciones">
                <button class="btn-accion-icon verde-claro" onclick="editarUsuario(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-accion-icon" onclick="cambiarEstado(${user.id}, ${user.activo})">
                    <i class="bi ${esActivo ? 'bi-toggle-on' : 'bi-toggle-off'}"></i>
                </button>
                <button class="btn-accion-icon rojo" onclick="eliminarUsuario(${user.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });
}

async function editarUsuario(id) {
    const res = await fetch(`${API_URL}/usuarios/${id}`);
    const user = await res.json();

    const { value: formValues } = await Swal.fire({
        title: 'Editar Usuario',
        html: `
            <input id="swal-name" class="swal2-input" value="${user.name}">
            <input id="swal-email" class="swal2-input" value="${user.email}">
            <input id="swal-pass" class="swal2-input" type="password" placeholder="Nueva contraseña">
        `,
        preConfirm: () => ({
            name: document.getElementById('swal-name').value,
            email: document.getElementById('swal-email').value,
            password: document.getElementById('swal-pass').value
        })
    });

    if (formValues) {
        const res = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formValues)
        });
        if (res.ok) {
            Swal.fire('Éxito', 'Actualizado', 'success');
            cargarUsuarios();
        }
    }
}

async function cambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual == 1 ? 0 : 1;
    await fetch(`${API_URL}/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado })
    });
    cargarUsuarios();
}

async function eliminarUsuario(id) {
    if ((await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true })).isConfirmed) {
        await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
        cargarUsuarios();
    }
}

document.addEventListener('DOMContentLoaded', cargarUsuarios);