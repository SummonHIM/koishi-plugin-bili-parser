import type { Context } from "koishi"
import Handlebars from "handlebars"
import { type Config, logger } from ".."

export class Bili_Opus {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 根据动态 ID 查找动态信息
   * @param id 动态 ID
   * @returns 动态信息 Json
   */
  async fetch_article_info(id: string) {
    const ret = await this.ctx.http.get(
      `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${id}`,
      {
        headers: {
          "User-Agent": this.config.userAgent,
          Cookie: this.config.cookies,
        },
      }
    )
    return ret
  }

  /**
   * 生成动态信息
   * @param id 动态 ID
   * @returns 文字动态信息
   */
  async gen_context(id: string, config: Config) {
    const info = await this.fetch_article_info(id)

    switch (info.code) {
      case -404:
        return "动态不存在"
      default:
        if (info.code !== 0) return `BiliBili 返回错误代码：${info.code}`
    }

    const template = Handlebars.compile(this.config.bOpusRetPreset)
    logger.debug("bOpus api return: ", info.data.item)
    return template(info.data.item)
  }
}
