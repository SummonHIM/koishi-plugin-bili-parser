import type { Context } from "koishi"
import Handlebars from 'handlebars'
import { type Config, logger } from ".."

export class Bili_Live {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 解析直播状态
   * @param statusCode 状态代码
   * @returns 状态文字
   */
  private getStatusText(statusCode: number) {
    switch (statusCode) {
      case 0:
        return "未开播"
      case 1:
        return "直播中"
      case 2:
        return "轮播中"
      default:
        return "未知状态"
    }
  }

  /**
   * 根据直播 ID 查找直播信息
   * @param id 直播 ID
   * @returns 直播信息 Json
   */
  async fetch_video_info(id: string) {
    const ret = await this.ctx.http.get(
      `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${id}`,
      {
        headers: {
          "User-Agent": this.config.userAgent,
          "Cookie": this.config.cookies
        }
      }
    )
    return ret
  }

  /**
   * 生成直播信息
   * @param id 直播 ID
   * @returns 文字直播信息
   */
  async gen_context(id: string, config: Config) {
    const info = await this.fetch_video_info(id)
    if (info.code !== 0) throw (`Fetching live api failed. Code: ${info.code}`)

    Handlebars.registerHelper('formatLiveStatus', (value: number) => {
      return this.getStatusText(value)
    })
    const template = Handlebars.compile(this.config.bLiveRetPreset)
    logger.debug("bLive api return: ", info.data)
    return template(info.data)
  }
}
