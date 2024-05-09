import { Context } from "koishi";

export class Bili_Live {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
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
      "https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + id
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
    if (!info && !info["data"]) return null;

    var ret = `[${this.getStatusText(info["data"]["live_status"])}] ${info["data"]["title"]}\n`;
    ret += `<img src=\"${info["data"]["keyframe"]}\" />`;
    ret += info["data"]["description"] + "\n";
    ret += `观看：${info["data"]["online"]}\t关注：${info["data"]["attention"]}\n`;
    ret += `https://live.bilibili.com/${info["data"]["room_id"]}`;
    return ret;
  }
}
