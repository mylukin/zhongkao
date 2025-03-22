import fs from 'fs';
import path from 'path';

// 读取JSON文件
const jsonData = JSON.parse(fs.readFileSync('./ZhongKaoHeXin.json', 'utf8'));

// 科幻主题列表
const sciFiThemes = [
  { theme: "太空探索", description: "描述人类探索宇宙深处的冒险故事" },
  { theme: "时间旅行", description: "讲述穿越不同时间点的奇幻经历" },
  { theme: "机器人社会", description: "想象人类与人工智能共存的世界" },
  { theme: "虚拟现实", description: "描绘人们在计算机生成的世界中的生活" },
  { theme: "外星接触", description: "讲述人类与外星文明的第一次接触" },
  { theme: "末日生存", description: "描述在灾难后的世界中求生的故事" },
  { theme: "生物科技", description: "探索基因工程和生物技术改变人类的可能性" },
  { theme: "平行宇宙", description: "讲述多元宇宙中的奇遇" },
  { theme: "超能力者", description: "描述拥有特殊能力的人类的生活和挑战" },
  { theme: "未来城市", description: "描绘高科技城市中的日常生活" }
];

// 提取name和trans字段
let outputText = '# 中考核心词汇表 - 科幻故事记忆版 (30天学习计划)\n\n';
outputText += '此文档包含中考核心词汇，每个单词都附有中文翻译，按照30天学习计划分组，每组单词可创作成2-3分钟的科幻小故事。\n\n';

// 计算总单词数
const totalWords = jsonData.length;
// 每天学习的故事数量 (每天听5个故事，每个约5-6分钟，共30分钟)
const STORIES_PER_DAY = 5;
// 30天学习计划
const TOTAL_DAYS = 30;
// 总共需要的故事数量
const TOTAL_STORIES = STORIES_PER_DAY * TOTAL_DAYS;
// 每个故事包含的单词数量 (根据总单词数和总故事数计算)
const WORDS_PER_STORY = Math.ceil(totalWords / TOTAL_STORIES);

console.log(`总单词数: ${totalWords}`);
console.log(`每天学习故事数: ${STORIES_PER_DAY}`);
console.log(`每个故事包含单词数: ${WORDS_PER_STORY}`);

// 生成所有单词的基本列表
outputText += '## 完整单词列表\n\n';
jsonData.forEach(word => {
  const name = word.name;
  const translations = word.trans.join(' | ');
  outputText += `${name}: ${translations}\n\n`;
});

// 生成30天学习计划
outputText += '\n\n## 30天学习计划\n\n';
outputText += `本学习计划将所有单词分为30天学习，每天${STORIES_PER_DAY}个科幻故事，每个故事包含约${WORDS_PER_STORY}个单词。\n`;
outputText += `每天听取这${STORIES_PER_DAY}个故事的音频大约需要30分钟时间 (每个故事约5-6分钟)。\n\n`;

// 打乱单词顺序以随机分组
const shuffledWords = [...jsonData];
for (let i = shuffledWords.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
}

// 按天分组单词
for (let day = 1; day <= TOTAL_DAYS; day++) {
  outputText += `### 第 ${day} 天\n\n`;
  outputText += `目标：学习并听取以下${STORIES_PER_DAY}个科幻小故事，总时长约30分钟。\n\n`;

  // 每天指定数量的故事
  for (let story = 1; story <= STORIES_PER_DAY; story++) {
    // 计算当前故事对应的单词索引范围
    const startIdx = (day - 1) * STORIES_PER_DAY * WORDS_PER_STORY + (story - 1) * WORDS_PER_STORY;
    let endIdx = startIdx + WORDS_PER_STORY;
    // 确保不超出单词总数
    if (endIdx > shuffledWords.length) endIdx = shuffledWords.length;
    // 获取当前故事的单词
    const storyWords = shuffledWords.slice(startIdx, endIdx);

    // 如果没有单词了就退出
    if (storyWords.length === 0) break;

    // 随机选择一个科幻主题
    const randomTheme = sciFiThemes[Math.floor(Math.random() * sciFiThemes.length)];

    outputText += `#### 故事 ${story}: "${randomTheme.theme}的奇遇"\n\n`;

    // 列出这个故事的所有单词
    storyWords.forEach(word => {
      const name = word.name;
      const translations = word.trans.join(' | ');
      outputText += `${name}: ${translations}\n\n`;
    });

    // 根据单词特点创建更具体的情境提示
    const wordNames = storyWords.map(w => w.name);
    let situationPrompt = '';

    // 根据单词特点生成不同的情境提示
    if (wordNames.some(w => ['space', 'ship', 'star', 'planet', 'universe', 'galaxy'].includes(w))) {
      situationPrompt = '宇航员们乘坐飞船探索新星球';
    } else if (wordNames.some(w => ['robot', 'machine', 'computer', 'technology', 'program'].includes(w))) {
      situationPrompt = '人类与先进人工智能共同生活';
    } else if (wordNames.some(w => ['time', 'past', 'future', 'history', 'ancient'].includes(w))) {
      situationPrompt = '时间旅行者在不同时代的奇遇';
    } else if (wordNames.some(w => ['city', 'world', 'building', 'town', 'society'].includes(w))) {
      situationPrompt = '未来城市中的高科技生活';
    } else if (wordNames.some(w => ['power', 'energy', 'force', 'control', 'ability'].includes(w))) {
      situationPrompt = '具有超能力的人类的故事';
    } else {
      // 默认情境
      situationPrompt = `关于未来世界的科技冒险`;
    }

    // 添加科幻故事创作提示
    outputText += '**科幻故事创作提示**:\n';
    outputText += `推荐主题: **${randomTheme.theme}** - ${randomTheme.description}\n\n`;
    outputText += `使用以上${storyWords.length}个单词，创作一个约5-6分钟(约800-1200字)的科幻短篇故事。您可以想象在一个${randomTheme.theme}的世界里，${situationPrompt}。\n\n`;
    outputText += '**写作建议**: \n';
    outputText += '1. 故事中用黑体标记所有目标单词，例如："宇航员驾驶着巨大的**ship**，向宇宙深处进发..."\n';
    outputText += '2. 确保故事结构完整，包含引人入胜的开头、曲折的发展和令人满意的结尾\n';
    outputText += '3. 使用简单句和对话，便于朗读和录制音频\n';
    outputText += '4. 尽量创造生动的场景和角色，帮助学生形成强烈的记忆关联\n\n';
    outputText += '**音频录制建议**:\n';
    outputText += '1. 语速适中，发音清晰\n';
    outputText += '2. 对话部分可以使用不同的声音\n';
    outputText += '3. 录制时间控制在5-6分钟左右\n';
    outputText += '4. 在关键单词处稍作停顿，强调重点\n\n';
    outputText += '---\n\n';
  }
}

// 添加学习指南
outputText += '## 学习方法指南\n\n';
outputText += '### 建议学习流程\n\n';
outputText += '1. **预习单词**: 先浏览当天要学习的所有单词及其中文释义\n';
outputText += '2. **听取音频**: 每天听取5个故事的音频，总时长约30分钟\n';
outputText += '3. **跟读练习**: 听完一遍后，尝试跟读，加强记忆\n';
outputText += '4. **单词复习**: 学习完毕后，回顾当天学过的单词\n';
outputText += '5. **定期回顾**: 每周安排一天时间复习之前学过的单词\n\n';

outputText += '### 音频使用建议\n\n';
outputText += '1. **碎片时间学习**: 可以在通勤、锻炼或做家务时听取音频\n';
outputText += '2. **睡前复习**: 睡前听取当天学过的故事，强化记忆\n';
outputText += '3. **反复循环**: 对于难记的单词，可以多次重复相应故事的音频\n';
outputText += '4. **录音比对**: 可以录下自己朗读的版本，与标准音频比对，纠正发音\n\n';

outputText += '### 科幻故事创作与分享\n\n';
outputText += '1. **鼓励创作**: 学生可以尝试使用学过的单词自己创作科幻小故事\n';
outputText += '2. **小组分享**: 将学生分成小组，分享自己创作的故事，互相学习\n';
outputText += '3. **配音比赛**: 可以组织学生为故事配音，增加学习趣味性\n';
outputText += '4. **绘制插图**: 鼓励学生为故事绘制插图，加强视觉记忆\n\n';

outputText += '### 进度跟踪表\n\n';
outputText += '| 天数 | 日期 | 完成故事数 | 掌握单词数 | 感受 |\n';
outputText += '|------|------|------------|------------|------|\n';
for (let i = 1; i <= TOTAL_DAYS; i++) {
  outputText += `| 第${i}天 |        |            |            |      |\n`;
}
outputText += '\n坚持30天的学习计划，将有效掌握这些核心词汇，轻松应对中考！\n';

// 写入到文本文件
fs.writeFileSync('vocabulary_for_stories.txt', outputText, 'utf8');

console.log(`提取完成! 文件已保存为 vocabulary_for_stories.txt`);
console.log(`30天学习计划已创建，每天${STORIES_PER_DAY}个故事，每个故事约${WORDS_PER_STORY}个单词。`); 