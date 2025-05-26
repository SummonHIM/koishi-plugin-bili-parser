import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 解析直播状态
 * @param statusCode 状态代码
 * @returns 状态文字
 */
export function getStatusText(statusCode: number) {
  switch (statusCode) {
    case 0:
      return "未开播";
    case 1:
      return "直播中";
    case 2:
      return "轮播中";
    default:
      return "未知状态";
  }
}

/**
 * 获取直播间基本信息
 * @param id 直播 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${id}`,
    {
      headers: {
        Host: "api.live.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}
