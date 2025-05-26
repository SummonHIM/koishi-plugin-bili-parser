# @summonhim/koishi-plugin-bili-parser

[![npm](https://img.shields.io/npm/v/@summonhim/koishi-plugin-bili-parser?style=flat-square)](https://www.npmjs.com/package/@summonhim/koishi-plugin-bili-parser) [![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org/) [![Koishi](https://img.shields.io/badge/Koishi-5546a3?style=flat-square&logo=typescript&logoColor=fff)
](https://koishi.chat/)

A koishi plugin use to parse bilibili links.

一个能够解析 BiliBili 链接的 Koishi 插件。

## 前置依赖

- [handlebars](https://www.npmjs.com/package/handlebars)
- [numbro](https://www.npmjs.com/package/numbro)

## 使用方法
### Video/视频
当正则表达式符合 `bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)`，回复

```
{{title}}
<img src=\"{{pic}}\" />
UP主：{{owner.name}}
{{truncate desc 35}}
点赞：{{formatNumber stat.like}}\t\t投币：{{formatNumber stat.coin}}
收藏：{{formatNumber stat.favorite}}\t\t转发：{{formatNumber stat.share}}
观看：{{formatNumber stat.view}}\t\t弹幕：{{formatNumber stat.danmaku}}
https://www.bilibili.com/video/{{bvid}}
```

### Live/直播
当正则表达式符合 `live\.bilibili\.com(?:\/h5)?\/(\d+)`，回复

```
[{{formatLiveStatus live_status}}]{{title}}
<img src=\"{{user_cover}}\" />
{{description}}
观看：{{formatNumber online}}\t\t关注：{{formatNumber attention}}
https://live.bilibili.com/{{room_id}}
```

### Bangumi/番剧
当正则表达式符合 `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`，`bilibili\.com\/bangumi\/media\/(md(\d+))`，回复

```
{{season_title}}（{{rating.score}}分）
<img src=\"{{cover}}\" />
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/media/md{{media_id}}
```

具体集
```
{{season_title}}（{{rating.score}}分）
<img src=\"{{getCurrentEpisode "cover"}}\" />
第 {{getCurrentEpisode "title"}} 话 - {{getCurrentEpisode "long_title"}}
{{truncate evaluate 35}}
点赞：{{formatNumber stat.likes}}\t\t投币：{{formatNumber stat.coins}}
追番：{{formatNumber stat.favorites}}\t\t转发：{{formatNumber stat.share}}
播放：{{formatNumber stat.views}}\t\t弹幕：{{formatNumber stat.danmakus}}
https://www.bilibili.com/bangumi/play/ep{{getCurrentEpisode "ep_id"}}
```

### Space/空间
当正则表达式符合 `space\.bilibili\.com\/(\d+)`，回复

```
{{items.[0].modules.module_author.name}} 的个人空间
<img src=\"{{items.[0].modules.module_author.face}}\" />
https://space.bilibili.com/{{items.[0].modules.module_author.mid}}
```

### Opus/动态
当正则表达式符合 `bilibili\.com\/opus\/(\d+)`，回复

```
{{item.modules.module_author.name}}的动态
<img src=\"{{item.modules.module_author.face}}\" />
{{#if item.modules.module_dynamic.desc.text}}
  {{item.modules.module_dynamic.desc.text}}
{{else if item.modules.module_dynamic.major.article.title}}
  {{item.modules.module_dynamic.major.article.title}}
{{/if}}

转发：{{formatNumber item.modules.module_stat.forward.count}} | 评论：{{formatNumber item.modules.module_stat.comment.count}} | 点赞：{{formatNumber item.modules.module_stat.like.count}}
https://www.bilibili.com/opus/{{item.id_str}}
```

### Article/专栏
当正则表达式符合 `bilibili\.com\/read\/cv(\d+)`，`bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)`，回复

```
{{title}}
<img src=\"{{image_urls.[0]}}\" />
UP主：{{author_name}}
点赞：{{formatNumber stats.like}}\t\t投币：{{formatNumber stats.coin}}
阅读：{{formatNumber stats.view}} | 收藏：{{formatNumber stats.favorite}} | 转发：{{formatNumber stats.share}}
https://www.bilibili.com/read/cv{{getArticleID}}
```

### Audio/音乐
当正则表达式符合 `bilibili\.com\/audio\/au(\d+)`，回复

```
{{title}}
<img src=\"{{cover}}\" />
UP主：{{uname}}\t\t歌手：{{author}}
播放：{{formatNumber statistic.play}}\t\t投币：{{formatNumber coin_num}}
收藏：{{formatNumber statistic.collect}}\t\t转发：{{formatNumber statistic.share}}
https://www.bilibili.com/audio/au{{id}}
```

### Audio Menu/歌单
当正则表达式符合 `bilibili\.com\/audio\/am(\d+)`，回复

```
{{title}}
<img src=\"{{cover}}\" />
UP主：{{uname}}
{{intro}}
播放：{{formatNumber statistic.play}} | 收藏：{{formatNumber statistic.collect}} | 转发：{{formatNumber statistic.share}}
https://www.bilibili.com/audio/am{{menuId}}
```

### Short link/短链接
当正则表达式符合 `b23\.tv\/([0-9a-zA-Z]+)`，`bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`，会先解析回原链接，之后会自动交给以上方法处理。

### Light App/小程序
当正则表达式符合 `https:\\\/\\\/b23.tv\\\/(.+)\?`，会先解析回原链接，之后会自动交给以上方法处理。

## 自定义文本预设

假如说你需要修改视频的文本预设：

1. 为本插件开启调试日志。

koishi.yml
```Yaml
logger:
  levels:
    bili-parser: 3
```

2. 发送一个视频链接给 Bot。此时日志会输出从 API 中获取来的 Json 数据。例：

```Json
Video api return: {
    "name": "SummonHIM",
    "id": "11223344",
    "dict": {
        "aa": "AA",
        "bb": "BB"
    },
    "array": [
        123,
        "HIM"
    ]
}
```

（推荐前去 [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) 参阅更详细的 BiliBili API 介绍）

3. 根据以上 Json 数据来编写自定义的文本预设占位符。

```
{{name}} - {{id}}
{{dict.aa}} - {{dict.bb}}
{{array.[0]}} - {{array.[1]}}
```

```
SummonHIM - 11223344
AA - BB
123 - HIM
```

有关更多占位符使用方法，请参阅 [Handlebars.js](https://handlebarsjs.com/)。

### Handlebars Helper 介绍
如果你有相关的模板函数，欢迎向我们的仓库中 PR。

#### 全局
- formatNumber: 数字简化，例："formatNumber 1638" 会转换为 "1.6k"。
- truncate: 字符串截断，例："truncate 啊啊啊啊啊啊啊啊啊啊啊 5" 会被省略为“啊啊啊啊啊啊…”。

#### 专栏
- getArticleID: 用于返回专栏 ID。

#### 番剧
- getCurrentEpisode: 返回当前集的字典。例：'getCurrentEpisode "title"' 会返回当前集的标题。

#### 直播
- formatLiveStatus: 文字化当前直播状态。例："formatNumber online"。

## 关于 Puppeteer
目前 Puppeteer 是直接加载一遍正常网页来刷新 wbi 等 Cookie。这个办法虽笨又慢但却是个不错的解决方案。如果你有更快的方案欢迎发 Issue。
