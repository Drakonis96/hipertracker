export const EMOJI_CATEGORIES = [
  { id: 'comida', label: 'Comida' },
  { id: 'bebida', label: 'Bebida' },
  { id: 'hogar', label: 'Hogar' },
  { id: 'higiene', label: 'Higiene' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'otros', label: 'Otros' },
];

// [emoji, palabras clave (es), categoría]
const RAW = [
  // ---- Comida ----
  ['🍎', 'manzana fruta', 'comida'],
  ['🍏', 'manzana verde fruta', 'comida'],
  ['🍐', 'pera fruta', 'comida'],
  ['🍊', 'naranja mandarina fruta', 'comida'],
  ['🍋', 'limón cítrico fruta', 'comida'],
  ['🍌', 'plátano banana fruta', 'comida'],
  ['🍉', 'sandía fruta', 'comida'],
  ['🍇', 'uvas uva fruta', 'comida'],
  ['🍓', 'fresa fruta', 'comida'],
  ['🫐', 'arándanos fruta', 'comida'],
  ['🍈', 'melón fruta', 'comida'],
  ['🍒', 'cerezas cereza fruta', 'comida'],
  ['🍑', 'melocotón fruta', 'comida'],
  ['🥭', 'mango fruta', 'comida'],
  ['🍍', 'piña fruta', 'comida'],
  ['🥥', 'coco fruta', 'comida'],
  ['🥝', 'kiwi fruta', 'comida'],
  ['🍅', 'tomate verdura', 'comida'],
  ['🍆', 'berenjena verdura', 'comida'],
  ['🥑', 'aguacate', 'comida'],
  ['🥦', 'brócoli verdura', 'comida'],
  ['🥬', 'lechuga verdura', 'comida'],
  ['🥒', 'pepino verdura', 'comida'],
  ['🌶️', 'pimiento picante guindilla', 'comida'],
  ['🫑', 'pimiento verdura', 'comida'],
  ['🌽', 'maíz', 'comida'],
  ['🥕', 'zanahoria verdura', 'comida'],
  ['🧄', 'ajo', 'comida'],
  ['🧅', 'cebolla', 'comida'],
  ['🥔', 'patata', 'comida'],
  ['🫘', 'legumbres judías alubias', 'comida'],
  ['🥜', 'cacahuete fruto seco', 'comida'],
  ['🌰', 'castaña fruto seco', 'comida'],
  ['🍞', 'pan', 'comida'],
  ['🥐', 'croissant bollería', 'comida'],
  ['🥖', 'barra pan baguette', 'comida'],
  ['🫓', 'pan plano', 'comida'],
  ['🥨', 'pretzel', 'comida'],
  ['🥯', 'bagel', 'comida'],
  ['🧀', 'queso', 'comida'],
  ['🥚', 'huevo huevos', 'comida'],
  ['🍳', 'huevo frito sartén', 'comida'],
  ['🧈', 'mantequilla', 'comida'],
  ['🥞', 'tortitas', 'comida'],
  ['🧇', 'gofre', 'comida'],
  ['🥓', 'bacon panceta', 'comida'],
  ['🥩', 'carne filete ternera', 'comida'],
  ['🍗', 'pollo muslo carne', 'comida'],
  ['🍖', 'carne costilla', 'comida'],
  ['🌭', 'perrito caliente salchicha', 'comida'],
  ['🍔', 'hamburguesa', 'comida'],
  ['🍟', 'patatas fritas', 'comida'],
  ['🍕', 'pizza', 'comida'],
  ['🥪', 'sándwich bocadillo', 'comida'],
  ['🌮', 'taco', 'comida'],
  ['🌯', 'burrito durum', 'comida'],
  ['🥙', 'kebab durum', 'comida'],
  ['🧆', 'falafel', 'comida'],
  ['🥗', 'ensalada', 'comida'],
  ['🥘', 'paella guiso', 'comida'],
  ['🍲', 'sopa cocido', 'comida'],
  ['🍝', 'pasta espagueti', 'comida'],
  ['🍜', 'ramen fideos', 'comida'],
  ['🍛', 'curry arroz', 'comida'],
  ['🍣', 'sushi', 'comida'],
  ['🍤', 'gamba langostino marisco', 'comida'],
  ['🦪', 'ostra marisco', 'comida'],
  ['🍚', 'arroz', 'comida'],
  ['🥫', 'conserva lata', 'comida'],
  ['🍯', 'miel', 'comida'],
  ['🧂', 'sal', 'comida'],
  ['🫙', 'tarro bote mermelada', 'comida'],
  ['🍿', 'palomitas', 'comida'],
  ['🍦', 'helado cucurucho', 'comida'],
  ['🍨', 'helado tarrina', 'comida'],
  ['🍧', 'granizado helado', 'comida'],
  ['🥧', 'tarta pastel', 'comida'],
  ['🧁', 'magdalena cupcake', 'comida'],
  ['🍰', 'tarta porción', 'comida'],
  ['🎂', 'tarta cumpleaños', 'comida'],
  ['🍮', 'flan natillas', 'comida'],
  ['🍭', 'piruleta caramelo', 'comida'],
  ['🍬', 'caramelo chuche', 'comida'],
  ['🍫', 'chocolate', 'comida'],
  ['🍩', 'donut dónut', 'comida'],
  ['🍪', 'galleta', 'comida'],
  ['🧊', 'hielo cubito', 'comida'],

  // ---- Bebida ----
  ['🥛', 'leche vaso lácteo', 'bebida'],
  ['☕', 'café té caliente', 'bebida'],
  ['🫖', 'tetera té', 'bebida'],
  ['🍵', 'té verde infusión', 'bebida'],
  ['🧃', 'zumo brik bebida', 'bebida'],
  ['🥤', 'refresco vaso bebida', 'bebida'],
  ['🧋', 'bubble tea', 'bebida'],
  ['🍶', 'sake botella', 'bebida'],
  ['🍾', 'champán cava botella', 'bebida'],
  ['🍷', 'vino copa', 'bebida'],
  ['🍸', 'cóctel martini', 'bebida'],
  ['🍹', 'cóctel tropical', 'bebida'],
  ['🍺', 'cerveza', 'bebida'],
  ['🍻', 'cervezas brindis', 'bebida'],
  ['🥂', 'brindis copas cava', 'bebida'],
  ['🥃', 'whisky vaso', 'bebida'],
  ['🧉', 'mate infusión', 'bebida'],
  ['💧', 'agua gota', 'bebida'],

  // ---- Hogar ----
  ['🏠', 'casa hogar', 'hogar'],
  ['🛋️', 'sofá salón', 'hogar'],
  ['🛏️', 'cama dormitorio', 'hogar'],
  ['🪑', 'silla', 'hogar'],
  ['🚪', 'puerta', 'hogar'],
  ['🚽', 'váter wc inodoro', 'hogar'],
  ['🛁', 'bañera baño', 'hogar'],
  ['🚿', 'ducha baño', 'hogar'],
  ['🧻', 'papel higiénico rollo', 'hogar'],
  ['🧼', 'jabón pastilla', 'hogar'],
  ['🧽', 'esponja estropajo', 'hogar'],
  ['🧹', 'escoba barrer', 'hogar'],
  ['🧺', 'cesta colada ropa', 'hogar'],
  ['🧴', 'bote gel loción champú', 'hogar'],
  ['🪣', 'cubo fregona', 'hogar'],
  ['🔌', 'enchufe cargador', 'hogar'],
  ['💡', 'bombilla luz', 'hogar'],
  ['🔋', 'pila batería', 'hogar'],
  ['🕯️', 'vela', 'hogar'],
  ['🪔', 'lámpara aceite', 'hogar'],
  ['🔨', 'martillo herramienta', 'hogar'],
  ['🪛', 'destornillador herramienta', 'hogar'],
  ['🔧', 'llave inglesa herramienta', 'hogar'],
  ['🪚', 'sierra herramienta', 'hogar'],
  ['🧰', 'caja herramientas', 'hogar'],
  ['🧲', 'imán', 'hogar'],
  ['🪟', 'ventana', 'hogar'],
  ['🪞', 'espejo', 'hogar'],
  ['🗑️', 'papelera basura', 'hogar'],
  ['♻️', 'reciclaje reciclar', 'hogar'],
  ['🪴', 'planta maceta', 'hogar'],
  ['🔑', 'llave', 'hogar'],
  ['🧵', 'hilo costura', 'hogar'],
  ['🪡', 'aguja coser', 'hogar'],
  ['🧶', 'lana ovillo', 'hogar'],
  ['📦', 'caja paquete cartón', 'hogar'],

  // ---- Higiene y salud ----
  ['💊', 'pastilla medicina medicamento', 'higiene'],
  ['💉', 'jeringa vacuna', 'higiene'],
  ['🩹', 'tirita venda', 'higiene'],
  ['🩺', 'estetoscopio médico', 'higiene'],
  ['🌡️', 'termómetro fiebre', 'higiene'],
  ['🦷', 'diente dental', 'higiene'],
  ['🪥', 'cepillo dientes', 'higiene'],
  ['🪒', 'cuchilla afeitar', 'higiene'],
  ['🪮', 'peine', 'higiene'],
  ['💄', 'pintalabios maquillaje', 'higiene'],
  ['💅', 'esmalte uñas manicura', 'higiene'],
  ['🧴', 'crema loción protector', 'higiene'],
  ['🧖', 'spa sauna', 'higiene'],
  ['😷', 'mascarilla', 'higiene'],
  ['👓', 'gafas vista', 'higiene'],

  // ---- Ropa ----
  ['👕', 'camiseta ropa', 'ropa'],
  ['👔', 'camisa corbata', 'ropa'],
  ['👖', 'pantalón vaquero', 'ropa'],
  ['👗', 'vestido', 'ropa'],
  ['👚', 'blusa top', 'ropa'],
  ['🧥', 'abrigo chaqueta', 'ropa'],
  ['🧦', 'calcetines', 'ropa'],
  ['🧤', 'guantes', 'ropa'],
  ['🧣', 'bufanda', 'ropa'],
  ['🧢', 'gorra', 'ropa'],
  ['👒', 'sombrero pamela', 'ropa'],
  ['👟', 'zapatillas deporte', 'ropa'],
  ['👞', 'zapato', 'ropa'],
  ['👠', 'tacón zapato', 'ropa'],
  ['👢', 'bota', 'ropa'],
  ['🥾', 'bota montaña', 'ropa'],
  ['🩴', 'chancla', 'ropa'],
  ['👜', 'bolso', 'ropa'],
  ['👛', 'monedero', 'ropa'],
  ['🎒', 'mochila', 'ropa'],
  ['💼', 'maletín', 'ropa'],
  ['⌚', 'reloj pulsera', 'ropa'],
  ['💍', 'anillo joya', 'ropa'],
  ['🕶️', 'gafas sol', 'ropa'],

  // ---- Otros ----
  ['🛒', 'carrito compra', 'otros'],
  ['🛍️', 'bolsas compra', 'otros'],
  ['🎁', 'regalo', 'otros'],
  ['📱', 'móvil teléfono', 'otros'],
  ['💻', 'portátil ordenador', 'otros'],
  ['⌨️', 'teclado', 'otros'],
  ['🖱️', 'ratón', 'otros'],
  ['🖨️', 'impresora', 'otros'],
  ['📺', 'televisión tele', 'otros'],
  ['📷', 'cámara foto', 'otros'],
  ['🎧', 'auriculares cascos', 'otros'],
  ['📚', 'libros', 'otros'],
  ['📖', 'libro lectura', 'otros'],
  ['📰', 'periódico prensa', 'otros'],
  ['✏️', 'lápiz papelería', 'otros'],
  ['🖊️', 'bolígrafo papelería', 'otros'],
  ['📝', 'cuaderno notas', 'otros'],
  ['✂️', 'tijeras', 'otros'],
  ['🖍️', 'cera color pintar', 'otros'],
  ['🖌️', 'pincel pintura', 'otros'],
  ['🎨', 'paleta arte color', 'otros'],
  ['🧩', 'puzzle', 'otros'],
  ['🎮', 'videojuego mando', 'otros'],
  ['🧸', 'peluche juguete', 'otros'],
  ['⚽', 'balón fútbol', 'otros'],
  ['🏀', 'baloncesto balón', 'otros'],
  ['🎾', 'tenis pelota', 'otros'],
  ['🚲', 'bici bicicleta', 'otros'],
  ['🌸', 'flor planta', 'otros'],
  ['🌻', 'girasol flor', 'otros'],
  ['💐', 'ramo flores', 'otros'],
  ['🐶', 'perro mascota', 'otros'],
  ['🐱', 'gato mascota', 'otros'],
  ['🐟', 'pez pecera', 'otros'],
  ['🦴', 'hueso perro', 'otros'],
  ['🐾', 'huella mascota pata', 'otros'],
  ['🍼', 'biberón bebé', 'otros'],
  ['🚼', 'bebé pañal', 'otros'],
];

const _seen = new Set();
export const EMOJIS = RAW.reduce((acc, [emoji, keywords, category]) => {
  if (_seen.has(emoji)) return acc; // dedup por emoji
  _seen.add(emoji);
  acc.push({ emoji, keywords, category });
  return acc;
}, []);

// Sinónimos inglés → español. Permiten sugerir/buscar emojis escribiendo en
// inglés (p. ej. "milk" encuentra 🥛). El valor es una palabra clave que ya
// existe en RAW (los acentos se normalizan, así que da igual escribirlos).
const EN_ES = {
  // Comida
  fruit: 'fruta', apple: 'manzana', pear: 'pera', orange: 'naranja', tangerine: 'mandarina',
  lemon: 'limon', lime: 'limon', banana: 'platano', watermelon: 'sandia', grape: 'uva',
  grapes: 'uvas', strawberry: 'fresa', blueberry: 'arandanos', blueberries: 'arandanos',
  melon: 'melon', cherry: 'cereza', cherries: 'cerezas', peach: 'melocoton', mango: 'mango',
  pineapple: 'piña', coconut: 'coco', kiwi: 'kiwi', tomato: 'tomate', eggplant: 'berenjena',
  aubergine: 'berenjena', avocado: 'aguacate', broccoli: 'brocoli', lettuce: 'lechuga',
  cucumber: 'pepino', pepper: 'pimiento', chili: 'picante', chilli: 'picante', corn: 'maiz',
  carrot: 'zanahoria', garlic: 'ajo', onion: 'cebolla', potato: 'patata', beans: 'legumbres',
  peanut: 'cacahuete', peanuts: 'cacahuete', nut: 'fruto', chestnut: 'castaña',
  vegetable: 'verdura', veggie: 'verdura', bread: 'pan', loaf: 'pan', baguette: 'baguette',
  croissant: 'croissant', pretzel: 'pretzel', bagel: 'bagel', cheese: 'queso', egg: 'huevo',
  eggs: 'huevo', butter: 'mantequilla', pancake: 'tortitas', pancakes: 'tortitas',
  waffle: 'gofre', bacon: 'bacon', meat: 'carne', steak: 'filete', beef: 'ternera',
  chicken: 'pollo', ribs: 'costilla', hotdog: 'salchicha', sausage: 'salchicha',
  hamburger: 'hamburguesa', burger: 'hamburguesa', fries: 'fritas', pizza: 'pizza',
  sandwich: 'sandwich', taco: 'taco', burrito: 'burrito', kebab: 'kebab', falafel: 'falafel',
  salad: 'ensalada', paella: 'paella', soup: 'sopa', stew: 'guiso', pasta: 'pasta',
  spaghetti: 'espagueti', noodles: 'fideos', ramen: 'ramen', curry: 'curry', rice: 'arroz',
  sushi: 'sushi', shrimp: 'gamba', prawn: 'langostino', oyster: 'ostra', seafood: 'marisco',
  canned: 'conserva', can: 'lata', honey: 'miel', salt: 'sal', jam: 'mermelada',
  popcorn: 'palomitas', icecream: 'helado', cake: 'tarta', cupcake: 'cupcake',
  muffin: 'magdalena', pudding: 'flan', lollipop: 'piruleta', candy: 'caramelo',
  sweet: 'chuche', chocolate: 'chocolate', donut: 'donut', doughnut: 'donut',
  cookie: 'galleta', biscuit: 'galleta', ice: 'hielo',
  // Bebida
  milk: 'leche', water: 'agua', coffee: 'cafe', tea: 'te', juice: 'zumo', soda: 'refresco', beer: 'cerveza',
  beers: 'cervezas', wine: 'vino', cocktail: 'coctel', whisky: 'whisky', whiskey: 'whisky',
  champagne: 'champan', sake: 'sake', smoothie: 'batido',
  // Hogar
  home: 'hogar', house: 'casa', sofa: 'sofa', couch: 'sofa', bed: 'cama', chair: 'silla',
  door: 'puerta', toilet: 'vater', bath: 'baño', bathtub: 'bañera', shower: 'ducha',
  soap: 'jabon', paper: 'papel', sponge: 'esponja', scourer: 'estropajo', broom: 'escoba', basket: 'cesta',
  laundry: 'colada', lotion: 'locion', shampoo: 'champu', bucket: 'cubo', mop: 'fregona',
  plug: 'enchufe', charger: 'cargador', bulb: 'bombilla', lightbulb: 'bombilla', light: 'luz',
  battery: 'pila', candle: 'vela', lamp: 'lampara', hammer: 'martillo',
  screwdriver: 'destornillador', wrench: 'inglesa', saw: 'sierra', tool: 'herramienta',
  tools: 'herramientas', toolbox: 'herramientas', magnet: 'iman', window: 'ventana',
  mirror: 'espejo', trash: 'basura', garbage: 'basura', bin: 'papelera', recycle: 'reciclaje',
  plant: 'planta', key: 'llave', thread: 'hilo', needle: 'aguja', sewing: 'costura',
  wool: 'lana', yarn: 'ovillo', box: 'caja', package: 'paquete', cardboard: 'carton',
  // Higiene y salud
  medicine: 'medicina', pill: 'pastilla', drug: 'medicamento', syringe: 'jeringa',
  vaccine: 'vacuna', bandage: 'tirita', plaster: 'tirita', stethoscope: 'estetoscopio',
  thermometer: 'termometro', fever: 'fiebre', tooth: 'diente', dental: 'dental',
  toothbrush: 'cepillo', razor: 'cuchilla', shaving: 'afeitar', comb: 'peine',
  lipstick: 'pintalabios', makeup: 'maquillaje', nail: 'uñas', manicure: 'manicura',
  cream: 'crema', sunscreen: 'protector', mask: 'mascarilla', glasses: 'gafas',
  // Ropa
  clothes: 'ropa', clothing: 'ropa', tshirt: 'camiseta', shirt: 'camisa', tie: 'corbata',
  pants: 'pantalon', trousers: 'pantalon', jeans: 'vaquero', dress: 'vestido', blouse: 'blusa',
  coat: 'abrigo', jacket: 'chaqueta', socks: 'calcetines', gloves: 'guantes', scarf: 'bufanda',
  cap: 'gorra', hat: 'sombrero', sneakers: 'zapatillas', shoe: 'zapato', shoes: 'zapato',
  heels: 'tacon', boot: 'bota', boots: 'bota', flipflop: 'chancla', bag: 'bolso',
  purse: 'monedero', wallet: 'monedero', backpack: 'mochila', briefcase: 'maletin',
  watch: 'reloj', ring: 'anillo', sunglasses: 'gafas',
  // Otros
  cart: 'carrito', shopping: 'compra', gift: 'regalo', present: 'regalo', phone: 'movil',
  mobile: 'movil', laptop: 'portatil', computer: 'ordenador', keyboard: 'teclado',
  mouse: 'raton', printer: 'impresora', tv: 'television', television: 'television',
  camera: 'camara', headphones: 'auriculares', book: 'libro', books: 'libros',
  newspaper: 'periodico', pencil: 'lapiz', pen: 'boligrafo', notebook: 'cuaderno',
  scissors: 'tijeras', crayon: 'cera', brush: 'pincel', palette: 'paleta', puzzle: 'puzzle',
  videogame: 'videojuego', game: 'videojuego', toy: 'juguete', teddy: 'peluche', ball: 'balon',
  football: 'futbol', soccer: 'futbol', basketball: 'baloncesto', tennis: 'tenis', bike: 'bici',
  bicycle: 'bicicleta', flower: 'flor', flowers: 'flores', sunflower: 'girasol',
  bouquet: 'ramo', dog: 'perro', cat: 'gato', fish: 'pez', pet: 'mascota', bone: 'hueso',
  paw: 'huella', bottle: 'biberon', baby: 'bebe', diaper: 'pañal',
};

// Normaliza: minúsculas y sin acentos (para casar es/en sin importar tildes).
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Índice: cada emoji con sus palabras clave normalizadas, en paralelo a EMOJIS.
const NK = EMOJIS.map((e) => norm(e.keywords));
const NKW = NK.map((k) => k.split(' '));

// Traducción inglés→español (palabra clave exacta) para un término escrito.
function synonymsOf(token) {
  const out = [];
  for (const en in EN_ES) {
    if (en === token || (en.length >= 4 && token.startsWith(en))) out.push(norm(EN_ES[en]));
  }
  return out;
}

// ¿La palabra escrita `w` casa con la palabra clave `x`?
// Igualdad o prefijo en cualquier dirección (para singular/plural y escritura en vivo).
const wordHit = (x, w) => x === w || (w.length >= 4 && x.startsWith(w)) || (x.length >= 4 && w.startsWith(x));

export function searchEmojis(query, category) {
  const q = norm(query);
  const syns = q ? synonymsOf(q) : [];
  return EMOJIS.filter((e, i) => {
    if (category && category !== 'all' && e.category !== category) return false;
    if (!q) return true;
    return NK[i].includes(q) || syns.some((s) => NKW[i].includes(s)) || e.emoji === query;
  });
}

// Sugerencias de emoji a partir del nombre de un producto (escrito en es o en).
export function suggestEmojis(name, limit = 8) {
  const words = norm(name).split(/\s+/).filter((w) => w.length >= 2);
  if (!words.length) return [];
  const out = [];
  const seen = new Set();
  for (const w of words) {
    const syns = synonymsOf(w); // palabras clave exactas (inglés→español)
    for (let i = 0; i < EMOJIS.length; i += 1) {
      if (seen.has(EMOJIS[i].emoji)) continue;
      const kw = NKW[i];
      const hit = kw.some((x) => wordHit(x, w)) || syns.some((s) => kw.includes(s));
      if (hit) {
        out.push(EMOJIS[i]);
        seen.add(EMOJIS[i].emoji);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
