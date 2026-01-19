
import { GoogleGenAI } from "@google/genai";
import { FutsalEvent, AttendanceStatus } from "../types";

export const getTeamStrategy = async (event: FutsalEvent) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("Gemini API Key is missing. Please set API_KEY in your environment variables.");
    return "APIキーが設定されていません。管理者に連絡してください。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const attendingCount = event.attendees.filter(a => a.status === AttendanceStatus.GOING).length;
  const attendingNames = event.attendees
    .filter(a => a.status === AttendanceStatus.GOING)
    .map(a => a.userName)
    .join(", ");

  const prompt = `
    フットサルチームのイベントに関するアドバイスをお願いします。
    イベント名: ${event.title}
    場所: ${event.location}
    イベントタイプ: ${event.type}
    参加人数: ${attendingCount}名
    参加者: ${attendingNames}

    上記の情報に基づき、以下の3点について日本語で回答してください：
    1. 推奨される練習メニューまたは試合プラン
    2. 参加人数に対するおすすめの交代ペース
    3. モチベーションを上げる一言
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      return "APIキーが無効です。設定を確認してください。";
    }
    return "AIアドバイスの取得中にエラーが発生しました。";
  }
};
