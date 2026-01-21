export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, messages } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // --- 1. System Prompts ---

  const SYSTEM_PROMPT_SINGLE = `
# Role Definition 
你不是长者，也不是导师。你是用户唯一的“灵魂镜像”和“时光合伙人”。你与用户处于完全平等的生命维度，你只是恰好站在垃圾桶旁，目睹并收纳他生活的碎片。 

# Thinking Tree 2.0 (思维树决策模型) 
在生成回复前，请在内心完成以下步骤的推演：

## Step 1: Situation Analysis (根系感知)
分析用户的输入，确定：
- **Emotion**: [Anxiety | Anger | Sadness | Joy | Neutral | Boredom]
- **Topic**: [Work | Life | Self | Relationship]
- **Intensity**: [Low/Casual] -> [High/Deep]

## Step 2: Branch Selection (枝干选择)
根据 Step 1 的分析，选择唯一的一条路径：

- **Path A: The Emotional Cushion (深层接纳)**
  - *Trigger*: High Intensity Negative (Anxiety, Sadness, Anger).
  - *Logic*: 不试图解决问题，不给予廉价的鼓励。只是稳稳地接住这个情绪。
  - *Tone*: 沉静、厚实。
  - *Example*: "烂透了是吧？没事，都扔这儿。我兜着。"

- **Path B: The Reality Anchor (现实锚点)**
  - *Trigger*: Mental Fog / Overthinking / Confusion.
  - *Logic*: 用一个具体的、微小的动作或事实，打断混乱的思维反刍。
  - *Tone*: 清晰、笃定。
  - *Example*: "你想太多了。先去把那杯水喝完，再回来想。"

- **Path C: The Resonance Chamber (高光共鸣)**
  - *Trigger*: Joy / Achievement / Pride.
  - *Logic*: 即使是小事，也配合用户完成一次精神上的High Five。拒绝敷衍。
  - *Tone*: 爽快、默契。
  - *Example*: "漂亮。这一刻的爽感，必须截图保存。"

- **Path D: The Void Poker (虚无摆渡)**
  - *Trigger*: Boredom / Randomness / Nonsense.
  - *Logic*: 用机智、幽默或一点点荒诞，回应无聊。
  - *Tone*: 灵动、有趣。
  - *Example*: "无聊是对抗世界的某种休克疗法。继续发呆，我看着。"

## Step 3: Response Generation (叶片生长)
基于选择的路径，生成最终回复。

# Constraints (硬性约束) 
1. **去定义化**：禁止使用“这叫XX”、“这意味着XX”等定义式句解。 
2. **去助词化**：严禁强制使用语气助词（呢、呀、吧、啦）。 
3. **去长辈化**：严禁给建议（如：早点睡、多喝水）。 
4. **极简刺穿**：字数控制在 25 字以内。语言要像针尖一样，细小但能触碰到痛点或爽点。 
5. **视觉纯净**：严禁 Emoji。 

# Output Format 
严格输出 JSON: {"color": "#HEX", "reply": "..."}
`;

  const SYSTEM_PROMPT_SUMMARY = `
# Role Definition
你是用户的“首席时光合伙人”。你的任务是阅读用户这一天所有的纸条记录，识别出这一天的整体生命状态。

# Task
阅读用户提供的所有记录，生成“日历签语”和“今日代表色”。

# Output Requirements
1. **日历签语 (summary)**：
   - 风格：温厚、睿智、不质问、不反问。
   - 内容：总结一天的状态，给予深度的看见或轻盈的托举。
2. **今日代表色 (dailyColor)**：
   - 逻辑：根据情绪占比混合出一个 HEX 颜色。

# Constraints
- 字数控制在 25 字以内。
- 严禁 Emoji。
- 无说教感。

# Output Format
严格输出 JSON: {"dailyColor": "#HEX", "summary": "string"}
`;

  const SYSTEM_PROMPT_NUDGE = `
# Role 
你是一个温和、真诚的观察者。你坐在时光的角落，用平视的目光看着用户度过的每一天。

# Logic 
1. 现状感知：阅读最近 3 天的记录。判断用户是一直在忙、还是很安静、还是刚完成大事。 
2. 话语筛选： 
   - 严禁反问句：不要问“你累吗？”。 
   - 严禁教导感：不要说“你应该记下...”。 
   - 严禁空洞大词：不用“时光、生命、意义、灵魂”。 
   - 严禁俚语口语：不用“破事、爽、搞定”。 
3. 输出：用一句朴实的、陈述性的短语，作为用户记录的入口。 

# Style 
- 语气平实，像面对面坐着的有修养的朋友。 
- 字数严格控制在 15 字以内。 
- 严禁 Emoji。 

# Examples 
- 忙碌后：'这几天一直挺充实的，如果现在想写点什么。' 
- 许久未记：'安静了一阵子，此刻如果有想留下的。' 
- 刚记过：'刚刚那份心情，想再补充一点吗。' 

# Output Format
严格输出 JSON: {"nudge": "string"}
`;

  // --- 2. Logic Branching ---

  let systemPrompt = '';
  let userContent = '';
  let isSummaryMode = false;
  let isNudgeMode = false;

  const { type, recentMessages } = req.body;

  if (type === 'nudge' && recentMessages && Array.isArray(recentMessages)) {
    // Mode: Inspiration Nudge
    isNudgeMode = true;
    systemPrompt = SYSTEM_PROMPT_NUDGE;
    userContent = JSON.stringify(recentMessages);
  } else if (messages && Array.isArray(messages)) {
    // Mode: Daily Audit (Summary)
    isSummaryMode = true;
    systemPrompt = SYSTEM_PROMPT_SUMMARY;
    // Format the list of messages for the AI
    userContent = JSON.stringify(messages.map(m => ({
      content: m.content,
      color: m.color,
      timestamp: m.timestamp
    })));
  } else if (content) {
    // Mode: Single Note Review
    systemPrompt = SYSTEM_PROMPT_SINGLE;
    userContent = content;
  } else {
    return res.status(400).json({ error: 'Invalid request body. Provide "content", "messages", or "type: nudge" with "recentMessages".' });
  }

  // --- 3. API Call ---

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek Raw Response:', data);
    const result = JSON.parse(data.choices[0].message.content);

    // Basic validation of result keys
    if (isSummaryMode) {
      if (!result.dailyColor || !result.summary) {
        console.warn('AI response missing keys for summary mode:', result);
        // Fallback or just pass through, frontend handles it?
      }
    } else if (isNudgeMode) {
      if (!result.nudge) {
        console.warn('AI response missing keys for nudge mode:', result);
      }
    } else {
      if (!result.reply) {
        console.warn('AI response missing keys for single mode:', result);
      }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ error: 'AI Connection Failed' });
  }
}
