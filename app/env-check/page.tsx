/**
 * @file app/env-check/page.tsx
 * @description 환경 변수 설정 상태 확인 페이지
 *
 * 이 페이지는 개발 중 필요한 환경 변수가 모두 설정되어 있는지 확인합니다.
 * 브라우저에서 /env-check 경로로 접속하여 확인할 수 있습니다.
 */

import { checkEnvVars } from "@/lib/utils/env-check";

export default function EnvCheckPage() {
  // 서버 컴포넌트에서 환경 변수 확인
  const envStatus = checkEnvVars();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">환경 변수 설정 상태</h1>
      
      <div className="space-y-6">
        {/* 한국관광공사 API */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📌 한국관광공사 API
            {envStatus.tourApi.allSet ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">NEXT_PUBLIC_TOUR_API_KEY</span>
              {envStatus.tourApi.nextPublic ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">TOUR_API_KEY (백업)</span>
              {envStatus.tourApi.backup ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-yellow-600">⚠️ 미설정 (선택사항)</span>
              )}
            </div>
            {!envStatus.tourApi.allSet && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>설정 방법:</strong> 한국관광공사 공공 API에서 API 키를 발급받아 .env 파일에 추가하세요.
                  <br />
                  <a
                    href="https://www.data.go.kr/data/15101578/openapi.do"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    한국관광공사 API 발급 페이지 →
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 구글 지도 API */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🗺️ 구글 지도 API
            {envStatus.googleMaps.allSet ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
              {envStatus.googleMaps.apiKey ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
            {!envStatus.googleMaps.allSet && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>설정 방법:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Google Cloud Console에서 프로젝트 생성</li>
                    <li>Maps JavaScript API 활성화</li>
                    <li>API 키 발급 후 .env 파일에 추가</li>
                  </ol>
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 inline-block"
                  >
                    Google Cloud Console →
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Clerk (이미 설정됨) */}
        <section className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔐 Clerk (이미 설정됨)
            {envStatus.clerk.allSet ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>
              {envStatus.clerk.publishable ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">CLERK_SECRET_KEY</span>
              {envStatus.clerk.secret ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
          </div>
        </section>

        {/* Supabase (이미 설정됨) */}
        <section className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🗄️ Supabase (이미 설정됨)
            {envStatus.supabase.allSet ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
              {envStatus.supabase.url ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              {envStatus.supabase.anonKey ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
              {envStatus.supabase.serviceRole ? (
                <span className="text-green-600">✅ 설정됨</span>
              ) : (
                <span className="text-red-600">❌ 미설정</span>
              )}
            </div>
          </div>
        </section>

        {/* 전체 상태 요약 */}
        <section className="border rounded-lg p-6 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">📊 전체 상태 요약</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>한국관광공사 API</span>
              {envStatus.tourApi.allSet ? (
                <span className="text-green-600 font-semibold">✅ 완료</span>
              ) : (
                <span className="text-red-600 font-semibold">❌ 미완료</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>구글 지도 API</span>
              {envStatus.googleMaps.allSet ? (
                <span className="text-green-600 font-semibold">✅ 완료</span>
              ) : (
                <span className="text-red-600 font-semibold">❌ 미완료</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Clerk</span>
              {envStatus.clerk.allSet ? (
                <span className="text-green-600 font-semibold">✅ 완료</span>
              ) : (
                <span className="text-red-600 font-semibold">❌ 미완료</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Supabase</span>
              {envStatus.supabase.allSet ? (
                <span className="text-green-600 font-semibold">✅ 완료</span>
              ) : (
                <span className="text-red-600 font-semibold">❌ 미완료</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

