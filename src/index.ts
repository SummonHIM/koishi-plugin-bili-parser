import { Context, Schema, h } from "koishi";
import { link_type_parser, type_processer } from "./link_parse";

export const name = "bili-parser";

export interface Config {
  parseLimit: number;
  showError: boolean;
  bVideoIDPreference: string;
  bVideoImage: boolean;
  bVideoDesc: boolean;
  bVideoStat: boolean;
  bLiveImage: boolean;
  bLiveDesc: boolean;
  bLiveStat: boolean;
  bBangumiImage: boolean;
  bBangumiEvaluate: boolean;
  bBangumiStat: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    parseLimit: Schema.number().default(3).description("单对话多链接解析上限"),
    showError: Schema.boolean()
      .default(false)
      .description("当链接不正确时提醒发送者"),
  }).description("基础设置"),

  Schema.object({
    bVideoIDPreference: Schema.union([
      Schema.const("bv").description("BV 号"),
      Schema.const("av").description("AV 号"),
    ])
      .default("bv")
      .description("ID 偏好"),
    bVideoImage: Schema.boolean().default(true).description("显示封面"),
    bVideoDesc: Schema.boolean().default(true).description("显示简介"),
    bVideoStat: Schema.boolean()
      .default(true)
      .description("显示状态（*三联信息*）"),
  }).description("视频设置"),

  Schema.object({
    bLiveImage: Schema.boolean()
      .default(true)
      .description("显示封面 *（由 API 截取的当前帧画面）*"),
    bLiveDesc: Schema.boolean().default(true).description("显示简介"),
    bLiveStat: Schema.boolean().default(true).description("显示状态"),
  }).description("直播设置"),

  Schema.object({
    bBangumiImage: Schema.boolean().default(true).description("显示封面"),
    bBangumiEvaluate: Schema.boolean().default(true).description("显示简介"),
    bBangumiStat: Schema.boolean().default(true).description("显示状态"),
  }).description("番剧设置"),
]);

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const links = link_type_parser(session.content);
    if (links.length === 0) return next();

    var ret: string = "";
    ret += [h("quote", { id: session.messageId })];
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
