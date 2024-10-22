// pages/api/calendar.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import type { CalendarEvent } from "../../types/calendar";

type ApiResponse =
  | {
      value: CalendarEvent[];
    }
  | {
      error: string;
      details?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log("Session check:", {
      exists: !!session,
      hasToken: !!session?.accessToken,
    });

    if (!session?.accessToken) {
      console.log("No access token found in session:", session);
      return res.status(401).json({ error: "認証が必要です" });
    }

    const { calendarId } = req.query;

    // 今週の日付範囲を取得
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() - today.getDay() + 6);

    console.log(
      "Fetching calendar with token:",
      session.accessToken.substring(0, 10) + "...",
    );

    // URLの構築
    let url = "https://graph.microsoft.com/v1.0/me/calendar/calendarView";

    if (calendarId) {
      url = `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/calendarView`;
    }

    // パラメータの追加
    url += `?startDateTime=${startOfWeek.toISOString()}&endDateTime=${endOfWeek.toISOString()}`;

    console.log("Requesting URL:", url); // デバッグ用

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/json",
        Prefer: 'outlook.timezone="Asia/Tokyo"',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API Error:", errorData);
      throw new Error(
        `Graph API Error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    console.log(`Retrieved ${data.value?.length || 0} events`);

    res.status(200).json(data);
  } catch (error) {
    console.error("Calendar API Error:", error);
    res.status(500).json({
      error: "カレンダーの取得に失敗しました",
      details: error instanceof Error ? error.message : "未知のエラー",
    });
  }
}
