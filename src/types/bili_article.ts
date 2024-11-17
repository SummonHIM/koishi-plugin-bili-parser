import type { Context } from "koishi"
import Handlebars from 'handlebars'
import type { Config } from ".."

export class Bili_Article {
  private ctx: Context
  private config: Config

  constructor(ctx: Context, config: Config) {
    this.ctx = ctx
    this.config = config
  }

  /**
   * 根据专栏 ID 查找专栏信息
   * @param id 专栏 ID
   * @returns 专栏信息 Json
   */
  async fetch_article_info(id: string) {
    const ret = await this.ctx.http.get(
      `https://api.bilibili.com/x/article/viewinfo?id=${id.replace(/^cv/, "")}`,
      {
        headers: {
          "User-Agent": this.config.userAgent,
          "Cookie": this.config.cookies
        }
      }
    )
    return ret
  }

  /**
   * 生成专栏信息
   * @param id 专栏 ID
   * @returns 文字专栏信息
   */
  async gen_context(id: string) {
    const info = await this.fetch_article_info(id)
    if (info.code !== 0) throw (`Fetching article api failed. Code: ${info.code}`)

    Handlebars.registerHelper('getArticleID', () => {
      return id
    })

    const template = Handlebars.compile(this.config.bArticleRetPreset)
    return template(info.data)
  }
}