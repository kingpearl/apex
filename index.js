"use strict";

const fetch = require("node-fetch");
const DailyWallpaper = require("daily-wallpaper");

/**
 * Call the callback with the wallpaper url when done
 * (and with an optionnal error as first parameter).
 */
async function _getBingWallpaper() {
  try {
    const res = await fetch(
      "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US",
    );
    const {
      images: [wallpaperSource],
    } = await res.json();
    console.log(wallpaperSource);
    return wallpaperSource;
  } catch (err) {
    console.error("Could not fetch wallpaper source from Bing");
    throw err;
  }
}

/**
 * Fetches and set the current bing wallpaper as wallpaper
 */
module.exports = async function (directory) {
  const dailyWallpaper = new DailyWallpaper();

  dailyWallpaper.getWallpaperSource = async function (done) {
    try {
      const source = await _getBingWallpaper();
      const url =
        "http://www.bing.com" + source.url.replaceAll("1920x1080", "UHD");
      console.log(url);
      done(null, {
        url,
        extension: "jpg",
      });
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
