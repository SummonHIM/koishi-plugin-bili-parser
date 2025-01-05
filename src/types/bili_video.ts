import type { Context, Dict } from "koishi"
import Handlebars from "handlebars"
import { type Config, logger } from ".."

export class Bili_Video {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 解析 ID 类型
   * @param id 视频 ID
   * @returns type: ID 类型, id: 视频 ID
   */
  private vid_type_parse(id: string): { type: string; id: string } {
    const idRegex = [
      { pattern: /av([0-9]+)/i, type: "av" },
      { pattern: /bv([0-9a-zA-Z]+)/i, type: "bv" },
    ]

    let ret = { type: null, id: null }

    for (const regex of idRegex) {
      const match = id.match(regex.pattern)
      if (match) {
        ret = {
          type: regex.type,
          id: match[1],
        }
      }
    }

    return ret
  }

  /**
   * 根据视频 ID 查找视频信息
   * @param id 视频 ID
   * @returns 视频信息 Json
   */
  async fetch_video_info(id: string) {
    let ret: Dict
    const vid = this.vid_type_parse(id)
    switch (vid.type) {
      case "av":
        ret = await this.ctx.http.get(
          `https://api.bilibili.com/x/web-interface/view?aid=${vid.id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              Cookie: this.config.cookies,
            },
          }
        )
        break
      case "bv":
        ret = await this.ctx.http.get(
          `https://api.bilibili.com/x/web-interface/view?bvid=${vid.id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              Cookie: this.config.cookies,
            },
          }
        )
        break
    }

    return ret
  }

  /**
   * 生成视频信息
   * @param id 视频 ID
   * @returns 文字视频信息
   */
  async gen_context(id: string, config: Config) {
    const info = await this.fetch_video_info(id)

    switch (info.code) {
      case -404:
        return "视频不存在"
      default:
        if (info.code !== 0) return `BiliBili 返回错误代码：${info.code}`
    }

    const template = Handlebars.compile(this.config.bVideoRetPreset)
    logger.debug("bVideo api return: ", info.data)
    return template(info.data)
  }
}
