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

import { useEffect, useRef, useState, useMemo } from "react";
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
  // 초기화/지오코딩/스크립트 로드 상태 추적 (무한 루프 방지)
  const scriptLoadedRef = useRef(false);
  const geocodingAttemptedRef = useRef(false);
  const [geocodingState, setGeocodingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [finalCoordinates, setFinalCoordinates] = useState<{ lng: number; lat: number } | null>(null);
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

  // 🔥 무한 루프 해결: 좌표 변환을 useMemo로 메모이제이션
  // tour.mapx, tour.mapy가 변경될 때만 재계산됩니다
  const convertedCoords = useMemo(() => {
    const result = toWgs84FromKTO(tour.mapx, tour.mapy);
    console.log("좌표 변환 결과 (useMemo):", {
      lng: result.lng.toFixed(8),
      lat: result.lat.toFixed(8),
      valid: result.valid,
      isInKoreaRange: result.lat >= 33.0 && result.lat <= 38.6 && result.lng >= 124.0 && result.lng <= 132.0,
    });
    return result;
  }, [tour.mapx, tour.mapy]);

  const { lng, lat, valid } = convertedCoords;
  
  // 한국 좌표 범위 검증
  const isInKoreaRange = useMemo(() => {
    return lat >= 33.0 && lat <= 38.6 && lng >= 124.0 && lng <= 132.0;
  }, [lat, lng]);
  
  // 최종 사용할 좌표: KATEC 좌표가 유효하면 사용, 아니면 Geocoder로 얻은 좌표 사용
  const useCoordinates = finalCoordinates || (valid && isInKoreaRange ? { lng, lat } : null);
  
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
    console.log("🔄 useEffect 실행 - contentid:", tour.contentid);
    
    // 🔥 무한 루프 해결: finalCoordinates 초기화
    // valid && isInKoreaRange 일 때만 finalCoordinates 설정
    if (valid && isInKoreaRange && !finalCoordinates) {
      console.log("✅ 유효한 좌표 설정:", { lng, lat });
      setFinalCoordinates({ lng, lat });
      // return; // 여기서 return하지 않고 계속 진행하여 지도 로드
    }
    
    // 좌표가 유효하지 않거나 한국 범위를 벗어난 경우
    if (!valid || !isInKoreaRange) {
      const fullAddress = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
      if (!fullAddress) {
        // 주소도 없으면 에러 표시
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
      // 주소가 있으면 Geocoder는 네이버 지도 API 로드 후 호출
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
    
    // 주소 기반 좌표 변환 함수
    function geocodeAddress(address: string) {
      const naverMaps = window.naver?.maps as any;
      if (!naverMaps?.Service) {
        console.error("❌ Geocoder 서비스가 준비되지 않았습니다.");
        setGeocodingState('error');
        setIsLoading(false);
        setError(new Error("지도 API가 준비되지 않았습니다."));
        console.groupEnd();
        return;
      }

      // 동일 주소로 중복 시도 방지
      if (geocodingAttemptedRef.current) {
        console.warn("⚠️ Geocoder는 이미 시도되었습니다. 중복 호출 방지");
        return;
      }
      geocodingAttemptedRef.current = true;

      console.group("📍 Geocoder API 호출");
      console.log("주소:", address);
      setGeocodingState('loading');

      // naver.maps.Service.geocode 사용
      naverMaps.Service.geocode(
        {
          query: address,
        },
        (status: any, response: any) => {
          console.log("Geocoder 응답 상태:", status);
          console.log("Geocoder 응답:", response);

          if (status !== naverMaps.Service.Status.OK) {
            console.error("❌ Geocoder API 호출 실패:", status);
            setGeocodingState('error');
            setIsLoading(false);
            setError(
              new Error(
                `주소를 좌표로 변환하는데 실패했습니다. (상태: ${status})`
              )
            );
            console.groupEnd();
            return;
          }

          const result = response.v2;
          const items = result.addresses;

          if (!items || items.length === 0) {
            console.warn("⚠️ Geocoder 결과가 없습니다.");
            setGeocodingState('error');
            setIsLoading(false);
            setError(new Error("주소에 해당하는 좌표를 찾을 수 없습니다."));
            console.groupEnd();
            return;
          }

          // 첫 번째 결과 사용
          const firstResult = items[0];
          const geocodedLng = parseFloat(firstResult.x);
          const geocodedLat = parseFloat(firstResult.y);

          console.log("✅ Geocoder 좌표 획득:", {
            lng: geocodedLng,
            lat: geocodedLat,
            roadAddress: firstResult.roadAddress || firstResult.jibunAddress,
          });

          // 좌표 유효성 검증
          if (
            !Number.isFinite(geocodedLat) ||
            !Number.isFinite(geocodedLng) ||
            geocodedLat === 0 ||
            geocodedLng === 0
          ) {
            console.error("❌ Geocoder로 얻은 좌표가 유효하지 않습니다.");
            setGeocodingState('error');
            setIsLoading(false);
            setError(new Error("좌표 변환 결과가 유효하지 않습니다."));
            console.groupEnd();
            return;
          }

          // 한국 좌표 범위 검증
          const isGeocodedInKoreaRange =
            geocodedLat >= 33.0 &&
            geocodedLat <= 38.6 &&
            geocodedLng >= 124.0 &&
            geocodedLng <= 132.0;

          if (!isGeocodedInKoreaRange) {
            console.warn("⚠️ Geocoder로 얻은 좌표가 한국 범위를 벗어남");
            setGeocodingState('error');
            setIsLoading(false);
            setError(
              new Error(
                `변환된 좌표가 한국 범위를 벗어났습니다. (위도: ${geocodedLat.toFixed(6)}, 경도: ${geocodedLng.toFixed(6)})`
              )
            );
            console.groupEnd();
            return;
          }

          // 좌표 설정 및 지도 초기화
          setFinalCoordinates({ lng: geocodedLng, lat: geocodedLat });
          setGeocodingState('success');
          console.log("✅ Geocoder 좌표 변환 성공, 지도 초기화 진행");
          console.groupEnd();
          
          // 지도 초기화
          waitForContainer();
        }
      );
    }

    /**
     * 네이버 지도 API 스크립트 로드
     */
    function loadNaverMapScript() {
      // 이미 window.naver.maps가 있으면 스크립트 로드 생략
      if (window.naver?.maps) {
        console.log("ℹ️ 네이버 지도 API가 이미 로드됨");
        waitForNaverMaps();
        return;
      }

      // 중복 로드 방지
      if (scriptLoadedRef.current || document.getElementById("naver-maps-script")) {
        console.log("ℹ️ 네이버 지도 스크립트가 이미 로드/로딩 중");
        return;
      }
      scriptLoadedRef.current = true;

      console.log("📡 네이버 지도 API 스크립트 로드 시작");

      const script = document.createElement("script");
      script.id = "naver-maps-script";
      
      // 콜백 함수 등록
      (window as any).__naverMapOnLoad = () => {
        console.log("✅ 네이버 지도 API 로드 콜백 실행");
        waitForNaverMaps();
      };

      // 공식 문서 기준 파라미터는 ncpKeyId
      // Geocoder 서브 모듈 추가: 주소를 좌표로 변환하기 위해 필요
      // 참고: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
      // 참고: https://navermaps.github.io/maps.js.ncp/docs/tutorial-Geocoder-Geocoding.html
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder&callback=__naverMapOnLoad`;
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
        
        // 좌표가 유효하지 않으면 Geocoder 시도
        if (!valid || !isInKoreaRange) {
          const fullAddress = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
          if (fullAddress) {
            console.log("📍 주소 기반 좌표 변환 시작:", fullAddress);
            geocodeAddress(fullAddress);
            return;
          }
        }
        
        // 좌표가 유효하면 지도 초기화 진행
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
          
          // 좌표가 유효하지 않으면 Geocoder 시도
          if (!valid || !isInKoreaRange) {
            const fullAddress = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
            if (fullAddress) {
              console.log("📍 주소 기반 좌표 변환 시작:", fullAddress);
              geocodeAddress(fullAddress);
              return;
            }
          }
          
          // 좌표가 유효하면 지도 초기화 진행
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

      // 최종 좌표 확인
      const coordinates = finalCoordinates || (valid && isInKoreaRange ? { lng, lat } : null);
      if (!coordinates) {
        console.error("❌ 지도 초기화 실패: 유효한 좌표 없음");
        return;
      }

      try {
        console.log("🗺️ 지도 초기화 시작:", coordinates);

        // 중심 좌표
        const center = new window.naver.maps.LatLng(coordinates.lat, coordinates.lng);

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

    // 스크립트/맵 로드 트리거
    if (typeof window !== "undefined") {
      if (window.naver?.maps) {
        waitForNaverMaps();
      } else {
        loadNaverMapScript();
      }
    }

    // cleanup
    return () => {
      console.log("🧹 DetailMap cleanup");
      // contentid가 변경되면 ref 초기화
      scriptLoadedRef.current = false;
      geocodingAttemptedRef.current = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
    // 🔥 무한 루프 해결: useMemo로 메모이제이션된 값만 의존성에 추가
    // tour.contentid가 변경되면 전체 재초기화
    // valid, isInKoreaRange는 이미 useMemo로 메모이제이션되어 안정적
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.contentid]);

  /**
   * 길찾기 버튼 핸들러
   * 네이버 지도 길찾기 페이지로 이동
   */
  const handleDirections = () => {
    const coordinates = useCoordinates;
    if (!coordinates) {
      console.warn("⚠️ 유효하지 않은 좌표로 길찾기 불가");
      return;
    }

    // 네이버 지도 길찾기 URL (도보 경로)
    const directionsUrl = `https://map.naver.com/v5/directions/-/-/-/-/walk?c=${coordinates.lng},${coordinates.lat},15,0,0,0,dh`;
    
    console.log("🚗 길찾기 URL:", directionsUrl);
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * 좌표 복사 핸들러
   */
  const handleCopyCoordinates = async () => {
    const coordinates = useCoordinates;
    if (!coordinates) {
      console.warn("⚠️ 복사할 좌표가 없습니다.");
      return;
    }
    
    const coordinatesText = `${coordinates.lat}, ${coordinates.lng}`;
    
    try {
      await navigator.clipboard.writeText(coordinatesText);
      console.log("✅ 좌표 복사 완료:", coordinatesText);
      // 토스트 메시지는 sonner가 이미 설정되어 있으므로 여기서는 로그만
    } catch (error) {
      console.error("❌ 좌표 복사 실패:", error);
    }
  };

  // 좌표가 유효하지 않고 Geocoder도 실패한 경우
  if (!useCoordinates && geocodingState !== 'loading') {
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
              <p className="text-sm text-muted-foreground">
                {geocodingState === 'loading' 
                  ? '주소를 좌표로 변환하는 중...' 
                  : '지도를 불러오는 중...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 좌표 정보 */}
      {useCoordinates && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">좌표:</span>
            <span className="font-mono">
              {useCoordinates.lat.toFixed(6)}, {useCoordinates.lng.toFixed(6)}
            </span>
            {geocodingState === 'success' && (
              <span className="text-xs text-muted-foreground">(주소 기반 변환)</span>
            )}
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
      )}

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

