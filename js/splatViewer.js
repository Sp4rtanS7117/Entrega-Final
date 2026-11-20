class SplatViewer {
  constructor(idCanvas, idBarraProgreso) {
    this.canvas = document.getElementById(idCanvas);
    this.barraProgreso = document.getElementById(idBarraProgreso);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.camara = {
      x: 0,
      y: 0,
      zoom: 1,
      objetivoX: 0,
      objetivoY: 0,
      arrastrando: false,
      ultimoX: 0,
      ultimoY: 0
    };

    this.puntos = [];
    this.animacionId = null;

    if (this.canvas) {
      this.iniciar();
    }
  }

  iniciar() {
    this.ajustarTamano();
    window.addEventListener('resize', () => this.ajustarTamano());
    this.escucharEventos();
    this.crearNubePuntos();
    this.simularCarga();
    this.animar();
  }

  ajustarTamano() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * Math.min(window.devicePixelRatio, 1.5);
    this.canvas.height = this.canvas.clientHeight * Math.min(window.devicePixelRatio, 1.5);
  }

  escucharEventos() {
    // Mouse
    this.canvas.addEventListener('mousedown', (e) => {
      this.camara.arrastrando = true;
      this.camara.ultimoX = e.clientX;
      this.camara.ultimoY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.camara.arrastrando = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.camara.arrastrando) return;
      const dx = e.clientX - this.camara.ultimoX;
      const dy = e.clientY - this.camara.ultimoY;

      this.camara.objetivoX += dx * 0.005;
      this.camara.objetivoY += dy * 0.005;

      this.camara.ultimoX = e.clientX;
      this.camara.ultimoY = e.clientY;
    });

    // Touch en móviles
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.camara.arrastrando = true;
        this.camara.ultimoX = e.touches[0].clientX;
        this.camara.ultimoY = e.touches[0].clientY;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.camara.arrastrando || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.camara.ultimoX;
      const dy = e.touches[0].clientY - this.camara.ultimoY;

      this.camara.objetivoX += dx * 0.005;
      this.camara.objetivoY += dy * 0.005;

      this.camara.ultimoX = e.touches[0].clientX;
      this.camara.ultimoY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', () => {
      this.camara.arrastrando = false;
    });
  }

  moverCamara(vista) {
    if (vista === 'dron') {
      this.camara.objetivoX = 0;
      this.camara.objetivoY = 0.2;
      this.camara.zoom = 1;
    } else if (vista === 'interior') {
      this.camara.objetivoX = 1.3;
      this.camara.objetivoY = -0.1;
      this.camara.zoom = 1.4;
    } else if (vista === 'terraza') {
      this.camara.objetivoX = -1.2;
      this.camara.objetivoY = 0.15;
      this.camara.zoom = 1.15;
    }
  }

  simularCarga() {
    let porcentaje = 0;
    const intervalo = setInterval(() => {
      porcentaje += 10;
      if (porcentaje >= 100) {
        porcentaje = 100;
        clearInterval(intervalo);
      }
      if (this.barraProgreso) {
        this.barraProgreso.style.width = `${porcentaje}%`;
      }
    }, 150);
  }

  crearNubePuntos() {
    this.puntos = [];
    const cantidad = 380;
    for (let i = 0; i < cantidad; i++) {
      this.puntos.push({
        x: (Math.random() - 0.5) * 850,
        y: (Math.random() - 0.5) * 450,
        z: Math.random() * 600 + 80,
        radio: Math.random() * 2 + 1,
        opacidad: Math.random() * 0.7 + 0.3,
        esCyan: Math.random() > 0.55
      });
    }
  }

  animar() {
    this.camara.x += (this.camara.objetivoX - this.camara.x) * 0.08;
    this.camara.y += (this.camara.objetivoY - this.camara.y) * 0.08;

    if (this.ctx) {
      const ancho = this.canvas.width;
      const alto = this.canvas.height;
      this.ctx.clearRect(0, 0, ancho, alto);

      const centroX = ancho / 2;
      const centroY = alto / 2;

      for (let p of this.puntos) {
        const cosX = Math.cos(this.camara.x);
        const sinX = Math.sin(this.camara.x);

        const rotX = p.x * cosX - p.z * sinX;
        const rotZ = p.x * sinX + p.z * cosX;
        const rotY = p.y + this.camara.y * 100;

        const profundidad = rotZ + 400;
        if (profundidad > 20) {
          const fov = 450 / profundidad;
          const pantallaX = centroX + rotX * fov * this.camara.zoom;
          const pantallaY = centroY + rotY * fov * this.camara.zoom;

          this.ctx.beginPath();
          this.ctx.arc(pantallaX, pantallaY, p.radio * fov, 0, Math.PI * 2);
          this.ctx.fillStyle = p.esCyan 
            ? `rgba(0, 229, 255, ${p.opacidad * 0.7})` 
            : `rgba(220, 235, 255, ${p.opacidad * 0.4})`;
          this.ctx.fill();
        }
      }
    }

    this.animacionId = requestAnimationFrame(() => this.animar());
  }
}

window.SplatViewer = SplatViewer;
