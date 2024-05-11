import { Context } from "koishi";
import { Config } from ".";
import { Bili_Video } from "./bili_video";
import { Bili_Live } from "./bili_live";
import { Bili_Short } from "./bili_short";
import { Bili_Bangumi } from "./bili_bangumi";

/**
 * 链接类型解析
 * @param content 传入消息
 * @returns type: "链接类型", id :"内容ID"
 */
export function link_type_parser(content: string): string[] {
  var linkRegex = [
    {
      pattern: /bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)/gim,
      type: "Video",
    },
    {
      pattern: /live\.bilibili\.com(?:\/h5)?\/(\d+)/gim,
      type: "Live",
    },
    {
      pattern: /bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))/gim,
      type: "Bangumi",
    },
    {
      pattern: /bilibili\.com\/bangumi\/media\/(md(\d+))/gim,
      type: "Bangumi",
    },
    // {
    //   pattern: /space\.bilibili\.com\/(\d+)/gim,
    //   type: "Space",
    // },
    {
      pattern: /b23\.tv(?:\\)?\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    },
    {
      pattern: /bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    },
  ];

  var ret = [];

  for (const rule of linkRegex) {
    var match: string[];
    let lastID: string;
    while ((match = rule.pattern.exec(content)) !== null) {
      if (lastID == match[1]) continue;

      ret.push({
        type: rule.type,
        id: match[1],
      });

      lastID = match[1];
    }
  }

  return ret;
}

/**
 * 类型执行器
 * @param ctx Context
 * @param config Config
 * @param element 链接列表
 * @returns 解析来的文本
 */
export async function type_processer(
  ctx: Context,
  config: Config,
  element: string
) {
  var ret: string = "";
  switch (element["type"]) {
    case "Video":
      const bili_video = new Bili_Video(ctx, config);
      const video_info = await bili_video.gen_context(element["id"]);
      if (video_info != null) ret += video_info;
      break;

    case "Live":
      const bili_live = new Bili_Live(ctx, config);
      const live_info = await bili_live.gen_context(element["id"]);
      if (live_info != null) ret += live_info;
      break;

    case "Bangumi":
      const bili_bangumi = new Bili_Bangumi(ctx, config);
      const bangumi_info = await bili_bangumi.gen_context(element["id"]);
      if (bangumi_info != null) ret += bangumi_info;
      break;

    // case "Space":
    //   ret += "暂时不支持查询空间信息，敬请期待！" + "\n";
    //   break;

    case "Short":
      const bili_short = new Bili_Short(ctx);
      const typed_link = link_type_parser(
        await bili_short.get_redir_url(element["id"])
      );
      for (const element of typed_link) {
        const final_info = await type_processer(ctx, config, element);
        if (final_info != null) ret += final_info;
        break;
      }
      break;
  }
  return ret;
}
