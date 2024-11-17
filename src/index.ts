import { type Context, Schema } from "koishi"
import { type_processer } from "./link_parse"

export const name = "bili-parser"

export interface Config {
  parseLimit: number
  showQuote: boolean
  userAgent: string
  cookies: string

  bVideoFullURL: boolean
  bVideoRetPreset: string

  bLiveRetPreset: string

  bBangumiFullURL: boolean
  bBangumiRetPreset: string
  bEpisodeRetPreset: string

  bArticleFullURL: boolean
  bArticleRetPreset: string

  // bAudioFullURL: boolean
  // bAudioRetPreset: string

  bOpusRetPreset: string

  bSpaceRetPreset: string
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    parseLimit: Schema.number().default(3).description("单对话多链接解析上限"),
    showQuote: Schema.boolean().default(true).description("引用/回复原消息"),
    showError: Schema.boolean()
      .default(false)
      .description("当链接不正确时提醒发送者"),
    userAgent: Schema.string()
      .default(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      )
      .description("所有 API 请求所用的 User-Agent"),
    cookies: Schema.string()
      .description("所有 API 请求所用的 cookies"),
  }).description("基础设置"),

  Schema.object({
    bVideoFullURL: Schema.boolean()
      .default(true)
      .description(
        "需要完整链接 *（若关闭，则仅需 AV/BV 号即可解析）*"
      ),
    bVideoRetPreset: Schema.string()
      .default(`{{title}}
<img src=\"{{pic}}\" />
UP主：{{owner.name}}
{{truncate desc 35}}
点赞：{{formatNumber stat.like}}\t\t投币：{{formatNumber stat.coin}}
收藏：{{formatNumber stat.favorite}}\t\t转发：{{formatNumber stat.share}}
观看：{{formatNumber stat.view}}\t\t弹幕：{{formatNumber stat.danmaku}}
https://www.bilibili.com/video/{{bvid}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("视频设置"),

  Schema.object({
    bLiveRetPreset: Schema.string()
      .default(`[{{formatLiveStatus live_status}}]{{title}}
<img src=\"{{user_cover}}\" />
{{description}}
观看：{{formatNumber online}}\t\t关注：{{formatNumber attention}}
https://live.bilibili.com/{{room_id}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("直播设置"),

  Schema.object({
    bBangumiFullURL: Schema.boolean()
      .default(true)
      .description(
        "需要完整链接 *（若关闭，则仅需 EP/SS/MD 号即可解析）*"
      ),
    bBangumiRetPreset: Schema.string()
      .default(`{{season_title}}（{{rating.score}}分）
<img src=\"{{cover}}\" />
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/media/md{{media_id}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的番剧集文本预设"),
    bEpisodeRetPreset: Schema.string()
      .default(`{{season_title}}（{{rating.score}}分）
<img src=\"{{getCurrentEpisode "cover"}}\" />
第 {{getCurrentEpisode "title"}} 话 - {{getCurrentEpisode "long_title"}}
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/play/ep{{getCurrentEpisode "ep_id"}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的具体集文本预设"),
  }).description("番剧集设置"),

  Schema.object({
    bArticleFullURL: Schema.boolean()
      .default(true)
      .description(
        "需要完整链接 *（若关闭，则仅需 CV 号即可解析）*"
      ),
    bArticleRetPreset: Schema.string()
      .default(`{{title}}
<img src=\"{{banner_url}}\" />
UP主：{{author_name}}
点赞：{{formatNumber stats.like}}\t\t投币：{{formatNumber stats.coin}}
观看：{{formatNumber stats.view}} | 收藏：{{formatNumber stats.favorite}} | 转发：{{formatNumber stats.share}}
https://www.bilibili.com/read/{{getArticleID}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("专栏设置"),

//   Schema.object({
//     bAudioFullURL: Schema.boolean()
//       .default(true)
//       .description(
//         "需要完整链接 *（若关闭，则仅需 AU 号即可解析）*"
//       ),
//     bAudioRetPreset: Schema.string()
//       .default(`{{title}}
// <img src=\"{{cover}}\" />
// UP主：{{uname}}\t\t歌手：{{author}}
// 播放：{{formatNumber statistic.play}}\t\t投币：{{formatNumber coin_num}}
// 收藏：{{formatNumber statistic.collect}}\t\t转发：{{formatNumber statistic.share}}
// https://www.bilibili.com/audio/au{{id}}`)
//       .role('textarea', { rows: [8, 4] })
//       .description("返回的文本预设"),
//   }).description("歌曲设置"),

  Schema.object({
    bOpusRetPreset: Schema.string()
      .default(`{{modules.module_author.name}}的动态
<img src=\"{{modules.module_dynamic.additional.goods.items.[0].cover}}\" />
{{modules.module_dynamic.desc.text}}
转发：{{formatNumber modules.module_stat.forward.count}} | 评论：{{formatNumber modules.module_stat.comment.count}} | 点赞：{{formatNumber modules.module_stat.like.count}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("动态设置"),

  Schema.object({
    bSpaceRetPreset: Schema.string()
      .default(`{{module_author.name}}
<img src=\"{{module_author.face}}\" />
https://space.bilibili.com/{{module_author.mid}}`)
      .role('textarea', { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("控件设置"),
])

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const retMsg = type_processer(session, ctx, config)

    if (await retMsg !== "" || await retMsg !== null) {
      return retMsg
    }
    return next()
  })
}

