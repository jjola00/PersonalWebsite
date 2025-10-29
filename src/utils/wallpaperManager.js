// Wallpaper management utilities
// Centralized wallpaper list and shuffling logic

const WALLPAPERS = [
  '/wallpapers/Haikyuu-Hinata.mp4',
  '/wallpapers/Haikyuu-HinataKageyama.mp4',
  '/wallpapers/DemonSlayer-Kokushibo.mp4',
  '/wallpapers/SilentHill-Maria.mp4',
  '/wallpapers/VinlandSaga-Thorfinn.mp4',
  '/wallpapers/Arcane-JinxEkko.mp4',
  '/wallpapers/Spiderman-Spiderman.mp4',
  '/wallpapers/Sekiro-Sekiro.mp4',
  '/wallpapers/Genshin-Serai.mp4',
  '/wallpapers/Arcane-Jinx.mp4',
  '/wallpapers/EldenRing-Neightreign.mp4',
  '/wallpapers/EldenRing-Demigods.mp4',
  '/wallpapers/EldenRIng-RayaLucaria.mp4',
  '/wallpapers/EldenRing-Malekith.mp4',
  '/wallpapers/SpiderMan.mp4',
  '/wallpapers/KillBill.mp4',
  '/wallpapers/Makima.mp4',
  '/wallpapers/DarknessDevil.mp4'
];

// Singleton shuffled wallpapers instance
let shuffledWallpapers = null;

export const getShuffledWallpapers = () => {
  if (!shuffledWallpapers) {
    shuffledWallpapers = [...WALLPAPERS].sort(() => Math.random() - 0.5);
  }
  return shuffledWallpapers;
};

export const getCurrentWallpaper = (index) => {
  const wallpapers = getShuffledWallpapers();
  return wallpapers[index % wallpapers.length];
};

export const getWallpaperCount = () => {
  return WALLPAPERS.length;
};

// Reset shuffle (useful for testing or manual refresh)
export const reshuffleWallpapers = () => {
  shuffledWallpapers = [...WALLPAPERS].sort(() => Math.random() - 0.5);
  return shuffledWallpapers;
};