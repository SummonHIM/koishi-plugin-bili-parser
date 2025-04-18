import type { Context } from "koishi";
import type { Config } from "..";

export class Bili_Short {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 根据短链接重定向获取正常链接
   * @param id 短链接 ID
   * @returns 正常链接
   */
  async get_redir_url(id: string) {
    const data = await this.ctx.http.get(`https://b23.tv/${id}`, {
      redirect: "manual",
      headers: {
        "User-Agent": this.config.userAgent,
      },
    });

    try {
      const match = data.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/i);
      return match[1];
    } catch (error) {
      return null;
    }
  }
}
