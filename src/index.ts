import { Context, Schema } from "koishi";
import { link_type_parser, type_processer } from "./link_parse";

export const name = "bili-parser";

export interface Config {
  idPreference;
  parseLimit;
}

export const Config: Schema<Config> = Schema.object({
  idPreference: Schema.union([
    Schema.const("bv").description("BV 号"),
    Schema.const("av").description("AV 号"),
  ])
    .required()
    .description("视频 ID 偏好"),
  parseLimit: Schema.number().default(3).description("单对话多链接解析上限"),
});

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const links = link_type_parser(session.content);
    if (links.length === 0) return next();

    var ret: string = "";
    let countLink = 0;

    // 循环检测链接类型
    for (const element of links) {
      if (countLink >= 1) ret += "\n";
      if (countLink >= config.parseLimit) {
        ret += "已达到解析上限…";
        break;
      }

      ret += await type_processer(ctx, config, element);
      countLink++;
    }

    return ret;
  });
}
