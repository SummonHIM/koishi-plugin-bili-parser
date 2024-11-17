# @summonhim/koishi-plugin-bili-parser

[![npm](https://img.shields.io/npm/v/@summonhim/koishi-plugin-bili-parser?style=flat-square)](https://www.npmjs.com/package/@summonhim/koishi-plugin-bili-parser)

A koishi plugin use to parse bilibili links.

一个能够解析 BiliBili 链接的 Koishi 插件。

## Usage/使用方法
### Video/视频
When regex match `bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)`, reply

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
When regex match `live\.bilibili\.com(?:\/h5)?\/(\d+)`, reply

当正则表达式符合 `live\.bilibili\.com(?:\/h5)?\/(\d+)`，回复

```
[{{formatLiveStatus live_status}}]{{title}}
<img src=\"{{user_cover}}\" />
{{description}}
观看：{{formatNumber online}}\t\t关注：{{formatNumber attention}}
https://live.bilibili.com/{{room_id}}
```

### Bangumi/番剧
When regex match `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`, `bilibili\.com\/bangumi\/media\/(md(\d+))`, reply

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

### Article/专栏
When regex match `bilibili\.com\/read\/cv(\d+)`, `bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)`, reply

当正则表达式符合 `bilibili\.com\/read\/cv(\d+)`，`bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)`，回复

```
{{title}}
<img src=\"{{banner_url}}\" />
UP主：{{author_name}}
点赞：{{formatNumber stats.like}}\t\t投币：{{formatNumber stats.coin}}
观看：{{formatNumber stats.view}} | 收藏：{{formatNumber stats.favorite}} | 转发：{{formatNumber stats.share}}
https://www.bilibili.com/read/{{getArticleID}}
```

### Audio/音乐

由于音乐 API 已被加密。所以暂时禁用该 API。

### Opus/动态
When regex match `bilibili\.com\/opus\/(\d+)`, reply

当正则表达式符合 `bilibili\.com\/opus\/(\d+)`，回复

```
{{modules.module_author.name}}的动态
<img src=\"{{modules.module_dynamic.additional.goods.items.[0].cover}}\" />
{{modules.module_dynamic.desc.text}}
转发：{{formatNumber modules.module_stat.forward.count}} | 评论：{{formatNumber modules.module_stat.comment.count}} | 点赞：{{formatNumber modules.module_stat.like.count}}
```

### Space/空间
When regex match `space\.bilibili\.com\/(\d+)`, reply

当正则表达式符合 `space\.bilibili\.com\/(\d+)`，回复

```
{{module_author.name}}
<img src=\"{{module_author.face}}\" />
https://space.bilibili.com/{{module_author.mid}}
```

### Short link/短链接
When regex match `b23\.tv\/([0-9a-zA-Z]+)`, `bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`, reply

当正则表达式符合 `b23\.tv\/([0-9a-zA-Z]+)`，`bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`，会先解析回原链接，之后会自动交给以上方法处理。

### Light App/小程序
When regex match `https:\\\/\\\/b23.tv\\\/(.+)\?`, reply

当正则表达式符合 `https:\\\/\\\/b23.tv\\\/(.+)\?`，会先解析回原链接，之后会自动交给以上方法处理。

## 自定义文本预设

假如说你需要修改视频的文本预设：

1. 前去 [/src/types](/src/types)。找到处理视频的代码 bili_video.ts。将其打开。
2. 在函数 fetch_video_info 中你可找到一段域名为 api.bilibili.com 的 API 链接。将其粘贴到浏览器。并将需要修改的 ID 变量修改为正确的变量。
3. 假如说 API 返回的 Json 结果如下：
```Json
{
    "code": 0,
    "data": {
        "name": "SummonHIM",
        "id": "11223344",
        "dict": {
            "aa": "AA",
            "bb": "BB"
        },
        "array": [
            123,
            "fjt"
        ]
    }
}
```
3. 查看 gen_context 函数。一般会有个 template 函数。template(info.data) 即为占位符仅在 "data" 字典里生效。例：
```
{{name}} - {{id}}
{{dict.aa}} - {{dict.bb}}
{{array.[0]}} - {{array.[1]}}
```

```
SummonHIM - 11223344
AA - BB
123 - fjt
```

有关更多占位符使用方法，请参阅 [Handlebars.js](https://handlebarsjs.com/)。