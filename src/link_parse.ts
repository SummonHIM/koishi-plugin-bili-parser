import { type Context, type Session } from "koishi";
import numbro from "numbro";
import Handlebars from "handlebars";
import { type Config, logger } from ".";
import { Bili_Video } from "./types/bili_video";
import { Bili_Short } from "./types/bili_short";
import { Bili_Live } from "./types/bili_live";
import { Bili_Bangumi } from "./types/bili_bangumi";
import { Bili_Article } from "./types/bili_article";
import { Bili_Audio } from "./types/bili_audio";
import { Bili_Opus } from "./types/bili_opus";
import { Bili_Space } from "./types/bili_space";
import { Bili_AudioMenu } from "./types/bili_audio_menu";

interface LinkRegex {
  pattern: RegExp;
  type: string;
}

interface LinkType {
  type: string;
  id: string;
}

/**
 * 将小程序 Json 替换为原始链接
 * @param content 原文字符串
 * @returns 替换后的字符串
 */
function parse_little_app(content: string): string {
  const jsonRegex = /<json\s+data="([^"]+)"\s*\/?>/g;

  // 使用 replace 方法直接替换原文
  const replacedContent = content.replace(jsonRegex, (match, p1) => {
    try {
      const jsonData = JSON.parse(
        p1
          .replace(/&quot;/g, '"') // 替换 HTML 实体
          .replace(/&amp;/g, "&")
      );

      // 检查是否包含符合条件的 appid
      if (jsonData.meta?.detail_1?.appid === "1109937557") {
        return jsonData.meta.detail_1.qqdocurl || match;
      }

      return match;
    } catch (error) {
      logger.error("Failed to parse little app JSON:", error);
      return match;
    }
  });

  return replacedContent;
}

/**
 * 链接类型解析
 * @param content 传入消息
 * @param config 插件设置
 * @returns [{type: "链接类型", id :"内容ID"}]
 */
function link_type_parser(content: string, config: Config): LinkType[] {
  const linkRegex: LinkRegex[] = [];

  if (config.bVideoEnable) {
    linkRegex.push({
      pattern: config.bVideoFullURL
        ? /bilibili\.com\/video\/(?<![a-zA-Z0-9])[aA][vV]([0-9]+)/gim
        : /((?<![a-zA-Z0-9])[aA][vV]([0-9]+))/gim,
      type: "Video",
    });
    linkRegex.push({
      pattern: config.bVideoFullURL
        ? /bilibili\.com\/video\/(?<![a-zA-Z0-9])[bB][vV](1[0-9A-Za-z]+)/gim
        : /((?<![a-zA-Z0-9])[bB][vV](1[0-9A-Za-z]+))/gim,
      type: "Video",
    });
  }

  if (config.bLiveEnable)
    linkRegex.push({
      pattern: /live\.bilibili\.com(?:\/h5)?\/(\d+)/gim,
      type: "Live",
    });

  if (config.bBangumiEnable) {
    linkRegex.push(
      {
        pattern: config.bBangumiFullURL
          ? /bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))/gim
          : /((ep|ss)(\d+))/gim,
        type: "Bangumi",
      },
      {
        pattern: config.bBangumiFullURL
          ? /bilibili\.com\/bangumi\/media\/(md(\d+))/gim
          : /(md(\d+))/gim,
        type: "Bangumi",
      }
    );
  }

  if (config.bArticleEnable) {
    linkRegex.push(
      {
        pattern: config.bArticleFullURL
          ? /bilibili\.com\/read\/cv(\d+)/gim
          : /cv(\d+)/gim,
        type: "Article",
      },
      {
        pattern: /bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)/gim,
        type: "Article",
      }
    );
  }

  if (config.bAudioEnable) {
    linkRegex.push(
      {
        pattern: config.bAudioFullURL
          ? /bilibili\.com\/audio\/au(\d+)/gim
          : /au(\d+)/gim,
        type: "Audio",
      },
      {
        pattern: config.bAudioFullURL
          ? /bilibili\.com\/audio\/am(\d+)/gim
          : /am(\d+)/gim,
        type: "AudioMenu",
      }
    );
  }

  if (config.bOpusEnable)
    linkRegex.push({
      pattern: /bilibili\.com\/opus\/(\d+)/gim,
      type: "Opus",
    });

  if (config.bSpaceEnable) {
    linkRegex.push(
      {
        pattern: /space\.bilibili\.com\/(\d+)/gim,
        type: "Space",
      },
      {
        pattern: /bilibili\.com\/space\/(\d+)/gim,
        type: "Space",
      }
    );
  }

  if (config.bShortEnable) {
    linkRegex.push(
      {
        pattern: /b23\.tv(?:\\)?\/([0-9a-zA-Z]+)/gim,
        type: "Short",
      },
      {
        pattern: /bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)/gim,
        type: "Short",
      }
    );
  }

  let sanitizedContent: string = content;
  sanitizedContent = parse_little_app(sanitizedContent);
  sanitizedContent = sanitizedContent.replace(/<[^>]+>/g, "");
  logger.debug("Sanitized message: ", sanitizedContent);

  const results: LinkType[] = [];

  linkRegex.forEach(({ pattern, type }) => {
    const matches = sanitizedContent.matchAll(pattern);

    for (const match of matches) {
      results.push({
        type: type,
        id: match[1],
      });
    }
  });

  // 去重
  const ret = results.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.type === item.type && t.id === item.id)
  );

  logger.debug("Links: ", ret);
  return ret;
}

/**
 * 类型解析器
 * @param links 链接数组
 * @param ctx Context
 * @param config Config
 * @returns 解析来的文本
 */
async function type_parser(links: LinkType[], ctx: Context, config: Config) {
  let ret = "";
  let countLink = 0;

  for (const link of links) {
    let context = "";

    if (countLink >= config.parseLimit) {
      ret += "\n\n已达到解析上限…";
      break;
    }

    switch (link.type) {
      case "Video":
        const bili_video = new Bili_Video(ctx, config);
        const video_info = await bili_video.gen_context(link.id, config);
        if (video_info != null) context += video_info;
        break;

      case "Live":
        const bili_live = new Bili_Live(ctx, config);
        const live_info = await bili_live.gen_context(link.id, config);
        if (live_info != null) context += live_info;
        break;

      case "Bangumi":
        const bili_bangumi = new Bili_Bangumi(ctx, config);
        const bangumi_info = await bili_bangumi.gen_context(link.id, config);
        if (bangumi_info != null) context += bangumi_info;
        break;

      case "Article":
        const bili_article = new Bili_Article(ctx, config);
        const article_info = await bili_article.gen_context(link.id, config);
        if (article_info != null) context += article_info;
        break;

      case "Audio":
        const bili_audio = new Bili_Audio(ctx, config);
        const audio_info = await bili_audio.gen_context(link.id);
        if (audio_info != null) context += audio_info;
        break;

      case "AudioMenu":
        const bili_audio_menu = new Bili_AudioMenu(ctx, config);
        const audio_menu_info = await bili_audio_menu.gen_context(link.id);
        if (audio_menu_info != null) context += audio_menu_info;
        break;

      case "Opus":
        const bili_opus = new Bili_Opus(ctx, config);
        const opus_info = await bili_opus.gen_context(link.id, config);
        if (opus_info != null) context += opus_info;
        break;

      case "Space":
        const bili_space = new Bili_Space(ctx, config);
        const space_info = await bili_space.gen_context(link.id, config);
        if (space_info != null) context += space_info;
        break;

      case "Short":
        const bili_short = new Bili_Short(ctx, config);
        const redir_url = await bili_short.get_redir_url(link.id);
        if (redir_url === null) {
          context += "短链接不正确。";
          break;
        }
        const links = link_type_parser(redir_url, config);
        const final_info = await type_parser(links, ctx, config);
        if (final_info !== null) context += final_info;
        break;

      default:
        throw new Error("No such type.");
    }

    if (context !== "" && countLink >= 1)
      ret += `\n${config.customDelimiter}\n`;
    if (context !== "") ret += context;

    countLink++;
  }

  return ret;
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
  const links = link_type_parser(session.content, config);

  if (links.length === 0) return null;

  Handlebars.registerHelper("formatNumber", (value: number) => {
    return numbro(value).format({
      average: true,
      mantissa: 1,
      optionalMantissa: true,
    });
  });

  Handlebars.registerHelper("truncate", (text, length) => {
    if (typeof text !== "string") {
      return text;
    }

    if (text.length > length) {
      return `${text.substring(0, length)}…`;
    }

    return text;
  });

  const ret = await type_parser(links, ctx, config);

  return ret;
}
