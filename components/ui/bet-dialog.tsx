'use client';

import React from 'react';
import Image from 'next/image';
import Dialog from './dialog';
import MotionButton from './motion-button';
import { useTheme } from './theme-provider';

interface BetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BetDialog: React.FC<BetDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="🧠 90% dos apostadores">
      <div className="flex flex-col items-center">
        <div className="relative w-full h-[300px] mb-4 overflow-hidden rounded-lg">
          <Image
            src="/images/bet.jpg"
            alt="Imagem de mineradores"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        
        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        💸 Desistem a um passo do grande prêmio.

        </p>
        
        <div className="flex justify-center space-x-4 w-full">
          <MotionButton
            onClick={onClose}
            className={`${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } px-4 py-2 rounded-lg transition-colors duration-200 shadow-md flex-1`}
          >
            Voltar às apostas
          </MotionButton>
          
          <MotionButton
            onClick={onConfirm}
            className={`${
              isDarkMode 
                ? 'bg-red-700 text-white hover:bg-red-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            } px-4 py-2 rounded-lg transition-colors duration-200 shadow-md flex-1`}
          >
            Desistir
          </MotionButton>
        </div>
      </div>
    </Dialog>
  );
};

export default BetDialog; 