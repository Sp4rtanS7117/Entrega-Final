# Installation 0°  Spatial Real Estate & Hospitality Marketing Digital 3D



Plataforma de marketing inmersivo y digitalización volumétrica de propiedades turísticas, cabañas de lujo y hosterías en Ecuador (Andes, Amazonía y Costa) utilizando **3D Gaussian Splatting (3DGS)** y fotogrametría aérea con dron.



Basado en las rubricas de evaluación el proyecto cumple con los siguientes módulos funcionales:

1. **Página de Inicio con Marca Propia (`index.html`):**
   * Estética *Tactical Luxury / Dark Spatial* Basado en entornos Sci Fi y Futurista.
   * Visor Hero con interfaz HUD táctica, coordenadas geográficas en Ecuador y controles orbitales interactivos para computadora y celular.
   * Botones de vista de cámara (*Vista Dron Exterior*, *Interior Cabaña*, *Terraza y Paisaje*).
   * Barra de estado de descarga de archivos volumétricos.

2. **Catálogo de Productos y Servicios (`assets/data/properties.json` & `js/main.js`):**
   * Consumo dinámico de datos mediante `fetch()` en formato JSON (sin datos quemados en el HTML). (Hardcoded Data es un tipo de scripting que no permite edición posterior del contenido en la plataforma, sino solo desde el motor de desarrollo).
   * Filtros por categoría (*Todos*, *Hosterías & Haciendas*, *Airbnb & Glamping*).
   * Ficha técnica por locación: conteo de Gaussian Splats, área en m², método de captura y capacidad de huéspedes.
   * Ventana modal de exploración volumétrica 3D.

3. **Formulario de Contacto Real:**
   * Agendamiento de levantamientos técnicos con dron y láser terrestre.
   * Validación de campos obligatorios y respuesta visual con estados de carga y confirmación de recepción.

4. **Panel de Administrador con Login (`admin.html`):**
   * Pantalla de acceso restringido para operadores.
   * Métricas de telemetría (locaciones activas, leads recibidos y conteo total de splats).
   * Formulario para registrar nuevas locaciones 3DGS y tabla con eliminación dinámica de registros.

5. **Inteligencia Artificial Personalizada (0°-AI):**
   * Widget flotante de asistencia comercial con contexto del negocio.
   * Responde sobre tarifas estimadas por metro cuadrado en Ecuador y genera sugerencias comerciales para anuncios de hospedaje.

---

##  Organización de Carpetas y Código Limpio  (Grafica hecha con gemini)

```text
├── index.html                  # Página principal (Hero 3D, Catálogo, Formulario e IA)
├── admin.html                  # Panel privado de administración y bandeja de leads
├── README.md                   # Documentación técnica del proyecto y rúbricas
├── .gitignore                  # Exclusión de archivos binarios pesados (>100MB)
├── css/
│   └── styles.css              # Sistema de diseño responsive y temas oscuros
├── js/
│   ├── db.js                   # Capa Backend / Persistencia (Supabase PostgreSQL y Auth)
│   ├── nativeViewport.js       # Renderizador WebGL nativo de 3D Gaussian Splats (PlayCanvas)
│   ├── splatViewer.js          # Visor de respaldo interactivo y HUD
│   └── main.js                 # Lógica del catálogo, filtros, modal, formulario e IA
└── assets/
    ├── data/
    │   └── properties.json     # Catálogo dinámico de propiedades y locaciones
    ├── images/                 # Fotografías y recursos gráficos
    └── models/                 # Modelos 3DGS (.compressed.ply) y licencia CC-BY 4.0
```

---

##  Especificaciones de Gaussian Splatting (3DGS)

* **Formato optimizado:** Se recomienda exportar escenas en formato `.compressed.ply` utilizando [SuperSplat](https://superspl.at) para reducir el peso por debajo de 25 MB.
* **Compatibilidad:** Renderizado WebGL 2.0 / WebGPU con controles táctiles móviles y soporte para los motores PlayCanvas y Three.js (`@mkkellogg/gaussian-splats-3d`).

---

##  Publicación en GitHub Pages

1. Sube los cambios a la rama principal de tu repositorio en GitHub (`main`).
2. En GitHub, dirígete a **Settings** > **Pages**.
3. En la sección **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save** y en un par de minutos tu proyecto estará publicado con URL accesible en internet.

Esta es la documentacion para que cualquier dev pueda entender.