import { useSession, signIn, signOut } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Calendar, Clock, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import type { CalendarEvent } from "../types/calendar";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const calendarId =
    "AAMkADI3NjQ4M2FiLTJmYTItNDAyNi05NGVkLWNmMDMyOGQ5OGM1NQBGAAAAAAApVe3kao9RQJEX4S3FlLnVBwDoBNRECihNRokzM1BXhmxeAAAAAAEGAADoBNRECihNRokzM1BXhmxeAAE_JlilAAA=";

  useEffect(() => {
    if (session) {
      void fetchEvents();
    }
  }, [session]);

  const fetchEvents = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendar?calendarId=${calendarId}`);
      if (!response.ok) {
        throw new Error("カレンダーの取得に失敗しました");
      }
      const data = await response.json();
      // value プロパティからイベントの配列を取得
      setEvents(data.value || []);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "未知のエラーが発生しました",
      );
      setLoading(false);
      // エラー時は空配列をセット
      setEvents([]);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <button
          onClick={() => void signIn("azure-ad")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Microsoftアカウントでログイン
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Outlookカレンダー</h1>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              今週の予定
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : error ? (
              <div className="text-red-500 py-4">エラー: {error}</div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                今週の予定はありません
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="font-semibold text-lg">{event.subject}</div>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.start.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(event.start.dateTime)} -{" "}
                        {formatTime(event.end.dateTime)}
                      </span>
                    </div>
                    {event.location?.displayName && (
                      <div className="text-gray-600 mt-1">
                        場所: {event.location.displayName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
