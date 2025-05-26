import { Dict } from "koishi";

import { runtime } from "../..";
import { BiliAPI } from ".";

interface VIDType {
  type: string;
  id: string;
}

/**
 * 解析 ID 类型
 * @param id 视频 ID
 * @returns type: ID 类型, id: 视频 ID
 */
function vid_type_parse(id: string): VIDType {
  const idRegex = [
    { pattern: /av([0-9]+)/i, type: "av" },
    { pattern: /bv([0-9a-zA-Z]+)/i, type: "bv" },
  ];

  let ret: VIDType;

  for (const regex of idRegex) {
    const match = id.match(regex.pattern);
    if (match) {
      ret = {
        type: regex.type,
        id: match[1],
      };
    }
  }

  return ret;
}

/**
 * 获取视频基本信息
 * @param id 视频 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  let url: string;
  const vid = vid_type_parse(id);

  switch (vid.type) {
    case "av":
      url = `https://api.bilibili.com/x/web-interface/view?aid=${vid.id}`;
      break;
    case "bv":
      url = `https://api.bilibili.com/x/web-interface/view?bvid=${vid.id}`;
      break;
    default:
      throw new Error(`No such video type: ${vid.type}`);
  }

  const ret = await runtime.ctx.http.get<BiliAPI<Dict>>(url, {
    headers: {
      Host: "api.bilibili.com",
      "User-Agent": runtime.config.userAgent,
    },
  });

  return ret;
}

/**
 * 使用 Puppeteer 获取视频基本信息
 * @param id 视频 ID
 * @returns API 内容
 */
export async function puppeteer_fetch_api(id: string) {
  if (!runtime.ctx.puppeteer)
    throw new Error("Please enable puppeteer service.");

  let url: string;
  const vid = vid_type_parse(id);

  switch (vid.type) {
    case "av":
      url = `https://api.bilibili.com/x/web-interface/view?aid=${vid.id}`;
      break;
    case "bv":
      url = `https://api.bilibili.com/x/web-interface/view?bvid=${vid.id}`;
      break;
    default:
      throw new Error(`No such video type: ${vid.type}`);
  }

  const browser = runtime.ctx.puppeteer.browser;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (runtime.config.userAgent) {
    await page.setUserAgent(runtime.config.userAgent);
  }

  let ret: BiliAPI<Dict>;
  try {
    await page.goto(`https://www.bilibili.com/video/${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(url, { waitUntil: "networkidle2" });

    ret = await page.evaluate(() => {
      return JSON.parse(document.body.innerText);
    });
  } finally {
    await page.close();
    await context.close();
  }

  return ret;
}
