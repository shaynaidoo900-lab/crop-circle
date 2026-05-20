import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatHectares(hectares: number): string {
  return `${hectares.toFixed(2)} ha`;
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function getNDVIColor(ndvi: number): string {
  if (ndvi >= 0.7) return '#166534';
  if (ndvi >= 0.5) return '#22c55e';
  if (ndvi >= 0.3) return '#eab308';
  if (ndvi >= 0.1) return '#f97316';
  return '#ef4444';
}

export function getNDVILevel(ndvi: number): string {
  if (ndvi >= 0.7) return 'Healthy';
  if (ndvi >= 0.5) return 'Moderate';
  if (ndvi >= 0.3) return 'Stressed';
  return 'Critical';
}