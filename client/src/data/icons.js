import {
  Apple, Banana, Cherry, Grape, Citrus, Carrot, Salad, Bean, Wheat, Leaf, Sprout, Nut, Vegan,
  Egg, EggFried, Milk, Beef, Drumstick, Fish, Ham, Croissant, Cookie, Donut, Cake, CakeSlice,
  Dessert, Pizza, Sandwich, Soup, Popcorn, IceCreamBowl, IceCreamCone, Candy, CandyCane,
  CookingPot, ChefHat, Utensils, UtensilsCrossed,
  Coffee, CupSoda, GlassWater, Wine, Beer, Martini, Droplet,
  Home, Lamp, Lightbulb, Bed, Sofa, Armchair, Bath, ShowerHead, Refrigerator, Microwave,
  WashingMachine, Trash2, Recycle, PaintBucket, PaintRoller, Brush, Hammer, Wrench, Plug,
  Battery, Flashlight, Scissors, Box, Package, Key, Fan, Flame, Droplets, SprayCan, Trash, Sparkles,
  Pill, Syringe, Stethoscope, Bandage, Thermometer, HeartPulse, Heart, Glasses,
  Baby, Dog, Cat, Bird, Bone, PawPrint, Rabbit,
  Shirt, Footprints, Watch, Backpack, Briefcase, Wallet, Gift, ShoppingBag, ShoppingBasket,
  ShoppingCart, Book, BookOpen, Newspaper, Pencil, Pen, Notebook, Smartphone, Laptop, Headphones,
  Tv, Camera, Gamepad2, Umbrella, Flower, Flower2, TreePine, Sun, Palette, CreditCard, Star, Tag, Bookmark,
} from 'lucide-react';

export const ICON_CATEGORIES = [
  { id: 'comida', label: 'Comida' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'hogar', label: 'Hogar y limpieza' },
  { id: 'higiene', label: 'Higiene y salud' },
  { id: 'bebe', label: 'Bebé y mascotas' },
  { id: 'otros', label: 'Ropa y otros' },
];

// [Componente, nombre (id estable), categoría, palabras clave]
const DEFS = [
  // Comida
  [Apple, 'Apple', 'comida', 'manzana fruta'],
  [Banana, 'Banana', 'comida', 'plátano banana fruta'],
  [Cherry, 'Cherry', 'comida', 'cereza fruta'],
  [Grape, 'Grape', 'comida', 'uva uvas fruta'],
  [Citrus, 'Citrus', 'comida', 'naranja limón cítrico fruta'],
  [Carrot, 'Carrot', 'comida', 'zanahoria verdura'],
  [Salad, 'Salad', 'comida', 'ensalada verdura lechuga'],
  [Bean, 'Bean', 'comida', 'judía legumbre alubia'],
  [Wheat, 'Wheat', 'comida', 'trigo cereal harina'],
  [Leaf, 'Leaf', 'comida', 'hoja verde hierba'],
  [Sprout, 'Sprout', 'comida', 'brote germinado verdura'],
  [Nut, 'Nut', 'comida', 'fruto seco nuez'],
  [Vegan, 'Vegan', 'comida', 'vegano vegetal'],
  [Egg, 'Egg', 'comida', 'huevo huevos'],
  [EggFried, 'EggFried', 'comida', 'huevo frito'],
  [Milk, 'Milk', 'comida', 'leche lácteo batido'],
  [Beef, 'Beef', 'comida', 'carne ternera filete'],
  [Drumstick, 'Drumstick', 'comida', 'pollo muslo carne'],
  [Fish, 'Fish', 'comida', 'pescado pez marisco'],
  [Ham, 'Ham', 'comida', 'jamón embutido'],
  [Croissant, 'Croissant', 'comida', 'croissant bollería pan'],
  [Cookie, 'Cookie', 'comida', 'galleta'],
  [Donut, 'Donut', 'comida', 'donut dónut'],
  [Cake, 'Cake', 'comida', 'tarta pastel'],
  [CakeSlice, 'CakeSlice', 'comida', 'porción tarta pastel'],
  [Dessert, 'Dessert', 'comida', 'postre flan'],
  [Pizza, 'Pizza', 'comida', 'pizza'],
  [Sandwich, 'Sandwich', 'comida', 'sándwich bocadillo'],
  [Soup, 'Soup', 'comida', 'sopa caldo'],
  [Popcorn, 'Popcorn', 'comida', 'palomitas'],
  [IceCreamBowl, 'IceCreamBowl', 'comida', 'helado tarrina'],
  [IceCreamCone, 'IceCreamCone', 'comida', 'helado cucurucho'],
  [Candy, 'Candy', 'comida', 'caramelo chuche'],
  [CandyCane, 'CandyCane', 'comida', 'caramelo bastón'],
  [CookingPot, 'CookingPot', 'comida', 'olla cocina guiso'],
  [ChefHat, 'ChefHat', 'comida', 'cocina chef'],
  [Utensils, 'Utensils', 'comida', 'cubiertos comida'],
  [UtensilsCrossed, 'UtensilsCrossed', 'comida', 'cubiertos restaurante'],
  // Bebidas
  [Coffee, 'Coffee', 'bebidas', 'café té caliente'],
  [CupSoda, 'CupSoda', 'bebidas', 'refresco vaso bebida'],
  [GlassWater, 'GlassWater', 'bebidas', 'agua vaso'],
  [Wine, 'Wine', 'bebidas', 'vino copa'],
  [Beer, 'Beer', 'bebidas', 'cerveza'],
  [Martini, 'Martini', 'bebidas', 'cóctel copa'],
  [Droplet, 'Droplet', 'bebidas', 'agua gota líquido'],
  // Hogar y limpieza
  [Home, 'Home', 'hogar', 'casa hogar'],
  [Lamp, 'Lamp', 'hogar', 'lámpara luz'],
  [Lightbulb, 'Lightbulb', 'hogar', 'bombilla luz'],
  [Bed, 'Bed', 'hogar', 'cama dormitorio'],
  [Sofa, 'Sofa', 'hogar', 'sofá salón'],
  [Armchair, 'Armchair', 'hogar', 'sillón silla'],
  [Bath, 'Bath', 'hogar', 'bañera baño'],
  [ShowerHead, 'ShowerHead', 'hogar', 'ducha baño'],
  [Refrigerator, 'Refrigerator', 'hogar', 'nevera frigorífico'],
  [Microwave, 'Microwave', 'hogar', 'microondas'],
  [WashingMachine, 'WashingMachine', 'hogar', 'lavadora colada'],
  [Trash2, 'Trash2', 'hogar', 'basura papelera'],
  [Trash, 'Trash', 'hogar', 'basura cubo'],
  [Recycle, 'Recycle', 'hogar', 'reciclaje reciclar'],
  [PaintBucket, 'PaintBucket', 'hogar', 'pintura cubo'],
  [PaintRoller, 'PaintRoller', 'hogar', 'rodillo pintura'],
  [Brush, 'Brush', 'hogar', 'cepillo brocha'],
  [Hammer, 'Hammer', 'hogar', 'martillo herramienta'],
  [Wrench, 'Wrench', 'hogar', 'llave herramienta'],
  [Plug, 'Plug', 'hogar', 'enchufe electricidad'],
  [Battery, 'Battery', 'hogar', 'pila batería'],
  [Flashlight, 'Flashlight', 'hogar', 'linterna'],
  [Scissors, 'Scissors', 'hogar', 'tijeras'],
  [Box, 'Box', 'hogar', 'caja almacenaje'],
  [Package, 'Package', 'hogar', 'paquete caja'],
  [Key, 'Key', 'hogar', 'llave'],
  [Fan, 'Fan', 'hogar', 'ventilador'],
  [Flame, 'Flame', 'hogar', 'fuego gas'],
  [Droplets, 'Droplets', 'hogar', 'limpieza líquido gotas'],
  [SprayCan, 'SprayCan', 'hogar', 'spray limpiador aerosol'],
  [Sparkles, 'Sparkles', 'hogar', 'brillo limpio limpieza'],
  // Higiene y salud
  [Pill, 'Pill', 'higiene', 'pastilla medicina pastillas'],
  [Syringe, 'Syringe', 'higiene', 'jeringa vacuna'],
  [Stethoscope, 'Stethoscope', 'higiene', 'médico salud'],
  [Bandage, 'Bandage', 'higiene', 'tirita venda'],
  [Thermometer, 'Thermometer', 'higiene', 'termómetro fiebre'],
  [HeartPulse, 'HeartPulse', 'higiene', 'salud corazón'],
  [Heart, 'Heart', 'higiene', 'corazón salud'],
  [Glasses, 'Glasses', 'higiene', 'gafas vista'],
  // Bebé y mascotas
  [Baby, 'Baby', 'bebe', 'bebé niño pañal'],
  [Dog, 'Dog', 'bebe', 'perro mascota'],
  [Cat, 'Cat', 'bebe', 'gato mascota'],
  [Bird, 'Bird', 'bebe', 'pájaro mascota'],
  [Bone, 'Bone', 'bebe', 'hueso perro'],
  [PawPrint, 'PawPrint', 'bebe', 'huella mascota pata'],
  [Rabbit, 'Rabbit', 'bebe', 'conejo mascota'],
  // Ropa y otros
  [Shirt, 'Shirt', 'otros', 'camiseta ropa'],
  [Footprints, 'Footprints', 'otros', 'zapatos calzado pasos'],
  [Watch, 'Watch', 'otros', 'reloj'],
  [Backpack, 'Backpack', 'otros', 'mochila'],
  [Briefcase, 'Briefcase', 'otros', 'maletín trabajo'],
  [Wallet, 'Wallet', 'otros', 'cartera monedero'],
  [Gift, 'Gift', 'otros', 'regalo'],
  [ShoppingBag, 'ShoppingBag', 'otros', 'bolsa compra'],
  [ShoppingBasket, 'ShoppingBasket', 'otros', 'cesta compra'],
  [ShoppingCart, 'ShoppingCart', 'otros', 'carrito compra'],
  [Book, 'Book', 'otros', 'libro'],
  [BookOpen, 'BookOpen', 'otros', 'libro lectura'],
  [Newspaper, 'Newspaper', 'otros', 'periódico prensa'],
  [Pencil, 'Pencil', 'otros', 'lápiz papelería'],
  [Pen, 'Pen', 'otros', 'bolígrafo papelería'],
  [Notebook, 'Notebook', 'otros', 'cuaderno libreta'],
  [Smartphone, 'Smartphone', 'otros', 'móvil teléfono'],
  [Laptop, 'Laptop', 'otros', 'portátil ordenador'],
  [Headphones, 'Headphones', 'otros', 'auriculares cascos'],
  [Tv, 'Tv', 'otros', 'televisión tele'],
  [Camera, 'Camera', 'otros', 'cámara foto'],
  [Gamepad2, 'Gamepad2', 'otros', 'videojuego mando'],
  [Umbrella, 'Umbrella', 'otros', 'paraguas'],
  [Flower, 'Flower', 'otros', 'flor planta'],
  [Flower2, 'Flower2', 'otros', 'flores planta'],
  [TreePine, 'TreePine', 'otros', 'árbol planta'],
  [Sun, 'Sun', 'otros', 'sol verano'],
  [Palette, 'Palette', 'otros', 'paleta arte color'],
  [CreditCard, 'CreditCard', 'otros', 'tarjeta pago'],
  [Star, 'Star', 'otros', 'estrella favorito'],
  [Tag, 'Tag', 'otros', 'etiqueta precio'],
  [Bookmark, 'Bookmark', 'otros', 'marcador'],
];

const MAP = {};
export const ICONS = [];
for (const [Comp, name, category, keywords] of DEFS) {
  if (!Comp || MAP[name]) continue; // dedup por nombre
  MAP[name] = Comp;
  ICONS.push({ name, category, keywords, Comp });
}

export function getIconComponent(name) {
  return (name && MAP[name]) || null;
}

export function searchIcons(query, category) {
  const q = (query || '').trim().toLowerCase();
  return ICONS.filter((i) => {
    if (category && category !== 'all' && i.category !== category) return false;
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || i.keywords.toLowerCase().includes(q);
  });
}
