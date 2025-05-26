import { runtime } from "../..";

/**
 * 根据短链接重定向获取正常链接
 * @param id 短链接 ID
 * @returns 正常链接
 */
export async function get_redir_url(id: string) {
  const data = await runtime.ctx.http.get(`https://b23.tv/${id}`, {
    redirect: "manual",
    headers: {
      "User-Agent": runtime.config.userAgent,
    },
  });

  try {
    const match = data.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/i);
    return match[1];
  } catch {
    return null;
  }
}
