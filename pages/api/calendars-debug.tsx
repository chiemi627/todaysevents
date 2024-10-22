// pages/api/calendars-debug.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.accessToken) {
      return res.status(401).json({ error: "認証が必要です" });
    }

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/calendars',
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Graph API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // カレンダー情報を見やすく整形
    const formattedCalendars = data.value.map(cal => ({
      id: cal.id,
      name: cal.name,
      owner: cal.owner?.name || 'Unknown',
      isDefault: cal.isDefaultCalendar || false,
      canShare: cal.canShare || false,
      canViewPrivateItems: cal.canViewPrivateItems || false
    }));

    res.status(200).json({
      total: formattedCalendars.length,
      calendars: formattedCalendars
    });

  } catch (error) {
    console.error('Calendars API Error:', error);
    res.status(500).json({ 
      error: "カレンダー一覧の取得に失敗しました",
      details: error instanceof Error ? error.message : '未知のエラー'
    });
  }
}