import type { Context } from "koishi";
import Handlebars from "handlebars";
import { type Config, logger } from "..";

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
    const ret = await this.ctx.http.get(
      `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
      {
        headers: {
          "User-Agent": this.config.userAgent,
          Cookie: this.config.cookies,
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

    switch (info.code) {
      case -404:
        return "音乐不存在";
      default:
        if (info.code !== 0) return `BiliBili 返回错误代码：${info.code}`;
    }

    const template = Handlebars.compile(this.config.bAudioRetPreset);
    logger.debug("bAudio api return: ", info.data);
    return template(info.data);
  }
}
