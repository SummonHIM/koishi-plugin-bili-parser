import { Context } from "koishi";
import { Config } from ".";

export class Bili_Bangumi {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 解析 ID 类型
   * @param id 番剧 ID
   * @returns type: ID 类型, id: 番剧 ID
   */
  private bgm_type_parse(id: string) {
    var idRegex = [
      {
        pattern: /ep([0-9]+)/i,
        type: "ep",
      },
      {
        pattern: /ss([0-9]+)/i,
        type: "ss",
      },
      {
        pattern: /md([0-9]+)/i,
        type: "md",
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
   * 根据番剧 ID 查找番剧信息
   * @param id 番剧 ID
   * @returns 番剧信息 Json
   */
  async fetch_video_info(type: string, id: string) {
    var ret: string[];
    switch (type) {
      case "ep":
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/pgc/view/web/season?ep_id=" + id
        );
        break;
      case "ss":
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/pgc/view/web/season?season_id=" + id
        );
        break;
      case "md":
        const mdInfo = await this.ctx.http.get(
          "https://api.bilibili.com/pgc/review/user?media_id=" + id
        );
        ret = await this.ctx.http.get(
          "https://api.bilibili.com/pgc/view/web/season?season_id=" +
            mdInfo["result"]["media"]["season_id"]
        );
        break;
      default:
        ret = null;
        break;
    }
    return ret;
  }

  /**
   * 生成番剧信息
   * @param id 番剧 ID
   * @returns 文字番剧信息
   */
  async gen_context(id: string) {
    const vid = this.bgm_type_parse(id);
    const info = await this.fetch_video_info(vid["type"], vid["id"]);

    if (!info && !info["result"]) return null;

    var ret = `${info["result"]["season_title"]} （${info["result"]["rating"]["score"]}分）\n`;
    switch (vid["type"]) {
      case "ep":
        const episodes = info["result"]["episodes"];
        const epIndex = episodes.findIndex(
          (episode: Number) => episode["ep_id"] == vid["id"]
        );

        this.config.bBangumiImage
          ? (ret += `<img src=\"${episodes[epIndex]["cover"]}\"/>\n`)
          : null;
        ret += `第 ${episodes[epIndex]["title"]} 话 - ${episodes[epIndex]["long_title"]}\n`;
        this.config.bBangumiStat
          ? (ret += `点赞：${info["result"]["stat"]["likes"]}\t\t投币：${info["result"]["stat"]["coins"]}\n
收藏：${info["result"]["stat"]["favorites"]}\t\t转发：${info["result"]["stat"]["share"]}\n`)
          : null;
        ret += `https://www.bilibili.com/bangumi/play/ep${episodes[epIndex]["ep_id"]}\n`;
        break;

      case "ss":
      case "md":
        this.config.bBangumiImage
          ? (ret += `<img src=\"${info["result"]["cover"]}\"/>\n`)
          : null;
        this.config.bBangumiEvaluate
          ? (ret += `${info["result"]["evaluate"]}\n`)
          : null;
        this.config.bBangumiStat
          ? (ret += `点赞：${info["result"]["stat"]["likes"]}\t\t投币：${info["result"]["stat"]["coins"]}
收藏：${info["result"]["stat"]["favorites"]}\t\t转发：${info["result"]["stat"]["share"]}\n`)
          : null;
        ret += `https://www.bilibili.com/bangumi/media/md${info["result"]["media_id"]}\n`;
        break;

      default:
        ret = null;
        break;
    }
    return ret;
  }
}