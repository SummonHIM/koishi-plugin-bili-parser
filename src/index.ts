import { Context, Schema } from "koishi";
import { link_type_parser } from "./link_parse";
import { Bili_Video } from "./bili_video";
import { Bili_Live } from "./bili_live";

export const name = "bili-parser";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  ctx.middleware(async (session, next) => {
    const links = link_type_parser(session.content);
    if (links.length === 0) return next();

    var ret: string = "";
    let moreLink = false;

    // 循环检测链接类型
    for (const element of links) {
      if (moreLink !== false) ret += "\n";
      switch (element["type"]) {
        case "Video":
          const bili_video = new Bili_Video(ctx);
          const video_info = await bili_video.gen_context(element["id"]);
          ret += video_info;
          break;

        case "Live":
          const bili_live = new Bili_Live(ctx);
          const live_info = await bili_live.gen_context(element["id"]);
          ret += live_info;
          break;

        case "Space":
          ret += "暂时不支持查询空间信息，敬请期待！" + "\n";
          break;

        case "Short":
          ret += element["id"] + "\n";
          break;
      }
      moreLink = true;
    }

    return ret;
  });
}
