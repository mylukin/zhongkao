import fs from 'fs';
import path from 'path';

// 读取生成的词汇文件
const vocabularyText = fs.readFileSync('./vocabulary_for_stories.txt', 'utf8');

// 创建输出目录
const outputDir = './stories_by_day';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 提取学习计划部分
const learningPlanRegex = /## 30天学习计划[\s\S]*?(?=## 学习方法指南)/;
const learningPlanMatch = vocabularyText.match(learningPlanRegex);

if (!learningPlanMatch) {
  console.error("无法在文件中找到30天学习计划部分");
  process.exit(1);
}

const learningPlanText = learningPlanMatch[0];

// 提取30天的内容
const dayRegex = /### 第 (\d+) 天[\s\S]*?(?=### 第 \d+ 天|## 学习方法指南)/g;
const days = [];
let match;

// 提取每一天的内容
while ((match = dayRegex.exec(learningPlanText)) !== null) {
  const dayNumber = match[1];
  const dayContent = match[0].trim();
  days.push({ dayNumber, dayContent });
}

// 处理可能漏掉的天
console.log(`从正则表达式中找到了${days.length}天的内容`);

// 检查是否有缺失的天数
const foundDays = new Set(days.map(d => parseInt(d.dayNumber)));
for (let i = 1; i <= 30; i++) {
  if (!foundDays.has(i)) {
    console.log(`尝试手动查找第${i}天的内容...`);

    // 尝试手动找到这一天的内容
    const specificDayRegex = new RegExp(`### 第 ${i} 天[\\s\\S]*?(?=### 第 ${i + 1} 天|## 学习方法指南)`, 'g');
    const specificMatch = specificDayRegex.exec(learningPlanText);

    if (specificMatch) {
      console.log(`手动找到了第${i}天的内容`);
      days.push({
        dayNumber: i.toString(),
        dayContent: specificMatch[0].trim()
      });
    } else if (i === 30) {
      // 特殊处理第30天（最后一天）
      const lastDayRegex = /### 第 30 天[\s\S]*$/;
      const lastDayMatch = learningPlanText.match(lastDayRegex);

      if (lastDayMatch) {
        console.log(`找到了第30天的内容`);
        days.push({
          dayNumber: "30",
          dayContent: lastDayMatch[0].trim()
        });
      }
    }
  }
}

// 按天数排序
days.sort((a, b) => parseInt(a.dayNumber) - parseInt(b.dayNumber));

console.log(`总共找到${days.length}天的内容`);

// 计算新的单词分配
const totalWords = 2140; // 原始单词总数
const STORIES_PER_DAY = 3; // 新的每天故事数
const TOTAL_DAYS = 30;
const TOTAL_STORIES = STORIES_PER_DAY * TOTAL_DAYS;
const WORDS_PER_STORY = Math.ceil(totalWords / TOTAL_STORIES); // 约30个单词/故事

console.log(`总单词数: ${totalWords}`);
console.log(`每天故事数: ${STORIES_PER_DAY}`);
console.log(`每个故事包含单词数: ${WORDS_PER_STORY}`);
console.log(`每天学习单词数: ${STORIES_PER_DAY * WORDS_PER_STORY}`);

// 重新组织所有单词
// 从原始JSON文件提取所有单词
let allWords = [];
try {
  const jsonData = JSON.parse(fs.readFileSync('./ZhongKaoHeXin.json', 'utf8'));
  allWords = jsonData;
  console.log(`从JSON文件加载了${allWords.length}个单词`);
} catch (error) {
  console.log(`无法从JSON文件加载单词: ${error.message}`);
  console.log("使用现有数据继续处理...");
}

// 如果无法从JSON加载，使用词汇表中的单词
if (allWords.length === 0) {
  // 简单提取所有单词（这是备用方法）
  const wordRegex = /^([a-zA-Z\-]+):/gm;
  let wordMatch;
  while ((wordMatch = wordRegex.exec(vocabularyText)) !== null) {
    allWords.push({ name: wordMatch[1] });
  }
  console.log(`从词汇表提取了${allWords.length}个单词`);
}

// 随机打乱单词顺序
const shuffledWords = [...allWords];
for (let i = shuffledWords.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
}

// 用于存储所有故事的数组
const allStories = [];

// 创建每一天的故事
for (let day = 1; day <= TOTAL_DAYS; day++) {
  const dayDir = path.join(outputDir, `day_${day}`);
  if (!fs.existsSync(dayDir)) {
    fs.mkdirSync(dayDir);
  }

  // 为当天创建故事
  const storiesForDay = [];

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

  for (let story = 1; story <= STORIES_PER_DAY; story++) {
    // 计算当前故事的单词索引范围
    const startIdx = (day - 1) * STORIES_PER_DAY * WORDS_PER_STORY + (story - 1) * WORDS_PER_STORY;
    let endIdx = startIdx + WORDS_PER_STORY;

    // 确保不超出单词总数
    if (endIdx > shuffledWords.length) endIdx = shuffledWords.length;

    // 获取当前故事的单词
    const storyWords = shuffledWords.slice(startIdx, endIdx);

    // 如果没有足够的单词了就退出
    if (storyWords.length === 0) break;

    // 随机选择一个科幻主题
    const randomTheme = sciFiThemes[Math.floor(Math.random() * sciFiThemes.length)];

    // 创建故事内容
    let storyContent = `#### 故事 ${story}: "${randomTheme.theme}的奇遇"\n\n`;

    // 添加单词列表
    storyWords.forEach(word => {
      const name = word.name;
      const translations = word.trans ? word.trans.join(' | ') : '未提供翻译';
      storyContent += `${name}: ${translations}\n\n`;
    });

    // 添加科幻故事创作提示
    storyContent += `**科幻故事创作提示**:\n`;
    storyContent += `推荐主题: **${randomTheme.theme}** - ${randomTheme.description}\n\n`;

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

    // 将故事添加到当天的故事列表中
    storiesForDay.push({
      dayNumber: day.toString(),
      storyNumber: story.toString(),
      storyTitle: randomTheme.theme,
      storyContent: storyContent,
      situationPrompt: situationPrompt,
      wordCount: storyWords.length
    });
  }

  console.log(`第${day}天：创建了${storiesForDay.length}个故事`);

  // 将每个故事保存为单独的文件
  storiesForDay.forEach(story => {
    const storyFileName = `story_${story.dayNumber}_${story.storyNumber}.md`;
    const storyFilePath = path.join(dayDir, storyFileName);

    // 整理故事内容：添加标题和修改创作提示
    let storyFileContent = `# 第${story.dayNumber}天 - 故事${story.storyNumber}：${story.storyTitle}\n\n`;
    storyFileContent += story.storyContent;

    // 添加明确的英文创作指示
    storyFileContent += `请使用以上单词列表中的全部单词（约${story.wordCount}个），创作一个英文科幻短篇故事，故事长度约300-500字，难度为中国初三中考水平（中等偏上）。\n\n`;
    storyFileContent += `**重要：必须使用单词列表中的所有单词，一个都不能漏掉！可以重复使用单词，但每个单词至少要出现一次。**\n\n`;
    storyFileContent += `您可以想象一个关于${story.situationPrompt}的故事情境。\n\n`;

    // 添加简化版的写作建议
    storyFileContent += `**写作建议**: \n`;
    storyFileContent += `1. 故事必须用英文创作，难度控制在中国初三中考水平（中等偏上）\n`;
    storyFileContent += `2. 在故事中用粗体标记所有目标单词，例如："The astronaut boarded the **ship**..."\n`;
    storyFileContent += `3. 使用初三学生熟悉的词汇和简单句式，避免复杂从句\n`;
    storyFileContent += `4. 创建300-500字的完整故事，包含开头、发展和结尾\n`;
    storyFileContent += `5. 确保使用了单词列表中的每一个单词，不要遗漏任何单词\n`;

    fs.writeFileSync(storyFilePath, storyFileContent);

    // 添加到所有故事数组
    allStories.push({
      path: storyFilePath,
      day: story.dayNumber,
      story: story.storyNumber,
      title: story.storyTitle,
      wordCount: story.wordCount
    });
  });

  // 为每天创建一个索引文件
  const dayIndexFileName = `day_${day}_index.md`;
  const dayIndexFilePath = path.join(dayDir, dayIndexFileName);

  const totalWordsToday = storiesForDay.reduce((sum, story) => sum + story.wordCount, 0);

  let dayIndexContent = `# 第${day}天 - 学习计划\n\n`;
  dayIndexContent += `本日包含${storiesForDay.length}个科幻故事，每个故事约${WORDS_PER_STORY}个单词，总计约${totalWordsToday}个单词。\n\n`;
  dayIndexContent += `## 使用说明\n\n`;
  dayIndexContent += `1. 点击下方链接查看每个故事文件\n`;
  dayIndexContent += `2. 将故事文件内容发送给AI大模型，请它根据提示创作适合初三学生的英文科幻故事\n`;
  dayIndexContent += `3. 将生成的英文故事用于学习和TTS音频生成\n\n`;
  dayIndexContent += `## 本日故事列表\n\n`;

  storiesForDay.forEach(story => {
    dayIndexContent += `- [故事${story.storyNumber}：${story.storyTitle}](./story_${story.dayNumber}_${story.storyNumber}.md) - ${story.wordCount}个单词\n`;
  });

  // 添加导航链接
  dayIndexContent += `\n## 导航\n\n`;
  const prevDay = parseInt(day) > 1 ? parseInt(day) - 1 : null;
  const nextDay = parseInt(day) < 30 ? parseInt(day) + 1 : null;

  if (prevDay) {
    dayIndexContent += `[上一天 (第${prevDay}天)](../day_${prevDay}/day_${prevDay}_index.md) | `;
  } else {
    dayIndexContent += `上一天 | `;
  }

  dayIndexContent += `[返回目录](../master_index.md)`;

  if (nextDay) {
    dayIndexContent += ` | [下一天 (第${nextDay}天)](../day_${nextDay}/day_${nextDay}_index.md)`;
  } else {
    dayIndexContent += ` | 下一天`;
  }

  fs.writeFileSync(dayIndexFilePath, dayIndexContent);
}

// 创建总索引文件
const masterIndexPath = path.join(outputDir, 'master_index.md');
const totalWordsInAllStories = allStories.reduce((sum, story) => sum + parseInt(story.wordCount || 0), 0);

let masterIndexContent = `# 中考核心词汇 - 30天科幻故事学习计划\n\n`;
masterIndexContent += `总共30天，每天${STORIES_PER_DAY}个故事，每个故事约${WORDS_PER_STORY}个单词，每天学习约${STORIES_PER_DAY * WORDS_PER_STORY}个单词。\n\n`;
masterIndexContent += `## 使用方法\n\n`;
masterIndexContent += `1. 每天学习一个文件夹中的${STORIES_PER_DAY}个故事\n`;
masterIndexContent += `2. 将每个故事文件单独发送给AI，请它根据提示创作适合初三学生的英文科幻故事（300-500字）\n`;
masterIndexContent += `3. 使用生成的英文故事文本进行TTS音频生成\n`;
masterIndexContent += `4. 聆听音频学习英文单词，每天约30分钟\n\n`;
masterIndexContent += `## 按天查看\n\n`;

// 计算每天的单词数
const wordsByDay = {};
allStories.forEach(story => {
  const day = story.day;
  if (!wordsByDay[day]) wordsByDay[day] = 0;
  wordsByDay[day] += parseInt(story.wordCount || 0);
});

for (let i = 1; i <= 30; i++) {
  const wordsToday = wordsByDay[i.toString()] || 0;
  masterIndexContent += `- [第${i}天](./day_${i}/day_${i}_index.md) - ${STORIES_PER_DAY}个故事 - ${wordsToday}个单词\n`;
}

// 添加统计信息
masterIndexContent += `\n## 统计\n\n`;
masterIndexContent += `- 总单词数: ${totalWordsInAllStories}个\n`;
masterIndexContent += `- 总故事数: ${allStories.length}个\n`;
masterIndexContent += `- 每天故事数: ${STORIES_PER_DAY}个\n`;
masterIndexContent += `- 每个故事单词数: 约${WORDS_PER_STORY}个\n`;
masterIndexContent += `- 每天学习单词数: 约${STORIES_PER_DAY * WORDS_PER_STORY}个\n`;

fs.writeFileSync(masterIndexPath, masterIndexContent);

console.log(`
拆分完成！
- 创建了${TOTAL_DAYS}个日文件夹
- 总共生成了${allStories.length}个故事文件
- 总词汇量: ${totalWordsInAllStories}个单词
- 索引文件保存在 ${masterIndexPath}
`); 