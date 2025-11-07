/**
 * 네이버 지도 API 디버그 페이지
 * 
 * 이 페이지는 네이버 지도 API 연동 문제를 진단합니다.
 */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface DiagnosticResult {
  status: "success" | "error" | "warning";
  message: string;
  detail?: string;
}

export default function DebugMapPage() {
  const [clientId, setClientId] = useState<string>("");
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [naverExists, setNaverExists] = useState<boolean>(false);
  const [mapsExists, setMapsExists] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 환경 변수에서 Client ID 가져오기
    const rawClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";
    const cleanedId = rawClientId.replace(/^["']|["']$/g, "").trim();
    setClientId(cleanedId);
    setCurrentDomain(window.location.origin);
  }, []);

  const runDiagnostics = () => {
    setIsChecking(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    // 1. Client ID 확인
    if (!clientId) {
      results.push({
        status: "error",
        message: "Client ID가 설정되지 않았습니다",
        detail: ".env 파일에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 추가하세요",
      });
    } else if (clientId.length < 10) {
      results.push({
        status: "warning",
        message: "Client ID가 너무 짧습니다",
        detail: `현재: ${clientId} (${clientId.length}자)`,
      });
    } else {
      results.push({
        status: "success",
        message: "Client ID 설정 확인",
        detail: `${clientId} (${clientId.length}자)`,
      });
    }

    // 2. 현재 도메인 확인
    results.push({
      status: "success",
      message: "현재 도메인",
      detail: currentDomain,
    });

    // 3. 스크립트 로드 테스트
    const scriptUrl = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    
    // 기존 스크립트 제거
    const existingScripts = document.querySelectorAll('script[src*="openapi.map.naver.com"]');
    existingScripts.forEach(script => script.remove());
    
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;

    let attempts = 0;
    const maxAttempts = 50; // 5초

    script.onload = () => {
      console.log("✅ 스크립트 로드 완료");
      setScriptLoaded(true);

      results.push({
        status: "success",
        message: "스크립트 로드 성공",
        detail: scriptUrl,
      });

      // window.naver 체크
      const checkInterval = setInterval(() => {
        attempts++;

        if (window.naver) {
          setNaverExists(true);
          
          if (window.naver.maps) {
            setMapsExists(true);
            clearInterval(checkInterval);
            
            results.push({
              status: "success",
              message: "✅ 네이버 지도 API 인증 성공!",
              detail: "지도를 정상적으로 사용할 수 있습니다.",
            });
            
            setDiagnostics([...results]);
            setIsChecking(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            
            results.push({
              status: "error",
              message: "❌ 인증 실패: window.naver는 존재하지만 window.naver.maps가 없습니다",
              detail: `이는 도메인 미등록 또는 Maps API 미활성화를 의미합니다.
              
해결 방법:
1. 네이버 클라우드 플랫폼 (https://console.ncloud.com/) 접속
2. AI·Application Service → AI·NAVER API → Application 등록 정보
3. Client ID "${clientId}" 선택
4. "API 설정" 탭 클릭
5. "서비스 URL"에 다음 추가:
   - ${currentDomain}
   - http://127.0.0.1:3000 (선택사항)
6. Maps 서비스 활성화 확인
7. 저장 후 이 페이지 새로고침`,
            });
            
            setDiagnostics([...results]);
            setIsChecking(false);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          
          results.push({
            status: "error",
            message: "❌ window.naver 객체를 찾을 수 없습니다",
            detail: "네트워크 문제 또는 잘못된 Client ID일 수 있습니다. 브라우저 콘솔(F12)의 Network 탭을 확인하세요.",
          });
          
          setDiagnostics([...results]);
          setIsChecking(false);
        }
      }, 100);
    };

    script.onerror = () => {
      console.error("❌ 스크립트 로드 실패");
      
      results.push({
        status: "error",
        message: "스크립트 로드 실패",
        detail: "네트워크 연결을 확인하거나 Client ID가 유효한지 확인하세요.",
      });
      
      setDiagnostics([...results]);
      setIsChecking(false);
    };

    document.head.appendChild(script);
    
    setTimeout(() => {
      if (results.length <= 2) { // Client ID와 도메인 체크만 된 상태
        results.push({
          status: "warning",
          message: "스크립트 로드 시간 초과",
          detail: "네트워크가 느리거나 연결에 문제가 있을 수 있습니다.",
        });
        setDiagnostics([...results]);
        setIsChecking(false);
      }
    }, 6000);
  };

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="size-5 text-green-600" />;
      case "error":
        return <XCircle className="size-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="size-5 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" />
            뒤로가기
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🗺️ 네이버 지도 API 진단</h1>
          <p className="text-muted-foreground">
            네이버 지도가 표시되지 않는 문제를 진단합니다.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">현재 설정</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {clientId || "미설정"}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">현재 도메인:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {currentDomain}
                </code>
              </div>
            </div>
          </div>

          <Button 
            onClick={runDiagnostics} 
            disabled={isChecking || !clientId}
            className="w-full"
          >
            {isChecking ? "진단 중..." : "진단 시작"}
          </Button>
        </div>

        {diagnostics.length > 0 && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="font-semibold">진단 결과</h3>
            <div className="space-y-3">
              {diagnostics.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 p-4 rounded-lg",
                    result.status === "success" && "bg-green-50 dark:bg-green-950/20",
                    result.status === "error" && "bg-red-50 dark:bg-red-950/20",
                    result.status === "warning" && "bg-yellow-50 dark:bg-yellow-950/20"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{result.message}</p>
                    {result.detail && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {result.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
          <h3 className="font-semibold">📚 도움말</h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. 도메인 등록 방법</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>
                  <a 
                    href="https://console.ncloud.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    네이버 클라우드 플랫폼 콘솔
                  </a> 접속
                </li>
                <li>AI·Application Service → AI·NAVER API</li>
                <li>Application 등록 정보에서 해당 Client ID 선택</li>
                <li>"API 설정" 탭 클릭</li>
                <li>서비스 URL에 <code className="bg-background px-1 rounded">{currentDomain}</code> 추가</li>
                <li>Maps 서비스 활성화 확인</li>
                <li>저장 후 이 페이지 새로고침</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. 개발 서버 재시작</h4>
              <p className="text-muted-foreground ml-2">
                .env 파일을 수정한 경우 개발 서버를 재시작해야 합니다.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">3. 브라우저 캐시 삭제</h4>
              <p className="text-muted-foreground ml-2">
                Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)으로 하드 새로고침
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

