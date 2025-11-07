"use client";

/**
 * @file components/detail-map.tsx
 * @description 상세 페이지 전용 네이버 지도 컴포넌트 (단일 위치 표시)
 * - 스크립트 동적 로드: https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=...
 * - JS v3에서는 ncpKeyId가 아니라 ncpClientId를 사용합니다.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface DetailMapProps {
  lat: number;
  lng: number;
  title?: string;
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
    navermap_authFailure?: () => void;
  }
}

export default function DetailMap({ lat, lng, title, className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver?.maps) return;
    if (mapInstanceRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      const center = new window.naver.maps.LatLng(lat, lng);
      const map = new window.naver.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeId: window.naver.maps.MapTypeId.NORMAL,
      });
      mapInstanceRef.current = map;
      
      // 마커 생성
      if (title) {
        new window.naver.maps.Marker({ position: center, map, title });
      } else {
        new window.naver.maps.Marker({ position: center, map });
      }
      setIsLoading(false);
      console.log("✅ DetailMap 초기화 완료");
    } catch (err) {
      console.error("❌ DetailMap 초기화 실패:", err);
      setError(new Error("지도를 초기화하는데 실패했습니다."));
      setIsLoading(false);
    }
  }, [lat, lng, title]);

  useEffect(() => {
    // Client ID 가져오기 (환경 변수에서 읽기, 따옴표 제거)
    const rawClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "jz6mn8mwj2";
    // .env 파일의 따옴표 제거 (예: "jz6mn8mwj2" -> jz6mn8mwj2)
    const clientId = rawClientId.replace(/^["']|["']$/g, "").trim();
    
    console.group("🗺️ DetailMap 스크립트 로드");
    console.log("Client ID (원본):", rawClientId);
    console.log("Client ID (처리 후):", clientId);

    if (!clientId) {
      setError(new Error("네이버 지도 Client ID가 설정되지 않았습니다."));
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    if (window.naver?.maps) {
      console.log("✅ 네이버 지도 API 이미 로드됨 (DetailMap)");
      console.groupEnd();
      initMap();
      return;
    }

        const existingScript = document.querySelector(`script[src*="oapi.map.naver.com"]`);
    if (existingScript) {
      console.log("⏳ 스크립트 로드 대기 (DetailMap)");
      const poll = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(poll);
          console.groupEnd();
          initMap();
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 10000);
      return;
    }

        const script = document.createElement("script");
        // JS v3 공식 엔드포인트 및 파라미터: ncpKeyId
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;

        // 인증 실패 콜백 등록
        window.navermap_authFailure = () => {
          console.error("❌ navermap_authFailure (components/detail-map.tsx)");
          setError(new Error("네이버 지도 API 인증 실패. 도메인/Key 설정을 확인하세요."));
          setIsLoading(false);
        };
    script.onload = () => {
      console.log("✅ 네이버 지도 스크립트 로드 완료 (DetailMap)");
      console.log("스크립트 URL:", script.src);
      
      // 스크립트가 완전히 로드될 때까지 대기 (최대 5초)
      let attempts = 0;
      const maxAttempts = 50; // 5초
      
      const checkNaverMaps = setInterval(() => {
        attempts++;
        
        // 디버깅: 1초마다 상태 체크
        if (attempts % 10 === 0) {
          console.log(`[DetailMap ${attempts * 100}ms] window.naver:`, window.naver ? "존재" : "없음");
        }
        
        if (window.naver?.maps) {
          clearInterval(checkNaverMaps);
          console.log("✅ 네이버 지도 API 준비 완료 (DetailMap)");
          console.groupEnd();
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkNaverMaps);
          console.error("❌ 네이버 지도 API 타임아웃 (DetailMap)");
          console.error("최종 window.naver:", window.naver);
          
          const errorMessage = window.naver && !window.naver.maps
            ? `인증 실패: 도메인 미등록 가능성
            
네이버 클라우드 플랫폼에서 ${window.location.origin} 도메인을 등록하세요.`
            : "네이버 지도 API 로드 실패 (Client ID/네트워크 확인)";
            
          setError(new Error(errorMessage));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 100);
    };
    script.onerror = () => {
      console.error("❌ 네이버 지도 스크립트 로드 실패 (DetailMap)");
      setError(new Error("네이버 지도 스크립트 로드 실패 (Client ID/도메인 등록 확인)"));
      setIsLoading(false);
      console.groupEnd();
    };
    document.head.appendChild(script);
    console.log("📡 스크립트 로드 시작 (DetailMap):", script.src);

    return () => {
      console.log("🧹 DetailMap cleanup");
    };
  }, [initMap]);

  if (error) {
    return (
      <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-destructive/10 text-xs p-4">
        {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-muted text-sm">
        지도를 불러오는 중...
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="h-[300px] w-full rounded-lg border" />
    </div>
  );
}


