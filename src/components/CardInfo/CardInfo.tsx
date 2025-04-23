import React, { useState, useEffect } from 'react';
import styles from './CardInfo.module.css';
import { FACTIONS, getCardById, CARDS_DATA } from '../../constants/cards';

const CARD_WIDTH = 269;
const CARD_HEIGHT = 400;
const CARD_X_OFFSET = 279;
const CARD_Y_OFFSET = 410;

const CARD_IMAGES_MAP = {
  "ace.png": { x: 0 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "akainu.png": { x: 1 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "aokiji.png": { x: 2 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "apoo.png": { x: 3 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "zoro.png": { x: 4 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "bb.png": { x: 5 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "bbeckman.png": { x: 6 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "bonney.png": { x: 7 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "primewb.png": { x: 8 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "robin.png": { x: 9 * CARD_X_OFFSET, y: 0 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "broggy.png": { x: 0 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "brook.png": { x: 1 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "buggy.png": { x: 2 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "capone.png": { x: 3 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "chopper.png": { x: 4 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "crocodile.png": { x: 5 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "doffy.png": { x: 6 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "donkrieg.png": { x: 7 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "urouge.png": { x: 8 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "usopp.png": { x: 9 * CARD_X_OFFSET, y: 1 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "dorry.png": { x: 0 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "dragon.png": { x: 1 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "drake.png": { x: 2 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "enel.png": { x: 3 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "franky.png": { x: 4 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "hancock.png": { x: 5 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "hawkins.png": { x: 6 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "jango.png": { x: 7 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "rockstar.png": { x: 8 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "roger.png": { x: 9 * CARD_X_OFFSET, y: 2 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "jinbei.png": { x: 0 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "kid.png": { x: 1 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "killer.png": { x: 2 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "kizaru.png": { x: 3 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "kuma.png": { x: 4 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "kuro.png": { x: 5 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "law.png": { x: 6 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "luckyroux.png": { x: 7 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "yasopp.png": { x: 8 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "zeff.png": { x: 9 * CARD_X_OFFSET, y: 3 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "luffy.png": { x: 0 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "marco.png": { x: 1 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "marguerite.png": { x: 2 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "mihawk.png": { x: 3 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "moria.png": { x: 4 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "mr1.png": { x: 5 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "mr2.png": { x: 6 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "mr3.png": { x: 7 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "sabo.png": { x: 8 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "sanji.png": { x: 9 * CARD_X_OFFSET, y: 4 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "msdoublefinger.png": { x: 0 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "msgoldenweek.png": { x: 1 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "nami.png": { x: 2 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "oldgarp.png": { x: 3 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "oldrayleigh.png": { x: 4 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "oldwb.png": { x: 5 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "primegarp.png": { x: 6 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "primerayleigh.png": { x: 7 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "shanks.png": { x: 8 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
  "smoker.png": { x: 9 * CARD_X_OFFSET, y: 5 * CARD_Y_OFFSET, width: CARD_WIDTH, height: CARD_HEIGHT },
};

// Функции из untitled проекта
const extractCardFromAtlas = async (imageName: string) => {
  const coords = CARD_IMAGES_MAP[imageName as keyof typeof CARD_IMAGES_MAP];
  if (!coords) return null;
  
  try {
    const atlasImage = new Image();
    atlasImage.crossOrigin = 'anonymous';
    
    const atlasLoaded = new Promise<void>((resolve, reject) => {
      atlasImage.onload = () => resolve();
      atlasImage.onerror = () => reject(new Error('Не удалось загрузить атлас карт'));
      atlasImage.src = '/cardatlas.png';
    });
    
    await atlasLoaded;
    
    const canvas = document.createElement('canvas');
    canvas.width = coords.width;
    canvas.height = coords.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(
      atlasImage,
      coords.x, coords.y, coords.width, coords.height,
      0, 0, coords.width, coords.height
    );
    
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Ошибка при вырезании карточки:', error);
    return null;
  }
};

const getCardImageUrl = async (imageName: string) => {
  const blob = await extractCardFromAtlas(imageName);
  if (!blob) return null;
  
  return URL.createObjectURL(blob);
};

// Получение имени персонажа без расширения файла
const getCharacterName = (fileName: string) => {
  return fileName.replace('.png', '');
};

// Получение фракций карты
const getCardFactions = (imageName: string): string[] => {
  const card = CARDS_DATA.find(card => card.image === imageName);
  if (!card) return [];
  return card.factions.map(factionId => FACTIONS[factionId]);
};

const CardInfo: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const cardNames = Object.keys(CARD_IMAGES_MAP);

  // Загрузка изображения выбранной карты
  useEffect(() => {
    let isMounted = true;

    const loadCardImage = async () => {
      if (!selectedCard) return;
      
      try {
        const imageUrl = await getCardImageUrl(selectedCard);
        if (isMounted && imageUrl) {
          setCardImage(imageUrl);
        }
      } catch (error) {
        console.error('Ошибка загрузки карточки:', error);
      }
    };

    loadCardImage();

    return () => {
      isMounted = false;
      // Освобождаем ресурсы предыдущего URL
      if (cardImage) {
        URL.revokeObjectURL(cardImage);
      }
    };
  }, [selectedCard]);

  // Выбор карточки из списка
  const handleCardSelect = (cardName: string) => {
    setSelectedCard(cardName);
  };

  // Получение фракций для выбранной карты
  const getSelectedCardFactions = () => {
    if (!selectedCard) return '';
    const factions = getCardFactions(selectedCard);
    return factions.join(', ');
  };

  return (
    <div className={styles.cardinfoContainer}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          Информация о картах
        </div>
        <div className={styles.headerButtons}>
          <a href="/game" className={styles.drawButton}>
            Game
          </a>
          <a href="/login" className={styles.logoutButton}>
            Login
          </a>
        </div>
      </div>
      
      <div className={styles.cardInfoContainer}>
        <div className={styles.cardDisplay}>
          {cardImage ? (
            <>
              <img 
                src={cardImage} 
                alt={`Карта ${getCharacterName(selectedCard || '')}`} 
                className={styles.cardImage}
              />
              <div className={styles.cardFaction}>
                Фракции: {getSelectedCardFactions()}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              {selectedCard 
                ? 'Загрузка карточки...' 
                : 'Выберите карточку из списка'}
            </div>
          )}
        </div>
        
        <div className={styles.cardList}>
          <h3>Список доступных карт</h3>
          <div className={styles.cardsGrid}>
            {cardNames.map((cardName) => (
              <button
                key={cardName}
                className={`${styles.cardButton} ${selectedCard === cardName ? styles.selected : ''}`}
                onClick={() => handleCardSelect(cardName)}
              >
                {getCharacterName(cardName)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <footer className={styles.footer}>
        <div className={styles.footerButtons}>
          <a href="/game" className={styles.footerButton}>Game</a>
          <a href="/login" className={styles.footerButton}>Login</a>
        </div>
        <p>This site is a One Piece universe card game. View all available cards and their details here.</p>
      </footer>
    </div>
  );
};

export default CardInfo; 