// 1. Selección segura de elementos del DOM usando las clases del HTML
const seccionCarrusel = document.querySelector('.carrusel');
const contenedorSlides = document.querySelector('.slides');
const todosLosSlides = document.querySelectorAll('.slide');
const todasLasBolitas = document.querySelectorAll('.dot');
const botonPrev = document.querySelector('.prev');
const botonNext = document.querySelector('.next');

let indexActual = 0;
let intervaloCarrusel = null;
const TIEMPO_AUTOPLAY = 5000; // 5 segundos entre transiciones

// 2. Función principal que mueve el carrusel (control manual estable)
// 2. Función principal que mueve el carrusel (control estable mediante CSS transforms)
function actualizarCarrusel(nuevoIndex) {
  if (!todosLosSlides || todosLosSlides.length === 0) return;

  indexActual = nuevoIndex;

  // Si el índice se pasa del límite derecho, regresa al primero
  if (indexActual >= todosLosSlides.length) {
    indexActual = 0;
  }
  // Si se pasa del límite izquierdo, va al último
  if (indexActual < 0) {
    indexActual = todosLosSlides.length - 1;
  }

  // Mueve horizontalmente el contenedor base en múltiplos de 100%
  if (contenedorSlides) {
    contenedorSlides.style.transform = `translateX(-${indexActual * 100}%)`;
  }

  // Actualiza los estados visuales de las bolitas inferiores
  todasLasBolitas.forEach((bolita, i) => {
    bolita.classList.toggle('active', i === indexActual);
  });
  
  // Actualiza los estados visuales de los slides
  todosLosSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === indexActual);
  });
}

// 3. Funciones de dirección manual
// 3. Funciones de dirección
function avanzarSlide() {
  actualizarCarrusel(indexActual + 1);
}

function retrocederSlide() {
  actualizarCarrusel(indexActual - 1);
}

// 4. Asignación de Eventos de Clic (Flechas de navegación manual)
// 4. Gestión limpia y controlada del movimiento automático (Autoplay)
function iniciarAutoplay() {
  if (intervaloCarrusel || !todosLosSlides || todosLosSlides.length <= 1) return;
  intervaloCarrusel = setInterval(() => {
    avanzarSlide();
  }, TIEMPO_AUTOPLAY);
}

function detenerAutoplay() {
  if (intervaloCarrusel) {
    clearInterval(intervaloCarrusel);
    intervaloCarrusel = null;
  }
}

function reiniciarAutoplay() {
  detenerAutoplay();
  iniciarAutoplay();
}

// 5. Asignación de Eventos de Clic (Navegación manual con reinicio limpio del contador)
if (botonNext && botonPrev) {
  botonNext.addEventListener('click', (e) => {
    e.preventDefault();
    avanzarSlide();
    reiniciarAutoplay();
  });

  botonPrev.addEventListener('click', (e) => {
    e.preventDefault();
    retrocederSlide();
    reiniciarAutoplay();
  });
}

// 5. Asignación de Eventos de Clic (Bolitas inferiores)
// 6. Asignación de Eventos de Clic (Bolitas inferiores con reinicio del contador)
todasLasBolitas.forEach((bolita, i) => {
  bolita.addEventListener('click', (e) => {
    e.preventDefault();
    actualizarCarrusel(i);
    reiniciarAutoplay();
  });
});

// 6. Estabilidad del DOM: Prevenir saltos de página y recargas indeseadas
// 7. Pausa inteligente en interacción (hover en escritorio y táctil en móviles)
if (seccionCarrusel) {
  seccionCarrusel.addEventListener('mouseenter', detenerAutoplay);
  seccionCarrusel.addEventListener('mouseleave', iniciarAutoplay);
  seccionCarrusel.addEventListener('touchstart', detenerAutoplay, { passive: true });
  seccionCarrusel.addEventListener('touchend', () => {
    reiniciarAutoplay();
  }, { passive: true });
}

// 8. Prevención de acumulación de intervalos cuando la pestaña está en segundo plano
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    detenerAutoplay();
  } else {
    iniciarAutoplay();
  }
});

// 9. Estabilidad del DOM e Inicialización
document.addEventListener("DOMContentLoaded", function () {
  // Iniciar carrusel automático si existen slides
  iniciarAutoplay();

  // Prevenir que enlaces con href="#" vacíos provoquen saltos hacia arriba
  document.addEventListener('click', function (evento) {
    const enlace = evento.target.closest('a');
    if (enlace && enlace.getAttribute('href') === '#') {
      evento.preventDefault();
    }
  });

  // Prevenir recargas forzadas por envío de formularios estáticos
  const formComentario = document.getElementById('formComentario');
  if (formComentario) {
    formComentario.addEventListener('submit', function (evento) {
      evento.preventDefault();
    });
  }

  // Animación de tarjetas al hacer scroll
  const tarjetas = document.querySelectorAll('.tarjeta-didactica');
  if (tarjetas.length > 0) {
    const opciones = {
      root: null,          
      threshold: 0.15      
    };

    const observador = new IntersectionObserver(function (entradas, observer) {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible'); 
          observer.unobserve(entrada.target);     
        }
      });
    }, opciones);

    tarjetas.forEach(tarjeta => {
      observador.observe(tarjeta);
    });
  }
});
