export type GlossaryCategory =
  | 'all'
  | 'phishing'
  | 'web'
  | 'mobile'
  | 'fraud'
  | 'social'
  | 'network'
  | 'ai'
  | 'workspace';

export interface GlossaryEntry {
  id: string;
  term: string;
  category: Exclude<GlossaryCategory, 'all'>;
  categoryLabel: string;
  icon: string; // Google Fonts Material Symbol name
  tagline: string;
  definition: string;
  whyDangerous: string;
  badExample: string;
  goodExample: string;
  tips: string[];
}

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'menu_book' },
  { id: 'phishing', label: 'Phishing y Correos', icon: 'phishing' },
  { id: 'web', label: 'Web y Descargas', icon: 'public' },
  { id: 'mobile', label: 'Celular y SMS', icon: 'smartphone' },
  { id: 'fraud', label: 'Fraudes y Pagos', icon: 'payments' },
  { id: 'social', label: 'Redes Sociales', icon: 'diversity_1' },
  { id: 'network', label: 'Wi-Fi y Redes', icon: 'wifi' },
  { id: 'ai', label: 'Inteligencia Artificial', icon: 'psychology' },
  { id: 'workspace', label: 'Entorno Laboral & MFA', icon: 'apartment' },
];

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'phishing',
    term: '¿Qué es el Phishing?',
    category: 'phishing',
    categoryLabel: 'Phishing',
    icon: 'phishing',
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
    icon: 'schedule',
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
    icon: 'link',
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
    icon: 'manage_search',
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
    icon: 'lock',
    tagline: 'Cifrado no significa que el sitio sea honesto',
    definition:
      'El candado (HTTPS) indica que la comunicación entre tu navegador y el servidor viaja cifrada, pero cualquier estafador puede obtener un certificado HTTPS gratuito para su página falsa.',
    whyDangerous:
      'Mucha gente confía ciegamente porque ve el candado verde o gris, sin revisar si el dominio es legítimo.',
    badExample: 'https://convertir-videos-gratis-ya.xyz (tiene candado, pero el dominio es sospechoso)',
    goodExample: 'https://www.ucc.edu.co (candado + dominio oficial verificado)',
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
    icon: 'bug_report',
    tagline: 'Programas dañinos disfrazados de documentos',
    definition:
      'El malware es software malicioso (virus, troyanos, spyware, ransomware) diseñado para espiar, dañar o secuestrar tu equipo. Muchas veces se disfraza con doble extensión o botones falsos de descarga.',
    whyDangerous:
      'Si abres un archivo como "calendario.pdf.exe" o instalas una app desde un botón falso, ejecutas un programa que puede robar contraseñas guardadas o cifrar tus archivos.',
    badExample: 'Archivo: calendario_2026.pdf.exe  |  Botón gigante "DESCARGAR AHORA (100% sin virus)"',
    goodExample: 'Archivo: calendario_2026.pdf (desde portal institucional oficial)',
    tips: [
      'Mira siempre los últimos caracteres después del último punto (.exe, .bat, .scr, .apk son ejecutables).',
      'Desconfía de páginas llenas de anuncios con múltiples botones llamativos de "Download".',
    ],
  },
  {
    id: 'smishing-sim-swapping',
    term: 'Smishing y SIM Swapping',
    category: 'mobile',
    categoryLabel: 'Celular y SMS',
    icon: 'smartphone',
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
    icon: 'admin_panel_settings',
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
    icon: 'qr_code_scanner',
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
  {
    id: 'redes-sociales-suplantacion',
    term: 'Suplantación en Redes y Falsos Sorteos',
    category: 'social',
    categoryLabel: 'Redes Sociales',
    icon: 'diversity_1',
    tagline: 'Perfiles clonados, sorteos trampa y falsas ofertas laborales',
    definition:
      'Cuentas clonadas con nombres casi idénticos a los de tus amigos o marcas populares que envían mensajes directos (DM) prometiendo premios inexistentes o pidiendo transferencias de urgencia.',
    whyDangerous:
      'Aprovechan los lazos de confianza entre amigos y el deseo de recompensas fáciles para robar dinero o tomar el control de tus cuentas sociales.',
    badExample: '@sorteos_apple_vip: "¡Ganaste un iPhone! Paga solo $35.000 de envío" · @amigo__: "Estoy varado, préstame $150.000"',
    goodExample: 'Verificar por llamada telefónica directa antes de transferir y desconfiar de premios donde debes pagar por adelantado.',
    tips: [
      'Si un amigo te pide dinero por chat, llámalo a su número habitual para confirmar su identidad.',
      'Ninguna marca oficial te pedirá dinero por adelantado para entregarte un premio legítimo.',
      'Desconfía de ofertas de trabajo que prometan sumas desmedidas por ver videos o dar likes.',
    ],
  },
  {
    id: 'wifi-publico-evil-twin',
    term: 'Redes Wi-Fi Abiertas y Evil Twin (Gemelo Malicioso)',
    category: 'network',
    categoryLabel: 'Wi-Fi y Conexiones',
    icon: 'wifi',
    tagline: 'Puntos de acceso falsos creados para espiar tu tráfico',
    definition:
      'Un atacante monta una red inalámbrica con un nombre similar al de un lugar público (aeropuerto, café, centro comercial) sin contraseña. Todo el tráfico que pase por esa red puede ser interceptado o redirigido a páginas falsas.',
    whyDangerous:
      'Pueden capturar contraseñas no cifradas, inyectar publicidad maliciosa o exigir la instalación de certificados fraudulentos en tu teléfono.',
    badExample: 'Conectarse a "Aeropuerto_WiFi_Gratis" abierta y aceptar instalar un "certificado de seguridad".',
    goodExample: 'Usar tus datos móviles o una VPN confiable cuando estés en lugares públicos concurridos.',
    tips: [
      'Evita realizar transacciones bancarias o ingresar contraseñas sensibles conectado a Wi-Fi públicas abiertas.',
      'Nunca instales archivos ni certificados para poder "conectarte gratis".',
      'Desactiva la opción de conectarse automáticamente a redes Wi-Fi abiertas en tu móvil.',
    ],
  },
  {
    id: 'deepfakes-ia-vishing',
    term: 'Inteligencia Artificial: Deepfakes y Clonación de Voz',
    category: 'ai',
    categoryLabel: 'Inteligencia Artificial',
    icon: 'psychology',
    tagline: 'Audios sintetizados y videos manipulados para estafar',
    definition:
      'El uso de modelos generativos de IA para clonar la voz de un familiar o el rostro de una persona pública con el fin de realizar extorsiones relámpago o promover inversiones fraudulentas.',
    whyDangerous:
      'El realismo de los audios y videos generados con pocos segundos de muestra puede engañar incluso a personas escépticas si no prestan atención a inconsistencias vocales.',
    badExample: 'Nota de voz de un "familiar" con tono monótono diciendo que está en un retén y necesita dinero en un Nequi desconocido.',
    goodExample: 'Hacer una pregunta personal que solo el familiar real sabría responder para validar su identidad.',
    tips: [
      'Establece una palabra clave familiar de seguridad para situaciones de emergencia económica.',
      'Presta atención a artefactos: pausas antinaturales, ruidos metálicos y modismos que no correspondan a la persona.',
      'Si recibes un mensaje de voz pidiendo dinero desde un número nuevo, contacta al número habitual antes de hacer nada.',
    ],
  },
  {
    id: 'mfa-fatigue-workspace',
    term: 'MFA Fatigue y Amenazas en Entornos de Trabajo/Estudio',
    category: 'workspace',
    categoryLabel: 'Entorno Laboral & MFA',
    icon: 'apartment',
    tagline: 'Bombardeo de solicitudes de 2 pasos y falso soporte TI',
    definition:
      'Ataque donde el delincuente ya obtuvo tu contraseña y te envía decenas de notificaciones push de aprobación en la madrugada para que, por cansancio o error, toques "Aprobar" y le concedas acceso total.',
    whyDangerous:
      'Anula la protección del doble factor de autenticación y compromete el correo institucional, documentos académicos y cuentas de la empresa.',
    badExample: 'Aprobar una notificación de Microsoft Authenticator a las 3:00 AM creyendo que es una actualización.',
    goodExample: 'Rechazar la notificación y cambiar de inmediato la contraseña institucional.',
    tips: [
      'Nunca apruebes una notificación de autenticación que tú no hayas provocado.',
      'Si recibes solicitudes repetitivas, reporta al equipo de TI o cambia tu clave de inmediato.',
      'Desconfía de correos de "Soporte TI" que amenacen con cerrar tu buzón si no validas tu clave en un link externo.',
    ],
  },
];
