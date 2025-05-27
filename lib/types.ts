/**
 * Espaço reservado para tipos futuros
 */
export type PlaceholderType = any; 

/**
 * Tipos para o Triolingo
 */

// Cores da roleta
export type RouletteColor = 'red' | 'black';

// Resultado da aposta
export interface BetResult {
  success: boolean;
  color: RouletteColor;
  pointsWon: number;
  pointsLost: number;
  newTotal: number;
} 