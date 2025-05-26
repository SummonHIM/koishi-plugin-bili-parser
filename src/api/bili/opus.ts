import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 获取动态详情
 * @param id 动态 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${id}`,
    {
      headers: {
        Host: "api.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}
