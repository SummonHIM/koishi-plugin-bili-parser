import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 获取音乐基本信息
 * @param id 音乐 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
    {
      headers: {
        Host: "www.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}

/**
 * 获取歌单基本信息
 * @param id 歌单 ID
 * @returns API 内容
 */
export async function fetch_am_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`,
    {
      headers: {
        Host: "www.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}

/**
 * 使用 Puppeteer 获取音乐基本信息
 * @param id 音乐 ID
 * @returns API 内容
 */
export async function puppeteer_fetch_api(id: string) {
  if (!runtime.ctx.puppeteer)
    throw new Error("Please enable puppeteer service.");

  const browser = runtime.ctx.puppeteer.browser;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (runtime.config.userAgent) {
    await page.setUserAgent(runtime.config.userAgent);
  }

  let ret: BiliAPI<Dict>;
  try {
    await page.goto(`https://www.bilibili.com/audio/au${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(
      `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
      { waitUntil: "networkidle2" },
    );

    ret = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
  } finally {
    await page.close();
    await context.close();
  }

  return ret;
}

/**
 * 使用 Puppeteer 获取歌单基本信息
 * @param id 歌单 ID
 * @returns API 内容
 */
export async function puppeteer_fetch_am_api(id: string) {
  if (!runtime.ctx.puppeteer)
    throw new Error("Please enable puppeteer service.");

  const browser = runtime.ctx.puppeteer.browser;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (runtime.config.userAgent) {
    await page.setUserAgent(runtime.config.userAgent);
  }

  let ret: BiliAPI<Dict>;
  try {
    await page.goto(`https://www.bilibili.com/audio/am${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(
      `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`,
      { waitUntil: "networkidle2" },
    );

    ret = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
  } finally {
    await page.close();
    await context.close();
  }

  return ret;
}
