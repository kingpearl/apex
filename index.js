"use strict";

const path = require("path");
const fetch = require("node-fetch");
const DailyWallpaper = require("daily-wallpaper");

const WALLS_TREE_URL =
  "https://api.github.com/repos/dharmx/walls/git/trees/main?recursive=1";
const WALLS_RAW_BASE = "https://raw.githubusercontent.com/dharmx/walls/main/";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);

async function _getBingWallpaper() {
  const idx = Math.floor(Math.random() * 8);
  try {
    const res = await fetch(
      `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=1&mkt=en-US`,
    );
    const {
      images: [wallpaperSource],
    } = await res.json();
    const url =
      "http://www.bing.com" + wallpaperSource.url.replaceAll("1920x1080", "UHD");
    console.log(url);
    return { url, extension: "jpg" };
  } catch (err) {
    console.error("Could not fetch wallpaper source from Bing");
    throw err;
  }
}

async function _getWallsWallpaper() {
  try {
    const res = await fetch(WALLS_TREE_URL);
    const { tree } = await res.json();
    const images = tree.filter(
      (entry) =>
        entry.type === "blob" &&
        IMAGE_EXT.has(path.extname(entry.path).toLowerCase()),
    );
    const pick = images[Math.floor(Math.random() * images.length)];
    const url = WALLS_RAW_BASE + pick.path;
    const extension = path.extname(pick.path).slice(1).toLowerCase();
    console.log(url);
    return { url, extension };
  } catch (err) {
    console.error("Could not fetch wallpaper source from dharmx/walls");
    throw err;
  }
}

async function _resolveSource(source) {
  const choice =
    source === "random" || !source
      ? Math.random() < 0.5
        ? "bing"
        : "walls"
      : source;
  if (choice === "bing") return _getBingWallpaper();
  if (choice === "walls") return _getWallsWallpaper();
  throw new Error(`Unknown source: ${source}`);
}

module.exports = async function (directory, source) {
  const dailyWallpaper = new DailyWallpaper();

  dailyWallpaper.getWallpaperSource = async function (done) {
    try {
      const resolved = await _resolveSource(source);
      done(null, resolved);
    } catch (err) {
      done(err);
    }
  };

  dailyWallpaper.setDirectory(directory);

  return new Promise((resolve, reject) => {
    dailyWallpaper.setDailyWallpaper(function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
