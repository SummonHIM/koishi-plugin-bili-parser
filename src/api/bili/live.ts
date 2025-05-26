import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 解析直播状态
 * @param statusCode 状态代码
 * @returns 状态文字
 */
export function getStatusText(statusCode: number) {
  switch (statusCode) {
    case 0:
      return "未开播";
    case 1:
      return "直播中";
    case 2:
      return "轮播中";
    default:
      return "未知状态";
  }
}

/**
 * 获取直播间基本信息
 * @param id 直播间 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${id}`,
    {
      headers: {
        Host: "api.live.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}

/**
 * 使用 Puppeteer 获取直播基本信息
 * @param id 直播间 ID
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
    await page.goto(`https://live.bilibili.com/${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(
      `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${id}`,
      { waitUntil: "load" },
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
