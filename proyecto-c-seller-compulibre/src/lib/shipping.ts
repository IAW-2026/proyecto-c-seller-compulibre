export const SHIPPING_APP_URL =
  "https://proyecto-c-shipping-compulibre.vercel.app";

export const SHIPPING_COURIERS = [
  "Andreani",
  "OCA",
  "Correo Argentino",
  "Urbano",
  "DHL",
] as const;

export type ShippingCourier = (typeof SHIPPING_COURIERS)[number];

export function isShippingCourier(value: string): value is ShippingCourier {
  return SHIPPING_COURIERS.includes(value as ShippingCourier);
}

export const SHIPPING_STATUSES = [
  "LABEL_CREATED",
  "IN_TRANSIT",
  "DELIVERED",
] as const;

export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];

export function isShippingStatus(value: string): value is ShippingStatus {
  return SHIPPING_STATUSES.includes(value as ShippingStatus);
}
