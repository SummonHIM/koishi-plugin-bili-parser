import { Context } from "koishi";
import { vid_type_parse } from "./link_parse";

export class Bili_Live {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
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

    var ret = info["data"]["title"] + "\n";
    ret += `<img src=\"${info["data"]["keyframe"]}\"/>`;
    ret += info["data"]["description"] + "\n";
    ret +=
      "观看：" +
      info["data"]["online"] +
      "\t关注：" +
      info["data"]["attention"] +
      "\n";
    ret += "https://live.bilibili.com/" + info["data"]["room_id"] + "\n";
    return ret;
  }
}
