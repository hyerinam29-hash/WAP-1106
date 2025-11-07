/**
 * @file components/naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 이 컴포넌트는 네이버 지도 API를 사용하여 지도를 표시합니다.
 * PRD.md의 2.2 네이버 지도 연동 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 API 스크립트 동적 로드
 * 2. 기본 지도 표시
 * 3. 지역별 중심 좌표 설정
 * 4. 줌 레벨 자동 조정
 * 5. 좌표 변환 (KATEC → WGS84)
 *
 * @dependencies
 * - 네이버 지도 API: https://oapi.map.naver.com/openapi/v3/maps.js
 * - lib/utils/region-coordinates: getRegionCenter
 * - lib/types/tour: TourItem
 *
 * @see PRD.md 2.2 네이버 지도 연동
 * @see TODO.MD 2.7 네이버 지도 연동 (177-182줄)
 * @see https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TourItem } from "@/lib/types/tour";
import { getRegionCenter } from "@/lib/utils/region-coordinates";
import { toWgs84FromKTO } from "@/lib/utils/coordinates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map as MapIcon, Satellite, Navigation } from "lucide-react";

/**
 * 네이버 지도 컴포넌트 Props
 */
interface NaverMapProps {
  /** 관광지 목록 (마커 표시용) */
  tours?: TourItem[];
  /** 선택된 지역 코드 */
  areaCode?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 선택된 관광지 ID (리스트 클릭 시 지도 이동용) */
  selectedTourId?: string;
  /** 호버된 관광지 ID (리스트 호버 시 마커 강조용, 선택 사항) */
  hoveredTourId?: string;
  /** 지도 이동 콜백 (외부에서 지도 이동 제어용) */
  onMapReady?: (mapInstance: any) => void;
}

/**
 * 네이버 지도 타입 선언 (전역 window 객체 확장)
 */
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
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        Marker: new (
          options: {
            position: any;
            map?: any;
            icon?: any;
            title?: string;
          }
        ) => {
          setMap: (map: any | null) => void;
          getPosition: () => any;
          addListener: (event: string, handler: (...args: any[]) => void) => any;
        };
        InfoWindow: new (
          options: {
            content: string | HTMLElement;
            borderWidth?: number;
            disableAnchor?: boolean;
            backgroundColor?: string;
            anchorColor?: string;
            pixelOffset?: any;
          }
        ) => {
          open: (map: any, marker: any) => void;
          close: () => void;
          setContent: (content: string | HTMLElement) => void;
        };
        LatLng: new (lat: number, lng: number) => any;
        MapTypeId: {
          NORMAL: any;
          SATELLITE: any;
          HYBRID: any;
        };
        Event: {
          addListener: (target: any, event: string, handler: (...args: any[]) => void) => any;
          removeListener: (listener: any) => void;
        };
      };
    };
  }
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours = [],
  areaCode,
  className,
  selectedTourId,
  hoveredTourId,
  onMapReady,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");
  const [currentZoom, setCurrentZoom] = useState(13);

  console.group("🗺️ NaverMap 컴포넌트");
  console.log("Props:", { toursCount: tours.length, areaCode });

  // 네이버 지도 API 스크립트 로드 및 지도 초기화
  useEffect(() => {
    // Client ID 설정 (하드코딩)
    const clientId = "jz6mm8mwj2";

    console.group("🗺️ 네이버 지도 API 로드");
    console.log("Client ID:", clientId);
    console.log("현재 도메인:", typeof window !== "undefined" ? window.location.origin : "");

    // 스크립트가 이미 로드되었는지 확인
    if (window.naver?.maps && mapRef.current) {
      console.log("✅ 네이버 지도 API 이미 로드됨, 지도 초기화");
      console.groupEnd();
      initMap();
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(
      `script[src*="oapi.map.naver.com"]`
    );
    if (existingScript) {
      console.log("⏳ 네이버 지도 API 스크립트 로드 중...");
      // 스크립트 로드 완료 대기
      const checkInterval = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkInterval);
          console.log("✅ 네이버 지도 API 로드 완료 (대기 중 감지)");
          console.groupEnd();
          if (mapRef.current) {
            initMap();
          }
        }
      }, 100);

      // 최대 10초 대기
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.naver?.maps) {
          console.error("❌ 네이버 지도 API 로드 타임아웃");
          setError(new Error("네이버 지도 API 로드에 시간이 너무 오래 걸립니다. 네트워크 연결을 확인해주세요."));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 10000);

      return;
    }

    // 스크립트 동적 로드 (oapi + ncpKeyId + callback)
    const script = document.createElement("script");
    
    // 콜백 함수 정의 (스크립트 로드 전에 정의해야 함)
    (window as any).__naverMapOnLoad = () => {
      console.log("✅ NaverMap callback fired (__naverMapOnLoad)");
      
      // window.naver.maps가 준비될 때까지 대기
      const waitForNaverMaps = () => {
        if (!window.naver?.maps) {
          console.warn("⏳ window.naver.maps 대기 중...");
          
          let attempts = 0;
          const maxAttempts = 60; // 3초 (50ms * 60)
          const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.naver?.maps) {
              clearInterval(checkInterval);
              console.log(`✅ window.naver.maps 준비 완료 (${attempts * 50}ms 후)`);
              waitForContainer();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.error("❌ window.naver.maps 타임아웃 (3초) - 인증 실패 가능성");
              setError(
                new Error(
                  `네이버 지도 API 인증 실패

해결 방법:
1. 네이버 클라우드 플랫폼 콘솔: https://console.ncloud.com/
2. Client ID "${clientId}" 확인
3. 서비스 URL에 ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"} 등록
4. Maps API 서비스 활성화 확인
5. 저장 후 하드 새로고침 (Ctrl+Shift+R)`
                )
              );
              setIsLoading(false);
              console.groupEnd();
            }
          }, 50);
          return;
        }
        
        // 즉시 사용 가능
        waitForContainer();
      };
      
      // 지도 컨테이너가 준비될 때까지 대기
      const waitForContainer = () => {
        if (!mapRef.current) {
          console.warn("⏳ 지도 컨테이너 대기 중...");
          
          let attempts = 0;
          const maxAttempts = 40; // 2초 (50ms * 40)
          const checkContainer = setInterval(() => {
            attempts++;
            
            if (mapRef.current) {
              clearInterval(checkContainer);
              console.log(`✅ 지도 컨테이너 준비 완료 (${attempts * 50}ms 후)`);
              initMap();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkContainer);
              console.error("❌ 지도 컨테이너 타임아웃 (2초)");
              setError(new Error("지도 컨테이너를 찾을 수 없습니다. 페이지를 새로고침해주세요."));
              setIsLoading(false);
              console.groupEnd();
            }
          }, 50);
          return;
        }
        
        // 즉시 사용 가능
        initMap();
      };
      
      waitForNaverMaps();
    };

    // 공식 문서 기준 엔드포인트 및 파라미터 + callback
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&callback=__naverMapOnLoad`;
    script.async = true;
    
    console.log("📡 스크립트 로드 URL:", script.src);
    console.log("⚠️ 중요: 네이버 클라우드 플랫폼에서 다음을 확인하세요:");
    console.log("1. Client ID:", clientId);
    console.log("2. 등록된 도메인에", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000", "포함되어 있는지");
    console.log("3. Maps API 서비스가 활성화되어 있는지");
    
    // 인증 실패 콜백 (공식 문서 제공 훅)
    (window as any).navermap_authFailure = () => {
      console.error("❌ navermap_authFailure: 인증 실패 감지 (NCP Key/도메인 설정 확인)");
      setError(
        new Error(
          `네이버 지도 API 인증 실패 (navermap_authFailure)

확인 사항:
- Client ID: ${clientId}
- 서비스 URL에 ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"} 등록
- Maps API 서비스 활성화`
        )
      );
      setIsLoading(false);
    };

    script.onload = () => {
      console.log("✅ 네이버 지도 API 스크립트 로드 완료");
      console.log("스크립트 URL:", script.src);
    };
    
    script.onerror = (error) => {
      console.error("❌ 네이버 지도 API 스크립트 로드 실패:", error);
      console.error("로드 시도한 URL:", script.src);
      setError(
        new Error(
          `네이버 지도 API를 불러오는데 실패했습니다. 
          원인: Client ID 오류 또는 도메인 미등록 가능성
          확인사항:
          1. 네이버 클라우드 플랫폼에서 Client ID 확인
          2. 도메인 등록 확인 (localhost:3000 포함)
          3. Maps API 서비스 활성화 확인`
        )
      );
      setIsLoading(false);
      console.groupEnd();
    };

    document.head.appendChild(script);
    console.log("📡 네이버 지도 API 스크립트 로드 시작:", script.src);

    return () => {
      // cleanup: 스크립트 제거는 하지 않음 (다른 컴포넌트에서도 사용 가능)
      console.log("🧹 스크립트 로드 useEffect cleanup");
    };
  }, []);

  // 지도 초기화 함수
  const initMap = useCallback(() => {
    if (!mapRef.current) {
      console.error("❌ 지도 컨테이너가 없습니다");
      setError(
        new Error(
          `지도 컨테이너를 찾을 수 없습니다.

가능한 원인:
1. React 컴포넌트가 아직 마운트되지 않음
2. DOM 렌더링 지연

해결 방법:
- 페이지를 새로고침해주세요 (Ctrl+Shift+R)
- 브라우저 콘솔에서 추가 에러 확인`
        )
      );
      setIsLoading(false);
      return;
    }

    if (!window.naver?.maps) {
      console.error("❌ 네이버 지도 API가 로드되지 않았습니다");
      setError(
        new Error(
          `네이버 지도 API가 로드되지 않았습니다.

가능한 원인:
1. 네이버 지도 API 인증 실패 (도메인 미등록)
2. 네트워크 연결 문제
3. 스크립트 로드 지연

해결 방법:
1. 네이버 클라우드 플랫폼 콘솔: https://console.ncloud.com/
2. Client ID 확인
3. 서비스 URL에 ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"} 등록
4. Maps API 서비스 활성화 확인
5. 브라우저 개발자 도구(F12) → Network 탭에서 maps.js 요청 확인`
        )
      );
      setIsLoading(false);
      return;
    }

    // 이미 지도가 초기화되어 있으면 재초기화하지 않음
    if (mapInstanceRef.current) {
      console.log("✅ 지도가 이미 초기화되어 있습니다. 재초기화하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // 지역별 중심 좌표 가져오기
      const regionCenter = getRegionCenter(areaCode);
      console.log("📍 지역 중심 좌표:", regionCenter);

      // 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(
          regionCenter.lat,
          regionCenter.lng
        ),
        zoom: regionCenter.zoom,
        mapTypeId: window.naver.maps.MapTypeId.NORMAL,
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // 지도 준비 완료 콜백 호출
      if (onMapReady) {
        onMapReady(map);
      }

      // 지도 준비 상태
      setMapReady(true);

      console.log("✅ 네이버 지도 초기화 완료");
      setIsLoading(false);
    } catch (err) {
      console.error("❌ 지도 초기화 실패:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "지도를 초기화하는데 실패했습니다.";
      
      setError(new Error(errorMessage));
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // areaCode, onMapReady는 의존성에서 제외 (초기화 시에만 사용)

  // 지역 코드 변경 시 지도 중심 좌표 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const regionCenter = getRegionCenter(areaCode);
    console.log("지역 변경, 중심 좌표 업데이트:", regionCenter);

    try {
      mapInstanceRef.current.setCenter(
        new window.naver.maps.LatLng(regionCenter.lat, regionCenter.lng)
      );
      mapInstanceRef.current.setZoom(regionCenter.zoom);
      console.log("✅ 지도 중심 좌표 업데이트 완료");
    } catch (err) {
      console.error("❌ 지도 중심 좌표 업데이트 실패:", err);
    }
  }, [areaCode]);

  // 콘텐츠 타입별 마커 색상 매핑 (선택 사항)
  const getMarkerColorByContentType = (contentTypeId?: string) => {
    switch (contentTypeId) {
      case "12": // 관광지
        return "#2B7DE9";
      case "14": // 문화시설
        return "#8B5CF6";
      case "15": // 축제/행사
        return "#F59E0B";
      case "25": // 여행코스
        return "#10B981";
      case "28": // 레포츠
        return "#EF4444";
      case "32": // 숙박
        return "#14B8A6";
      case "38": // 쇼핑
        return "#F97316";
      case "39": // 음식점
        return "#22C55E";
      default:
        return "#3B82F6"; // 기본 파란색
    }
  };

  // HTML 기반 커스텀 마커 생성 (단색 원형)
  const createMarkerIcon = (color: string) => {
    const size = 20;
    const border = 2;
    const inner = size - border * 2;
    const html = `
      <div style="
        width:${size}px; height:${size}px; border-radius:50%;
        background:${color}; border:${border}px solid #ffffff;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `;
    return { content: html };
  };

  // 마커 참조를 contentId로 매핑하는 Map
  const markerMapRef = useRef<Map<string, { marker: any; tour: TourItem }>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (Map as any)()
  );

  // 마커 및 인포윈도우 렌더링
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver?.maps) {
      console.log("⏳ 마커 렌더링 대기 - mapReady:", mapReady);
      return;
    }

    // 이전 마커 정리
    if (markersRef.current.length > 0) {
      console.log(`🧹 기존 마커 제거: ${markersRef.current.length}개`);
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }
    markerMapRef.current.clear();

    if (!tours || tours.length === 0) {
      console.log("ℹ️ 표시할 관광지 없음 (tours 비어있음)");
      return;
    }

    console.group("📍 마커 렌더링");
    console.log("관광지 개수:", tours.length);

    // 단일 InfoWindow 재사용
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.naver.maps.InfoWindow({
        content: "",
        borderWidth: 0,
        disableAnchor: false,
        backgroundColor: "#ffffff",
        anchorColor: "#ffffff",
      });
    }

    // 유효 좌표만 마커 생성
    const validTours = tours.filter((t) => {
      const { lat, lng, valid } = toWgs84FromKTO(t.mapx, t.mapy);
      return valid && Number.isFinite(lat) && Number.isFinite(lng);
    });
    console.log("유효 좌표 관광지 수:", validTours.length);

    validTours.forEach((tour) => {
      const { lat, lng } = toWgs84FromKTO(tour.mapx, tour.mapy);
      const position = new window.naver.maps.LatLng(lat, lng);
      const color = getMarkerColorByContentType(tour.contenttypeid);
      let markerOptions: any = {
        position,
        map: mapInstanceRef.current,
        title: tour.title,
      };
      try {
        markerOptions.icon = createMarkerIcon(color);
      } catch (e) {
        console.warn("⚠️ 커스텀 아이콘 적용 실패, 기본 마커로 대체", e);
      }
      const marker = new window.naver.maps.Marker(markerOptions);

      // 마커 맵에 저장
      markerMapRef.current.set(tour.contentid, { marker, tour });

      // 인포윈도우 내용 구성 (제목, 주소, 상세보기)
      const address = tour.addr1 || "주소 정보 없음";
      const contentHtml = `
        <div style="min-width:220px; max-width:280px; padding:10px 12px;">
          <div style="font-weight:600; margin-bottom:6px; font-size:14px;">${tour.title}</div>
          <div style="color:#6b7280; font-size:12px; line-height:1.4; margin-bottom:8px;">${address}</div>
          <a href="/places/${tour.contentid}" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:#fff; padding:6px 10px; border-radius:8px; font-size:12px; text-decoration:none;">
            상세보기
          </a>
        </div>
      `;

      if (window.naver?.maps?.Event?.addListener) {
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("📌 마커 클릭(Event.addListener):", { contentid: tour.contentid, title: tour.title });
          infoWindowRef.current!.setContent(contentHtml);
          infoWindowRef.current!.open(mapInstanceRef.current, marker);
        });
      } else if ((marker as any).addListener) {
        (marker as any).addListener("click", () => {
          console.log("📌 마커 클릭(marker.addListener):", { contentid: tour.contentid, title: tour.title });
          infoWindowRef.current!.setContent(contentHtml);
          infoWindowRef.current!.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });

    console.log("생성된 마커 수:", markersRef.current.length);
    console.groupEnd();

    return () => {
      // 언마운트/의존성 변경 시 마커 정리
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
      }
      markerMapRef.current.clear();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [tours, mapReady]);

  // 선택된 관광지로 지도 이동 및 마커 강조
  useEffect(() => {
    if (!selectedTourId || !mapReady || !mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const markerData = markerMapRef.current.get(selectedTourId);
    if (!markerData) {
      console.log("⚠️ 선택된 관광지의 마커를 찾을 수 없음:", selectedTourId);
      return;
    }

    const { marker, tour } = markerData;
    const position = marker.getPosition();

    console.group("📍 선택된 관광지로 지도 이동");
    console.log("관광지 ID:", selectedTourId);
    console.log("관광지명:", tour.title);
    console.log("위치:", position);

    // 지도 중심 이동
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15); // 줌 레벨 조정 (선택 사항)

    // 인포윈도우 열기
    const address = tour.addr1 || "주소 정보 없음";
    const contentHtml = `
      <div style="min-width:220px; max-width:280px; padding:10px 12px;">
        <div style="font-weight:600; margin-bottom:6px; font-size:14px;">${tour.title}</div>
        <div style="color:#6b7280; font-size:12px; line-height:1.4; margin-bottom:8px;">${address}</div>
        <a href="/places/${tour.contentid}" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:#fff; padding:6px 10px; border-radius:8px; font-size:12px; text-decoration:none;">
          상세보기
        </a>
      </div>
    `;
    infoWindowRef.current?.setContent(contentHtml);
    infoWindowRef.current?.open(mapInstanceRef.current, marker);

    console.log("✅ 지도 이동 완료");
    console.groupEnd();
  }, [selectedTourId, mapReady]);

  // 호버된 관광지 마커 강조 (선택 사항)
  useEffect(() => {
    if (!mapReady || !window.naver?.maps) {
      return;
    }

    // 모든 마커의 강조 상태 초기화
    markerMapRef.current.forEach(({ marker }) => {
      // 마커 강조는 아이콘 크기나 색상 변경으로 구현 가능
      // 현재는 선택된 마커만 인포윈도우로 표시하므로, 호버는 선택 사항
    });

    // 호버된 마커가 있으면 해당 마커 강조 (선택 사항)
    if (hoveredTourId) {
      const markerData = markerMapRef.current.get(hoveredTourId);
      if (markerData) {
        console.log("🖱️ 호버된 관광지 마커:", hoveredTourId);
        // 호버 시 마커 강조 로직 (선택 사항)
        // 예: 마커 아이콘 크기 증가, 색상 변경 등
      }
    }
  }, [hoveredTourId, mapReady]);

  // 줌 레벨 변경 감지
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const map = mapInstanceRef.current;
    
    // 지도 줌 변경 이벤트 리스너
    const zoomChangeHandler = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      console.log("🔍 줌 레벨 변경:", zoom);
    };

    const zoomChangeListener = window.naver.maps.Event.addListener(
      map,
      "zoom_changed",
      zoomChangeHandler
    );

    return () => {
      if (zoomChangeListener && window.naver?.maps?.Event) {
        // 네이버 지도 API의 Event.removeListener는 리스너 객체를 받습니다
        try {
          window.naver.maps.Event.removeListener(zoomChangeListener);
        } catch (err) {
          console.warn("⚠️ 줌 변경 리스너 제거 실패:", err);
        }
      }
    };
  }, [mapReady]);

  // 줌 인 핸들러
  const handleZoomIn = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const currentZoom = mapInstanceRef.current.getZoom();
    const newZoom = Math.min(currentZoom + 1, 21); // 최대 줌 레벨 21
    mapInstanceRef.current.setZoom(newZoom);
    console.log("🔍 줌 인:", currentZoom, "→", newZoom);
  }, []);

  // 줌 아웃 핸들러
  const handleZoomOut = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const currentZoom = mapInstanceRef.current.getZoom();
    const newZoom = Math.max(currentZoom - 1, 1); // 최소 줌 레벨 1
    mapInstanceRef.current.setZoom(newZoom);
    console.log("🔍 줌 아웃:", currentZoom, "→", newZoom);
  }, []);

  // 지도 유형 변경 핸들러
  const handleMapTypeChange = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const newMapType = mapType === "normal" ? "satellite" : "normal";
    const mapTypeId = newMapType === "normal" 
      ? window.naver.maps.MapTypeId.NORMAL 
      : window.naver.maps.MapTypeId.SATELLITE;
    
    mapInstanceRef.current.setMapTypeId(mapTypeId);
    setMapType(newMapType);
    console.log("🗺️ 지도 유형 변경:", mapType, "→", newMapType);
  }, [mapType]);

  // 현재 위치로 이동 핸들러
  const handleCurrentLocation = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    if (!navigator.geolocation) {
      console.warn("⚠️ 브라우저가 위치 정보를 지원하지 않습니다.");
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }

    console.log("📍 현재 위치 요청 중...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("✅ 현재 위치 획득:", { latitude, longitude });

        const location = new window.naver.maps.LatLng(latitude, longitude);
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
        
        // 현재 위치 마커 표시 (선택 사항)
        // 기존 마커는 유지하고, 현재 위치만 추가로 표시할 수 있음
      },
      (error) => {
        console.error("❌ 위치 정보 획득 실패:", error);
        let errorMessage = "위치 정보를 가져올 수 없습니다.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "위치 정보 사용 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case error.TIMEOUT:
            errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  console.groupEnd();

  return (
    <div className={className}>
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex h-[400px] lg:h-[600px] items-center justify-center rounded-lg border bg-muted">
          <div className="text-center">
            <div className="mb-2 text-sm text-muted-foreground">
              지도를 불러오는 중...
            </div>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="flex h-[400px] lg:h-[600px] items-center justify-center rounded-lg border bg-destructive/10">
          <div className="text-center p-6 max-w-2xl">
            <div className="mb-4 text-4xl">🗺️</div>
            <div className="mb-2 text-lg font-semibold text-destructive">
              네이버 지도 API 인증 실패
            </div>
            <div className="mb-6 text-sm text-muted-foreground whitespace-pre-line text-left bg-white/50 p-4 rounded-lg border">
              {error.message}
            </div>
            <div className="text-sm text-muted-foreground space-y-3 text-left">
              <div className="font-semibold text-foreground">✅ 해결 방법:</div>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  <a
                    href="https://console.ncloud.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    네이버 클라우드 플랫폼 콘솔
                  </a>
                  접속
                </li>
                <li>
                  <strong>AI·Application Service</strong> → <strong>AI·NAVER API</strong> → <strong>Application 등록 정보</strong>
                </li>
                <li>
                  Client ID 선택
                </li>
                <li>
                  <strong>"API 설정"</strong> 탭 클릭
                </li>
                <li>
                  <strong>"서비스 URL"</strong>에 다음 추가:
                  <div className="mt-1 bg-muted p-2 rounded text-xs font-mono">
                    {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                  </div>
                </li>
                <li>
                  <strong>Maps API 서비스</strong> 활성화 확인
                </li>
                <li>
                  저장 후 페이지 새로고침 (<code className="bg-muted px-1 py-0.5 rounded text-xs">Ctrl + Shift + R</code>)
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 지도 컨테이너 */}
      {!error && (
        <div className="relative">
          <div
            ref={mapRef}
            className={cn(
              "h-[400px] w-full rounded-lg border lg:h-[600px]",
              isLoading && "hidden"
            )}
            style={{ minHeight: "400px" }}
          />
          
          {/* 지도 컨트롤 버튼들 */}
          {mapReady && !isLoading && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {/* 줌 컨트롤 */}
              <div className="flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="rounded-none border-b"
                  aria-label="줌 인"
                  title="줌 인"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="rounded-none"
                  aria-label="줌 아웃"
                  title="줌 아웃"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>

              {/* 지도 유형 선택 */}
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={handleMapTypeChange}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg border"
                aria-label={mapType === "normal" ? "위성 지도로 전환" : "일반 지도로 전환"}
                title={mapType === "normal" ? "위성 지도" : "일반 지도"}
              >
                {mapType === "normal" ? (
                  <Satellite className="h-4 w-4" />
                ) : (
                  <MapIcon className="h-4 w-4" />
                )}
              </Button>

              {/* 현재 위치로 이동 */}
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={handleCurrentLocation}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg border"
                aria-label="현재 위치로 이동"
                title="현재 위치로 이동"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

