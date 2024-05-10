# @summonhim/koishi-plugin-bili-parser

[![npm](https://img.shields.io/npm/v/@summonhim/koishi-plugin-bili-parser?style=flat-square)](https://www.npmjs.com/package/@summonhim/koishi-plugin-bili-parser)

A koishi plugin use to parse bilibili links.

一个能够解析 BiliBili 链接的 Koishi 插件。

## Usage/使用方法
### Video/视频
When regex match `bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)`, reply

当正则表达式符合 `bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)`，回复

```
标题
![图片](图片链接)
介绍
点赞：${like}	投币：${coin}
收藏：${fav}	转发：${stat}
https://www.bilibili.com/video/${id}
```

### Live/直播
When regex match `live\.bilibili\.com(?:\/h5)?\/(\d+)`, reply

当正则表达式符合 `live\.bilibili\.com(?:\/h5)?\/(\d+)`，回复

```
标题
![图片](图片链接)
介绍
观看：${online}	关注：${attention}
https://live.bilibili.com/${id}
```

### Live/直播
When regex match `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`, `bilibili\.com\/bangumi\/media\/(md(\d+))`, reply

当正则表达式符合 `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`，`bilibili\.com\/bangumi\/media\/(md(\d+))`，回复

```
标题
![图片](图片链接)
介绍
点赞：${likes}	投币：${coins}
收藏：${favs}	转发：${stat}
https://www.bilibili.com/video/${id}
```

### Short link/短链接
When regex match `b23\.tv\/([0-9a-zA-Z]+)`, `bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`, reply

当正则表达式符合 `b23\.tv\/([0-9a-zA-Z]+)`，`bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`，会先解析回原链接，之后会自动交给以上方法处理。

### Light App/小程序
When regex match `https:\\\/\\\/b23.tv\\\/(.+)\?`, reply

当正则表达式符合 `https:\\\/\\\/b23.tv\\\/(.+)\?`，会先解析回原链接，之后会自动交给以上方法处理。
