// pages/calendars-debug.tsx
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { NextPage } from "next";

interface CalendarInfo {
  id: string;
  name: string;
  owner: string;
  isDefault: boolean;
  canShare: boolean;
  canViewPrivateItems: boolean;
}

const CalendarsDebug: NextPage = () => {
  const { data: session } = useSession();
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchCalendars();
    }
  }, [session]);

  const fetchCalendars = async () => {
    try {
      const response = await fetch('/api/calendars-debug');
      if (!response.ok) {
        throw new Error('カレンダー情報の取得に失敗しました');
      }
      const data = await response.json();
      setCalendars(data.calendars);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知のエラー');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">利用可能なカレンダー一覧</h1>
      <div className="space-y-4">
        {calendars.map((calendar) => (
          <div key={calendar.id} className="border p-4 rounded-lg">
            <div className="font-bold text-lg">
              {calendar.name}
              {calendar.isDefault && (
                <span className="ml-2 text-sm text-blue-500">(デフォルト)</span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <div>ID: {calendar.id}</div>
              <div>所有者: {calendar.owner}</div>
              <div>
                権限: 
                {calendar.canShare && ' 共有可能 '}
                {calendar.canViewPrivateItems && ' プライベート項目の表示可能 '}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarsDebug;