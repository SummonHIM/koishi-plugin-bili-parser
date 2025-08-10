import { Links, logger, runtime } from ".";
import { get_redir_url, puppeteer_get_redir_url } from "./api/bili/short";
import { normalizeVideoId } from "./bv_av_converter";

/**
 * 去重函数 (BV/AV号互转去重)
 * @param links 链接数组
 * @returns 去重后的链接数组
 */
function deduplicateLinks(links: Links[]): Links[] {
  return links.filter((item, index, self) => {
    // 对于视频类型，使用标准化id进行去重
    if (item.type === "Video") {
      const normalizedId = normalizeVideoId(item.id);
      return index === self.findIndex((t) => 
        t.type === item.type && normalizeVideoId(t.id) === normalizedId
      );
    }
    // 其他类型使用原有去重逻辑
    return index === self.findIndex((t) => 
      t.type === item.type && t.id === item.id
    );
  });
}

/**
 * 类型翻译器
 * @param type 类型
 * @returns 中文类型
 */
export function type_translator(type: string) {
  const typeMap: Record<string, string> = {
    Video: "视频",
    Live: "直播",
    BangumiEp: "番剧集",
    BangumiSs: "番剧集",
    BangumiMd: "番剧集",
    Space: "空间",
    Opus: "动态",
    Article: "专栏",
    Audio: "音乐",
    AudioMenu: "歌单",
    Short: "短链接",
  };

  return typeMap[type];
}

/**
 * 将小程序 Json 替换为原始链接
 * @param content 原文字符串
 * @returns 替换后的字符串
 */
function parse_little_app(content: string): string {
  const jsonRegex: RegExp = /<json\s+data="([^"]+)"\s*\/?>/g;

  // 使用 replace 方法直接替换原文
  const replacedContent: string = content.replace(jsonRegex, (match, p1) => {
    try {
      // 替换 HTML 实体
      const jsonData = JSON.parse(
        p1.replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
      );

      // 检查是否包含符合条件的 appid
      if (jsonData.meta?.detail_1?.appid === "1109937557") {
        return jsonData.meta.detail_1.qqdocurl || match;
      }

      return match;
    } catch (error) {
      logger.error("Failed to parse little app JSON: ", error);
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
export function link_parser(content: string): Links[] {
  interface LinkRegex {
    pattern: RegExp;
    type: string;
  }

  const linkRegex: LinkRegex[] = [];

  // 若设置项已启用，则将该类型的正则写入 linkRegex内
  if (runtime.config.bVideoEnable) {
    linkRegex.push({
      pattern: runtime.config.bVideoFullURL
        ? /bilibili\.com\/video\/((?<![a-zA-Z0-9])[aA][vV]([0-9]+))/gim
        : /((?<![a-zA-Z0-9])[aA][vV]([0-9]+))/gim,
      type: "Video",
    });
    linkRegex.push({
      pattern: runtime.config.bVideoFullURL
        ? /bilibili\.com\/video\/((?<![a-zA-Z0-9])[bB][vV](1[0-9A-Za-z]+))/gim
        : /((?<![a-zA-Z0-9])[bB][vV](1[0-9A-Za-z]+))/gim,
      type: "Video",
    });
  }

  if (runtime.config.bLiveEnable)
    linkRegex.push({
      pattern: /live\.bilibili\.com(?:\/h5)?\/(\d+)/gim,
      type: "Live",
    });

  if (runtime.config.bBangumiEnable) {
    linkRegex.push(
      {
        pattern: runtime.config.bBangumiFullURL
          ? /bilibili\.com\/bangumi\/play\/(ep(\d+))/gim
          : /(ep(\d+))/gim,
        type: "BangumiEp",
      },
      {
        pattern: runtime.config.bBangumiFullURL
          ? /bilibili\.com\/bangumi\/play\/(ss(\d+))/gim
          : /(ss(\d+))/gim,
        type: "BangumiSs",
      },
      {
        pattern: runtime.config.bBangumiFullURL
          ? /bilibili\.com\/bangumi\/media\/(md(\d+))/gim
          : /(md(\d+))/gim,
        type: "BangumiMd",
      },
    );
  }

  if (runtime.config.bSpaceEnable) {
    linkRegex.push(
      {
        pattern: /space\.bilibili\.com\/(\d+)/gim,
        type: "Space",
      },
      {
        pattern: /bilibili\.com\/space\/(\d+)/gim,
        type: "Space",
      },
    );
  }

  if (runtime.config.bOpusEnable)
    linkRegex.push({
      pattern: /bilibili\.com\/opus\/(\d+)/gim,
      type: "Opus",
    });

  if (runtime.config.bArticleEnable) {
    linkRegex.push(
      {
        pattern: runtime.config.bArticleFullURL
          ? /bilibili\.com\/read\/cv(\d+)/gim
          : /cv(\d+)/gim,
        type: "Article",
      },
      {
        pattern: /bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)/gim,
        type: "Article",
      },
    );
  }

  if (runtime.config.bAudioEnable) {
    linkRegex.push(
      {
        pattern: runtime.config.bAudioFullURL
          ? /bilibili\.com\/audio\/au(\d+)/gim
          : /au(\d+)/gim,
        type: "Audio",
      },
      {
        pattern: runtime.config.bAudioFullURL
          ? /bilibili\.com\/audio\/am(\d+)/gim
          : /am(\d+)/gim,
        type: "AudioMenu",
      },
    );
  }

  if (runtime.config.bShortEnable) {
    linkRegex.push(
      {
        pattern: /b23\.tv(?:\\)?\/([0-9a-zA-Z]+)/gim,
        type: "Short",
      },
      {
        pattern: /bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)/gim,
        type: "Short",
      },
    );
  }

  // 净化内容。去除多余的 HTML 标签
  let sanitizedContent: string = content;
  sanitizedContent = parse_little_app(sanitizedContent);
  sanitizedContent = sanitizedContent.replace(/<[^>]+>/g, "");
  logger.debug("Sanitized message: ", sanitizedContent);

  // 生成链接数组
  const results: Links[] = [];

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
  const unique = deduplicateLinks(results);

  logger.debug("Links: ", unique);
  return unique;
}

export async function short_link_parser(links: Links[]): Promise<Links[]> {
  const result: Links[] = [];

  for (const link of links) {
    if (link.type === "Short") {
      let redirUrl: string;
      if (runtime.config.usePuppeteer) {
        redirUrl = await puppeteer_get_redir_url(link.id);
      } else {
        redirUrl = await get_redir_url(link.id);
      }
      if (redirUrl) {
        const resolvedLinks = link_parser(redirUrl);
        if (resolvedLinks.length > 0) {
          result.push(...resolvedLinks);
          continue;
        }
      }
    }
    result.push(link);
  }

  // 去重
  const unique = deduplicateLinks(result);

  return unique;
}
