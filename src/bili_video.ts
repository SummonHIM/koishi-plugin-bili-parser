import { Context } from "koishi";
import { vid_type_parse } from "./link_parse";
import { Config } from ".";

export class Bili_Video {
  private ctx: Context;
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config
  }

  /**
   * 根据视频 ID 查找视频信息
   * @param id 视频 ID
   * @returns 视频信息 Json
   */
  async fetch_video_info(id: string) {
    var ret: string[];
    const vid = vid_type_parse(id);
    switch (vid["type"]) {
      case "av":
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/x/web-interface/view?aid=" + vid["id"]
        );
        break;
      case "bv":
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/x/web-interface/view?bvid=" + vid["id"]
        );
        break;
      default:
        ret = null;
        break;
    }
    return ret;
  }

  /**
   * 生成视频信息
   * @param id 视频 ID
   * @returns 文字视频信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_video_info(id);
    if (!info && !info["data"]) return null;

    var ret = info["data"]["title"] + "\n";
    ret += `<img src=\"${info["data"]["pic"]}\"/>`;
    ret += info["data"]["desc"] + "\n";
    ret += `点赞：${info["data"]["stat"]["like"]}\t\t投币：${info["data"]["stat"]["coin"]}\n`;
    ret += `收藏：${info["data"]["stat"]["favorite"]}\t\t转发：${info["data"]["stat"]["share"]}\n`;
    if (this.config.idPreference == "bv")
      ret += "https://www.bilibili.com/video/" + info["data"]["bvid"] + "\n";
    else if (this.config.idPreference == "av")
      ret += "https://www.bilibili.com/video/av" + info["data"]["aid"] + "\n";
    return ret;
  }
}
