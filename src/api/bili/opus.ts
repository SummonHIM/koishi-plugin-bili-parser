import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 获取动态详情
 * @param id 动态 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${id}`,
    {
      headers: {
        Host: "api.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}

/**
 * 使用 Puppeteer 获取动态基本信息
 * @param id 动态 ID
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
    await page.goto(`https://www.bilibili.com/opus/${id}`, {
      waitUntil: "networkidle2",
    });
    await page.goto(
      `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${id}`,
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
