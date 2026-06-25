export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autonoma de Buenos Aires",
  "Cordoba",
  "Corrientes",
  "Entre Rios",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquen",
  "Rio Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucuman",
] as const;

export type ArgentinaProvince = (typeof ARGENTINA_PROVINCES)[number];

function normalizeProvinceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getArgentinaProvince(value: string) {
  const normalizedValue = normalizeProvinceName(value);

  return ARGENTINA_PROVINCES.find(
    (province) => normalizeProvinceName(province) === normalizedValue
  );
}

