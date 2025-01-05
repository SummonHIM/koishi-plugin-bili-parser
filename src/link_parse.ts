import { type Context, type Session, h } from "koishi"
import numbro from "numbro"
import Handlebars from "handlebars"
import { type Config, logger } from "."
import { Bili_Video } from "./types/bili_video"
import { Bili_Short } from "./types/bili_short"
import { Bili_Live } from "./types/bili_live"
import { Bili_Bangumi } from "./types/bili_bangumi"
import { Bili_Article } from "./types/bili_article"
// import { Bili_Audio } from "./types/bili_audio"
import { Bili_Opus } from "./types/bili_opus"
import { Bili_Space } from "./types/bili_space"

interface LinkRegex {
  pattern: RegExp
  type: string
}

interface LinkType {
  type: string
  id: string
}

/**
 * 链接类型解析
 * @param content 传入消息
 * @param config 插件设置
 * @returns [{type: "链接类型", id :"内容ID"}]
 */
function link_type_parser(content: string, config: Config): LinkType[] {
  const linkRegex: LinkRegex[] = []

  if (config.bVideoEnable)
    linkRegex.push({
      pattern: config.bVideoFullURL
        ? /bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)/gim
        : /([ab]v[0-9a-zA-Z]+)/gim,
      type: "Video",
    })

  if (config.bLiveEnable)
    linkRegex.push({
      pattern: /live\.bilibili\.com(?:\/h5)?\/(\d+)/gim,
      type: "Live",
    })

  if (config.bBangumiEnable) {
    linkRegex.push({
      pattern: config.bBangumiFullURL
        ? /bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))/gim
        : /((ep|ss)(\d+))/gim,
      type: "Bangumi",
    })
    linkRegex.push({
      pattern: config.bBangumiFullURL
        ? /bilibili\.com\/bangumi\/media\/(md(\d+))/gim
        : /(md(\d+))/gim,
      type: "Bangumi",
    })
  }

  if (config.bArticleEnable) {
    linkRegex.push({
      pattern: config.bArticleFullURL
        ? /bilibili\.com\/read\/cv(\d+)/gim
        : /cv(\d+)/gim,
      type: "Article",
    })
    linkRegex.push({
      pattern: /bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)/gim,
      type: "Article",
    })
  }

  // {
  //   pattern: config.bAudioFullURL
  //     ? /bilibili\.com\/audio\/(au(\d+))/gim
  //     : /(au(\d+))/gim,
  //   type: "Audio",
  // },

  if (config.bOpusEnable)
    linkRegex.push({
      pattern: /bilibili\.com\/opus\/(\d+)/gim,
      type: "Opus",
    })

  if (config.bSpaceEnable)
    linkRegex.push({
      pattern: /space\.bilibili\.com\/(\d+)/gim,
      type: "Space",
    })

  if (config.bShortEnable) {
    linkRegex.push({
      pattern: /b23\.tv(?:\\)?\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    })
    linkRegex.push({
      pattern: /bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    })
  }

  const results: LinkType[] = []

  linkRegex.forEach(({ pattern, type }) => {
    const matches = content.matchAll(pattern)

    for (const match of matches) {
      results.push({
        type: type,
        id: match[1],
      })
    }
  })

  // 去重
  const ret = results.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.type === item.type && t.id === item.id)
  )

  logger.debug("Links: ", ret)
  return ret
}

/**
 * 类型解析器
 * @param links 链接数组
 * @param ctx Context
 * @param config Config
 * @returns 解析来的文本
 */
async function type_parser(links: LinkType[], ctx: Context, config: Config) {
  let ret = ""
  let countLink = 0

  for (const link of links) {
    let context = ""

    if (countLink >= config.parseLimit) {
      ret += "已达到解析上限…"
      break
    }

    switch (link.type) {
      case "Video": {
        const bili_video = new Bili_Video(ctx, config)
        const video_info = await bili_video.gen_context(link.id, config)
        if (video_info != null) context += video_info
        break
      }

      case "Live": {
        const bili_live = new Bili_Live(ctx, config)
        const live_info = await bili_live.gen_context(link.id, config)
        if (live_info != null) context += live_info
        break
      }

      case "Bangumi": {
        const bili_bangumi = new Bili_Bangumi(ctx, config)
        const bangumi_info = await bili_bangumi.gen_context(link.id, config)
        if (bangumi_info != null) context += bangumi_info
        break
      }

      case "Article": {
        const bili_article = new Bili_Article(ctx, config)
        const article_info = await bili_article.gen_context(link.id, config)
        if (article_info != null) context += article_info
        break
      }

      // case "Audio": {
      //   const bili_audio = new Bili_Audio(ctx, config)
      //   const audio_info = await bili_audio.gen_context(link.id)
      //   if (audio_info != null) ret += audio_info
      //   break
      // }

      case "Opus": {
        const bili_opus = new Bili_Opus(ctx, config)
        const opus_info = await bili_opus.gen_context(link.id, config)
        if (opus_info != null) context += opus_info
        break
      }

      case "Space": {
        const bili_space = new Bili_Space(ctx, config)
        const space_info = await bili_space.gen_context(link.id, config)
        if (space_info != null) context += space_info
        break
      }

      case "Short": {
        const bili_short = new Bili_Short(ctx, config)
        const redir_url = await bili_short.get_redir_url(link.id)
        if (redir_url === null) {
          context += "短链接不正确。"
          break
        }
        const links = link_type_parser(redir_url, config)
        const final_info = await type_parser(links, ctx, config)
        if (final_info !== null) context += final_info
        break
      }
    }

    if (context !== "" && countLink >= 1)
      ret += `\n${config.customDelimiter}\n`
    if (context !== "") ret += context

    countLink++
  }

  return ret
}

/**
 * 链接解析器
 * @param ctx Context
 * @param config Config
 * @param element 链接列表
 * @returns 解析来的文本
 */
export default async function link_parser(
  session: Session,
  ctx: Context,
  config: Config
) {
  const links = link_type_parser(session.content, config)

  if (links.length === 0) return null

  Handlebars.registerHelper("formatNumber", (value: number) => {
    return numbro(value).format({
      average: true,
      mantissa: 1,
      optionalMantissa: true,
    })
  })

  Handlebars.registerHelper("truncate", (text, length) => {
    if (typeof text !== "string") {
      return text
    }

    if (text.length > length) {
      return `${text.substring(0, length)}…`
    }

    return text
  })

  let ret = config.showQuote
    ? `${[h("quote", { id: session.messageId })]}\n`
    : ""

  const tpRet = await type_parser(links, ctx, config)
  if (tpRet === "") return null
  ret += tpRet

  logger.debug(`Generated message: ${ret}`)
  return ret
}
