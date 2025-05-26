import { Dict } from "koishi";

import { runtime } from "../..";
import { BiliAPI } from ".";

interface BGMType {
  type: string;
  id: string;
}

/**
 * 解析 ID 类型
 * @param id 番剧集 ID
 * @returns type: ID 类型, id: 番剧集 ID
 */
function bgm_type_parse(id: string): BGMType {
  const idRegex = [
    { pattern: /ep([0-9]+)/i, type: "ep" },
    { pattern: /ss([0-9]+)/i, type: "ss" },
  ];

  let ret: BGMType;

  for (const rule of idRegex) {
    const match = id.match(rule.pattern);
    if (match) {
      ret = {
        type: rule.type,
        id: match[1],
      };
    }
  }

  return ret;
}

/**
 * 获取番剧集基本信息
 * @param id 番剧集 ID
 * @returns API 内容
 */
export async function fetch_web_api(id: string): Promise<BiliAPI<Dict>> {
  let url: string;
  const bgm = bgm_type_parse(id);

  switch (bgm.type) {
    case "ep":
      url = `https://api.bilibili.com/pgc/view/web/season?ep_id=${bgm.id}`;
      break;
    case "ss":
      url = `https://api.bilibili.com/pgc/view/web/season?season_id=${bgm.id}`;
      break;
    default:
      throw new Error(`No such bangumi type: ${bgm.type}`);
  }

  const ret = await runtime.ctx.http.get<BiliAPI<Dict>>(url, {
    headers: {
      Host: "api.bilibili.com",
      "User-Agent": runtime.config.userAgent,
    },
  });

  ret.data = ret.result;
  return ret;
}

/**
 * 获取番剧集基本信息
 * @param id 番剧集 ID
 * @returns API 内容
 */
export async function fetch_mdid_api(id: string): Promise<BiliAPI<Dict>> {
  const mdInfo: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.bilibili.com/pgc/review/user?media_id=${id.replace(/^md/, "")}`,
    {
      headers: {
        Host: "api.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );

  if (!mdInfo.result) {
    throw new Error("Fetch bangumi infomation via mdid failed!");
  }

  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.bilibili.com/pgc/view/web/season?season_id=${mdInfo.result.media.season_id}`,
    {
      headers: {
        Host: "api.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  ret.data = ret.result;
  return ret;
}

/**
 * 使用 Puppeteer 获取番剧集基本信息
 * @param id 番剧集 ID
 * @returns API 内容
 */
export async function puppeteer_fetch_web_api(id: string) {
  if (!runtime.ctx.puppeteer)
    throw new Error("Please enable puppeteer service.");

  let url: string;
  const bgm = bgm_type_parse(id);

  switch (bgm.type) {
    case "ep":
      url = `https://api.bilibili.com/pgc/view/web/season?ep_id=${bgm.id}`;
      break;
    case "ss":
      url = `https://api.bilibili.com/pgc/view/web/season?season_id=${bgm.id}`;
      break;
    default:
      throw new Error(`No such bangumi type: ${bgm.type}`);
  }

  const browser = runtime.ctx.puppeteer.browser;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (runtime.config.userAgent) {
    await page.setUserAgent(runtime.config.userAgent);
  }

  let ret: BiliAPI<Dict>;
  try {
    await page.goto(`https://www.bilibili.com/bangumi/play/${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(url, { waitUntil: "load" });

    ret = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
  } finally {
    await page.close();
    await context.close();
  }

  ret.data = ret.result;
  return ret;
}

/**
 * 使用 Puppeteer 获取番剧集基本信息
 * @param id 番剧集 ID
 * @returns API 内容
 */
export async function puppeteer_fetch_mdid_api(id: string) {
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
    await page.goto(`https://www.bilibili.com/bangumi/media/${id}`, {
      waitUntil: "networkidle2",
    });

    await page.goto(
      `https://api.bilibili.com/pgc/review/user?media_id=${id.replace(/^md/, "")}`,
      {
        waitUntil: "load",
      },
    );
    const mdInfo: BiliAPI<Dict> = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
    if (!mdInfo.result) {
      throw new Error("Fetch bangumi infomation via mdid failed!");
    }

    await page.goto(
      `https://api.bilibili.com/pgc/view/web/season?season_id=${mdInfo.result.media.season_id}`,
      { waitUntil: "load" },
    );
    ret = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
  } finally {
    await page.close();
    await context.close();
  }

  ret.data = ret.result;
  return ret;
}
