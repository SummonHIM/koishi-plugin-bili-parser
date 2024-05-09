import { Context } from "koishi";
import { vid_type_parse } from "./link_parse";

export class bili_video {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * 根据视频 ID 查找视频信息
   * @param id 视频 ID
   * @returns 视频信息
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
   * @returns 视频信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_video_info(id);
    if (!info && !info["data"]) return null;

    var ret = info["data"]["title"] + "\n";
    ret += `<img src=\"${info["data"]["pic"]}\"/>`
    ret += info["data"]["desc"] + "\n";
    ret +=
      "点赞：" +
      info["data"]["stat"]["like"] +
      "\t投币：" +
      info["data"]["stat"]["coin"] +
      "\n";
    ret +=
      "收藏：" +
      info["data"]["stat"]["favorite"] +
      "\t转发：" +
      info["data"]["stat"]["share"] +
      "\n";
    ret += "https://www.bilibili.com/video/" + info["data"]["bvid"] + "\n";
    return ret;
  }
}
