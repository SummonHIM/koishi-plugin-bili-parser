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
UP主：${name}
介绍
点赞：${like}	投币：${coin}
收藏：${fav}	转发：${stat}
观看：${views}	弹幕：${danmaku}
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

### Bangumi/番剧
When regex match `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`, `bilibili\.com\/bangumi\/media\/(md(\d+))`, reply

当正则表达式符合 `bilibili\.com\/bangumi\/play\/((ep|ss)(\d+))`，`bilibili\.com\/bangumi\/media\/(md(\d+))`，回复

```
标题（${score}分）
![图片](图片链接)
第 ${title} 话 - ${long_title}
介绍
点赞：${likes}		投币：${coins}
追番：${favs}		转发：${stat}
播放：${views}		弹幕：${danmakus}
https://www.bilibili.com/bangumi/play/ep${id}
```

### Article/专栏
When regex match `bilibili\.com\/read\/cv(\d+)`, `bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)`, reply

当正则表达式符合 `bilibili\.com\/read\/cv(\d+)`，`bilibili\.com\/read\/mobile(?:\?id=|\/)(\d+)`，回复

```
标题
![图片](图片链接)
UP主：作者名称
点赞：${like}	投币：${coin}
收藏：${fav}	转发：${stat}
https://www.bilibili.com/read/cv${id}
```

### Audio/音乐
When regex match `bilibili\.com\/audio\/au(\d+)`, reply

当正则表达式符合 `bilibili\.com\/audio\/au(\d+)`，回复

```
标题
![图片](图片链接)
UP主：${up}		歌手：${author}
播放：${play}	投币：${coin}
收藏：${fav}	转发：${stat}
https://www.bilibili.com/audio/au${id}
```

### Opus/动态
When regex match `bilibili\.com\/opus\/(\d+)`, reply

当正则表达式符合 `bilibili\.com\/opus\/(\d+)`，回复

```
用户名的动态
内容
![图片](图片链接)
![图片](图片链接)...
转发：${forward} | 评论：${comment} | 点赞：${like}
https://www.bilibili.com/opus/${id}
```

### Short link/短链接
When regex match `b23\.tv\/([0-9a-zA-Z]+)`, `bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`, reply

当正则表达式符合 `b23\.tv\/([0-9a-zA-Z]+)`，`bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)`，会先解析回原链接，之后会自动交给以上方法处理。

### Light App/小程序
When regex match `https:\\\/\\\/b23.tv\\\/(.+)\?`, reply

当正则表达式符合 `https:\\\/\\\/b23.tv\\\/(.+)\?`，会先解析回原链接，之后会自动交给以上方法处理。
