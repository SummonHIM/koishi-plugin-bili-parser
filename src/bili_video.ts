import { Context } from "koishi";
import { Config } from ".";
import numeral from "./numeral";

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
          "https://api.bilibili.com/x/web-interface/view?aid=" + vid["id"],
          {
            headers: {
              "User-Agent": this.config.userAgent,
            },
          }
        );
        break;
      case "bv":
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/x/web-interface/view?bvid=" + vid["id"],
          {
            headers: {
              "User-Agent": this.config.userAgent,
            },
          }
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

    this.config.bVideoOwner
      ? (ret += `UP主： ${info["data"]["owner"]["name"]}\n`)
      : null;

    this.config.bVideoDesc ? (ret += `${info["data"]["desc"]}\n`) : null;

    this.config.bVideoStat
      ? (ret += `点赞：${numeral(
          info["data"]["stat"]["like"],
          this.config
        )}\t\t投币：${numeral(info["data"]["stat"]["coin"], this.config)}\n`)
      : null;

    this.config.bVideoStat
      ? (ret += `收藏：${numeral(
          info["data"]["stat"]["favorite"],
          this.config
        )}\t\t转发：${numeral(info["data"]["stat"]["share"], this.config)}\n`)
      : null;

    this.config.bVideoExtraStat
      ? (ret += `观看：${numeral(
          info["data"]["stat"]["view"],
          this.config
        )}\t\t弹幕：${numeral(info["data"]["stat"]["danmaku"], this.config)}\n`)
      : null;

    switch (this.config.bVideoIDPreference) {
      case "av":
        ret += `https://www.bilibili.com/video/av${info["data"]["aid"]}\n`;
        break;
      case "bv":
      default:
        ret += `https://www.bilibili.com/video/${info["data"]["bvid"]}\n`;
        break;
    }

    return ret;
  }
}
