import type { Context } from "koishi";
import Handlebars from "handlebars";
import { type Config, logger } from "..";

export class Bili_Article {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 根据专栏 ID 查找专栏信息
   * @param id 专栏 ID
   * @returns 专栏信息 Json
   */
  async fetch_article_info(id: string) {
    const ret = await this.ctx.http.get(
      `https://api.bilibili.com/x/article/viewinfo?id=${id.replace(/^cv/, "")}`,
      {
        headers: {
          "User-Agent": this.config.userAgent,
          Cookie: this.config.cookies,
        },
      }
    );
    return ret;
  }

  /**
   * 生成专栏信息
   * @param id 专栏 ID
   * @returns 文字专栏信息
   */
  async gen_context(id: string, config: Config) {
    const info = await this.fetch_article_info(id);

    switch (info.code) {
      case -404:
        return "文章不存在";
      default:
        if (info.code !== 0) return `BiliBili 返回错误代码：${info.code}`;
    }

    Handlebars.registerHelper("getArticleID", () => {
      return id.replace(/^cv/, "");
    });

    const template = Handlebars.compile(this.config.bArticleRetPreset);
    logger.debug("bArticle api return: ", info.data);
    return template(info.data);
  }
}
