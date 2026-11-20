document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar visor 3D
  const visor = new SplatViewer('lienzo3D', 'barraProgreso');

  /* ==========================================================
     [Viewport OpenSource] - Inicialización del Visor Nativo
     ========================================================== */
  let visorNativo = null;
  if (window.NativeSplatViewport) {
    visorNativo = new NativeSplatViewport({
      contenedorId: 'contenedorLienzo3D',
      archivoModelo: 'assets/models/scene.compressed.ply',
      barraProgresoId: 'barraProgreso'
    });
    visorNativo.iniciar();
  }
  /* ========================================================== */

  // Botones de cámara (Dron, Interior, Terraza)
  const botonesCamara = document.querySelectorAll('.btn-camara');
  botonesCamara.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesCamara.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      const vista = btn.getAttribute('data-vista');
      
      // Cambio dinámico de escena seccionada en el visor nativo
      if (visorNativo && visorNativo.iniciado) {
        visorNativo.cargarZona(vista);
      } else {
        visor.moverCamara(vista);
      }
    });
  });

  
  cargarCatalogo();
  prepararModal();
  prepararFormulario();
  prepararAsistenteIA();
  prepararComparadorVisual();
  prepararMenuMovil();
  prepararCalculadoraCotizacion();
});

// Función para cargar propiedades sin tenerlas hardcoded en el HTML
async function cargarCatalogo() {
  const contenedor = document.getElementById('cuadriculaCatalogo');
  const botonesFiltro = document.querySelectorAll('.btn-filtro');
  if (!contenedor) return;

  try {
    const respuesta = await fetch('assets/data/properties.json');
    const propiedades = await respuesta.json();
    mostrarTarjetas(propiedades, 'todos');

    // Conectar eventos a los botones de filtro  ( ͡° ͜ʖ ͡°)
    botonesFiltro.forEach(btn => {
      btn.addEventListener('click', () => {
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        const filtro = btn.getAttribute('data-filtro');
        mostrarTarjetas(propiedades, filtro);
      });
    });
  } catch (error) {
    contenedor.innerHTML = `
      <div style="grid-column: 1/-1; padding: 24px; color: #ff6b6b; text-align: center;">
        No se pudieron cargar los datos del catálogo.
      </div>
    `;
  }
}

// Dibuja las tarjetas en pantalla según el filtro 
function mostrarTarjetas(lista, filtro) {
  const contenedor = document.getElementById('cuadriculaCatalogo');
  contenedor.innerHTML = '';

  const filtradas = filtro === 'todos' 
    ? lista 
    : lista.filter(item => item.categoria === filtro);

  filtradas.forEach(item => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-propiedad';
    tarjeta.innerHTML = `
      <div class="imagen-tarjeta">
        <img src="${item.imagen}" alt="${item.titulo}" loading="lazy">
        <span class="insignia-tarjeta">● 3DGS ACTIVO</span>
      </div>
      <div class="cuerpo-tarjeta">
        <h3 class="titulo-tarjeta">${item.titulo}</h3>
        <p class="ubicacion-tarjeta">${item.ubicacion}</p>
        
        <div class="ficha-tecnica">
          <div class="item-ficha">
            <span>Resolución</span>
            <strong>${item.splats}</strong>
          </div>
          <div class="item-ficha">
            <span>Método</span>
            <strong>${item.metodo}</strong>
          </div>
          <div class="item-ficha">
            <span>Área</span>
            <strong>${item.area}</strong>
          </div>
          <div class="item-ficha">
            <span>Capacidad</span>
            <strong>${item.capacidad}</strong>
          </div>
        </div>

        <div class="pie-tarjeta">
          <button class="btn-principal btn-ver-3d" data-titulo="${item.titulo}" data-splat-id="${item.superSplatId || ''}" data-archivo="${item.archivo3D || ''}">
            Explorar en 3D
          </button>
          <span style="font-size: 0.8rem; color: var(--verde-activo);">● ${item.estado}</span>
        </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });

  // Conectar botones "Explorar en 3D"
  document.querySelectorAll('.btn-ver-3d').forEach(btn => {
    btn.addEventListener('click', () => {
      const titulo = btn.getAttribute('data-titulo');
      const splatId = btn.getAttribute('data-splat-id');
      const archivo = btn.getAttribute('data-archivo');
      abrirModal(titulo, splatId, archivo);
    });
  });
}

function prepararModal() {
  const modal = document.getElementById('modal3D');
  const btnCerrar = document.getElementById('btnCerrarModal');
  const btnReiniciar = document.getElementById('btnReiniciarCamaraModal');
  const btnCotizar = document.getElementById('btnCotizarDesdeModal');
  if (!modal || !btnCerrar) return;


  let visorModal = null;
  setTimeout(() => {
    visorModal = new SplatViewer('lienzoModal3D');
  }, 300);

  const iframeModal = document.getElementById('iframeModalSplat');
  const lienzoModal = document.getElementById('lienzoModal3D');

  btnCerrar.addEventListener('click', () => {
    modal.classList.remove('abierto');
    if (iframeModal) iframeModal.src = '';
  });

  if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
      if (visorModal) visorModal.moverCamara('dron');
    });
  }

  if (btnCotizar) {
    btnCotizar.addEventListener('click', () => {
      modal.classList.remove('abierto');
    });
  }

  window.abrirModal = function(titulo, splatId, archivo) {
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalDescripcion').textContent = 
      `Visualizando nube de radiancia y Gaussian Splats de ${titulo}. Puedes rotar la escena con el ratón o el dedo.`;
    
    // Carga de la escena 3D correspondiente
    if (splatId && iframeModal && lienzoModal) {
      lienzoModal.style.display = 'none';
      iframeModal.style.display = 'block';
      iframeModal.src = `https://superspl.at/view?id=${splatId}&noui=true`;
    } else {
      if (iframeModal && lienzoModal) {
        iframeModal.style.display = 'none';
        iframeModal.src = '';
        lienzoModal.style.display = 'block';
      }
    }

    modal.classList.add('abierto');
    if (visorModal) {
      visorModal.ajustarTamano();
    }
  };
}


// Validación y envío del formulario de contacto
function prepararFormulario() {
  const form = document.getElementById('formularioContacto');
  const estado = document.getElementById('mensajeEstadoForm');
  if (!form || !estado) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('campoNombre').value.trim();
    const email = document.getElementById('campoEmail').value.trim();
    const tipo = document.getElementById('campoTipo').value;
    const area = document.getElementById('campoArea').value;
    const ciudad = document.getElementById('campoCiudad').value;

    if (!nombre || !email) {
      estado.innerHTML = `<span style="color: #ff6b6b;">Por favor completa los campos obligatorios.</span>`;
      return;
    }

    // Estado visual de envío en progreso
    estado.innerHTML = `<span style="color: var(--color-dorado);">Enviando solicitud y conectando a Base de Datos...</span>`;

    try {
      if (window.db) {
        await window.db.guardarProspecto({
          nombre,
          email,
          tipo,
          area: area ? parseInt(area) : null,
          ciudad
        });
      }

      setTimeout(() => {
        estado.innerHTML = `<span style="color: var(--verde-activo);">✔ Solicitud registrada exitosamente en Base de Datos. Te contactaremos en menos de 24h.</span>`;
        form.reset();
      }, 700);
    } catch (err) {
      estado.innerHTML = `<span style="color: #ff6b6b;">Error al guardar: ${err.message}</span>`;
    }
  });
}


function prepararAsistenteIA() {
  const ventana = document.getElementById('ventanaChatIA');
  const btnFlotante = document.getElementById('btnFlotanteIA');
  const btnNav = document.getElementById('btnAbrirChat');
  const btnCerrar = document.getElementById('btnCerrarChat');
  const input = document.getElementById('inputChat');
  const btnEnviar = document.getElementById('btnEnviarMensaje');
  const historial = document.getElementById('historialMensajes');

  if (!ventana || !btnFlotante) return;

  const alternarChat = () => ventana.classList.toggle('abierta');
  btnFlotante.addEventListener('click', alternarChat);
  if (btnNav) btnNav.addEventListener('click', () => ventana.classList.add('abierta'));
  if (btnCerrar) btnCerrar.addEventListener('click', () => ventana.classList.remove('abierta'));

  const enviarMensaje = () => {
    const texto = input.value.trim();
    if (!texto) return;

    // Agregar mensaje del usuario
    agregarGlobo(texto, 'mensaje-usuario');
    input.value = '';

    // Respuesta inteligente contextual según el negocio (Gracias Github)
    setTimeout(() => {
      const respuesta = generarRespuestaIA(texto);
      agregarGlobo(respuesta, 'mensaje-bot');
    }, 600);
  };

  btnEnviar.addEventListener('click', enviarMensaje);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
  });

  // Conectar botones de preguntas rápidas
  const chips = document.querySelectorAll('.chip-pregunta');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const consulta = chip.getAttribute('data-consulta');
      input.value = consulta;
      enviarMensaje();
    });
  });

  function agregarGlobo(html, clase) {
    const globo = document.createElement('div');
    globo.className = `globo-mensaje ${clase}`;
    globo.innerHTML = html;
    historial.appendChild(globo);
    historial.scrollTop = historial.scrollHeight;
  }

  function generarRespuestaIA(pregunta) {
    const p = pregunta.toLowerCase();
    if (p.includes('precio') || p.includes('cotizar') || p.includes('costo') || p.includes('cuanto')) {
      return `<strong>Tarifas estimadas de escaneo 3DGS en Ecuador:</strong><br>
      • Paquete Airbnb/Interior (< 100m²): $250 - $400 USD.<br>
      • Paquete Hostería/Glamping (Dron + Terrestre, hasta 500m²): $650 - $950 USD.<br>
      • Desarrollos grandes (> 1000m²): Cotización a medida.<br>
      <em>¿De cuántos metros cuadrados es tu propiedad?</em>`;
    }
    if (p.includes('galapagos') || p.includes('mindo') || p.includes('andes') || p.includes('cotopaxi')) {
      return `Tenemos proyectos y demos activas en esa zona usando cámaras de alta resolución y drones DJI con más de 1.4 millones de Gaussian Splats. Revisa nuestro catálogo para verlas.`;
    }
    if (p.includes('copy') || p.includes('publicidad') || p.includes('anuncio') || p.includes('cabaña')) {
      return `<strong>Sugerencia de Copy para Airbnb / Instagram:</strong><br>
      <em>"¿Listo para despertar sobre las nubes? Explora nuestra Cabaña en Los Andes en 3D antes de tu llegada. Camina por la terraza y siente la inmersión de los volcanes con tecnología Gaussian Splatting."</em><br>
      ¿Te gustaría adaptarlo con fechas o servicios especiales?`;
    }
    if (p.includes('hola') || p.includes('buenas')) {
      return `¡Hola! Con gusto te asesoro. Puedo darte presupuestos para digitalizar tu hostería o sugerirte textos para tus anuncios de Airbnb con tours 3D.`;
    }
    return `Entendido. Para ese requerimiento de <strong>${pregunta}</strong> podemos coordinar una visita técnica y calcular la densidad de splats óptima para que cargue fluido en teléfonos móviles. ¿Te gustaría dejar tus datos en el formulario?`;
  }
}


// Manejo del comparador interactivo (Antes despues mayor enfoque en el fotorealismo del splat)
function prepararComparadorVisual() {
  const deslizador = document.getElementById('deslizadorComparador');
  const capaDespues = document.getElementById('capaDespues');
  const linea = document.getElementById('lineaDeslizador');

  if (!deslizador || !capaDespues || !linea) return;

  deslizador.addEventListener('input', (e) => {
    const valor = e.target.value;
    capaDespues.style.width = `${valor}%`;
    linea.style.left = `${valor}%`;
  });
}


// Manejo del menú desplegable en celulares
function prepararMenuMovil() {
  const btnHamburguesa = document.getElementById('btnHamburguesa');
  const menuEnlaces = document.getElementById('menuEnlaces');
  if (!btnHamburguesa || !menuEnlaces) return;

  btnHamburguesa.addEventListener('click', () => {
    btnHamburguesa.classList.toggle('activo');
    menuEnlaces.classList.toggle('abierto');
  });

  // Cerrar menú al hacer clic en cualquier enlace
  menuEnlaces.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => {
      btnHamburguesa.classList.remove('activo');
      menuEnlaces.classList.remove('abierto');
    });
  });
}


// Calculadora automática de cotización según área y tipo de propiedad
function prepararCalculadoraCotizacion() {
  const selectTipo = document.getElementById('campoTipo');
  const inputArea = document.getElementById('campoArea');
  const montoEstimado = document.getElementById('montoEstimado');
  const detalleEstimacion = document.getElementById('detalleEstimacion');

  if (!selectTipo || !inputArea || !montoEstimado || !detalleEstimacion) return;

  function recalcular() {
    const tipo = selectTipo.value;
    const area = parseFloat(inputArea.value) || 0;

    let tarifaBase = 250;
    let costoPorMetro = 1.2;
    let metodo = 'Escaneo terrestre 4K y visor web interactivo.';

    if (tipo === 'hosteria') {
      tarifaBase = 550;
      costoPorMetro = 1.0;
      metodo = 'Dron fotogramétrico exterior + escaneo terrestre de áreas comunes.';
    } else if (tipo === 'glamping') {
      tarifaBase = 320;
      costoPorMetro = 1.1;
      metodo = 'Captura 360° de domo/cabaña y sendero de acceso.';
    } else if (tipo === 'inmobiliaria') {
      tarifaBase = 800;
      costoPorMetro = 0.9;
      metodo = 'Gemelo digital aéreo de alta escala para ventas de planos y terrenos.';
    }

    let estimacion = tarifaBase;
    if (area > 0) {
      estimacion = Math.round(tarifaBase + (area * costoPorMetro));
      montoEstimado.textContent = `$${estimacion} USD (aprox)`;
    } else {
      montoEstimado.textContent = `$${tarifaBase} - $${tarifaBase + 200} USD`;
    }

    detalleEstimacion.textContent = `${metodo} Estimación para ${area > 0 ? area + ' m²' : 'área base'}.`;
  }

  selectTipo.addEventListener('change', recalcular);
  inputArea.addEventListener('input', recalcular);
}
