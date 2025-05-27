import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o formato local do usuário
 * 
 * @param date Data como string ou objeto Date
 * @returns String formatada no padrão local (dd/mm/aaaa hh:mm)
 */
export function formatDateToLocale(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Filtra uma string para conter apenas letras, removendo números, 
 * pontuação, espaços e outros caracteres especiais
 * 
 * @param text String de entrada a ser filtrada
 * @param keepAccents Se deve manter acentos (padrão: true)
 * @param ignoreCase Se deve ignorar diferenças entre maiúsculas e minúsculas (padrão: true)
 * @returns String contendo apenas letras
 */
export function filterOnlyLetters(
  text: string, 
  keepAccents: boolean = true,
  ignoreCase: boolean = true
): string {
  if (!text) return '';
  
  let processedText = text;
  
  // Converter para minúsculas se ignoreCase for true
  if (ignoreCase) {
    processedText = processedText.toLowerCase();
  }
  
  if (keepAccents) {
    // Filtrar apenas letras (incluindo acentuadas) usando expressão regular
    // Esta expressão regular mantém letras de a-z, A-Z e letras acentuadas comuns em português
    return processedText.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '');
  } else {
    // Remover acentos primeiro
    processedText = processedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Depois filtrar apenas letras básicas (a-z, A-Z)
    return processedText.replace(/[^a-zA-Z]/g, '');
  }
}

/**
 * Compara duas strings ignorando diferenças de formatação, 
 * acentos, maiúsculas/minúsculas e caracteres não alfabéticos
 * 
 * @param str1 Primeira string para comparação
 * @param str2 Segunda string para comparação
 * @returns Verdadeiro se as strings forem equivalentes após filtragem
 */
export function compareLettersOnly(str1: string, str2: string): boolean {
  const filtered1 = filterOnlyLetters(str1, false, true);
  const filtered2 = filterOnlyLetters(str2, false, true);
  
  return filtered1 === filtered2;
}
