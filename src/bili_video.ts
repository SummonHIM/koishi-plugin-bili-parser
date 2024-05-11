import { Context } from "koishi";
import { Config } from ".";

export class Bili_Video {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 解析 ID 类型
   * @param id 视频 ID
   * @returns type: ID 类型, id: 视频 ID
   */
  private vid_type_parse(id: string) {
    var idRegex = [
      {
        pattern: /av([0-9]+)/i,
        type: "av",
      },
      {
        pattern: /bv([0-9a-zA-Z]+)/i,
        type: "bv",
      },
    ];

    for (const rule of idRegex) {
      var match = id.match(rule.pattern);
      if (match) {
        return {
          type: rule.type,
          id: match[1],
        };
      }
    }

    return {
      type: null,
      id: null,
    };
  }

  /**
   * 根据视频 ID 查找视频信息
   * @param id 视频 ID
   * @returns 视频信息 Json
   */
  async fetch_video_info(id: string) {
    var ret: string[];
    const vid = this.vid_type_parse(id);
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
    if (!info || !info["data"]) return null;

    var ret = `${info["data"]["title"]}\n`;

    this.config.bVideoImage
      ? (ret += `<img src=\"${info["data"]["pic"]}\"/>\n`)
      : null;

    this.config.bVideoDesc ? (ret += `${info["data"]["desc"]}\n`) : null;

    this.config.bVideoStat
      ? (ret += `点赞：${info["data"]["stat"]["like"]}\t\t投币：${info["data"]["stat"]["coin"]}
收藏：${info["data"]["stat"]["favorite"]}\t\t转发：${info["data"]["stat"]["share"]}\n`)
      : null;

    switch (this.config.bVideoIDPreference) {
      case "bv":
        ret += `https://www.bilibili.com/video/${info["data"]["bvid"]}\n`;
        break;
      case "av":
        ret += `https://www.bilibili.com/video/av${info["data"]["aid"]}\n`;
        break;
      default:
        break;
    }

    return ret;
  }
}
