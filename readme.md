# @summonhim/koishi-plugin-bili-parser

[![npm](https://img.shields.io/npm/v/@summonhim/koishi-plugin-bili-parser?style=flat-square)](https://www.npmjs.com/package/@summonhim/koishi-plugin-bili-parser)

A koishi plugin use to parse bilibili links

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