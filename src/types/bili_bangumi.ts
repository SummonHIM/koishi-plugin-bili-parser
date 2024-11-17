import type { Context, Dict } from "koishi"
import Handlebars from 'handlebars'
import type { Config } from ".."

export class Bili_Bangumi {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 解析 ID 类型
   * @param id 番剧 ID
   * @returns type: ID 类型, id: 番剧 ID
   */
  private bgm_type_parse(id: string) {
    const idRegex = [
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
    ]

    let ret = {
      type: null,
      id: null,
    }

    for (const rule of idRegex) {
      const match = id.match(rule.pattern)
      if (match) {
        ret = {
          type: rule.type,
          id: match[1],
        }
      }
    }

    return ret
  }

  /**
   * 根据番剧 ID 查找番剧信息
   * @param id 番剧 ID
   * @returns 番剧信息 Json
   */
  async fetch_video_info(type: string, id: string) {
    let ret: Dict
    switch (type) {
      case "ep":
        ret = await this.ctx.http.get(
          `https://api.bilibili.com/pgc/view/web/season?ep_id=${id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              "Cookie": this.config.cookies
            }
          }
        )
        break
      case "ss":
        ret = await this.ctx.http.get(
          `https://api.bilibili.com/pgc/view/web/season?season_id=${id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              "Cookie": this.config.cookies
            }
          }
        )
        break
      case "md": {
        const mdInfo = await this.ctx.http.get(
          `https://api.bilibili.com/pgc/review/user?media_id=${id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              "Cookie": this.config.cookies
            }
          }
        )
        ret = await this.ctx.http.get(
          `https://api.bilibili.com/pgc/view/web/season?season_id=${mdInfo.result.media.season_id}`,
          {
            headers: {
              "User-Agent": this.config.userAgent,
              "Cookie": this.config.cookies
            }
          }
        )
        break
      }
      default:
        ret = null
        break
    }
    return ret
  }

  /**
   * 生成番剧信息
   * @param id 番剧 ID
   * @returns 文字番剧信息
   */
  async gen_context(id: string) {
    const vid = this.bgm_type_parse(id)
    const info = await this.fetch_video_info(vid.type, vid.id)

    if (info.code !== 0) throw (`Fetching bangumi api failed. Code: ${info.code}`)

    let ret = null

    switch (vid.type) {
      case "ep": {
        const episodes = info.result.episodes
        const epIndex = episodes.findIndex(
          (episode: Dict) => Number(episode.ep_id) === Number(vid.id)
        )



        Handlebars.registerHelper('getCurrentEpisode', (key: string) => {
          return episodes[epIndex][key]
        })

        const template = Handlebars.compile(this.config.bEpisodeRetPreset)
        ret = template(info.result)
        break
      }

      case "ss":
      case "md": {
        const template = Handlebars.compile(this.config.bBangumiRetPreset)
        ret = template(info.result)
        break
      }
    }

    return ret
  }
}
