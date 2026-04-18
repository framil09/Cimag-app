import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'HH:mm', { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return '';
  }
}

export function formatKm(km: number | null | undefined): string {
  if (km == null) return '0';
  return km.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function truncateAddress(address: string | null | undefined, maxLength = 35): string {
  if (!address) return '-';
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
}
