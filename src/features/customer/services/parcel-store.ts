import { useSyncExternalStore } from "react";
import { MOCK_PARCELS } from "../../../lib/mockData";
import type { Parcel } from "../../../types/global.types";

const KEY = "swiftdrop_parcels_v1";
const EVENT = "swiftdrop:parcels";

let cached: Parcel[] = MOCK_PARCELS;
let previous: string | null | undefined;

function snapshot(): Parcel[] {
  let raw: string | null;

  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }

  if (raw === previous) return cached;
  previous = raw;

  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    const saved = Array.isArray(parsed)
      ? parsed.filter(
          (p): p is Parcel =>
            !!p &&
            typeof p.id === "string" &&
            typeof p.senderId === "string" &&
            typeof p.trackingNumber === "string" &&
            !!p.recipientAddress &&
            typeof p.recipientName === "string" &&
            typeof p.size === "string" &&
            Number.isFinite(p.totalFee) &&
            Array.isArray(p.statusHistory),
        )
      : [];

    cached = [
      ...saved,
      ...MOCK_PARCELS.filter((p) => !saved.some((s) => s.id === p.id)),
    ];
  } catch {
    cached = MOCK_PARCELS;
  }

  return cached;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useParcels() {
  return useSyncExternalStore(subscribe, snapshot, () => MOCK_PARCELS);
}

export function saveParcel(parcel: Parcel) {
  const parcels = snapshot();

  localStorage.setItem(
    KEY,
    JSON.stringify([
      parcel,
      ...parcels.filter((p) => p.id !== parcel.id),
    ]),
  );

  window.dispatchEvent(new Event(EVENT));
}