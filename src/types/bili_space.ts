import type { Context } from "koishi"
import Handlebars from "handlebars"
import { type Config, logger } from ".."

export class Bili_Space {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 根据用户 ID 查找用户信息
   * @param id 用户 ID
   * @returns 用户信息 Json
   */
  async fetch_space_info(id: string) {
    const ret = await this.ctx.http.get(
      `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${id}`,
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
   * 生成用户信息
   * @param id 用户 ID
   * @returns 文字用户信息
   */
  async gen_context(id: string, config: Config) {
    const info = await this.fetch_space_info(id)

    switch (info.code) {
      case -404:
        return "空间不存在"
      default:
        if (info.code !== 0) return `BiliBili 返回错误代码：${info.code}`
    }

    const template = Handlebars.compile(this.config.bSpaceRetPreset)
    logger.debug("bSpace api return: ", info.data.items[0].modules)
    return template(info.data.items[0].modules)
  }
}
