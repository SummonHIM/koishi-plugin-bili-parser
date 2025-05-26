import { Dict } from "koishi";

import { BiliAPI } from ".";
import { runtime } from "../..";

/**
 * 获取音乐基本信息
 * @param id 音乐 ID
 * @returns API 内容
 */
export async function fetch_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${id}`,
    {
      headers: {
        Host: "www.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}

/**
 * 获取歌单基本信息
 * @param id 歌单 ID
 * @returns API 内容
 */
export async function fetch_am_api(id: string): Promise<BiliAPI<Dict>> {
  const ret: BiliAPI<Dict> = await runtime.ctx.http.get<BiliAPI<Dict>>(
    `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`,
    {
      headers: {
        Host: "www.bilibili.com",
        "User-Agent": runtime.config.userAgent,
      },
    },
  );
  return ret;
}
