/* ==========================================================================
   [Viewport OpenSource] - MOTOR NATIVO PLAYCANVAS GSPLAT (FINE-TUNED) version 12424234 :/ 
   ========================================================================== */

class NativeSplatViewport {
  constructor(opciones = {}) {
    this.contenedorId = opciones.contenedorId || 'contenedorLienzo3D';
    this.archivoModelo = opciones.archivoModelo || 'assets/models/scene.compressed.ply';
    this.barraProgresoId = opciones.barraProgresoId || 'barraProgreso';
    this.app = null;
    this.cameraEntity = null;
    this.splatEntity = null;
    this.iniciado = false;

    // Estado de cámara orbital con amortiguación
    this.orbita = {
      rotX: 10,
      rotY: 25,
      targetRotX: 10,
      targetRotY: 25,
      distancia: 2.8,
      targetDistancia: 2.8,
      targetCentro: [0, 0, 0],
      centroActual: [0, 0, 0],
      sensibilidad: 0.22,
      amortiguacion: 0.08
    };
  }

  async iniciar() {
    const contenedor = document.getElementById(this.contenedorId);
    const barra = document.getElementById(this.barraProgresoId);
    if (!contenedor) return;

    try {
      console.log('[Viewport OpenSource] Inicializando PlayCanvas con controles cinemáticos...');
      if (barra) barra.style.width = '15%';

      if (!window.pc) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/playcanvas@latest/build/playcanvas.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const pc = window.pc;
      if (!pc) throw new Error('No se pudo inicializar PlayCanvas.');

      // Reutilizar o crear canvas limpio
      const canvasExistente = document.getElementById('playcanvasLienzo');
      if (canvasExistente) canvasExistente.remove();

      const canvas = document.createElement('canvas');
      canvas.id = 'playcanvasLienzo';
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '1';
      contenedor.appendChild(canvas);

      this.app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
        graphicsDeviceOptions: { 
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance'
        }
      });

      this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
      this.app.start();

      window.addEventListener('resize', () => this.app.resizeCanvas());

      // Cámara cinemática
      this.cameraEntity = new pc.Entity('CamaraSplat');
      this.cameraEntity.addComponent('camera', {
        clearColor: new pc.Color(0.04, 0.05, 0.08, 1.0),
        fov: 50,
        nearClip: 0.05,
        farClip: 100
      });
      this.app.root.addChild(this.cameraEntity);

      // Activar loop de render con inercia continua
      this.iniciarLoopCinematico();
      this.agregarControlesCompletos(canvas);

      if (barra) barra.style.width = '45%';

      // Cargar archivo .compressed.ply
      const splatAsset = new pc.Asset('escena-3dgs', 'gsplat', {
        url: this.archivoModelo
      });

      this.app.assets.add(splatAsset);
      this.app.assets.load(splatAsset);

      splatAsset.ready(() => {
        this.splatEntity = new pc.Entity('ObjetoSplat');
        this.splatEntity.addComponent('gsplat', { asset: splatAsset });
        
        // Corrección de orientación para escaneos 3DGS (eje Y hacia arriba, invertir volteo)
        this.splatEntity.setLocalPosition(0, -0.3, 0);
        this.splatEntity.setLocalEulerAngles(180, 0, 0);
        this.app.root.addChild(this.splatEntity);

        if (barra) {
          barra.style.width = '100%';
          setTimeout(() => { barra.style.width = '0%'; }, 500);
        }
        this.iniciado = true;
        console.log('[Viewport OpenSource] ¡Escena calibrada y fluida a 60 FPS!');
      });

    } catch (err) {
      console.error('[Viewport OpenSource] Error de calibración:', err);
    }
  }

  iniciarLoopCinematico() {
    this.app.on('update', () => {
      if (!this.cameraEntity) return;

      const o = this.orbita;
      // Interpolación suave (Lerp) para movimiento fluido sin tirones
      o.rotX += (o.targetRotX - o.rotX) * o.amortiguacion;
      o.rotY += (o.targetRotY - o.rotY) * o.amortiguacion;
      o.distancia += (o.targetDistancia - o.distancia) * o.amortiguacion;
      
      o.centroActual[0] += (o.targetCentro[0] - o.centroActual[0]) * o.amortiguacion;
      o.centroActual[1] += (o.targetCentro[1] - o.centroActual[1]) * o.amortiguacion;
      o.centroActual[2] += (o.targetCentro[2] - o.centroActual[2]) * o.amortiguacion;

      const radX = (o.rotX * Math.PI) / 180;
      const radY = (o.rotY * Math.PI) / 180;

      const posX = o.centroActual[0] + o.distancia * Math.sin(radY) * Math.cos(radX);
      const posY = o.centroActual[1] + o.distancia * Math.sin(radX);
      const posZ = o.centroActual[2] + o.distancia * Math.cos(radY) * Math.cos(radX);

      this.cameraEntity.setPosition(posX, posY, posZ);
      this.cameraEntity.lookAt(o.centroActual[0], o.centroActual[1], o.centroActual[2]);
    });
  }

  agregarControlesCompletos(canvas) {
    let arrastrandoRotacion = false;
    let arrastrandoPan = false;
    let ultimoX = 0;
    let ultimoY = 0;

    // Desactivar menú contextual derecho para permitir Pan
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) arrastrandoRotacion = true; // Clic izquierdo: Rotar
      if (e.button === 2) arrastrandoPan = true;      // Clic derecho: Pan (Trasladar)
      ultimoX = e.clientX;
      ultimoY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      arrastrandoRotacion = false;
      arrastrandoPan = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!arrastrandoRotacion && !arrastrandoPan) return;
      const dx = e.clientX - ultimoX;
      const dy = e.clientY - ultimoY;

      if (arrastrandoRotacion) {
        this.orbita.targetRotY -= dx * this.orbita.sensibilidad;
        this.orbita.targetRotX = Math.max(-88, Math.min(88, this.orbita.targetRotX + dy * this.orbita.sensibilidad));
      } else if (arrastrandoPan) {
        // Mover el punto focal de la cámara en el plano local
        const factorPan = this.orbita.distancia * 0.0015;
        this.orbita.targetCentro[0] -= dx * factorPan;
        this.orbita.targetCentro[1] += dy * factorPan;
      }

      ultimoX = e.clientX;
      ultimoY = e.clientY;
    });

    // Zoom suave con rueda
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.003;
      this.orbita.targetDistancia = Math.max(0.4, Math.min(10, this.orbita.targetDistancia + delta * (this.orbita.distancia * 0.8)));
    }, { passive: false });

    // Controles táctiles móviles refinados (1 dedo rotar, 2 dedos pellizcar/zoom)
    let toqueDistanciaInicial = 0;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        ultimoX = e.touches[0].clientX;
        ultimoY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        toqueDistanciaInicial = Math.hypot(dx, dy);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - ultimoX;
        const dy = e.touches[0].clientY - ultimoY;
        this.orbita.targetRotY -= dx * this.orbita.sensibilidad;
        this.orbita.targetRotX = Math.max(-88, Math.min(88, this.orbita.targetRotX + dy * this.orbita.sensibilidad));
        ultimoX = e.touches[0].clientX;
        ultimoY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distActual = Math.hypot(dx, dy);
        const cambio = (toqueDistanciaInicial - distActual) * 0.01;
        this.orbita.targetDistancia = Math.max(0.4, Math.min(10, this.orbita.targetDistancia + cambio));
        toqueDistanciaInicial = distActual;
      }
    });
  }

  cargarZona(vista) {
    if (vista === 'dron') {
      this.orbita.targetRotX = 22;
      this.orbita.targetRotY = 40;
      this.orbita.targetDistancia = 3.8;
      this.orbita.targetCentro = [0, 0, 0];
    } else if (vista === 'interior') {
      this.orbita.targetRotX = 5;
      this.orbita.targetRotY = 0;
      this.orbita.targetDistancia = 1.2;
      this.orbita.targetCentro = [0, 0.1, 0];
    } else if (vista === 'terraza') {
      this.orbita.targetRotX = 12;
      this.orbita.targetRotY = -55;
      this.orbita.targetDistancia = 2.4;
      this.orbita.targetCentro = [-0.3, 0, 0];
    }
  }
}

window.NativeSplatViewport = NativeSplatViewport;

/* ==========================================================================
   FIN DE [Viewport OpenSource]
   ========================================================================== */
