import type { ContentTable, ListingKind } from '#shared/types/content'
import { BOQUETE_ZONES } from '#shared/utils/constants'

// The admin panel is a generic CRUD driven by these declarations: adding a
// field to a section is a config change, not an interface change.
export type FieldType =
  | 'text' | 'number' | 'select' | 'image'
  | 'bilingual' | 'bilingual-area' | 'bilingual-list'
  // Yes/No select stored as a real boolean.
  | 'boolean'
  // Map picker that writes both `lat` and `lng` (the field's key is ignored).
  | 'location'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  hint?: string
  options?: [string, string][]
  placeholder?: string
  // Sections split by kind (listings): only shown for these kinds. The same
  // key may appear once per kind with a different label or options.
  kinds?: ListingKind[]
  // Visual heading the field sits under; consecutive fields share it.
  group?: string
  // Blocks saving while empty.
  required?: boolean
}

export interface SectionConfig {
  table: ContentTable
  title: string
  nameField: string
  // Rows carry a `kind` that is chosen first and drives which fields show.
  byKind?: boolean
}

export const SECTIONS: Record<string, SectionConfig> = {
  places: { table: 'places', title: 'Lugares', nameField: 'name' },
  events: { table: 'events', title: 'Eventos', nameField: 'name' },
  posts: { table: 'posts', title: 'Blog', nameField: 'title' },
  rentals: { table: 'rentals', title: 'Alquileres', nameField: 'name' },
  listings: { table: 'listings', title: 'Propiedades', nameField: 'name', byKind: true },
  gallery: { table: 'gallery', title: 'Galería', nameField: 'label' },
}

const PLACEHOLDERS: Record<string, string> = {
  'id': 'ej: mi-nuevo-lugar',
  'img': 'Se completa automáticamente al subir una imagen',
  'author': 'Nombre del autor',
  'd': 'ej: 10',
  'price': 'ej: 120',
  'deposit': 'ej: 650',
  'utilitiesMin': 'ej: 60',
  'utilitiesMax': 'ej: 90',
  'wifiMbps': 'ej: 120',
  'guests': 'ej: 6',
  'beds': 'ej: 3',
  'baths': 'ej: 2',
  'parking': 'ej: 1',
  'sqmBuilt': 'ej: 140',
  'sqmLot': 'ej: 800',
  'minMonths': 'ej: 3',
  'availableFrom': 'ej: 2026-08-15',
  'rating': 'ej: 4.9',
  'reviews': 'ej: 128',
  'amen': 'wifi, kitchen, view, parking',
  'host.name': 'ej: Roberto Achú',
  'host.phone': 'ej: +507 6234-5678',
  'host.email': 'ej: roberto@livingboquete.com',
  'lat': 'ej: 8.7835',
  'lng': 'ej: -82.4389',
  'video': 'ej: https://youtu.be/dQw4w9WgXcQ',
}

export function placeholderFor(key: string) {
  return PLACEHOLDERS[key] ?? ''
}

export const SCHEMAS: Record<string, FieldDef[]> = {
  places: [
    { key: 'id', label: 'ID (slug)', type: 'text', hint: 'Ej: volcan-baru' },
    { key: 'name', label: 'Nombre', type: 'bilingual' },
    { key: 'cat', label: 'Categoría', type: 'bilingual', hint: 'Ej: Senderismo / Hiking' },
    { key: 'short', label: 'Descripción corta', type: 'bilingual-area' },
    { key: 'long', label: 'Descripción larga', type: 'bilingual-area' },
    { key: 'hours', label: 'Horario', type: 'bilingual' },
    { key: 'cost', label: 'Costo', type: 'bilingual' },
    { key: 'tips', label: 'Tips (uno por línea)', type: 'bilingual-list' },
    { key: 'img', label: 'Imagen', type: 'image' },
  ],
  events: [
    { key: 'id', label: 'ID (slug)', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'bilingual' },
    { key: 'd', label: 'Día (número)', type: 'text', hint: 'Ej: 10' },
    { key: 'm', label: 'Mes abreviado', type: 'bilingual', hint: 'Ej: ENE / JAN' },
    { key: 'range', label: 'Rango de fechas', type: 'bilingual' },
    { key: 'cat', label: 'Categoría', type: 'bilingual' },
    { key: 'time', label: 'Horario', type: 'bilingual' },
    { key: 'place', label: 'Lugar', type: 'bilingual' },
    { key: 'desc', label: 'Descripción', type: 'bilingual-area' },
    { key: 'img', label: 'Imagen', type: 'image' },
  ],
  posts: [
    { key: 'id', label: 'ID (slug)', type: 'text' },
    { key: 'title', label: 'Título', type: 'bilingual' },
    { key: 'author', label: 'Autor', type: 'text' },
    { key: 'date', label: 'Fecha', type: 'bilingual', hint: 'Ej: 12 Jun 2026 / Jun 12, 2026' },
    { key: 'cat', label: 'Categoría', type: 'bilingual' },
    { key: 'excerpt', label: 'Extracto', type: 'bilingual-area' },
    { key: 'body', label: 'Cuerpo (un párrafo por línea)', type: 'bilingual-list' },
    { key: 'img', label: 'Imagen', type: 'image' },
  ],
  rentals: [
    { key: 'id', label: 'ID (slug)', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'bilingual' },
    { key: 'type', label: 'Tipo', type: 'select', options: [['casa', 'Casa'], ['habitacion', 'Habitación'], ['apto', 'Apartamento']] },
    { key: 'price', label: 'Precio mensual ($)', type: 'number' },
    { key: 'deposit', label: 'Depósito reembolsable ($)', type: 'number', hint: '0 o vacío = no se muestra desglose de costos en la ficha' },
    { key: 'utilitiesMin', label: 'Servicios estimados — mínimo ($/mes)', type: 'number', hint: '0 o vacío = no se muestra' },
    { key: 'utilitiesMax', label: 'Servicios estimados — máximo ($/mes)', type: 'number', hint: '0 o vacío = no se muestra' },
    { key: 'guests', label: 'Personas', type: 'number' },
    { key: 'beds', label: 'Camas', type: 'number' },
    { key: 'baths', label: 'Baños', type: 'number' },
    { key: 'parking', label: 'Parqueos', type: 'number' },
    { key: 'sqmBuilt', label: 'M² de construcción', type: 'number' },
    { key: 'sqmLot', label: 'M² de terreno', type: 'number', hint: '0 si no aplica (apartamento, habitación)' },
    { key: 'minMonths', label: 'Estadía mínima (meses)', type: 'number' },
    { key: 'verified', label: 'Propiedad verificada', type: 'select', options: [['true', 'Sí, verificada'], ['false', 'No verificada']] },
    { key: 'verifiedDate', label: 'Fecha de verificación', type: 'text', hint: 'Formato AAAA-MM-DD. Vacío = se muestra "verificada" sin fecha' },
    { key: 'featured', label: 'Destacado (portada de /alquiler)', type: 'select', options: [['false', 'No'], ['true', 'Sí, destacado']] },
    { key: 'availableFrom', label: 'Disponible desde', type: 'text', hint: 'Formato AAAA-MM-DD. Vacío = disponible ahora' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'reviews', label: 'Num. reseñas', type: 'number' },
    { key: 'loc', label: 'Ubicación', type: 'bilingual' },
    { key: 'short', label: 'Descripción corta', type: 'bilingual-area' },
    { key: 'desc', label: 'Descripción larga', type: 'bilingual-area' },
    { key: 'amen', label: 'Amenidades (separadas por coma)', type: 'text', hint: 'wifi, kitchen, view, parking, pool, fireplace, furnished, pets' },
    { key: 'wifiMbps', label: 'Velocidad de internet medida (Mbps)', type: 'number', hint: 'Medida en la visita con un test de velocidad. 0 o vacío = no se muestra' },
    { key: 'workspace', label: 'Espacio de trabajo real', type: 'select', options: [['false', 'No'], ['true', 'Sí — escritorio y silla adecuados']] },
    { key: 'host.name', label: 'Nombre del anfitrión', type: 'text' },
    { key: 'host.phone', label: 'Celular del anfitrión', type: 'text' },
    { key: 'host.email', label: 'Correo del anfitrión', type: 'text' },
    { key: 'host.line', label: 'Descripción del anfitrión', type: 'bilingual', hint: 'Ej: Propietario local / Local owner' },
    { key: 'lat', label: 'Latitud', type: 'number' },
    { key: 'lng', label: 'Longitud', type: 'number' },
    { key: 'img', label: 'Imagen', type: 'image' },
    { key: 'video', label: 'Video de YouTube', type: 'text', hint: 'Pega el link del video del canal Mika Houses (o solo el ID del video). Vacío = no se muestra.' },
  ],
  listings: [
    // --- Básico
    { key: 'id', label: 'ID (slug)', type: 'text', group: 'Básico', required: true, hint: 'Solo minúsculas y guiones, ej: venta-casa-jaramillo. No se puede cambiar después.' },
    { key: 'name', label: 'Nombre', type: 'bilingual', group: 'Básico', required: true },
    { key: 'type', label: 'Tipo de alquiler', type: 'select', group: 'Básico', kinds: ['rent'], options: [['casa', 'Casa'], ['apto', 'Apartamento'], ['habitacion', 'Habitación']] },
    { key: 'type', label: 'Tipo de inmueble', type: 'select', group: 'Básico', kinds: ['sale'], options: [['casa', 'Casa'], ['apto', 'Apartamento']] },
    { key: 'short', label: 'Descripción corta', type: 'bilingual-area', group: 'Básico', hint: 'Aparece en la tarjeta del mapa. 1–2 oraciones.' },
    { key: 'desc', label: 'Descripción larga', type: 'bilingual-area', group: 'Básico' },

    // --- Ubicación
    { key: 'zone', label: 'Zona', type: 'select', group: 'Ubicación', required: true, options: BOQUETE_ZONES.map(z => [z.id, z.name] as [string, string]) },
    { key: 'loc', label: 'Ubicación visible', type: 'bilingual', group: 'Ubicación', hint: 'Texto que ve el público, ej: Volcancito, Boquete' },
    { key: 'lat', label: 'Punto en el mapa', type: 'location', group: 'Ubicación', required: true, hint: 'Haz clic en el mapa o arrastra el pin. También puedes pegar coordenadas de Google Maps (clic derecho → copiar).' },
    { key: 'approxLocation', label: 'Mostrar ubicación aproximada', type: 'boolean', group: 'Ubicación', hint: 'Sí = el mapa público muestra un área de ~300 m en lugar del punto exacto.' },

    // --- Precio
    { key: 'price', label: 'Precio mensual (US$)', type: 'number', group: 'Precio', kinds: ['rent'], required: true },
    { key: 'price', label: 'Precio de venta (US$)', type: 'number', group: 'Precio', kinds: ['sale'], required: true },
    { key: 'price', label: 'Precio total (US$)', type: 'number', group: 'Precio', kinds: ['land'], required: true, hint: 'El precio por m² se calcula automáticamente.' },
    { key: 'deposit', label: 'Depósito reembolsable (US$)', type: 'number', group: 'Precio', kinds: ['rent'], hint: '0 o vacío = no se muestra' },
    { key: 'utilitiesMin', label: 'Servicios estimados — mínimo (US$/mes)', type: 'number', group: 'Precio', kinds: ['rent'], hint: '0 o vacío = no se muestra' },
    { key: 'utilitiesMax', label: 'Servicios estimados — máximo (US$/mes)', type: 'number', group: 'Precio', kinds: ['rent'], hint: '0 o vacío = no se muestra' },
    { key: 'hoaFee', label: 'Cuota de mantenimiento (US$/mes)', type: 'number', group: 'Precio', kinds: ['sale'], hint: 'Comunidades cerradas o apartamentos. 0 o vacío = no aplica' },

    // --- Características
    { key: 'sqmLot', label: 'Superficie del terreno (m²)', type: 'number', group: 'Características', kinds: ['land'], required: true, hint: '1 hectárea = 10.000 m²' },
    { key: 'sqmBuilt', label: 'M² de construcción', type: 'number', group: 'Características', kinds: ['rent', 'sale'] },
    { key: 'sqmLot', label: 'M² de terreno', type: 'number', group: 'Características', kinds: ['rent', 'sale'], hint: '0 si no aplica (apartamento, habitación)' },
    { key: 'beds', label: 'Recámaras', type: 'number', group: 'Características', kinds: ['rent', 'sale'] },
    { key: 'baths', label: 'Baños', type: 'number', group: 'Características', kinds: ['rent', 'sale'] },
    { key: 'parking', label: 'Estacionamientos', type: 'number', group: 'Características', kinds: ['rent', 'sale'] },
    { key: 'guests', label: 'Personas máximo', type: 'number', group: 'Características', kinds: ['rent'] },
    { key: 'yearBuilt', label: 'Año de construcción', type: 'number', group: 'Características', kinds: ['sale'] },
    { key: 'furnished', label: 'Se vende amueblada', type: 'boolean', group: 'Características', kinds: ['sale'] },
    { key: 'topography', label: 'Topografía', type: 'select', group: 'Características', kinds: ['land'], options: [['plano', 'Plano'], ['inclinado', 'Inclinado'], ['mixto', 'Mixto']] },
    { key: 'water', label: 'Agua disponible', type: 'boolean', group: 'Características', kinds: ['land'] },
    { key: 'power', label: 'Luz eléctrica disponible', type: 'boolean', group: 'Características', kinds: ['land'] },
    { key: 'road', label: 'Acceso', type: 'select', group: 'Características', kinds: ['land'], options: [['asfalto', 'Calle asfaltada'], ['tierra', 'Camino de tierra'], ['ninguno', 'Sin acceso vehicular']] },
    { key: 'amen', label: 'Amenidades (separadas por coma)', type: 'text', group: 'Características', kinds: ['rent'], hint: 'wifi, kitchen, view, parking, pool, fireplace, furnished, pets' },
    { key: 'amen', label: 'Amenidades (separadas por coma)', type: 'text', group: 'Características', kinds: ['sale'], hint: 'view, garden, river, fireplace, parking, pool, security, furnished' },
    { key: 'amen', label: 'Atributos (separados por coma)', type: 'text', group: 'Características', kinds: ['land'], hint: 'view, river, spring, coffee' },
    { key: 'wifiMbps', label: 'Velocidad de internet medida (Mbps)', type: 'number', group: 'Características', kinds: ['rent'], hint: '0 o vacío = no se muestra' },
    { key: 'workspace', label: 'Espacio de trabajo real', type: 'boolean', group: 'Características', kinds: ['rent'] },

    // --- Disponibilidad (rent)
    { key: 'minMonths', label: 'Estadía mínima (meses)', type: 'number', group: 'Disponibilidad', kinds: ['rent'] },
    { key: 'availableFrom', label: 'Disponible desde', type: 'text', group: 'Disponibilidad', kinds: ['rent'], hint: 'Formato AAAA-MM-DD. Vacío = disponible ahora' },

    // --- Legal (sale, land)
    { key: 'title', label: 'Tipo de título', type: 'select', group: 'Legal', kinds: ['sale', 'land'], required: true, options: [['titulo', 'Título de propiedad'], ['derechos', 'Derechos posesorios']], hint: 'Derechos posesorios: más barato pero más riesgoso; se muestra un aviso al comprador.' },

    // --- Contacto
    { key: 'contact.name', label: 'Nombre de contacto', type: 'text', group: 'Contacto' },
    { key: 'contact.line', label: 'Descripción del contacto', type: 'bilingual', group: 'Contacto', hint: 'Ej: Propietario / Owner' },
    { key: 'contact.phone', label: 'Celular / WhatsApp', type: 'text', group: 'Contacto' },
    { key: 'contact.email', label: 'Correo', type: 'text', group: 'Contacto' },

    // --- Publicación
    { key: 'img', label: 'Foto principal', type: 'image', group: 'Publicación' },
    { key: 'video', label: 'Video de YouTube', type: 'text', group: 'Publicación', hint: 'Vacío = no se muestra' },
    { key: 'verified', label: 'Propiedad verificada', type: 'boolean', group: 'Publicación' },
    { key: 'verifiedDate', label: 'Fecha de verificación', type: 'text', group: 'Publicación', hint: 'Formato AAAA-MM-DD' },
    { key: 'featured', label: 'Destacada', type: 'boolean', group: 'Publicación' },
    { key: 'rating', label: 'Rating', type: 'number', group: 'Publicación', kinds: ['rent'], hint: '1.0 a 5.0. 0 = sin reseñas' },
    { key: 'reviews', label: 'Num. reseñas', type: 'number', group: 'Publicación', kinds: ['rent'] },
  ],
  gallery: [
    { key: 'id', label: 'ID (slug)', type: 'text' },
    { key: 'label', label: 'Etiqueta', type: 'bilingual' },
    { key: 'cat', label: 'Categoría', type: 'select', options: [['naturaleza', 'Naturaleza'], ['cafe', 'Café'], ['cultura', 'Cultura'], ['aventura', 'Aventura']] },
    { key: 'img', label: 'Imagen', type: 'image' },
  ],
}

export const HELP_TEXTS: Record<string, { title: string; lines: string[] }> = {
  places: {
    title: 'Gestión de Lugares / Atractivos',
    lines: [
      'Estos lugares aparecen en la sección <strong>"Principales atractivos"</strong> de la página de inicio.',
      '<strong>ID</strong> — Identificador único tipo slug (ej: <code>volcan-baru</code>). No usar espacios ni caracteres especiales.',
      '<strong>Nombre y Categoría</strong> — Deben completarse en ambos idiomas (Español e Inglés).',
      '<strong>Descripción corta</strong> — Aparece en la tarjeta de la home. Máximo 2 líneas.',
      '<strong>Descripción larga</strong> — Se muestra al ver el detalle del lugar.',
      '<strong>Tips</strong> — Escribe un consejo por línea. Se muestran como lista con viñetas.',
      '<strong>Imagen</strong> — Sube un archivo desde tu computadora (se convierte automáticamente a formato WebP). Tamaño recomendado: 800×600px.',
    ],
  },
  events: {
    title: 'Gestión de Eventos',
    lines: [
      'Los eventos aparecen en la sección <strong>"Próximos eventos"</strong> de la página de inicio.',
      '<strong>Día</strong> — Solo el número del día (ej: <code>10</code>).',
      '<strong>Mes abreviado</strong> — En español y en inglés (ej: ES: <code>ENE</code>, EN: <code>JAN</code>).',
      '<strong>Rango de fechas</strong> — Formato completo (ej: ES: <code>10 – 21 Enero 2027</code>, EN: <code>Jan 10 – 21, 2027</code>).',
      '<strong>Horario</strong> — Rango de horas (ej: <code>9:00 – 22:00</code>).',
      '<strong>Lugar</strong> — Nombre del sitio donde se realiza, en ambos idiomas.',
    ],
  },
  posts: {
    title: 'Gestión del Blog',
    lines: [
      'Los artículos del blog aparecen en <strong>/blog</strong> y se muestran como preview en la página de inicio.',
      '<strong>Autor</strong> — Nombre completo del autor (ej: <code>Marta Quirós</code>).',
      '<strong>Fecha</strong> — En ambos formatos (ES: <code>12 Jun 2026</code>, EN: <code>Jun 12, 2026</code>).',
      '<strong>Extracto</strong> — Resumen corto que aparece en la tarjeta del blog. 1-2 oraciones.',
      '<strong>Cuerpo</strong> — Escribe un párrafo por línea. Cada línea será un párrafo separado en el artículo.',
      '<strong>Imagen</strong> — Foto principal del artículo. Sube un archivo desde tu computadora (se convierte automáticamente a formato WebP). Tamaño recomendado: 800×500px.',
    ],
  },
  rentals: {
    title: 'Gestión de Alquileres',
    lines: [
      'Las propiedades son alquileres mensuales para vivir en Boquete (no por noche). Aparecen en <strong>/alquiler</strong> y cada una tiene su página de detalle con mapa.',
      '<strong>Tipo</strong> — Selecciona entre Casa, Habitación o Apartamento.',
      '<strong>Precio</strong> — Precio mensual en dólares, solo el número (ej: <code>650</code>).',
      '<strong>Rating</strong> — Calificación de 1.0 a 5.0 (ej: <code>4.9</code>).',
      '<strong>Amenidades</strong> — Lista separada por comas. Valores válidos: <code>wifi</code>, <code>kitchen</code>, <code>view</code>, <code>parking</code>, <code>pool</code>, <code>fireplace</code>, <code>furnished</code>, <code>pets</code>.',
      '<strong>Internet y trabajo remoto</strong> — Si en la visita mediste la velocidad, anótala en Mbps: aparece como "Wifi 120 Mbps" en la tarjeta y la ficha. "Espacio de trabajo real" marca la propiedad como apta para trabajo remoto (escritorio y silla de verdad, no la mesa del comedor).',
      '<strong>Destacado</strong> — Marca "Sí" para que la propiedad aparezca en la portada de <code>/alquiler</code>. Si marcas varias, se muestran en un carrusel; si no marcas ninguna, se destaca automáticamente la más reseñada.',
      '<strong>Latitud / Longitud</strong> — Coordenadas para el mapa. Boquete está aprox. en <code>8.78</code>, <code>-82.43</code>. Puedes obtener coordenadas desde Google Maps (click derecho → copiar coordenadas).',
      '<strong>Imagen</strong> — Sube un archivo desde tu computadora (se convierte automáticamente a formato WebP). Tamaño recomendado: 800×560px.',
      '<strong>Video</strong> — Pega la URL del video de YouTube del canal Mika Houses (ej: <code>https://youtu.be/XXXXXXXXXXX</code>). Déjalo vacío si la propiedad aún no tiene video.',
    ],
  },
  listings: {
    title: 'Gestión de Propiedades',
    lines: [
      'Alquileres, casas en venta y terrenos en un solo catálogo. Cada propiedad aparece como pin en el mapa público, con un color según su tipo.',
      '<strong>Tipo</strong> — Se elige al crear (Alquiler, Casa en venta o Terreno) y define qué campos se piden. No se puede cambiar después: si te equivocaste, crea una nueva y elimina la anterior.',
      '<strong>Punto en el mapa</strong> — Haz clic en el mapa o arrastra el pin. Si el propietario prefiere no mostrar la ubicación exacta, activa <em>Mostrar ubicación aproximada</em>.',
      '<strong>Precio</strong> — Solo el número en dólares. Alquiler = por mes; venta y terreno = precio total.',
      '<strong>Tipo de título</strong> — Título de propiedad o derechos posesorios. Es lo primero que pregunta un comprador extranjero; con derechos posesorios se muestra un aviso.',
      '<strong>Campos obligatorios</strong> — Marcados con <code>*</code>. No se puede guardar sin ellos.',
      '<strong>Foto principal</strong> — Se convierte automáticamente a WebP. Sin foto se muestra una ilustración de la marca.',
    ],
  },
  gallery: {
    title: 'Gestión de la Galería',
    lines: [
      'Las fotos aparecen en la sección de <strong>galería</strong> de la página de inicio con filtro por categoría.',
      '<strong>Etiqueta</strong> — Texto descriptivo de la foto en ambos idiomas (ej: ES: <code>Volcán Barú al amanecer</code>).',
      '<strong>Categoría</strong> — Selecciona entre Naturaleza, Café, Cultura o Aventura. Determina el filtro.',
      '<strong>Imagen</strong> — Sube un archivo desde tu computadora (se convierte automáticamente a formato WebP). Tamaño recomendado: 600×600px (cuadrada).',
    ],
  },
}

export function getPath(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

export function setPath(obj: any, path: string, value: unknown) {
  const parts = path.split('.')
  let o = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!
    if (typeof o[p] !== 'object' || o[p] === null) o[p] = {}
    o = o[p]
  }
  o[parts[parts.length - 1]!] = value
}
