import { Context } from "koishi";
import { Config } from ".";

export class Bili_Audio {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 根据直播 ID 查找直播信息
   * @param id 直播 ID
   * @returns 直播信息 Json
   */
  async fetch_audio_info(id: string) {
    var ret = await this.ctx.http.get(
      "https://www.bilibili.com/audio/music-service-c/web/song/info?sid=" + id,
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
    const info = await this.fetch_audio_info(id);
    if (!info || !info["data"] || info["data"].length === 0) return null;

    var ret = `${info["data"]["title"]}\n`;
    this.config.bMusicImage
      ? (ret += `<img src=\"${info["data"]["cover"]}\"/>\n`)
      : null;

    this.config.bMusicAuthor
      ? (ret += `UP主：${info["data"]["uname"]}\t\t歌手:${info["data"]["author"]}\n`)
      : null;

    this.config.bMusicStat
      ? (ret += `播放：${info["data"]["statistic"]["play"]}\t\t投币：${info["data"]["coin_num"]}
收藏：${info["data"]["statistic"]["collect"]}\t\t转发：${info["data"]["statistic"]["share"]}\n`)
      : null;

    ret += `https://www.bilibili.com/audio/au${id}`;
    return ret;
  }
}
