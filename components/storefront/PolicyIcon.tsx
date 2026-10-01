import { CircleX, FileText, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Policy } from "@/lib/policies";

const ICONS = {
  shield: ShieldCheck,
  file: FileText,
  truck: Truck,
  rotate: RotateCcw,
  cancel: CircleX,
} as const;

export function PolicyIcon({ name, size = 20 }: { name: Policy["icon"]; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} aria-hidden="true" />;
}
