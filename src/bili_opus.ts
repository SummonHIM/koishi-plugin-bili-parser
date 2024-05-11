import { Context } from "koishi";
import { Config } from ".";
import numeral from "./numeral";

export class Bili_Opus {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 根据动态 ID 查找动态信息
   * @param id 动态 ID
   * @returns 动态信息 Json
   */
  async fetch_article_info(id: string) {
    var ret = await this.ctx.http.get(
      "https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=" + id,
      {
        headers: {
          "User-Agent": this.config.userAgent,
        },
      }
    );
    return ret;
  }

  /**
   * 生成动态信息
   * @param id 动态 ID
   * @returns 文字动态信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_article_info(id);
    if (!info || !info["data"] || info["data"].length === 0) return null;
    const modules = info["data"]["item"]["modules"];

    var ret = `${modules["module_author"]["name"]}的动态\n`;

    ret += `${modules["module_dynamic"]["desc"]["text"]}\n\n`;

    this.config.bOpusImage
      ? modules["module_dynamic"]["major"]["draw"]["items"].forEach(
          (item: any) => {
            ret += `<img src=\"${item["src"]}\"/>`;
          }
        )
      : null;

    this.config.bOpusStat
      ? (ret += `转发：${numeral(
          modules["module_stat"]["forward"]["count"],
          this.config
        )} | 评论：${numeral(
          modules["module_stat"]["comment"]["count"],
          this.config
        )} | 点赞：${numeral(
          modules["module_stat"]["like"]["count"],
          this.config
        )}\n`)
      : null;

    ret += `https://www.bilibili.com/opus/${info["data"]["item"]["id_str"]}`;
    return ret;
  }
}
