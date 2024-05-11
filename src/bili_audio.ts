import { Context } from "koishi";
import { Config } from ".";
import numeral from "./numeral";

export class Bili_Audio {
  private ctx: Context;
  private config: Config;

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 根据音乐 ID 查找音乐信息
   * @param id 音乐 ID
   * @returns 音乐信息 Json
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
   * 生成音乐信息
   * @param id 音乐 ID
   * @returns 文字音乐信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_audio_info(id);
    if (!info || !info["data"] || info["data"].length === 0) return null;

    var ret = `${info["data"]["title"]}\n`;
    this.config.bMusicImage
      ? (ret += `<img src=\"${info["data"]["cover"]}\"/>\n`)
      : null;

    this.config.bMusicAuthor
      ? (ret += `UP主：${info["data"]["uname"]}\t\t歌手：${info["data"]["author"]}\n`)
      : null;

    this.config.bMusicStat
      ? (ret += `播放：${numeral(
          info["data"]["statistic"]["play"],
          this.config
        )}\t\t投币：${numeral(info["data"]["coin_num"], this.config)}\n`)
      : null;

    this.config.bMusicStat
      ? (ret += `收藏：${numeral(
          info["data"]["statistic"]["collect"],
          this.config
        )}\t\t转发：${numeral(
          info["data"]["statistic"]["share"],
          this.config
        )}\n`)
      : null;

    ret += `https://www.bilibili.com/audio/au${id}`;
    return ret;
  }
}
