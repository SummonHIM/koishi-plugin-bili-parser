import { Context, Schema, h } from "koishi";
import { link_type_parser, type_processer } from "./link_parse";

export const name = "bili-parser";

export interface Config {
  parseLimit: number;
  showQuote: boolean;
  useNumeral: boolean;
  showError: boolean;
  userAgent: string;
  bVideoIDPreference: string;
  bVideoIDPrefex: boolean;
  bVideoImage: boolean;
  bVideoOwner: boolean;
  bVideoDesc: boolean;
  bVideoStat: boolean;
  bVideoExtraStat: boolean;
  bLiveImage: boolean;
  bLiveDesc: boolean;
  bLiveStat: boolean;
  bBangumiImage: boolean;
  bBangumiEvaluate: boolean;
  bBangumiStat: boolean;
  bBangumiExtraStat: boolean;
  bArticleImage: boolean;
  bArticleAuthor: boolean;
  bArticleStat: boolean;
  bMusicImage: boolean;
  bMusicAuthor: boolean;
  bMusicStat: boolean;
  bOpusImage: boolean;
  bOpusStat: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    parseLimit: Schema.number().default(3).description("单对话多链接解析上限"),
    showQuote: Schema.boolean().default(true).description("引用/回复原消息"),
    useNumeral: Schema.boolean().default(true).description("使用格式化数字"),
    showError: Schema.boolean()
      .default(false)
      .description("当链接不正确时提醒发送者"),
    userAgent: Schema.string()
      .default(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      )
      .description("所有 API 请求所用的 User-Agent"),
  }).description("基础设置"),

  Schema.object({
    bVideoIDPreference: Schema.union([
      Schema.const("bv").description("BV 号"),
      Schema.const("av").description("AV 号"),
    ])
      .default("bv")
      .description("ID 偏好"),
    bVideoIDPrefex: Schema.boolean()
      .default(true)
      .description(
        "满足链接前缀 *（若开启，则对话中必须包含 bilibili.com/video/xxx 格式才能解析。否则对话中仅需包含 AV/BV 号格式即可解析。）*"
      ),
    bVideoImage: Schema.boolean().default(true).description("显示封面"),
    bVideoOwner: Schema.boolean().default(true).description("显示 UP 主"),
    bVideoDesc: Schema.boolean().default(true).description("显示简介"),
    bVideoStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（三连）*"),
    bVideoExtraStat: Schema.boolean()
      .default(true)
      .description("显示额外状态 *（观看&弹幕）*"),
  }).description("视频设置"),

  Schema.object({
    bLiveImage: Schema.boolean().default(true).description("显示封面"),
    bLiveDesc: Schema.boolean().default(true).description("显示简介"),
    bLiveStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（观看&关注）*"),
  }).description("直播设置"),

  Schema.object({
    bBangumiImage: Schema.boolean().default(true).description("显示封面"),
    bBangumiEvaluate: Schema.boolean().default(true).description("显示简介"),
    bBangumiStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（三连）*"),
    bBangumiExtraStat: Schema.boolean()
      .default(true)
      .description("显示额外状态 *（播放&弹幕）*"),
  }).description("番剧设置"),

  Schema.object({
    bArticleImage: Schema.boolean().default(true).description("显示封面"),
    bArticleAuthor: Schema.boolean().default(true).description("显示作者"),
    bArticleStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（三连）*"),
  }).description("专栏设置"),

  Schema.object({
    bMusicImage: Schema.boolean().default(true).description("显示封面"),
    bMusicAuthor: Schema.boolean().default(true).description("显示作者"),
    bMusicStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（三连）*"),
  }).description("音乐设置"),

  Schema.object({
    bOpusImage: Schema.boolean().default(true).description("显示图片"),
    bOpusStat: Schema.boolean()
      .default(true)
      .description("显示状态 *（转发&评论&点赞）*"),
  }).description("动态设置"),
]);

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const links = link_type_parser(config, session.content);
    if (links.length === 0) return next();

    var ret: string = "";
    if (config.showQuote) ret += [h("quote", { id: session.messageId })];
    let countLink = 0;

    // 循环检测链接类型
    for (const element of links) {
      if (countLink >= 1) ret += "\n";
      if (countLink >= config.parseLimit) {
        ret += "已达到解析上限…";
        break;
      }

      const tp_ret = await type_processer(ctx, config, element);
      if (tp_ret == "") {
        if (config.showError)
          ret = "无法解析链接信息。可能是 ID 不存在，或该类型可能暂不支持。";
        else ret = null;
      } else ret += tp_ret;

      countLink++;
    }

    return ret;
  });
}
