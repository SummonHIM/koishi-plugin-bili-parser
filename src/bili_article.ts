import { Context } from "koishi";
import { Config } from ".";
import numeral from "./numeral";

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
    var ret = await this.ctx.http.get(
      "https://api.bilibili.com/x/article/viewinfo?id=" + id,
      {
        headers: {
          "User-Agent": this.config.userAgent,
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
  async gen_context(id: string) {
    const info = await this.fetch_article_info(id);
    if (!info || !info["data"] || info["data"].length === 0) return null;

    var ret = `${info["data"]["title"]}\n`;
    this.config.bArticleImage
      ? (ret += `<img src=\"${info["data"]["image_urls"][0]}\"/>\n`)
      : null;

    this.config.bArticleAuthor
      ? (ret += `UP主：${info["data"]["author_name"]}\n`)
      : null;

    this.config.bArticleStat
      ? (ret += `点赞：${numeral(
          info["data"]["stats"]["like"],
          this.config
        )}\t\t投币：${numeral(info["data"]["stats"]["coin"], this.config)}\n`)
      : null;

    this.config.bArticleStat
      ? (ret += `收藏：${numeral(
          info["data"]["stats"]["favorite"],
          this.config
        )}\t\t转发：${numeral(info["data"]["stats"]["share"], this.config)}\n`)
      : null;

    ret += `https://www.bilibili.com/read/cv${id}`;
    return ret;
  }
}
