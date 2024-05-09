import { Context, Schema } from "koishi";
import { link_type_parser } from "./link_parse";
import { bili_video } from "./bili_video";

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
          const video = new bili_video(ctx);
          const info = await video.gen_context(element["id"]);
          ret += info;
          break;

        case "Space":
          ret += element["id"] + "\n";
          break;

        case "Live":
          ret += element["id"] + "\n";
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
