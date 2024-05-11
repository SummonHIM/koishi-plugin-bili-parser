import { Context } from "koishi";
import { Config } from ".";
import numeral from "./numeral";

export class Bili_Live {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 解析直播状态
   * @param statusCode 状态代码
   * @returns 状态文字
   */
  private getStatusText(statusCode) {
    switch (statusCode) {
      case 0:
        return "未开播";
      case 1:
        return "直播中";
      case 2:
        return "轮播中";
      default:
        return "未知状态";
    }
  }

  /**
   * 根据直播 ID 查找直播信息
   * @param id 直播 ID
   * @returns 直播信息 Json
   */
  async fetch_video_info(id: string) {
    var ret = await this.ctx.http.get(
      "https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + id,
      {
        headers: {
          "User-Agent": this.config.userAgent,
        },
      }
    );
    return ret;
  }

  /**
   * 生成直播信息
   * @param id 直播 ID
   * @returns 文字直播信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_video_info(id);
    if (!info || !info["data"] || info["data"].length === 0) return null;

    var ret = `[${this.getStatusText(info["data"]["live_status"])}] ${
      info["data"]["title"]
    }\n`;

    this.config.bLiveImage
      ? (ret += `<img src=\"${info["data"]["keyframe"]}\" />\n`)
      : null;

    this.config.bLiveDesc ? (ret += `${info["data"]["description"]}\n`) : null;

    this.config.bLiveStat
      ? (ret += `观看：${numeral(
          info["data"]["online"],
          this.config
        )}\t\t关注：${numeral(info["data"]["attention"], this.config)}\n`)
      : null;

    ret += `https://live.bilibili.com/${info["data"]["room_id"]}`;
    return ret;
  }
}
