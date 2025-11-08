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
  console.log("관광지 기본 정보:", {
    contentId: tour.contentid,
    title: tour.title,
    addr1: tour.addr1,
    addr2: tour.addr2,
  });

  // 원본 좌표 값 상세 로깅
  console.log("원본 좌표 값:", {
    mapx: tour.mapx,
    mapy: tour.mapy,
    mapxType: typeof tour.mapx,
    mapyType: typeof tour.mapy,
    mapxValue: String(tour.mapx),
    mapyValue: String(tour.mapy),
  });

  // 좌표 변환 (KATEC → WGS84)
  const { lng, lat, valid } = toWgs84FromKTO(tour.mapx, tour.mapy);
  
  // 변환 결과 상세 로깅
  console.log("좌표 변환 결과:", {
    lng: lng.toFixed(8),
    lat: lat.toFixed(8),
    valid,
    isInKoreaRange: lat >= 33.0 && lat <= 38.6 && lng >= 124.0 && lng <= 132.0,
  });

  // 한국 좌표 범위 검증
  const isInKoreaRange = lat >= 33.0 && lat <= 38.6 && lng >= 124.0 && lng <= 132.0;
  
  if (!isInKoreaRange && valid) {
    console.warn("⚠️ 좌표가 한국 범위를 벗어남:", {
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      expectedLatRange: "33.0 ~ 38.6",
      expectedLngRange: "124.0 ~ 132.0",
    });
  }

  // 좌표가 유효하지 않으면 에러 표시
  if (!valid) {
    console.error("❌ 유효하지 않은 좌표:", {
      mapx: tour.mapx,
      mapy: tour.mapy,
      lng,
      lat,
      reason: !Number.isFinite(lat) || !Number.isFinite(lng) 
        ? "무한대 또는 NaN"
        : lat === 0 || lng === 0
        ? "0 값"
        : "세계 좌표 범위 벗어남",
    });
  }

  useEffect(() => {
    // 좌표가 유효하지 않거나 한국 범위를 벗어나면 지도 초기화하지 않음
    if (!valid || !isInKoreaRange) {
      setIsLoading(false);
      if (!valid) {
        setError(new Error("관광지 위치 정보가 없습니다."));
      } else if (!isInKoreaRange) {
        setError(
          new Error(
            `좌표가 한국 범위를 벗어났습니다. (위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)})`
          )
        );
      }
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

    // 인증 실패 플래그 (타임아웃 중단용) - 상위 스코프에 선언
    let authFailed = false;

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

      // 공식 문서 기준 파라미터는 ncpKeyId
      // 참고: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&callback=__naverMapOnLoad`;
      script.async = true;

      // 인증 실패 콜백
      (window as any).navermap_authFailure = () => {
        authFailed = true; // 인증 실패 플래그 설정
        console.error("❌ navermap_authFailure: 인증 실패");
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        setError(
          new Error(
            `네이버 지도 API 인증 실패

해결 방법:
1. 네이버 클라우드 플랫폼 콘솔 접속: https://console.ncloud.com/
2. AI·Application Service → AI·NAVER API → Application 등록 정보
3. Client ID 선택 → "API 설정" 탭
4. "서비스 URL"에 다음 추가:
   ${currentOrigin}
5. Maps API 서비스 활성화 확인
6. 저장 후 페이지 새로고침 (Ctrl+Shift+R)

현재 설정:
- Client ID: ${clientId}
- 현재 도메인: ${currentOrigin}`
          )
        );
        setIsLoading(false);
        console.groupEnd();
      };

      script.onload = () => {
        console.log("✅ 네이버 지도 API 스크립트 로드 완료");
        // 스크립트는 로드되었지만 콜백이 실행되지 않으면 타임아웃 체크
        setTimeout(() => {
          if (!window.naver?.maps && !authFailed) {
            console.warn("⚠️ 스크립트는 로드되었지만 콜백이 실행되지 않음 (5초 후 확인)");
          }
        }, 5000);
      };

      script.onerror = () => {
        console.error("❌ 네이버 지도 API 스크립트 로드 실패");
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        setError(
          new Error(
            `네이버 지도 API를 불러오는데 실패했습니다.

가능한 원인:
1. 네트워크 연결 문제
2. Client ID 오류
3. 도메인 미등록
4. Maps API 서비스 비활성화

해결 방법:
1. 네트워크 연결 확인
2. 네이버 클라우드 플랫폼 콘솔: https://console.ncloud.com/
3. Client ID "${clientId}" 확인
4. 서비스 URL에 ${currentOrigin} 등록
5. Maps API 서비스 활성화 확인
6. 페이지 새로고침 (Ctrl+Shift+R)`
          )
        );
        setIsLoading(false);
        console.groupEnd();
      };

      document.head.appendChild(script);
    }

    /**
     * window.naver.maps가 준비될 때까지 대기
     */
    function waitForNaverMaps() {
      // 인증 실패 시 즉시 중단
      if (authFailed) {
        console.warn("⚠️ 인증 실패로 인해 대기 중단");
        return;
      }

      if (window.naver?.maps) {
        console.log("✅ window.naver.maps 준비 완료");
        waitForContainer();
        return;
      }

      console.warn("⏳ window.naver.maps 대기 중...");
      
      let attempts = 0;
      const maxAttempts = 120; // 6초로 증가 (50ms * 120)
      const checkInterval = setInterval(() => {
        attempts++;
        
        // 인증 실패 시 즉시 중단
        if (authFailed) {
          clearInterval(checkInterval);
          console.warn("⚠️ 인증 실패로 인해 대기 중단");
          return;
        }
        
        if (window.naver?.maps) {
          clearInterval(checkInterval);
          console.log(`✅ window.naver.maps 준비 완료 (${attempts * 50}ms 후)`);
          waitForContainer();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ window.naver.maps 타임아웃 (6초)");
          const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          setError(
            new Error(
              `지도 API 로드 타임아웃

가능한 원인:
1. 네트워크 연결 문제
2. 인증 실패 (도메인 미등록)
3. Maps API 서비스 비활성화

해결 방법:
1. 네트워크 연결 확인
2. 네이버 클라우드 플랫폼 콘솔: https://console.ncloud.com/
3. Client ID 확인
4. 서비스 URL에 ${currentOrigin} 등록
5. Maps API 서비스 활성화 확인
6. 페이지 새로고침 (Ctrl+Shift+R)`
            )
          );
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
  }, [tour.contentid, tour.title, tour.mapx, tour.mapy, lng, lat, valid, isInKoreaRange]);

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
    const fullAddress = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
    const hasAddress = !!fullAddress;

    // 주소 기반 네이버 지도 검색 URL 생성
    const naverMapSearchUrl = hasAddress
      ? `https://map.naver.com/v5/search/${encodeURIComponent(fullAddress)}`
      : null;

    return (
      <section className={cn("rounded-lg border bg-card p-6", className)}>
        <h2 className="mb-4 text-xl font-semibold">위치 정보</h2>
        
        {hasAddress ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">주소</p>
                <p className="text-muted-foreground">{fullAddress}</p>
              </div>
            </div>
            
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <p className="mb-2 text-muted-foreground">
                좌표 정보가 없어 지도를 표시할 수 없습니다.
              </p>
              {naverMapSearchUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full gap-2"
                >
                  <a
                    href={naverMapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Navigation className="size-4" />
                    네이버 지도에서 주소로 검색하기
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span>관광지 위치 정보가 없습니다.</span>
          </div>
        )}
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

