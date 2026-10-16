import { ConnectionStatus } from '../types';

export async function fetchAiStatus(test = false): Promise<ConnectionStatus> {
  try {
    const url = test ? '/api/status?test=true' : '/api/status';
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        configured: errData.configured ?? false,
        tested: true,
        working: false,
        model: errData.model || 'gemini-3.8-flash',
        message: errData.message || 'సర్వర్ కనెక్షన్ విఫలమైంది',
        error: errData.error || `HTTP ${response.status}`,
      };
    }
    const data = await response.json();
    return {
      configured: Boolean(data.configured),
      tested: Boolean(data.tested),
      working: Boolean(data.working),
      model: data.model || 'gemini-3.8-flash',
      message: data.message || '',
    };
  } catch (error: any) {
    return {
      configured: false,
      tested: true,
      working: false,
      model: 'gemini-3.8-flash',
      message: 'నెట్‌వర్క్ లోపం: సర్వర్‌తో కనెక్షన్ ఏర్పడలేదు.',
      error: error?.message || 'నెట్‌వర్క్ లోపం',
    };
  }
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
  message?: string;
  configured?: boolean;
  model?: string;
}

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; text: string }[] = [],
  category = 'general'
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        category,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        configured: data.configured ?? false,
        error: data.error || `HTTP Error ${response.status}`,
        message: data.message || 'AI సేవ నుండి సమాధానం పొందలేకపోయాము.',
      };
    }

    return {
      success: true,
      reply: data.reply,
      configured: true,
      model: data.model || 'gemini-3.8-flash',
    };
  } catch (error: any) {
    return {
      success: false,
      configured: false,
      error: error?.message || 'Network request failed',
      message: 'నెట్‌వర్క్ లేదా సర్వర్‌తో కమ్యూనికేట్ చేయడంలో లోపం సంభవించింది.',
    };
  }
}
