export type GlossaryCategory =
  | 'all'
  | 'phishing'
  | 'web'
  | 'mobile'
  | 'fraud';

export interface GlossaryEntry {
  id: string;
  term: string;
  category: Exclude<GlossaryCategory, 'all'>;
  categoryLabel: string;
  icon: string;
  tagline: string;
  definition: string;
  whyDangerous: string;
  badExample: string;
  goodExample: string;
  tips: string[];
}

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '📚' },
  { id: 'phishing', label: 'Phishing y Correos', icon: '🎣' },
  { id: 'web', label: 'Web y Descargas', icon: '🌐' },
  { id: 'mobile', label: 'Celular y SMS', icon: '📱' },
  { id: 'fraud', label: 'Fraudes y Pagos', icon: '💸' },
];

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'phishing',
    term: '¿Qué es el Phishing?',
    category: 'phishing',
    categoryLabel: 'Phishing',
    icon: '🎣',
    tagline: 'Suplantación de identidad por correo o mensajes',
    definition:
      'El phishing ("pesca" de datos) ocurre cuando un atacante se hace pasar por una empresa, banco, universidad o persona de confianza para engañarte y hacer que entregues tus contraseñas, códigos o datos bancarios.',
    whyDangerous:
      'Un solo clic en un enlace falso puede llevarte a una página idéntica a la de tu banco. Todo lo que escribas ahí llega directo al estafador.',
    badExample: 'Remitente: security@bank-alerts.co · "Tu cuenta será bloqueada en 2 horas"',
    goodExample: 'Remitente oficial: notificaciones@bancorealmio.com · Sin amenazas ni prisas',
    tips: [
      'Verifica lo que hay después del "@" en el correo, no solo el nombre visible.',
      'Desconfía de saludos genéricos como "Estimado cliente" combinados con urgencia.',
      'Nunca inicies sesión desde enlaces en correos inesperados: entra escribiendo tú la web oficial.',
    ],
  },
  {
    id: 'ingenieria-social',
    term: 'Ingeniería Social y Urgencia',
    category: 'phishing',
    categoryLabel: 'Manipulación',
    icon: '⏰',
    tagline: 'Miedo, premios falsos y presión de tiempo',
    definition:
      'Es la técnica psicológica de provocar una emoción fuerte (pánico, miedo a perder dinero, o emoción por un premio sorpresa) para que actúes rápido sin detenerte a revisar detalles.',
    whyDangerous:
      'Cuando sientes presión ("tienes solo 2 horas", "retiro de $1.200.000 en curso"), tu cerebro baja la guardia y comete errores que normalmente evitarías.',
    badExample: '"¡Ganaste $500.000! Tienes 30 minutos para reclamarlos aquí"',
    goodExample: 'Las empresas legítimas te dan canales oficiales y nunca te obligan a decidir bajo pánico.',
    tips: [
      'Si un mensaje te apura demasiado, detente 10 segundos: la prisa es la firma del estafador.',
      'Nadie regala premios por sorteos en los que nunca te inscribiste.',
    ],
  },
  {
    id: 'enlaces-acortados',
    term: 'Enlaces Acortados y Ocultos',
    category: 'phishing',
    categoryLabel: 'Enlaces',
    icon: '🔗',
    tagline: 'URLs disfrazadas que esconden su destino real',
    definition:
      'Son direcciones cortas (como bit.ly o tinyurl) o botones llamativos cuyo destino real no coincide con el sitio oficial de la marca que dicen representar.',
    whyDangerous:
      'Ocultan a qué página terminarás entrando: pueden redirigirte a un clon fraudulento o iniciar la descarga automática de un archivo malicioso.',
    badExample: 'Botón "Verificar cuenta" → http://bit.ly/x82k',
    goodExample: 'Enlace transparente → https://sucursal.bancooficial.com/ayuda',
    tips: [
      'Pasa el cursor encima (o mantén presionado en el celular) para previsualizar el enlace real.',
      'Los bancos y universidades serias no usan acortadores públicos para trámites de seguridad.',
    ],
  },
  {
    id: 'typosquatting',
    term: 'Typosquatting (Dominios Imitadores)',
    category: 'web',
    categoryLabel: 'Web',
    icon: '🔍',
    tagline: 'Letras cambiadas que parecen iguales a simple vista',
    definition:
      'Consiste en registrar direcciones web casi idénticas a las reales cambiando una letra o usando caracteres similares, como reemplazar una "i" por una "l" o una "o" por un "0".',
    whyDangerous:
      'A primera vista tu mente lee la palabra correcta, pero en realidad estás en un servidor controlado por atacantes.',
    badExample: 'http://banco-andlno.co/ingreso (usa una "L" minúscula en vez de "i")',
    goodExample: 'https://www.bancoandino.com.co',
    tips: [
      'Lee la barra de direcciones letra por letra antes de escribir cualquier clave.',
      'Guarda tus sitios bancarios y académicos en Favoritos para no depender de buscadores o links.',
    ],
  },
  {
    id: 'https-mito',
    term: 'El Mito del Candado HTTPS',
    category: 'web',
    categoryLabel: 'Web',
    icon: '🔒',
    tagline: 'Cifrado no significa que el sitio sea honesto',
    definition:
      'El candado (HTTPS) indica que la comunicación entre tu navegador y el servidor viaja cifrada, pero cualquier estafador puede obtener un certificado HTTPS gratuito para su página falsa.',
    whyDangerous:
      'Mucha gente confía ciegamente porque ve el candado verde o gris, sin revisar si el dominio es legítimo.',
    badExample: '🔒 https://convertir-videos-gratis-ya.xyz (tiene candado, pero el dominio es sospechoso)',
    goodExample: '🔒 https://www.ucc.edu.co (candado + dominio oficial verificado)',
    tips: [
      'El candado verifica cómo viajan los datos, NO quién es el dueño del sitio.',
      'Fíjate siempre en el dominio principal antes de la primera barra "/".',
    ],
  },
  {
    id: 'malware-doble-extension',
    term: 'Malware y Doble Extensión',
    category: 'web',
    categoryLabel: 'Malware',
    icon: '🦠',
    tagline: 'Programas dañinos disfrazados de documentos',
    definition:
      'El malware es software malicioso (virus, troyanos, spyware, ransomware) diseñado para espiar, dañar o secuestrar tu equipo. Muchas veces se disfraza con doble extensión o botones falsos de descarga.',
    whyDangerous:
      'Si abres un archivo como "calendario.pdf.exe" o instalas una app desde un botón falso, ejecutas un programa que puede robar contraseñas guardadas o cifrar tus archivos.',
    badExample: '📎 calendario_2026.pdf.exe  |  Botón gigante "⬇ DESCARGAR AHORA (100% sin virus)"',
    goodExample: '📎 calendario_2026.pdf (desde portal institucional oficial)',
    tips: [
      'Mira siempre los últimos caracteres después del último punto (.exe, .bat, .scr, .apk son ejecutables).',
      'Desconfía de páginas llenas de anuncios con múltiples botones verdes de "Download".',
    ],
  },
  {
    id: 'smishing-sim-swapping',
    term: 'Smishing y SIM Swapping',
    category: 'mobile',
    categoryLabel: 'Celular y SMS',
    icon: '📱',
    tagline: 'Phishing por SMS y robo de tu línea telefónica',
    definition:
      'El Smishing es phishing enviado por mensajes de texto (SMS). El SIM Swapping ocurre cuando un atacante convence a tu operador o usa tus códigos SMS para transferir tu número a su propia tarjeta SIM.',
    whyDangerous:
      'Si toman control de tu número celular, recibirán todos tus códigos de recuperación bancaria, WhatsApp y correo electrónico.',
    badExample: 'SMS de +57 300 000 0000: "Responde con el código de 6 dígitos o perderás tu línea"',
    goodExample: 'Los códigos OTP son privados; jamás se reenvían ni se dictan a terceros.',
    tips: [
      'Si pierdes la señal móvil de repente sin explicación y recibes correos de cambio de clave, actúa rápido y contacta a tu operador y banco.',
      'Nunca respondas ni compartas códigos de verificación por SMS o WhatsApp.',
    ],
  },
  {
    id: 'permisos-abusivos',
    term: 'Apps Falsas y Permisos Abusivos',
    category: 'mobile',
    categoryLabel: 'Celular y Apps',
    icon: '🔐',
    tagline: 'Apps fuera de tienda oficial o que piden más de la cuenta',
    definition:
      'Aplicaciones clonadas (como "WhatsApp Plus Gold") descargadas en archivos .apk externos, o apps y extensiones simples que solicitan acceso a tus SMS, contactos o toda tu navegación.',
    whyDangerous:
      'Pueden leer tus mensajes bancarios, robar tu agenda de contactos o capturar todo lo que escribes en el navegador.',
    badExample: 'App "Linterna Pro" pidiendo acceso a Contactos y Lectura de SMS.',
    goodExample: 'App oficial de tienda verificada pidiendo únicamente acceso al flash/cámara.',
    tips: [
      'Descarga aplicaciones únicamente desde Google Play Store o Apple App Store.',
      'Pregúntate: ¿para qué necesita una linterna leer mis SMS? Si no tiene sentido, niégale el permiso o desinstálala.',
    ],
  },
  {
    id: 'qrishing-fraudes',
    term: 'QRishing, Vishing y Comprobantes Falsos',
    category: 'fraud',
    categoryLabel: 'Fraudes Financieros',
    icon: '💸',
    tagline: 'QR alterados, falsos asesores y pagos inventados',
    definition:
      'Engaños enfocados en robarte dinero directamente: pegar un sticker QR falso encima del de un comercio (QRishing), llamarte fingiendo ser del banco (Vishing), o enviarte capturas editadas de transferencias que nunca existieron.',
    whyDangerous:
      'Una vez envías dinero desde tu billetera digital o dictas un código OTP a un falso asesor, la transacción es casi imposible de revertir.',
    badExample: 'QR con borde pegado encima · "Te envié $200.000 por error, mira la captura, devuélvemelos"',
    goodExample: 'Validar que el receptor coincida con el comercio y revisar el saldo REAL dentro de tu app.',
    tips: [
      'Al escanear un QR para pagar, verifica el nombre del destinatario antes de confirmar.',
      'Nunca aceptes capturas de pantalla como prueba de pago: verifica en los movimientos reales de tu app.',
      'Para recibir dinero por Nequi o Daviplata NUNCA necesitas dar códigos ni abrir enlaces externos.',
    ],
  },
];
