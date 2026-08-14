import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar locale español
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configurar plugins
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es'); // Establecer español como locale por defecto

/**
 * Formatea una fecha sin aplicar conversión de timezone.
 * Útil para fechas que vienen del backend como YYYY-MM-DD y deben mostrarse tal cual.
 * 
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 * @param locale - Locale para el formato (por defecto 'es')
 * @param options - Opciones de formateo (compatibilidad con código anterior)
 * @returns Fecha formateada o "Sin fecha" si es inválida
 */
export function formatDateLocal(
  dateString: string | null | undefined,
  _locale: string = 'es',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return 'Sin fecha';

  try {
    // Extraer solo la parte de fecha (YYYY-MM-DD) ignorando hora y timezone
    let datePart: string;
    
    if (dateString.includes('T')) {
      // Si tiene timestamp, extraer solo YYYY-MM-DD
      datePart = dateString.split('T')[0];
    } else {
      datePart = dateString;
    }
    
    // Parsear con dayjs
    const date = dayjs(datePart, 'YYYY-MM-DD', true); // strict mode
    
    if (!date.isValid()) return 'Sin fecha';
    
    // Determinar formato basado en options
    if (options?.month === 'long') {
      // Formato largo: "16 de noviembre de 2025"
      return date.format('DD [de] MMMM [de] YYYY');
    } else {
      // Formato corto por defecto: "16/11/2025"
      return date.format('DD/MM/YYYY');
    }
  } catch {
    return 'Sin fecha';
  }
}

/**
 * Formatea un timestamp UTC (por ejemplo deleted_at) a fecha y hora local.
 * Por defecto usa la zona horaria de Argentina.
 */
export function formatDateTimeLocalFromUtc(
  dateTimeString: string | null | undefined,
  timeZone: string = 'America/Argentina/Buenos_Aires'
): string {
  if (!dateTimeString) return 'Sin fecha';

  try {
    const utcDate = dayjs.utc(dateTimeString);
    if (!utcDate.isValid()) return 'Sin fecha';

    const localDate = utcDate.tz(timeZone);
    return localDate.format('DD/MM/YYYY HH:mm');
  } catch {
    return 'Sin fecha';
  }
}

/**
 * Convierte una fecha del backend a formato YYYY-MM-DD para input type="date"
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    // Si ya está en formato YYYY-MM-DD, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si tiene hora (ISO completo), extraer solo la fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // Intentar parsear con dayjs y formatear
    const date = dayjs(dateString);
    if (date.isValid()) {
      return date.format('YYYY-MM-DD');
    }
    
    return dateString;
  } catch {
    return '';
  }
}
