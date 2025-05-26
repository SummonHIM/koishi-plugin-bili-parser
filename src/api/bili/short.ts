import { runtime } from "../..";

/**
 * 根据短链接重定向获取正常链接
 * @param id 短链接 ID
 * @returns 正常链接
 */
export async function get_redir_url(id: string): Promise<string> {
  const data = await runtime.ctx.http.get(`https://b23.tv/${id}`, {
    redirect: "manual",
    headers: {
      "User-Agent": runtime.config.userAgent,
    },
  });

  try {
    const match = data.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/i);
    return match[1] as string;
  } catch {
    return null;
  }
}

/**
 * 使用 Puppeteer 根据短链接重定向获取正常链接
 * @param id 短链接 ID
 * @returns 正常链接
 */
export async function puppeteer_get_redir_url(id: string): Promise<string> {
  if (!runtime.ctx.puppeteer)
    throw new Error("Please enable puppeteer service.");

  const browser = runtime.ctx.puppeteer.browser;
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (runtime.config.userAgent) {
    await page.setUserAgent(runtime.config.userAgent);
  }

  let ret: string;
  try {
    await page.goto(`https://b23.tv/${id}`, {
      waitUntil: "domcontentloaded",
    });

    ret = await page.evaluate(() => {
      return window.location.href;
    });
  } finally {
    await page.close();
    await context.close();
  }

  return ret;
}
