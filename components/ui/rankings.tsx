'use client';

import React, { useState, useEffect } from 'react';
import { getGeneralRanking, getLanguageRanking, RankingItem } from '@/lib/firebase';
import { Button } from './button';

// Interface para as props do componente
interface RankingsProps {
  className?: string;
  initialLanguage?: string;
}

// Componente Rankings
export const Rankings: React.FC<RankingsProps> = ({ 
  className = '', 
  initialLanguage = 'english'
}) => {
  // Estado para armazenar os rankings
  const [generalRanking, setGeneralRanking] = useState<RankingItem[]>([]);
  const [languageRanking, setLanguageRanking] = useState<RankingItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Idiomas disponíveis
  const availableLanguages = [
    { code: 'english', name: 'Inglês' },
    { code: 'spanish', name: 'Espanhol' },
    { code: 'french', name: 'Francês' },
    { code: 'german', name: 'Alemão' },
    { code: 'italian', name: 'Italiano' },
    { code: 'japanese', name: 'Japonês' },
    { code: 'korean', name: 'Coreano' },
    { code: 'chinese', name: 'Chinês' },
    { code: 'russian', name: 'Russo' },
    { code: 'portuguese', name: 'Português' },
  ];

  // Função para buscar os rankings
  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar ranking geral
      const generalData = await getGeneralRanking(10);
      setGeneralRanking(generalData.rankings);
      
      // Buscar ranking por idioma
      const languageData = await getLanguageRanking(selectedLanguage, 10);
      setLanguageRanking(languageData.rankings);
    } catch (err) {
      console.error('Erro ao buscar rankings:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao buscar rankings');
      }
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os rankings quando o componente montar ou o idioma mudar
  useEffect(() => {
    fetchRankings();
  }, [selectedLanguage]);

  // Função para mudar o idioma selecionado
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  // Renderizar o item do ranking
  const renderRankingItem = (item: RankingItem, index: number) => {
    // Classes CSS para destaque das posições do pódio
    const positionClass = 
      item.position === 1 ? 'border-yellow-300 bg-opacity-10' :
      item.position === 2 ? 'border-gray-300 bg-opacity-10' :
      item.position === 3 ? 'border-amber-300 bg-opacity-10' :
      'border-border-color';
    
    // Emoji para as posições do pódio
    const positionEmoji = 
      item.position === 1 ? '🥇' :
      item.position === 2 ? '🥈' :
      item.position === 3 ? '🥉' :
      '';
    
    return (
      <li 
        key={item.uid} 
        className={`flex items-center justify-between p-3 border rounded-md mb-2 card ${positionClass}`}
      >
        <div className="flex items-center">
          <span className="text-xl font-bold w-8 text-center">{item.position}</span>
          <span className="text-xl mr-2">{positionEmoji}</span>
          <span className="font-medium">{item.name}</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold text-secondary-color">{item.points} pts</span>
        </div>
      </li>
    );
  };

  // Exibir mensagem de carregamento
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex justify-center p-12">
          <div className="flex items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary-color mr-2"></div>
            <span>Carregando rankings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro
  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-error bg-opacity-10 p-4 rounded-md text-error mb-4">
          {error}
        </div>
        <Button onClick={fetchRankings} className="btn-primary">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Seletor de idioma */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Selecione um idioma:</h3>
        <div className="flex flex-wrap gap-2">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedLanguage === lang.code
                  ? 'bg-primary-color text-white'
                  : 'bg-opacity-10 hover:bg-opacity-20'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking geral */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Ranking Global 🌎</h2>
        {generalRanking.length > 0 ? (
          <ul>
            {generalRanking.map(renderRankingItem)}
          </ul>
        ) : (
          <div className="text-center p-4 card bg-opacity-5 rounded-md">
            Nenhum usuário encontrado no ranking global.
          </div>
        )}
      </div>

      {/* Ranking por idioma */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Ranking de {availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage} 
          {selectedLanguage === 'english' && ' 🇺🇸'}
          {selectedLanguage === 'spanish' && ' 🇪🇸'}
          {selectedLanguage === 'french' && ' 🇫🇷'}
          {selectedLanguage === 'german' && ' 🇩🇪'}
          {selectedLanguage === 'italian' && ' 🇮🇹'}
          {selectedLanguage === 'japanese' && ' 🇯🇵'}
          {selectedLanguage === 'korean' && ' 🇰🇷'}
          {selectedLanguage === 'chinese' && ' 🇨🇳'}
          {selectedLanguage === 'russian' && ' 🇷🇺'}
          {selectedLanguage === 'portuguese' && ' 🇧🇷'}
        </h2>
        {languageRanking.length > 0 ? (
          <ul>
            {languageRanking.map(renderRankingItem)}
          </ul>
        ) : (
          <div className="text-center p-4 card bg-opacity-5 rounded-md">
            Nenhum usuário encontrado no ranking de {availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}.
          </div>
        )}
      </div>
    </div>
  );
}; 