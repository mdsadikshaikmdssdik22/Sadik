import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// Helper to check if API key is present and not dummy placeholder
function getValidApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key.trim();
}

// Instantiate GoogleGenAI client on server
function getAIClient(): GoogleGenAI | null {
  const apiKey = getValidApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Status endpoint: Reports whether AI is configured and allows live testing
app.get('/api/status', async (req, res) => {
  const apiKey = getValidApiKey();
  const shouldTest = req.query.test === 'true';

  if (!apiKey) {
    return res.json({
      configured: false,
      tested: false,
      working: false,
      model: 'gemini-3.8-flash',
      message: 'GEMINI_API_KEY ఇంకా సెట్ చేయబడలేదు. దయచేసి Google AI Studio Secrets లో మీ ఉచిత API కీని జోడించండి.',
    });
  }

  if (shouldTest) {
    try {
      const ai = getAIClient();
      if (!ai) throw new Error('AI క్లయింట్ ప్రారంభించబడలేదు.');

      const testResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'హలో, ఇది కనెక్షన్ పరీక్ష.',
        config: {
          thinkingConfig: { thinkingLevel: 'LOW' as any },
        },
      });

      const reply = testResponse.text || '';
      return res.json({
        configured: true,
        tested: true,
        working: true,
        model: 'gemini-3.8-flash',
        sampleReply: reply.slice(0, 50),
        message: 'Gemini 3.8 Flash విజయవంతంగా కనెక్ట్ అయింది! మీ తెలుగు AI సిద్ధంగా ఉంది.',
      });
    } catch (err: any) {
      console.error('Gemini test error:', err);
      return res.status(502).json({
        configured: true,
        tested: true,
        working: false,
        model: 'gemini-3.8-flash',
        error: err?.message || 'తెలియని లోపం',
        message: 'Gemini API ని సంప్రదించడంలో లోపం ఏర్పడింది. API కీ సరైనదేనా లేదా కోటా పూర్తయిందా అని తనిఖీ చేయండి.',
      });
    }
  }

  // Configured but untested
  return res.json({
    configured: true,
    tested: false,
    working: false,
    model: 'gemini-3.8-flash',
    message: 'API కీ కనుగొనబడింది. కనెక్షన్‌ని ధృవీకరించడానికి "పరీక్షించండి" నొక్కండి.',
  });
});

// Chat endpoint: Handles real AI prompts server-side without exposing API key
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], category = 'general' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'సందేశం ఖాళీగా ఉండకూడదు.',
      });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        configured: false,
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'AI సర్వీస్ ఇంకా కనెక్ట్ కాలేదు. Google AI Studio Secrets లో GEMINI_API_KEY ని కాన్ఫిగర్ చేయండి.',
      });
    }

    const systemInstruction = `మీరు "నా తెలుగు AI సహాయకుడు" (My Telugu AI Assistant) - తెలుగు మాట్లాడే మొబైల్ వినియోగదారుల కోసం ప్రత్యేకంగా రూపొందించబడిన స్నేహపూర్వక, నైపుణ్యం కలిగిన వ్యక్తిగత AI సహాయకుడు.

ప్రధాన నియమాలు:
1. మీ మొత్తం సమాధానం మాతృభాష అయిన స్వచ్ఛమైన, సరళమైన మరియు గౌరవప్రదమైన తెలుగులో ఉండాలి (ఉదాహరణకు: "మీరు", "చేయగలరు", "నమస్కారం").
2. అవసరమైన చోట ఆంగ్ల సాంకేతిక పదాలు, ఇంగ్లీష్ వాక్యాలు లేదా రెజ్యూమ్ హెడ్డింగ్స్ బ్రాకెట్లలో లేదా ప్రత్యేక పాయింట్లలో ఇవ్వండి.
3. మీరు క్రింది రంగాలలో ప్రత్యేక నైపుణ్యం కలిగి ఉన్నారు:
   - 📚 చదువు & విద్య (Education, Math, Science, School/College topics with simple steps and examples).
   - 📝 పరీక్షల సమాధానాలు (Exam answers, clear structured headings, step-by-step scoring points).
   - 🌐 ఇంగ్లీష్ అనువాదం (Telugu to English & English to Telugu translation with grammatical explanation and everyday usage).
   - 📄 రెజ్యూమ్ సాయం (Professional resumes, ATS keywords, bullet points for work experience, college fresher formats).
   - 💼 ఉద్యోగ దరఖాస్తులు (Cover letters, email drafting, HR interview answers, professional etiquette).
   - 📅 రోజువారీ ప్రణాళిక (Daily timetable, productivity tips, task prioritizing, habit plans).
4. మొబైల్ స్క్రీన్‌పై స్పష్టంగా కనిపించేలా బుల్లెట్ పాయింట్లు, బోల్డ్ హెడ్డింగులు, క్లీన్ స్పేసింగ్ ఉపయోగించండి. పెద్ద పెద్ద పేరాలను నివారించండి.`;

    // Build contents array with past history if provided
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Keep last 6 exchanges to manage context
      const recentHistory = history.slice(-6);
      for (const item of recentHistory) {
        if (item.text && item.role) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'క్షమించండి, సమాధానం రూపొందించడంలో సమస్య ఎదురైంది.';

    return res.json({
      success: true,
      configured: true,
      reply,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Server chat error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'సర్వర్‌లో అనుకోని లోపం జరిగింది',
      message: 'AI సేవ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి కాసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.',
    });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`My Telugu AI Assistant server running at http://0.0.0.0:${port}`);
  });
}

startServer();
