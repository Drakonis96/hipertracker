// Une clases condicionalmente (ignora falsy).
export function cn(...args) {
  return args.flat().filter(Boolean).join(' ');
}
