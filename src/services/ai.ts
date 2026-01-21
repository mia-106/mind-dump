export interface AIReply {
  color: string;
  reply: string;
}

export interface AINudge {
  nudge: string;
}

export const fetchNudge = async (recentMessages: string[]): Promise<AINudge> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'nudge', recentMessages }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek Nudge Response:', data);
    return data as AINudge;
  } catch (error) {
    console.error('Failed to fetch AI nudge:', error);
    throw error;
  }
};

export const fetchAIReply = async (content: string): Promise<AIReply> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek Raw Response:', data); // 验证连接：打印原始结果
    return data as AIReply;
  } catch (error) {
    console.error('Failed to fetch AI reply:', error);
    // 不再伪造回复，抛出错误让 UI 处理
    throw error;
  }
};
