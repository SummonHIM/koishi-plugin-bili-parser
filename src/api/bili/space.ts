import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 获取用户空间动态
 * @param id 用户 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get(
    `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${id}`,
    {
      headers: {
        Host: "api.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}
