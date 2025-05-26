import { type Context, Dict, Logger, Schema, h } from "koishi";
import {} from "koishi-plugin-puppeteer";

import { BiliAPI } from "./api/bili";
import { generate_context } from "./context_generator";

export interface Config {
  showQuote: boolean;
  parseLimit: number;
  customDelimiter: string;
  usePuppeteer: boolean;
  userAgent: string;
  // 视频
  bVideoEnable: boolean;
  bVideoFullURL: boolean;
  bVideoRetPreset: string;
  // 直播
  bLiveEnable: boolean;
  bLiveRetPreset: string;
  // 番剧集
  bBangumiEnable: boolean;
  bBangumiFullURL: boolean;
  bBangumiRetPreset: string;
  bEpisodeRetPreset: string;
  // 空间
  bSpaceEnable: boolean;
  bSpaceRetPreset: string;
  // 动态
  bOpusEnable: boolean;
  bOpusRetPreset: string;
  // 专栏
  bArticleEnable: boolean;
  bArticleFullURL: boolean;
  bArticleRetPreset: string;
  // 歌曲
  bAudioEnable: boolean;
  bAudioFullURL: boolean;
  bAudioRetPreset: string;
  bAudioMenuRetPreset: string;

  bShortEnable: boolean;
}

export interface Runtime {
  ctx: Context;
  config: Config;
}

export interface Links {
  type: string;
  id: string;
  data?: BiliAPI<Dict>;
}

export const name = "bili-parser";
export const logger = new Logger("bili-parser");
export const inject = {
  required: ["http"],
  optional: ["puppeteer"],
};
/* eslint-disable no-useless-escape */
export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    showQuote: Schema.boolean().default(true).description("引用/回复原消息"),
    parseLimit: Schema.number().default(3).description("单对话多链接解析上限"),
    customDelimiter: Schema.string()
      .default("------")
      .description("自定义分隔符。*当出现多链接时使用的分隔符*"),
    usePuppeteer: Schema.boolean()
      .default(false)
      .description("所有 API 请求使用 Puppeteer 完成"),
    userAgent: Schema.string()
      .default(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      )
      .description("所有 API 请求所用的 User-Agent"),
  }).description("基础设置"),

  Schema.object({
    bVideoEnable: Schema.boolean()
      .default(true)
      .description("启用视频链接解析"),
    bVideoFullURL: Schema.boolean()
      .default(true)
      .description("需要完整链接 *（若关闭，则仅需 AV/BV 号即可解析）*"),
    bVideoRetPreset: Schema.string()
      .default(
        `{{title}}
<img src=\"{{pic}}\" />
UP主：{{owner.name}}
{{truncate desc 35}}
点赞：{{formatNumber stat.like}}\t\t投币：{{formatNumber stat.coin}}
收藏：{{formatNumber stat.favorite}}\t\t转发：{{formatNumber stat.share}}
观看：{{formatNumber stat.view}}\t\t弹幕：{{formatNumber stat.danmaku}}
https://www.bilibili.com/video/{{bvid}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("视频设置"),

  Schema.object({
    bLiveEnable: Schema.boolean().default(true).description("启用直播链接解析"),
    bLiveRetPreset: Schema.string()
      .default(
        `[{{formatLiveStatus live_status}}]{{title}}
<img src=\"{{user_cover}}\" />
{{description}}
观看：{{formatNumber online}}\t\t关注：{{formatNumber attention}}
https://live.bilibili.com/{{room_id}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("直播设置"),

  Schema.object({
    bBangumiEnable: Schema.boolean()
      .default(true)
      .description("启用番剧链接解析"),
    bBangumiFullURL: Schema.boolean()
      .default(true)
      .description("需要完整链接 *（若关闭，则仅需 EP/SS/MD 号即可解析）*"),
    bBangumiRetPreset: Schema.string()
      .default(
        `{{season_title}}（{{rating.score}}分）
<img src=\"{{cover}}\" />
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/media/md{{media_id}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的番剧集文本预设"),
    bEpisodeRetPreset: Schema.string()
      .default(
        `{{season_title}}（{{rating.score}}分）
<img src=\"{{getCurrentEpisode "cover"}}\" />
第 {{getCurrentEpisode "title"}} 话 - {{getCurrentEpisode "long_title"}}
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/play/ep{{getCurrentEpisode "ep_id"}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的具体集文本预设"),
  }).description("番剧集设置"),

  Schema.object({
    bSpaceEnable: Schema.boolean()
      .default(true)
      .description("启用空间链接解析"),
    bSpaceRetPreset: Schema.string()
      .default(
        `{{module_author.name}} 的个人空间
<img src=\"{{module_author.face}}\" />
https://space.bilibili.com/{{module_author.mid}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("空间设置"),

  Schema.object({
    bOpusEnable: Schema.boolean().default(true).description("启用动态链接解析"),
    bOpusRetPreset: Schema.string()
      .default(
        `{{item.modules.module_author.name}}的动态
<img src=\"{{item.modules.module_author.face}}\" />
{{#if item.modules.module_dynamic.desc.text}}
  {{item.modules.module_dynamic.desc.text}}
{{else if item.modules.module_dynamic.major.article.title}}
  {{item.modules.module_dynamic.major.article.title}}
{{/if}}

转发：{{formatNumber item.modules.module_stat.forward.count}} | 评论：{{formatNumber item.modules.module_stat.comment.count}} | 点赞：{{formatNumber item.modules.module_stat.like.count}}
https://www.bilibili.com/opus/{{id_str}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("动态设置"),

  Schema.object({
    bArticleEnable: Schema.boolean()
      .default(true)
      .description("启用专栏链接解析"),
    bArticleFullURL: Schema.boolean()
      .default(true)
      .description("需要完整链接 *（若关闭，则仅需 CV 号即可解析）*"),
    bArticleRetPreset: Schema.string()
      .default(
        `{{title}}
<img src=\"{{image_urls.[0]}}\" />
UP主：{{author_name}}
点赞：{{formatNumber stats.like}}\t\t投币：{{formatNumber stats.coin}}
阅读：{{formatNumber stats.view}} | 收藏：{{formatNumber stats.favorite}} | 转发：{{formatNumber stats.share}}
https://www.bilibili.com/read/cv{{getArticleID}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的文本预设"),
  }).description("专栏设置"),

  Schema.object({
    bAudioEnable: Schema.boolean()
      .default(true)
      .description("启用音乐链接解析"),
    bAudioFullURL: Schema.boolean()
      .default(true)
      .description("需要完整链接 *（若关闭，则仅需 AU 号即可解析）*"),
    bAudioRetPreset: Schema.string()
      .default(
        `{{title}}
<img src=\"{{cover}}\" />
UP主：{{uname}}\t\t歌手：{{author}}
播放：{{formatNumber statistic.play}}\t\t投币：{{formatNumber coin_num}}
收藏：{{formatNumber statistic.collect}}\t\t转发：{{formatNumber statistic.share}}
https://www.bilibili.com/audio/au{{id}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的单曲文本预设"),
    bAudioMenuRetPreset: Schema.string()
      .default(
        `{{title}}
<img src=\"{{cover}}\" />
UP主：{{uname}}
{{intro}}
播放：{{formatNumber statistic.play}} | 收藏：{{formatNumber statistic.collect}} | 转发：{{formatNumber statistic.share}}
https://www.bilibili.com/audio/am{{menuId}}`,
      )
      .role("textarea", { rows: [8, 4] })
      .description("返回的歌单文本预设"),
  }).description("音乐设置"),

  Schema.object({
    bShortEnable: Schema.boolean().default(true).description("启用短链接解析"),
  }).description("短链接设置"),
]);
/* eslint-enable no-useless-escape */
export let runtime: Runtime;

export function apply(ctx: Context, config: Config) {
  // Puppeteer
  if (config.usePuppeteer) {
    ctx.inject(["puppeteer"], async (ctx) => {
      runtime = {
        ctx,
        config,
      };
    });
  } else {
    runtime = {
      ctx,
      config,
    };
  }

  ctx.middleware(async (session, next) => {
    logger.debug("Inbound message:", session.content);
    let retMsg: string = await generate_context(session);

    if (retMsg) {
      const replayStr: string = config.showQuote
        ? `${[h("quote", { id: session.messageId })]}\n`
        : "";
      retMsg = `${replayStr}${retMsg}`;
      logger.debug("Generated message: ", retMsg);
      return retMsg;
    }

    logger.debug("No message, next.");
    return next();
  });
}
