import { Context } from "koishi";

export class Bili_Short {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * 根据短链接重定向获取正常链接
   * @param id 短链接 ID
   * @returns 正常链接
   */
  async get_redir_url(id: string) {
    var data = await this.ctx.http.get("https://b23.tv/" + id, {
      redirect: "manual",
    });

    const match = data.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/i);
    if (match) return match[1];
    else return null;
  }
}
