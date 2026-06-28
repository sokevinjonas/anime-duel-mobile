export interface PalierTheme {
  palier: number;
  name: string;
  startLevel: number;
  endLevel: number;
  avatar: {
    character: string; // Nom du personnage
    imagePath: string; // Chemin vers l'asset
  };
  background: {
    imagePath: string; // Image de fond
    overlayColor: string; // Overlay pour readability
    overlayOpacity: number;
  };
  colors: {
    light: {
      primary: string;
      secondary: string;
      pathBase: string;
      pathCompleted: string;
      clouds: string;
      lockedClouds: string;
    };
    dark: {
      primary: string;
      secondary: string;
      pathBase: string;
      pathCompleted: string;
      clouds: string;
      lockedClouds: string;
    };
  };
}

export const PALIER_THEMES: PalierTheme[] = [
  {
    palier: 0,
    name: 'Débutant',
    startLevel: 1,
    endLevel: 15,
    avatar: {
      character: 'Gon Freecss',
      imagePath: require('../../assets/paliers/palier-0-gon.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-0-nature.jpg'),
      overlayColor: '#E8F5E9',
      overlayOpacity: 0.7,
    },
    colors: {
      light: {
        primary: '#4CAF50',
        secondary: '#66BB6A',
        pathBase: '#A5D6A7',
        pathCompleted: '#4CAF50',
        clouds: '#C8E6C9',
        lockedClouds: '#E0E0E0',
      },
      dark: {
        primary: '#66BB6A',
        secondary: '#4CAF50',
        pathBase: '#2E7D32',
        pathCompleted: '#66BB6A',
        clouds: '#1F3039',
        lockedClouds: '#37515E',
      },
    },
  },
  {
    palier: 1,
    name: 'Guerrier du Feu',
    startLevel: 16,
    endLevel: 40,
    avatar: {
      character: 'Son Goku',
      imagePath: require('../../assets/paliers/palier-1-goku.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-1-fire.jpg'),
      overlayColor: '#FF6B35',
      overlayOpacity: 0.6,
    },
    colors: {
      light: {
        primary: '#FF6B35',
        secondary: '#FF8C42',
        pathBase: '#FFB88C',
        pathCompleted: '#FF6B35',
        clouds: '#FFCCBC',
        lockedClouds: '#FFE0B2',
      },
      dark: {
        primary: '#FF8C42',
        secondary: '#FF6B35',
        pathBase: '#D84315',
        pathCompleted: '#FF8C42',
        clouds: '#3E2723',
        lockedClouds: '#4E342E',
      },
    },
  },
  {
    palier: 2,
    name: 'Pirate des Mers',
    startLevel: 41,
    endLevel: 65,
    avatar: {
      character: 'Monkey D. Luffy',
      imagePath: require('../../assets/paliers/palier-2-luffy.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-2-ocean.jpg'),
      overlayColor: '#0277BD',
      overlayOpacity: 0.6,
    },
    colors: {
      light: {
        primary: '#0277BD',
        secondary: '#03A9F4',
        pathBase: '#81D4FA',
        pathCompleted: '#0277BD',
        clouds: '#B3E5FC',
        lockedClouds: '#E1F5FE',
      },
      dark: {
        primary: '#03A9F4',
        secondary: '#0277BD',
        pathBase: '#01579B',
        pathCompleted: '#03A9F4',
        clouds: '#1A237E',
        lockedClouds: '#283593',
      },
    },
  },
  {
    palier: 3,
    name: 'Maître de la Foudre',
    startLevel: 66,
    endLevel: 90,
    avatar: {
      character: 'Zenitsu Agatsuma',
      imagePath: require('../../assets/paliers/palier-3-zenitsu.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-3-lightning.jpg'),
      overlayColor: '#7B1FA2',
      overlayOpacity: 0.6,
    },
    colors: {
      light: {
        primary: '#7B1FA2',
        secondary: '#9C27B0',
        pathBase: '#CE93D8',
        pathCompleted: '#7B1FA2',
        clouds: '#E1BEE7',
        lockedClouds: '#F3E5F5',
      },
      dark: {
        primary: '#9C27B0',
        secondary: '#7B1FA2',
        pathBase: '#4A148C',
        pathCompleted: '#9C27B0',
        clouds: '#311B92',
        lockedClouds: '#4527A0',
      },
    },
  },
  {
    palier: 4,
    name: 'Gardien de la Forêt',
    startLevel: 91,
    endLevel: 115,
    avatar: {
      character: 'Tanjiro Kamado',
      imagePath: require('../../assets/paliers/palier-4-tanjiro.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-4-forest.jpg'),
      overlayColor: '#2E7D32',
      overlayOpacity: 0.65,
    },
    colors: {
      light: {
        primary: '#2E7D32',
        secondary: '#43A047',
        pathBase: '#81C784',
        pathCompleted: '#2E7D32',
        clouds: '#A5D6A7',
        lockedClouds: '#C8E6C9',
      },
      dark: {
        primary: '#43A047',
        secondary: '#2E7D32',
        pathBase: '#1B5E20',
        pathCompleted: '#43A047',
        clouds: '#263238',
        lockedClouds: '#37474F',
      },
    },
  },
  {
    palier: 5,
    name: 'Seigneur de Glace',
    startLevel: 116,
    endLevel: 140,
    avatar: {
      character: 'Todoroki Shoto',
      imagePath: require('../../assets/paliers/palier-5-todoroki.png'),
    },
    background: {
      imagePath: require('../../assets/backgrounds/palier-5-ice.jpg'),
      overlayColor: '#00BCD4',
      overlayOpacity: 0.6,
    },
    colors: {
      light: {
        primary: '#00BCD4',
        secondary: '#26C6DA',
        pathBase: '#80DEEA',
        pathCompleted: '#00BCD4',
        clouds: '#B2EBF2',
        lockedClouds: '#E0F7FA',
      },
      dark: {
        primary: '#26C6DA',
        secondary: '#00BCD4',
        pathBase: '#006064',
        pathCompleted: '#26C6DA',
        clouds: '#263238',
        lockedClouds: '#37474F',
      },
    },
  },
];

export const getPalierTheme = (level: number): PalierTheme => {
  return PALIER_THEMES.find(
    (theme) => level >= theme.startLevel && level <= theme.endLevel
  ) || PALIER_THEMES[0];
};

export const getPalierByNumber = (palierNumber: number): PalierTheme => {
  return PALIER_THEMES.find((theme) => theme.palier === palierNumber) || PALIER_THEMES[0];
};
