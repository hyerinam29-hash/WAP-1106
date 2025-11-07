"use client";

/**
 * @file components/tour-detail/detail-map.tsx
 * @description 상세 페이지 전용 네이버 지도 컴포넌트 (단일 위치 표시 + 길찾기 기능)
 * 
 * 주요 기능:
 * 1. 네이버 지도 API를 사용한 지도 표시
 * 2. 해당 관광지 위치에 마커 1개 표시
 * 3. "길찾기" 버튼 - 네이버 지도 앱/웹으로 연동
 * 4. 좌표 정보 표시 (위도/경도)
 * 
 * @see PRD.md 2.4.4 지도 섹션
 * @see Design.md 상세페이지 - 지도 섹션
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation, Copy, MapPin } from "lucide-react";

interface DetailMapProps {
  /** 위도 (WGS84) */
  lat: number;
  /** 경도 (WGS84) */
  lng: number;
  /** 관광지명 */
  title?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: {
            center: any;
            zoom: number;
            mapTypeId?: any;
          }
        ) => {
          setCenter: (center: any) => void;
          setZoom: (zoom: number) => void;
          getZoom: () => number;
          setMapTypeId: (mapTypeId: any) => void;
          getMapTypeId: () => any;
        };
        LatLng: new (lat: number, lng: number) => any;
        MapTypeId: {
          NORMAL: any;
          SATELLITE: any;
          HYBRID: any;
        };
        Marker: new (options: {
          position: any;
          map: any;
          icon?: any;
          title?: string;
          zIndex?: number;
        }) => {
          setMap: (map: any) => void;
          getPosition: () => any;
          setIcon: (icon: any) => void;
          setZIndex: (zIndex: number) => void;
        };
        InfoWindow: new (options: {
          content: string | HTMLElement;
          maxWidth?: number;
          backgroundColor?: string;
          borderColor?: string;
          borderWidth?: number;
          anchorColor?: string;
          pixelOffset?: any;
        }) => {
          open: (map: any, marker: any) => void;
          close: () => void;
          setContent: (content: string | HTMLElement) => void;
        };
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        Event: {
          addListener: (target: any, event: string, handler: () => void) => void;
        };
      };
    };
    // 공식 문서 제공 인증 실패 훅
    navermap_authFailure?: () => void;
  }
}

export default function DetailMap({ lat, lng, title, className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  console.group("🗺️ DetailMap 컴포넌트");
  console.log("Props:", { lat, lng, title });

  /**
   * 네이버 지도 초기화
   */
  const initMap = useCallback(() => {
    console.log("🔍 initMap 호출됨");
    console.log("  - mapRef.current:", mapRef.current ? "존재" : "없음");
    console.log("  - window.naver:", window.naver ? "존재" : "없음");
    console.log("  - window.naver?.maps:", window.naver?.maps ? "존재" : "없음");
    
    // 지도 컨테이너 확인
    if (!mapRef.current) {
      console.error("❌ 지도 컨테이너가 없습니다");
      setError(new Error("지도 컨테이너를 찾을 수 없습니다. 페이지를 새로고침해주세요."));
      setIsLoading(false);
      return;
    }

    // 네이버 지도 API 확인
    if (!window.naver?.maps) {
      console.error("❌ 네이버 지도 API가 로드되지 않았습니다");
      console.error("  - window.naver:", window.naver);
      console.error("  - window.naver?.maps:", window.naver?.maps);
      
      setError(
        new Error(
          `네이버 지도 API가 로드되지 않았습니다.
          
가능한 원인:
1. 네이버 지도 API 인증 실패 (도메인 미등록)
2. 네트워크 연결 문제
3. 스크립트 로드 지연

해결 방법:
- /debug-map 페이지에서 자동 진단 실행
- 네이버 클라우드 플랫폼에서 도메인 등록 확인`
        )
      );
      setIsLoading(false);
      return;
    }
    
    // 이미 초기화된 경우
    if (mapInstanceRef.current) {
      console.log("✅ 지도가 이미 초기화되어 있습니다");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🗺️ 지도 초기화 시작...");
      const center = new window.naver.maps.LatLng(lat, lng);
      const map = new window.naver.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeId: window.naver.maps.MapTypeId.NORMAL,
      });
      mapInstanceRef.current = map;
      
      // 마커 생성
      new window.naver.maps.Marker({
        position: center,
        map,
        title: title || "관광지",
      });

      console.log("✅ DetailMap 초기화 완료");
      setIsLoading(false);
    } catch (err) {
      console.error("❌ DetailMap 초기화 실패:", err);
      setError(
        new Error(
          `지도를 초기화하는데 실패했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`
        )
      );
      setIsLoading(false);
    }
  }, [lat, lng, title]);

  /**
   * 네이버 지도 API 스크립트 로드
   */
  useEffect(() => {
    const rawClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "jz6mn8mwj2";
    const clientId = rawClientId.replace(/^["']|["']$/g, "").trim();
    
    console.log("📡 Client ID:", clientId);

    if (!clientId) {
      setError(new Error("네이버 지도 Client ID가 설정되지 않았습니다."));
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    // 이미 로드된 경우
    if (window.naver?.maps) {
      console.log("✅ 네이버 지도 API 이미 로드됨");
      console.groupEnd();
      
      // 지도 컨테이너가 준비될 때까지 약간 대기
      if (!mapRef.current) {
        console.log("⏳ 지도 컨테이너 대기 중...");
        const checkContainer = setInterval(() => {
          if (mapRef.current) {
            clearInterval(checkContainer);
            console.log("✅ 지도 컨테이너 준비 완료");
            initMap();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkContainer);
          if (!mapRef.current) {
            console.error("❌ 지도 컨테이너를 찾을 수 없습니다 (타임아웃)");
            setError(new Error("지도 컨테이너를 찾을 수 없습니다. 페이지를 새로고침해주세요."));
            setIsLoading(false);
          }
        }, 2000);
      } else {
        initMap();
      }
      return;
    }

    // 스크립트 로드 대기 중인 경우
    const existingScript = document.querySelector(`script[src*="oapi.map.naver.com"]`);
    if (existingScript) {
      console.log("⏳ 스크립트 로드 대기 중...");
      const poll = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(poll);
          console.groupEnd();
          
          // 지도 컨테이너 확인 후 초기화
          if (mapRef.current) {
            initMap();
          } else {
            console.log("⏳ 지도 컨테이너 대기 중...");
            const checkContainer = setInterval(() => {
              if (mapRef.current) {
                clearInterval(checkContainer);
                initMap();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkContainer);
              if (!mapRef.current) {
                setError(new Error("지도 컨테이너를 찾을 수 없습니다."));
                setIsLoading(false);
              }
            }, 2000);
          }
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 10000);
      return;
    }

    // 스크립트 동적 로드 (oapi + ncpKeyId)
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;

    // 인증 실패 콜백 등록
    window.navermap_authFailure = () => {
      console.error("❌ navermap_authFailure (DetailMap)");
      setError(new Error("네이버 지도 API 인증 실패 (DetailMap). 도메인/Key 설정을 확인하세요."));
      setIsLoading(false);
    };
    
    script.onload = () => {
      console.log("✅ 네이버 지도 스크립트 로드 완료");
      
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkNaverMaps = setInterval(() => {
        attempts++;
        
        if (window.naver?.maps) {
          clearInterval(checkNaverMaps);
          console.log("✅ 네이버 지도 API 준비 완료");
          console.groupEnd();
          
          // 지도 컨테이너 확인 후 초기화
          if (mapRef.current) {
            initMap();
          } else {
            console.log("⏳ 지도 컨테이너 대기 중...");
            const checkContainer = setInterval(() => {
              if (mapRef.current) {
                clearInterval(checkContainer);
                console.log("✅ 지도 컨테이너 준비 완료");
                initMap();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkContainer);
              if (!mapRef.current) {
                console.error("❌ 지도 컨테이너를 찾을 수 없습니다 (타임아웃)");
                setError(new Error("지도 컨테이너를 찾을 수 없습니다. 페이지를 새로고침해주세요."));
                setIsLoading(false);
              }
            }, 2000);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkNaverMaps);
          console.error("❌ 네이버 지도 API 타임아웃");
          setError(new Error("네이버 지도 API 로드 실패"));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error("❌ 네이버 지도 스크립트 로드 실패");
      setError(new Error("네이버 지도 스크립트 로드 실패"));
      setIsLoading(false);
      console.groupEnd();
    };
    
    document.head.appendChild(script);
    console.log("📡 스크립트 로드 시작");

    return () => {
      console.log("🧹 DetailMap cleanup");
    };
  }, [initMap]);

  /**
   * 네이버 지도 길찾기 열기
   */
  const handleDirections = () => {
    console.log("🚗 길찾기 버튼 클릭");
    // 네이버 지도 길찾기 URL (도보)
    // https://map.naver.com/v5/directions/-/-/-/-/walk?c=lng,lat,15,0,0,0,dh
    const directionsUrl = `https://map.naver.com/v5/directions/-/-/-/-/walk?c=${lng},${lat},15,0,0,0,dh`;
    console.log("📍 길찾기 URL:", directionsUrl);
    window.open(directionsUrl, "_blank");
  };

  /**
   * 좌표 복사
   */
  const handleCopyCoordinates = async () => {
    console.log("📋 좌표 복사 버튼 클릭");
    const coordinatesText = `위도: ${lat}, 경도: ${lng}`;
    
    try {
      await navigator.clipboard.writeText(coordinatesText);
      console.log("✅ 좌표 복사 성공:", coordinatesText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("❌ 좌표 복사 실패:", err);
    }
  };

  console.groupEnd();

  // 에러 상태
  if (error) {
    return (
      <div className={className}>
        <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-destructive/10">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4 text-4xl">🗺️</div>
            <div className="mb-2 text-sm font-semibold text-destructive">
              네이버 지도 로드 실패
            </div>
            <div className="mb-4 text-xs text-muted-foreground whitespace-pre-line text-left bg-white/50 p-4 rounded-lg border">
              {error.message}
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <a
                href="/debug-map"
                className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 font-medium"
              >
                🔍 자동 진단 페이지 열기
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={className}>
        <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 지도 표시
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 지도 */}
        <div ref={mapRef} className="h-[300px] w-full rounded-lg border" />
        
        {/* 버튼 그룹 */}
        <div className="flex flex-wrap gap-2">
          {/* 길찾기 버튼 */}
          <Button
            variant="default"
            size="sm"
            onClick={handleDirections}
            className="gap-2"
          >
            <Navigation className="size-4" />
            길찾기
          </Button>

          {/* 좌표 복사 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCoordinates}
            className="gap-2"
          >
            {copySuccess ? (
              <>
                <MapPin className="size-4" />
                복사완료!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                좌표 복사
              </>
            )}
          </Button>
        </div>

        {/* 좌표 정보 표시 (선택 사항) */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">좌표 정보</p>
              <p className="text-muted-foreground">
                위도: <span className="font-mono">{lat.toFixed(6)}</span>
              </p>
              <p className="text-muted-foreground">
                경도: <span className="font-mono">{lng.toFixed(6)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

