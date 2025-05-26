import numbro from "numbro";
import Handlebars from "handlebars";
import { Dict, Session } from "koishi";

import { Links, logger, runtime } from ".";
import { link_parser, short_link_parser, type_translator } from "./link_parser";
import { BiliAPI } from "./api/bili";
import * as Api_Bili_Video from "./api/bili/video";
import * as Api_Bili_Live from "./api/bili/live";
import * as Api_Bili_Bangumi from "./api/bili/bangumi";
import * as Api_Bili_Space from "./api/bili/space";
import * as Api_Bili_Opus from "./api/bili/opus";
import * as Api_Bili_Article from "./api/bili/article";
import * as Api_Bili_Audio from "./api/bili/audio";

/**
 * 传入一大堆变量，返回不是数字的那一个变量
 * @param args String 变量
 * @returns 不是数字的那一个
 */
function getFirstNonNumeric(...args) {
  for (const str of args) {
    if (
      typeof str !== "string" ||
      str.trim() === "" ||
      !/^[-]?\d+$/.test(str)
    ) {
      return str;
    }
  }
  return null;
}

/**
 * 错误翻译器
 * @param link Link 对象
 * @returns 错误文本
 */
function error_translator(link: Links): string {
  const errorMap: Record<string, string> = {
    // 权限类
    "-1": "应用程序不存在或已被封禁",
    "-2": "Access Key 错误",
    "-3": "API 校验密匙错误",
    "-4": "调用方对该 Method 没有权限",
    "-101": "账号未登录",
    "-102": "账号被封停",
    "-103": "积分不足",
    "-104": "硬币不足",
    "-105": "验证码错误",
    "-106": "账号非正式会员或在适应期",
    "-107": "应用不存在或者被封禁",
    "-108": "未绑定手机",
    "-110": "未绑定手机",
    "-111": "csrf 校验失败",
    "-112": "系统升级中",
    "-113": "账号尚未实名认证",
    "-114": "请先绑定手机",
    "-115": "请先完成实名认证",
    // 请求类
    "-304": "木有改动",
    "-307": "撞车跳转",
    "-352": "风控校验失败 (UA 或 wbi 参数不合法)",
    "-400": "请求错误",
    "-401": "未认证 (或非法请求)",
    "-403": "访问权限不足",
    "-404": "啥都木有",
    "-405": "不支持该方法",
    "-409": "冲突",
    "-412": "请求被拦截 (客户端 IP 被服务端风控)",
    "-500": "服务器错误",
    "-503": "过载保护,服务暂不可用",
    "-504": "服务调用超时",
    "-509": "超出限制",
    "-616": "上传文件不存在",
    "-617": "上传文件太大",
    "-625": "登录失败次数太多",
    "-626": "用户不存在",
    "-628": "密码太弱",
    "-629": "用户名或密码错误",
    "-632": "操作对象数量限制",
    "-643": "被锁定",
    "-650": "用户等级太低",
    "-652": "重复的用户",
    "-658": "Token 过期",
    "-662": "密码时间戳过期",
    "-688": "地理区域限制",
    "-689": "版权限制",
    "-701": "扣节操失败",
    "-799": "请求过于频繁，请稍后再试",
    "-8888": "对不起，服务器开小差了~ (ಥ﹏ಥ)",
    // 视频类
    "62002": "稿件不可见",
    "62004": "稿件审核中",
    "62012": "仅UP主自己可见",
    // 音乐类
    "72000000": "参数错误",
    "7201006": "该音频不存在或已被下架",
    "72010027": "版权音乐重定向",
    "72010002": "未登录",
  };

  return (
    getFirstNonNumeric(link.data.msg, link.data.message) ||
    errorMap[String(link.data.code)] ||
    `未知错误`
  );
}

/**
 * 文本生成器
 * @param session Session
 * @returns 文本
 */
export async function generate_context(session: Session): Promise<string> {
  // API 映射表
  let fetchApiMap: Record<string, (id: string) => Promise<BiliAPI<Dict>>>;

  // 如果使用 Puppeteer
  if (runtime.config.usePuppeteer) {
    fetchApiMap = {
      Video: Api_Bili_Video.puppeteer_fetch_api,
      Live: Api_Bili_Live.puppeteer_fetch_api,
      BangumiEp: Api_Bili_Bangumi.fetch_web_api,
      BangumiSs: Api_Bili_Bangumi.fetch_web_api,
      BangumiMd: Api_Bili_Bangumi.fetch_mdid_api,
      Space: Api_Bili_Space.puppeteer_fetch_api,
      Opus: Api_Bili_Opus.puppeteer_fetch_api,
      Article: Api_Bili_Article.puppeteer_fetch_api,
      Audio: Api_Bili_Audio.puppeteer_fetch_api,
      AudioMenu: Api_Bili_Audio.puppeteer_fetch_am_api,
    };
  } else {
    fetchApiMap = {
      Video: Api_Bili_Video.fetch_api,
      Live: Api_Bili_Live.fetch_api,
      BangumiEp: Api_Bili_Bangumi.fetch_web_api,
      BangumiSs: Api_Bili_Bangumi.fetch_web_api,
      BangumiMd: Api_Bili_Bangumi.fetch_mdid_api,
      Space: Api_Bili_Space.fetch_api,
      Opus: Api_Bili_Opus.fetch_api,
      Article: Api_Bili_Article.fetch_api,
      Audio: Api_Bili_Audio.fetch_api,
      AudioMenu: Api_Bili_Audio.fetch_am_api,
    };
  }

  // 模板映射表
  const templateMap: Record<string, HandlebarsTemplateDelegate> = {
    Video: Handlebars.compile(runtime.config.bVideoRetPreset),
    Live: Handlebars.compile(runtime.config.bLiveRetPreset),
    BangumiEp: Handlebars.compile(runtime.config.bEpisodeRetPreset),
    BangumiSs: Handlebars.compile(runtime.config.bBangumiRetPreset),
    BangumiMd: Handlebars.compile(runtime.config.bBangumiRetPreset),
    Space: Handlebars.compile(runtime.config.bSpaceRetPreset),
    Opus: Handlebars.compile(runtime.config.bOpusRetPreset),
    Article: Handlebars.compile(runtime.config.bArticleRetPreset),
    Audio: Handlebars.compile(runtime.config.bAudioRetPreset),
    AudioMenu: Handlebars.compile(runtime.config.bAudioMenuRetPreset),
  };

  // 模板函数：格式化数字
  Handlebars.registerHelper("formatNumber", (value: number) => {
    return numbro(value).format({
      average: true,
      mantissa: 1,
      optionalMantissa: true,
    });
  });

  // 模板函数：字符串截断
  Handlebars.registerHelper("truncate", (text, length) => {
    if (typeof text !== "string") return text;
    if (text.length > length) return `${text.substring(0, length)}…`;
    return text;
  });

  let links: Links[] = link_parser(session.content);
  links = await short_link_parser(links);
  const results: string[] = [];

  for (const link of links) {
    const fetch_api = fetchApiMap[link.type];
    const template = templateMap[link.type];
    if (fetch_api) {
      try {
        const api_content = await fetch_api(link.id);
        link.data = api_content;
      } catch (error) {
        logger.error(`Failed to fetch for ${link.type}:${link.id}`, error);
        results.push(
          `获取 ID 为 ${link.id} 的${type_translator(link.type)}时发生错误。`,
        );
        continue;
      }
    }

    if (template && link.data) {
      if (link.data.code !== 0) {
        results.push(
          `获取 ID 为 ${link.id} 的${type_translator(link.type)}时发生错误：${error_translator(link)}。`,
        );
        continue;
      }

      // 注册直播专用的模板函数
      if (link.type === "Live") {
        Handlebars.registerHelper("formatLiveStatus", (value: number) => {
          return Api_Bili_Live.getStatusText(value);
        });
      }
      // 注册番剧集专用的模板函数
      if (link.data.result && link.type === "BangumiEp") {
        const episodes = link.data.result.episodes;
        const epIndex = episodes.findIndex(
          (episode: Dict) =>
            Number(episode.ep_id) === Number(link.id.replace(/^ep/, "")),
        );
        Handlebars.registerHelper("getCurrentEpisode", (key: string) => {
          return episodes[epIndex][key];
        });
      }
      // 注册文章专用的模板函数
      if (link.type === "Article") {
        Handlebars.registerHelper("getArticleID", () => {
          return link.id.replace(/^cv/, "");
        });
      }

      logger.debug(`${link.type} API return:`, link.data.data);
      results.push(template(link.data.data));

      // 卸载直播专用的模板函数
      if (link.type === "Live") {
        Handlebars.unregisterHelper("formatLiveStatus");
      }
      if (link.data.result && link.type === "BangumiEp") {
        Handlebars.unregisterHelper("getCurrentEpisode");
      }
      // 卸载文章专用的模板函数
      if (link.type === "Article") {
        Handlebars.unregisterHelper("getArticleID");
      }
    }
  }

  return results.join(`\n${runtime.config.customDelimiter}\n`);
}
