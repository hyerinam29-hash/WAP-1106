/**
 * @file app/api-test/page.tsx
 * @description API 연결 테스트 페이지
 *
 * 이 페이지는 한국관광공사 API의 연결 상태를 테스트합니다.
 */

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ApiTestPage() {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  let testResult: {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
    url?: string;
  } = {
    success: false,
    message: "테스트 준비 중...",
  };

  if (!apiKey) {
    testResult = {
      success: false,
      message: "API 키가 설정되지 않았습니다.",
    };
  } else {
    try {
      // 간단한 API 호출 테스트 (지역코드 조회)
      const url = `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${apiKey}&numOfRows=5&pageNo=1&MobileOS=ETC&MobileApp=MyTrip&_type=json`;

      console.log("🧪 API 테스트 시작");
      console.log("요청 URL:", url.replace(apiKey, "***"));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTrip/1.0",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      console.log("응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}\n${errorText.substring(0, 200)}`
        );
      }

      const data = await response.json();
      console.log("응답 데이터:", JSON.stringify(data, null, 2));

      testResult = {
        success: true,
        message: "API 연결 성공!",
        data: data,
        url: url.replace(apiKey, "***"),
      };
    } catch (error) {
      console.error("❌ API 테스트 실패:", error);

      let errorMessage = "알 수 없는 오류";
      let errorDetails = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.name === "AbortError") {
          errorMessage = "요청 시간 초과 (10초)";
        } else if (error.message.includes("fetch")) {
          errorMessage = "네트워크 연결 실패";
          errorDetails = error.message;
        }
      }

      testResult = {
        success: false,
        message: `API 연결 실패: ${errorMessage}`,
        error: errorDetails || String(error),
      };
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">API 연결 테스트</h1>

      {/* 테스트 결과 */}
      <div
        className={`border rounded-lg p-6 ${
          testResult.success
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">
            {testResult.success ? "✅" : "❌"}
          </span>
          <h2 className="text-xl font-semibold">
            {testResult.success ? "연결 성공" : "연결 실패"}
          </h2>
        </div>

        <p
          className={`text-sm mb-4 ${
            testResult.success ? "text-green-800" : "text-red-800"
          }`}
        >
          {testResult.message}
        </p>

        {/* API 키 정보 */}
        <div className="mb-4 p-3 bg-white border rounded">
          <p className="text-xs font-mono text-muted-foreground">
            API 키: {apiKey ? `${apiKey.substring(0, 20)}...` : "미설정"}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            키 길이: {apiKey?.length || 0}자
          </p>
        </div>

        {/* 요청 URL */}
        {testResult.url && (
          <div className="mb-4 p-3 bg-white border rounded">
            <p className="text-xs font-semibold mb-1">요청 URL:</p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {testResult.url}
            </p>
          </div>
        )}

        {/* 응답 데이터 (성공 시) */}
        {testResult.success && testResult.data && (
          <div className="mt-4 p-3 bg-white border rounded">
            <p className="text-xs font-semibold mb-2">응답 데이터:</p>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}

        {/* 에러 상세 (실패 시) */}
        {!testResult.success && testResult.error && (
          <div className="mt-4 p-3 bg-white border rounded">
            <p className="text-xs font-semibold mb-2">에러 상세:</p>
            <pre className="text-xs font-mono text-red-600 overflow-x-auto">
              {testResult.error}
            </pre>
          </div>
        )}
      </div>

      {/* 해결 방법 안내 */}
      {!testResult.success && (
        <div className="mt-6 p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold mb-3">🔧 해결 방법</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
            <li>
              <strong>개발 서버 재시작:</strong>
              <br />
              <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
                Ctrl+C로 서버 중지 후 pnpm dev 재실행
              </code>
            </li>
            <li>
              <strong>인터넷 연결 확인:</strong>
              <br />
              브라우저에서 다른 사이트 접속 테스트
            </li>
            <li>
              <strong>방화벽/보안 프로그램 확인:</strong>
              <br />
              일시적으로 비활성화 후 테스트
            </li>
            <li>
              <strong>API 키 재발급:</strong>
              <br />
              <a
                href="https://www.data.go.kr/data/15101578/openapi.do"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                한국관광공사 API 발급 페이지 →
              </a>
            </li>
            <li>
              <strong>브라우저 콘솔 확인:</strong>
              <br />
              개발자 도구(F12) → Console/Network 탭에서 에러 확인
            </li>
          </ol>
        </div>
      )}

      {/* 추가 정보 */}
      <div className="mt-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-sm">💡 참고 정보</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-blue-900">
          <li>이 페이지는 서버 컴포넌트에서 API를 직접 호출합니다.</li>
          <li>성공 시 API 서버와의 연결은 정상입니다.</li>
          <li>실패 시 네트워크 또는 환경 설정을 확인하세요.</li>
          <li>
            페이지를 새로고침(F5)하면 테스트가 다시 실행됩니다.
          </li>
        </ul>
      </div>

      {/* 다른 테스트 페이지 링크 */}
      <div className="mt-6 flex gap-3">
        <Link href="/env-check">
          <Button variant="outline">환경 변수 확인</Button>
        </Link>
        <Link href="/">
          <Button>홈으로</Button>
        </Link>
      </div>
    </div>
  );
}

