import { GoogleGenAI } from "@google/genai";

// Safely access env vars in various build environments
const getApiKey = () => {
  try {
    // Standard Node/Webpack/Create-React-App
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Vite (uses import.meta.env) - accessed safely to prevent syntax errors in older parsers
    // Note: In a real Vite project, you would use import.meta.env.VITE_API_KEY
  } catch (e) {
    // Ignore errors
  }
  return '';
};

// Initialize the client.
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getGeminiHint = async (
  levelDescription: string, 
  userCode: string, 
  errorMessage: string | null
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("API Key not found. Mocking response for demo.");
      return "APIキーが設定されていないため、AIヒント機能は現在利用できませんが、コードを見直して頑張りましょう！ループの回数や角度は正しいですか？";
    }

    const model = 'gemini-2.5-flash';
    
    const prompt = `
      あなたはプログラミング初心者にPythonを教える優しい先生です。日本語で答えてください。
      ユーザーは次の課題に取り組んでいます: "${levelDescription}".
      
      現在のユーザーのコード:
      \`\`\`python
      ${userCode}
      \`\`\`
      
      ${errorMessage ? `エラーが発生しています: ${errorMessage}` : 'コードは動きましたが、正解の図形になりませんでした。'}
      
      短く、励ましになるようなヒントを2文以内で教えてください。
      直接的な答え（コードそのもの）は教えないでください。
      論理、幾何学的なヒント、または構文の修正点に焦点を当ててください。
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "あきらめないで！もう少しです。";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "うまく思考できませんでした。インターネット接続を確認してください。";
  }
};