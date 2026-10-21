// Wallpaper management utilities
// Centralized wallpaper list and shuffling logic

const WALLPAPERS = [
  '/wallpapers/Haikyuu-Hinata.mp4',
  '/wallpapers/Haikyuu-HinataKageyama.mp4',
  '/wallpapers/DemonSlayer-Kokushibo.mp4',
  '/wallpapers/SilentHill-Maria.mp4',
  '/wallpapers/VinlandSaga-Thorfinn.mp4',
  '/wallpapers/Arcane-JinxEkko.mp4',
  '/wallpapers/Spiderman2.mp4',
  '/wallpapers/Sekiro.mp4',
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

// Shuffled once per page load (Fisher-Yates), then shared by every caller
let shuffledWallpapers = null;

const getShuffledWallpapers = () => {
  if (!shuffledWallpapers) {
    shuffledWallpapers = [...WALLPAPERS];
    for (let i = shuffledWallpapers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWallpapers[i], shuffledWallpapers[j]] = [shuffledWallpapers[j], shuffledWallpapers[i]];
    }
  }
  return shuffledWallpapers;
};

export const getCurrentWallpaper = (index) => {
  const wallpapers = getShuffledWallpapers();
  return wallpapers.length ? wallpapers[index % wallpapers.length] : null;
};

export const getWallpaperCount = () => getShuffledWallpapers().length;

// Drop a wallpaper that failed to load for the rest of this visit. Everything
// after it shifts down one slot, so the same index now points at the next one.
export const markWallpaperBroken = (url) => {
  shuffledWallpapers = getShuffledWallpapers().filter((wallpaper) => wallpaper !== url);
};
