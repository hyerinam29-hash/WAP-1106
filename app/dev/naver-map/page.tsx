/**
 * @file app/dev/naver-map/page.tsx
 * @description 네이버 지도 최소 재현 페이지 (공식 가이드의 Hello, World 예제 기반)
 *
 * - 공식 문서: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
 * - 핵심: ncpKeyId 파라미터 사용 + callback으로 지도 초기화
 *
 * 이 페이지는 인증/도메인 설정을 빠르게 검증하기 위한 최소 구현입니다.
 * 브라우저에서 /dev/naver-map 경로로 접속해 지도 표시/에러 상태를 확인하세요.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// naver 타입은 components/naver-map.tsx에서 이미 선언되어 있으므로 여기서는 추가 선언만
declare global {
  interface Window {
    initMap?: () => void;
    navermap_authFailure?: () => void;
  }
}

export default function NaverMapTestPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    console.group("🗺️ 네이버 지도 API 디버깅");
    console.log("환경 변수 Client ID:", clientId);
    console.log("현재 도메인:", window.location.origin);
    console.log("전체 URL:", window.location.href);

    if (!clientId) {
      console.error("❌ Client ID 환경 변수 없음");
      console.groupEnd();
      setIsLoading(false);
      setError(
        [
          "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경 변수가 설정되지 않았습니다.",
          "",
          "해결 방법:",
          "1) .env.local 파일에 다음을 추가:",
          "   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_Client_ID",
          "2) 개발 서버를 재시작한 뒤 페이지를 새로고침하세요 (Ctrl+Shift+R).",
        ].join("\n")
      );
      return;
    }

    console.log("✅ Client ID 확인 완료");

    // 이미 로드된 경우 재사용
    if (window.naver?.maps && mapRef.current) {
      try {
        new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.3595704, 127.105399),
          zoom: 10,
        });
        setIsLoading(false);
      } catch (e) {
        setError("네이버 지도 초기화 중 오류가 발생했습니다.");
      }
      return;
    }

    // 인증 실패 훅 (공식 제공)
    window.navermap_authFailure = () => {
      console.error("❌ navermap_authFailure 콜백 호출됨");
      console.error("인증 실패 원인: NCP 콘솔에서 도메인/키/서비스 설정 문제");
      console.groupEnd();
      
      setIsLoading(false);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      setError(
        [
          "❌ navermap_authFailure: 인증 실패 감지",
          "",
          "현재 설정:",
          `- Client ID: ${clientId}`,
          `- 파라미터: ${paramName}`,
          `- 현재 도메인: ${origin}`,
          `- 스크립트 URL: ${script.src}`,
          "",
          "해결 방법:",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
          "1️⃣ 네이버 클라우드 플랫폼 콘솔 접속:",
          "   https://console.ncloud.com/",
          "",
          "2️⃣ Application 선택:",
          "   AI·Application Service → AI·NAVER API → Application",
          "   → Client ID 'jz6mn8mwj2' 선택",
          "",
          "3️⃣ 'API 설정' 탭 클릭",
          "",
          "4️⃣ '서비스 URL' 섹션:",
          "   - '추가' 버튼 클릭",
          `   - 정확히 입력: ${origin}`,
          "   - 슬래시(/) 없이, 포트 번호(:3000) 포함",
          "",
          "5️⃣ 'Web Dynamic Map' 또는 'Maps API' 서비스:",
          "   - 활성화 확인 (토글 ON)",
          "",
          "6️⃣ '저장' 버튼 클릭 (중요!)",
          "",
          "7️⃣ 브라우저에서 하드 새로고침 (Ctrl+Shift+R)",
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
          "💡 추가 확인:",
          `- 브라우저 주소창: ${origin}`,
          "- localhost와 127.0.0.1은 다른 도메인입니다",
          "- 콘솔 개발자 도구(F12) → Network 탭에서",
          "  'maps.js' 요청의 Status 코드 확인",
        ].join("\n")
      );
    };

    // 콜백에서 지도 초기화
    window.initMap = () => {
      console.log("✅ initMap 콜백 호출됨");
      
      if (!mapRef.current || !window.naver?.maps) {
        console.error("❌ 지도 컨테이너 또는 API 없음");
        console.groupEnd();
        setError("지도 컨테이너 또는 네이버 지도 API를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("🗺️ 지도 초기화 시작...");
        new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.3595704, 127.105399),
          zoom: 10,
        });
        console.log("✅ 지도 초기화 성공!");
        console.groupEnd();
        setIsLoading(false);
      } catch (e) {
        console.error("❌ 지도 초기화 실패:", e);
        console.groupEnd();
        setError("네이버 지도 초기화 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    // 스크립트 동적 로드
    // 공식 문서: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    // 최신 파라미터: ncpKeyId (구버전: ncpClientId)
    const useNewParam = true; // ncpKeyId 사용 (false로 변경하면 ncpClientId 시도)
    const paramName = useNewParam ? "ncpKeyId" : "ncpClientId";
    
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${paramName}=${clientId}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    console.log("📡 스크립트 로드 URL:", script.src);
    console.log(`📌 사용 파라미터: ${paramName}`);
    
    // 401 에러 감지를 위한 fetch 요청 (스크립트 로드 전 인증 확인)
    const authUrl = `https://oapi.map.naver.com/v3/auth?ncpKeyId=${clientId}&url=${encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    )}`;
    
    // 인증 상태 사전 확인 (선택 사항, 스크립트 로드와 병렬로 실행)
    fetch(authUrl)
      .then((response) => {
        if (response.status === 401) {
          setIsLoading(false);
          const origin =
            typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          setError(
            [
              "❌ 401 Unauthorized: 네이버 지도 API 인증 실패",
              "",
              "원인:",
              "1. Client ID가 잘못되었거나",
              "2. 서비스 URL(도메인)이 등록되지 않았거나",
              "3. Maps API 서비스가 활성화되지 않았습니다.",
              "",
              "해결 방법:",
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              "",
              "1️⃣ 네이버 클라우드 플랫폼 콘솔 접속:",
              "   https://console.ncloud.com/",
              "",
              "2️⃣ Application 선택:",
              "   AI·Application Service → AI·NAVER API → Application 등록 정보",
              "",
              "3️⃣ API 설정 탭 열기:",
              "   Client ID 선택 → 'API 설정' 탭 클릭",
              "",
              "4️⃣ 서비스 URL 등록:",
              `   '서비스 URL' 목록에 다음을 추가:`,
              `   ${origin}`,
              "",
              "   ⚠️ 중요:",
              "   - http://localhost:3000 (정확히 일치해야 함)",
              "   - 포트 번호까지 포함",
              "   - http와 https는 별도로 등록 필요",
              "",
              "5️⃣ Maps API 서비스 활성화:",
              "   'Maps API' 서비스가 활성화되어 있는지 확인",
              "",
              "6️⃣ 저장 후 재시작:",
              "   - 콘솔에서 '저장' 클릭",
              "   - 개발 서버 재시작 (pnpm dev)",
              "   - 브라우저 하드 새로고침 (Ctrl+Shift+R)",
              "",
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              "",
              "현재 설정:",
              `- Client ID: ${clientId}`,
              `- 현재 도메인: ${origin}`,
              `- 인증 URL: ${authUrl}`,
            ].join("\n")
          );
        }
      })
      .catch(() => {
        // fetch 실패는 무시 (스크립트 로드가 정상이면 문제없음)
      });
    
    script.onerror = (error) => {
      console.error("❌ 스크립트 로드 실패:", error);
      console.error("스크립트 URL:", script.src);
      console.groupEnd();
      
      setIsLoading(false);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      setError(
        [
          "❌ 네이버 지도 스크립트 로드 실패",
          "",
          "확인 사항:",
          "- 인터넷 연결 상태",
          "- Client ID 유효성",
          "- 서비스 URL(도메인) 등록 여부",
          "- 방화벽/보안 프로그램 차단 여부",
          "",
          `현재 도메인: ${origin}`,
          `Client ID: ${clientId}`,
          `스크립트 URL: ${script.src}`,
        ].join("\n")
      );
    };
    
    script.onload = () => {
      console.log("✅ 스크립트 파일 로드 완료");
      console.log("⏳ initMap 콜백 대기 중...");
      // initMap이 호출되거나 navermap_authFailure가 호출됨
    };
    
    document.head.appendChild(script);
    console.log("📤 스크립트 태그 추가 완료");

    // cleanup: 스크립트/전역 콜백은 유지 (다른 페이지 전환 용이)
    return () => {
      console.groupEnd();
    };
  }, []);

  return (
    <section className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">네이버 지도 최소 예제</h1>

      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
          지도를 불러오는 중...
        </div>
      )}

      <div
        ref={mapRef}
        className={cn(
          "h-[400px] w-full rounded-lg border",
          (isLoading || !!error) && "hidden"
        )}
      />
    </section>
  );
}


