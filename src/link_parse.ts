/**
 * 链接类型解析
 * @param content 传入消息
 * @returns type: "链接类型", id :"内容ID"
 */
export function link_type_parser(content: string): string[] {
  var linkRegex = [
    {
      pattern: /bilibili\.com\/video\/([ab]v[0-9a-zA-Z]+)/gim,
      type: "Video",
    },
    {
      pattern: /b23\.tv\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    },
    {
      pattern: /bili(?:22|23|33)\.cn\/([0-9a-zA-Z]+)/gim,
      type: "Short",
    },
    {
      pattern: /space\.bilibili\.com\/(\d+)/gim,
      type: "Space",
    },
    {
      pattern: /live\.bilibili\.com(?:\/h5)?\/(\d+)/gim,
      type: "Live",
    },
  ];

  var ret = [];

  linkRegex.forEach(function (rule) {
    var match: string[];
    while ((match = rule.pattern.exec(content)) !== null) {
      ret.push({
        type: rule.type,
        id: match[1], // 匹配到的内容
      });
    }
  });

  return ret;
}

/**
 * 解析 ID 类型
 * @param id 视频 ID
 * @returns type: ID 类型, id: 视频 ID
 */
export function vid_type_parse(id: string) {
  var idRegex = [
    {
      pattern: /av([0-9]+)/i,
      type: "av",
    },
    {
      pattern: /bv([0-9a-zA-Z]+)/i,
      type: "bv",
    },
  ];

  for (const rule of idRegex) {
    var match = id.match(rule.pattern);
    if (match) {
      return {
        type: rule.type,
        id: match[1], // 匹配到的内容
      };
    }
  }

  return {
    type: null,
    id: null, // 匹配到的内容
  };
}
