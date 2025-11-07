/**
 * @file components/tour-detail/detail-map.tsx
 * @description 관광지 상세페이지 - 지도 섹션
 *
 * 이 컴포넌트는 관광지 상세페이지에서 단일 관광지의 위치를 네이버 지도에 표시합니다.
 * TODO.md의 3.5 지도 섹션 (MVP 2.4.4) 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 표시
 * 2. 해당 관광지 마커 1개
 * 3. "길찾기" 버튼 (네이버 지도 연동)
 * 4. 좌표 정보 표시
 *
 * @dependencies
 * - 네이버 지도 API: https://oapi.map.naver.com/openapi/v3/maps.js
 * - lib/types/tour: TourDetail
 * - lib/utils/coordinates: toWgs84FromKTO
 *
 * @see TODO.md 3.5 지도 섹션 (MVP 2.4.4)
 * @see Design.md 3. 상세페이지 - 위치 정보
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toWgs84FromKTO } from "@/lib/utils/coordinates";
import type { TourDetail } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 지도 섹션 Props
 */
interface DetailMapProps {
  /** 관광지 상세 정보 */
  tour: TourDetail;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 네이버 지도 타입은 naver-map.tsx에서 이미 선언되어 있으므로 여기서는 사용만 합니다.
 * 필요시 window.naver.maps.LatLng를 사용합니다.
 */

/**
 * 관광지 상세페이지 지도 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailMap tour={tourDetail} />
 * ```
 */
export function DetailMap({ tour, className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  console.group("🗺️ DetailMap 렌더링");
  console.log("관광지:", {
    contentId: tour.contentid,
    title: tour.title,
    mapx: tour.mapx,
    mapy: tour.mapy,
    addr1: tour.addr1,
  });

  // 좌표 변환 (KATEC → WGS84)
  const { lng, lat, valid } = toWgs84FromKTO(tour.mapx, tour.mapy);
  console.log("좌표 변환:", { lng, lat, valid });

  // 좌표가 유효하지 않으면 에러 표시
  if (!valid) {
    console.warn("⚠️ 유효하지 않은 좌표:", { mapx: tour.mapx, mapy: tour.mapy });
  }

  useEffect(() => {
    // 좌표가 유효하지 않으면 지도 초기화하지 않음
    if (!valid) {
      setIsLoading(false);
      setError(new Error("관광지 위치 정보가 없습니다."));
      console.groupEnd();
      return;
    }

    // 네이버 지도 API Client ID
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      console.error("❌ NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경 변수가 설정되지 않았습니다.");
      setError(new Error("지도 API 키가 설정되지 않았습니다."));
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    console.log("🔑 네이버 지도 API Client ID:", clientId);

    // 이미 스크립트가 로드되어 있는지 확인
    const existingScript = document.querySelector(
      `script[src*="oapi.map.naver.com"]`
    );

    if (existingScript) {
      console.log("✅ 네이버 지도 API 스크립트 이미 로드됨");
      // 스크립트가 이미 있으면 바로 지도 초기화
      if (window.naver?.maps) {
        initMap();
      } else {
        // 스크립트는 있지만 아직 로드 중이면 대기
        waitForNaverMaps();
      }
    } else {
      // 스크립트가 없으면 새로 로드
      loadNaverMapScript();
    }

    /**
     * 네이버 지도 API 스크립트 로드
     */
    function loadNaverMapScript() {
      console.log("📡 네이버 지도 API 스크립트 로드 시작");

      const script = document.createElement("script");
      
      // 콜백 함수 등록
      (window as any).__naverMapOnLoad = () => {
        console.log("✅ 네이버 지도 API 로드 콜백 실행");
        waitForNaverMaps();
      };

      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&callback=__naverMapOnLoad`;
      script.async = true;

      // 인증 실패 콜백
      (window as any).navermap_authFailure = () => {
        console.error("❌ navermap_authFailure: 인증 실패");
        setError(
          new Error(
            `네이버 지도 API 인증 실패

확인 사항:
- Client ID: ${clientId}
- 서비스 URL에 ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"} 등록
- Maps API 서비스 활성화`
          )
        );
        setIsLoading(false);
        console.groupEnd();
      };

      script.onerror = () => {
        console.error("❌ 네이버 지도 API 스크립트 로드 실패");
        setError(new Error("지도 API를 불러오는데 실패했습니다."));
        setIsLoading(false);
        console.groupEnd();
      };

      document.head.appendChild(script);
    }

    /**
     * window.naver.maps가 준비될 때까지 대기
     */
    function waitForNaverMaps() {
      if (window.naver?.maps) {
        console.log("✅ window.naver.maps 준비 완료");
        waitForContainer();
        return;
      }

      console.warn("⏳ window.naver.maps 대기 중...");
      
      let attempts = 0;
      const maxAttempts = 60; // 3초
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.naver?.maps) {
          clearInterval(checkInterval);
          console.log(`✅ window.naver.maps 준비 완료 (${attempts * 50}ms 후)`);
          waitForContainer();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ window.naver.maps 타임아웃");
          setError(new Error("지도 API 로드에 실패했습니다. 페이지를 새로고침해주세요."));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 50);
    }

    /**
     * 지도 컨테이너가 준비될 때까지 대기
     */
    function waitForContainer() {
      if (mapRef.current) {
        console.log("✅ 지도 컨테이너 준비 완료");
        initMap();
        return;
      }

      console.warn("⏳ 지도 컨테이너 대기 중...");
      
      let attempts = 0;
      const maxAttempts = 40; // 2초
      const checkContainer = setInterval(() => {
        attempts++;
        
        if (mapRef.current) {
          clearInterval(checkContainer);
          console.log(`✅ 지도 컨테이너 준비 완료 (${attempts * 50}ms 후)`);
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkContainer);
          console.error("❌ 지도 컨테이너 타임아웃");
          setError(new Error("지도 컨테이너를 찾을 수 없습니다."));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 50);
    }

    /**
     * 지도 초기화
     */
    function initMap() {
      if (!mapRef.current || !window.naver?.maps) {
        console.error("❌ 지도 초기화 실패: 컨테이너 또는 API 없음");
        return;
      }

      try {
        console.log("🗺️ 지도 초기화 시작:", { lng, lat });

        // 중심 좌표
        const center = new window.naver.maps.LatLng(lat, lng);

        // 지도 생성
        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          zoom: 15, // 적절한 줌 레벨
        });

        mapInstanceRef.current = map;
        console.log("✅ 지도 생성 완료");

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: center,
          map,
          title: tour.title,
        });

        markerRef.current = marker;
        console.log("✅ 마커 생성 완료");

        setMapReady(true);
        setIsLoading(false);
        console.log("✅ DetailMap 초기화 완료");
        console.groupEnd();
      } catch (err) {
        console.error("❌ 지도 초기화 실패:", err);
        setError(err instanceof Error ? err : new Error("지도를 초기화하는데 실패했습니다."));
        setIsLoading(false);
        console.groupEnd();
      }
    }

    // cleanup
    return () => {
      console.log("🧹 DetailMap cleanup");
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [tour.contentid, tour.title, tour.mapx, tour.mapy, lng, lat, valid]);

  /**
   * 길찾기 버튼 핸들러
   * 네이버 지도 길찾기 페이지로 이동
   */
  const handleDirections = () => {
    if (!valid) {
      console.warn("⚠️ 유효하지 않은 좌표로 길찾기 불가");
      return;
    }

    // 네이버 지도 길찾기 URL (도보 경로)
    const directionsUrl = `https://map.naver.com/v5/directions/-/-/-/-/walk?c=${lng},${lat},15,0,0,0,dh`;
    
    console.log("🚗 길찾기 URL:", directionsUrl);
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * 좌표 복사 핸들러
   */
  const handleCopyCoordinates = async () => {
    const coordinates = `${lat}, ${lng}`;
    
    try {
      await navigator.clipboard.writeText(coordinates);
      console.log("✅ 좌표 복사 완료:", coordinates);
      // 토스트 메시지는 sonner가 이미 설정되어 있으므로 여기서는 로그만
    } catch (error) {
      console.error("❌ 좌표 복사 실패:", error);
    }
  };

  // 좌표가 유효하지 않은 경우
  if (!valid) {
    return (
      <section className={cn("rounded-lg border bg-card p-6", className)}>
        <h2 className="mb-4 text-xl font-semibold">위치 정보</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>관광지 위치 정보가 없습니다.</span>
        </div>
      </section>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <section className={cn("rounded-lg border bg-card p-6", className)}>
        <h2 className="mb-4 text-xl font-semibold">위치 정보</h2>
        <div className="text-sm text-destructive">
          {error.message}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">위치 정보</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDirections}
            className="gap-2"
            disabled={!mapReady}
          >
            <Navigation className="size-4" />
            길찾기
          </Button>
        </div>
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative">
        <div
          ref={mapRef}
          className={cn(
            "h-[400px] w-full rounded-lg border bg-muted",
            isLoading && "hidden"
          )}
          style={{ minHeight: "400px" }}
        />

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted">
            <div className="text-center">
              <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 좌표 정보 */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">좌표:</span>
          <span className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyCoordinates}
          className="gap-2"
        >
          <Copy className="size-4" />
          복사
        </Button>
      </div>

      {/* 주소 정보 */}
      {tour.addr1 && (
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">주소</p>
              <p className="text-muted-foreground">
                {tour.addr1} {tour.addr2 || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

