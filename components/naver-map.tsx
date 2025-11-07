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
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ZoomIn, ZoomOut, Map, Satellite } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { getRegionCenter } from "@/lib/utils/region-coordinates";
import { cn } from "@/lib/utils";

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
  /** 지도 이동 콜백 (외부에서 지도 이동 제어용) */
  onMapReady?: (mapInstance: any) => void;
}

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * 한국관광공사 API는 KATEC 좌표계를 사용하며,
 * 네이버 지도는 WGS84 좌표계를 사용합니다.
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형)
 * @param mapy - 위도 (KATEC 좌표계, 정수형)
 * @returns WGS84 좌표계의 경도와 위도
 *
 * @example
 * ```typescript
 * const { lng, lat } = convertKATECToWGS84("1269780000", "375665000");
 * // { lng: 126.978, lat: 37.5665 }
 * ```
 */
import { convertKATECToWGS84 } from "@/lib/utils/coordinates";

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
  }
}

/**
 * 관광 타입별 마커 색상 매핑
 */
const MARKER_COLORS: Record<string, string> = {
  "12": "#FF6B6B", // 관광지 - 빨간색
  "14": "#4ECDC4", // 문화시설 - 청록색
  "15": "#FFE66D", // 축제/행사 - 노란색
  "25": "#95E1D3", // 여행코스 - 민트색
  "28": "#F38181", // 레포츠 - 분홍색
  "32": "#AA96DA", // 숙박 - 보라색
  "38": "#FCBAD3", // 쇼핑 - 핑크색
  "39": "#FFD93D", // 음식점 - 금색
};

/**
 * 기본 마커 색상
 */
const DEFAULT_MARKER_COLOR = "#4285F4";

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours = [],
  areaCode,
  className,
  selectedTourId,
  onMapReady,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mapType, setMapType] = useState<"NORMAL" | "SATELLITE" | "HYBRID">("NORMAL");
  const [clientId, setClientId] = useState<string>("");

  console.group("🗺️ NaverMap 컴포넌트");
  console.log("Props:", { toursCount: tours.length, areaCode });

  // 네이버 지도 API 스크립트 로드 및 지도 초기화
  useEffect(() => {
    // Client ID 가져오기 (환경 변수에서 읽기, 따옴표 제거)
    const rawClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "jz6mn8mwj2";
    // .env 파일의 따옴표 제거 (예: "jz6mn8mwj2" -> jz6mn8mwj2)
    const clientId = rawClientId.replace(/^["']|["']$/g, "").trim();
    setClientId(clientId); // 상태에 저장하여 에러 메시지에서 사용

    console.group("🗺️ 네이버 지도 API 로드");
    console.log("Client ID (원본):", rawClientId);
    console.log("Client ID (처리 후):", clientId);
    console.log("Client ID 길이:", clientId.length);
    console.log("현재 도메인:", window.location.origin);
    console.log("현재 URL:", window.location.href);

    // Client ID가 없으면 에러 표시
    if (!clientId) {
      console.error("❌ 네이버 지도 Client ID가 설정되지 않았습니다.");
      setError(new Error("네이버 지도 Client ID가 설정되지 않았습니다. 환경 변수를 확인해주세요."));
      setIsLoading(false);
      console.groupEnd();
      return;
    }

    // 스크립트가 이미 로드되었는지 확인
    if (window.naver?.maps && mapRef.current) {
      console.log("✅ 네이버 지도 API 이미 로드됨, 지도 초기화");
      console.groupEnd();
      initMap();
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(
      `script[src*="openapi.map.naver.com"]`
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

    // 스크립트 동적 로드
    const script = document.createElement("script");
    // 네이버 지도 API v3 올바른 엔드포인트 사용
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    
    console.log("📡 스크립트 로드 URL:", script.src);
    console.log("⚠️ 중요: 네이버 클라우드 플랫폼에서 다음을 확인하세요:");
    console.log("1. Client ID:", clientId);
    console.log("2. 등록된 도메인에", window.location.origin, "포함되어 있는지");
    console.log("3. Maps API 서비스가 활성화되어 있는지");
    
    script.onload = () => {
      console.log("✅ 네이버 지도 API 스크립트 로드 완료");
      console.log("스크립트 URL:", script.src);
      
      // 스크립트가 완전히 로드될 때까지 대기 (최대 5초로 연장)
      let attempts = 0;
      const maxAttempts = 50; // 5초 (100ms * 50)
      
      const checkNaverMaps = setInterval(() => {
        attempts++;
        
        // 디버깅: window.naver 상태 주기적으로 체크
        if (attempts % 10 === 0) { // 1초마다
          console.log(`[${attempts * 100}ms] window.naver 상태:`, window.naver ? "존재" : "없음");
          if (window.naver) {
            console.log(`[${attempts * 100}ms] window.naver.maps 상태:`, window.naver.maps ? "존재" : "없음");
          }
        }
        
        if (window.naver?.maps) {
          clearInterval(checkNaverMaps);
          console.log("✅ 네이버 지도 API 준비 완료, 지도 초기화 시작");
          console.log("window.naver.maps:", typeof window.naver.maps);
          console.groupEnd();
          
          if (mapRef.current) {
            initMap();
          } else {
            console.error("❌ 지도 컨테이너가 없습니다");
            setError(new Error("지도 컨테이너를 찾을 수 없습니다."));
            setIsLoading(false);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkNaverMaps);
          console.error("❌ 네이버 지도 API 객체를 찾을 수 없습니다 (타임아웃)");
          console.error("최종 window.naver 상태:", window.naver);
          console.error("최종 window.naver?.maps 상태:", window.naver?.maps);
          
          // 인증 실패 가능성이 가장 높음
          const errorMessage = window.naver && !window.naver.maps
            ? `🚨 인증 실패: 네이버 지도 API 스크립트는 로드되었으나 인증에 실패했습니다.

✅ 해결 방법:
1. 네이버 클라우드 플랫폼 콘솔 접속 (https://console.ncloud.com/)
2. AI·Application Service → AI·NAVER API → Application 등록 정보
3. Client ID "${clientId}" 선택
4. "API 설정" 탭 클릭
5. "서비스 URL"에 다음 추가: ${window.location.origin}
6. Maps 서비스 활성화 확인
7. 저장 후 페이지 새로고침

현재 도메인: ${window.location.origin}
Client ID: ${clientId}`
            : `네이버 지도 API 로드 실패

가능한 원인:
1. 네트워크 연결 문제
2. Client ID 오류
3. 도메인 미등록

확인사항:
- 브라우저 개발자 도구(F12) → Network 탭에서 maps.js 요청 확인
- 상태 코드가 200인지 확인
- /env-check 페이지에서 Client ID 확인`;
          
          setError(new Error(errorMessage));
          setIsLoading(false);
          console.groupEnd();
        }
      }, 100);
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
      // 지도 인스턴스도 유지 (컴포넌트가 언마운트될 때만 정리)
      console.log("🧹 스크립트 로드 useEffect cleanup");
    };
  }, []);

  // 마커 아이콘 생성 함수 (SVG를 Data URL로 변환)
  const createMarkerIcon = useCallback((color: string) => {
    if (!window.naver?.maps) return null;

    // SVG를 Data URL로 변환
    const svg = `
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">📍</text>
      </svg>
    `;
    
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // 네이버 지도 API v3에서는 이미지 URL을 사용
    return {
      url: url,
      size: new window.naver.maps.Size(32, 32),
      scaledSize: new window.naver.maps.Size(32, 32),
      anchor: new window.naver.maps.Point(16, 32),
    };
  }, []);

  // 인포윈도우 콘텐츠 생성 함수
  const createInfoWindowContent = useCallback((tour: TourItem): string => {
    const contentTypeName = CONTENT_TYPE_NAMES[tour.contenttypeid] || "관광지";
    const address = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
    const detailUrl = `/places/${tour.contentid}`;

    return `
      <div style="
        padding: 12px;
        min-width: 200px;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        ">${tour.title}</h3>
        <div style="
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        ">
          <span style="
            display: inline-block;
            padding: 2px 8px;
            background-color: #e3f2fd;
            color: #1976d2;
            border-radius: 12px;
            font-weight: 500;
          ">${contentTypeName}</span>
        </div>
        ${address ? `
          <div style="
            margin-bottom: 8px;
            font-size: 13px;
            color: #666;
            line-height: 1.4;
          ">📍 ${address}</div>
        ` : ""}
        <a href="${detailUrl}" style="
          display: inline-block;
          margin-top: 8px;
          padding: 6px 12px;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#1565c0'" onmouseout="this.style.backgroundColor='#1976d2'">
          상세보기 →
        </a>
      </div>
    `;
  }, []);

  // 마커 생성 및 표시 함수
  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps || tours.length === 0) {
      return;
    }

    console.log("📍 마커 생성 시작:", tours.length, "개");

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 인포윈도우 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 새 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: "",
      maxWidth: 300,
      backgroundColor: "#ffffff",
      borderColor: "#e0e0e0",
      borderWidth: 1,
      anchorColor: "#ffffff",
    });
    infoWindowRef.current = infoWindow;

    // 각 관광지에 대해 마커 생성
    tours.forEach((tour) => {
      try {
        // 좌표 변환
        const { lng, lat } = convertKATECToWGS84(tour.mapx, tour.mapy);

        // 유효한 좌표인지 확인
        if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
          console.warn("⚠️ 유효하지 않은 좌표:", tour.title, { mapx: tour.mapx, mapy: tour.mapy });
          return;
        }

        // 마커 위치
        const position = new window.naver.maps.LatLng(lat, lng);

        // 마커 색상 (관광 타입별)
        const markerColor = MARKER_COLORS[tour.contenttypeid] || DEFAULT_MARKER_COLOR;
        const icon = createMarkerIcon(markerColor);

        // 마커 옵션 생성
        const markerOptions: any = {
          position: position,
          map: mapInstanceRef.current,
          title: tour.title,
          zIndex: tour.contentid === selectedTourId ? 1000 : 100,
        };

        // 아이콘이 있으면 추가 (없으면 기본 마커 사용)
        if (icon) {
          markerOptions.icon = icon;
        }

        // 마커 생성
        const marker = new window.naver.maps.Marker(markerOptions);

        // 마커 클릭 이벤트: 인포윈도우 표시
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("📍 마커 클릭:", tour.title);
          const content = createInfoWindowContent(tour);
          infoWindow.setContent(content);
          infoWindow.open(mapInstanceRef.current, marker);
        });

        // 선택된 관광지인 경우 강조
        if (tour.contentid === selectedTourId) {
          marker.setZIndex(1000);
          // 선택된 마커로 지도 이동
          mapInstanceRef.current.setCenter(position);
          mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom(), 15));
          // 인포윈도우 자동 열기
          const content = createInfoWindowContent(tour);
          infoWindow.setContent(content);
          infoWindow.open(mapInstanceRef.current, marker);
        }

        markersRef.current.push(marker);
      } catch (err) {
        console.error("❌ 마커 생성 실패:", tour.title, err);
      }
    });

    console.log("✅ 마커 생성 완료:", markersRef.current.length, "개");
  }, [tours, selectedTourId, createMarkerIcon, createInfoWindowContent]);

  // 지도 초기화 함수 (한 번만 실행되어야 함)
  const initMap = useCallback(() => {
    if (!mapRef.current) {
      console.error("❌ 지도 컨테이너가 없습니다");
      setError(new Error("지도 컨테이너를 찾을 수 없습니다."));
      setIsLoading(false);
      return;
    }

    if (!window.naver?.maps) {
      console.error("❌ 네이버 지도 API가 로드되지 않았습니다");
      setError(
        new Error(
          "네이버 지도 API가 로드되지 않았습니다. 브라우저 콘솔에서 네트워크 에러를 확인해주세요."
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
      // 지역별 중심 좌표 가져오기 (초기값 사용)
      const regionCenter = getRegionCenter(areaCode);
      console.log("📍 지역 중심 좌표:", regionCenter);

      // 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(
          regionCenter.lat,
          regionCenter.lng
        ),
        zoom: regionCenter.zoom,
        mapTypeId: window.naver.maps.MapTypeId[mapType],
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // 지도 준비 완료 콜백 호출
      if (onMapReady) {
        onMapReady(map);
      }

      console.log("✅ 네이버 지도 초기화 완료");
      setIsLoading(false);

      // 마커 생성은 별도 useEffect에서 처리 (여기서는 제거)
    } catch (err) {
      console.error("❌ 지도 초기화 실패:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "지도를 초기화하는데 실패했습니다.";
      
      // 네이버 지도 API 인증 실패 에러인지 확인
      if (
        errorMessage.includes("인증") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized")
      ) {
        setError(
          new Error(
            `네이버 지도 API 인증 실패
            해결 방법:
            1. 네이버 클라우드 플랫폼에서 Client ID 확인
            2. 도메인 등록 확인 (localhost:3000 포함)
            3. Maps API 서비스 활성화 확인
            4. /env-check 페이지에서 환경 변수 확인`
          )
        );
      } else {
        setError(new Error(errorMessage));
      }
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // areaCode, mapType, onMapReady도 제거 - 초기값만 사용

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

  // 지도 초기화 후 마커 생성 (지도가 준비된 후에만 실행)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    // 지도가 초기화된 후에만 마커 생성
    console.log("📍 마커 업데이트 (지도 준비 완료 후)");
    createMarkers();
  }, [createMarkers]);

  // 선택된 관광지 ID 변경 시 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps || !selectedTourId) {
      return;
    }

    const selectedTour = tours.find((tour) => tour.contentid === selectedTourId);
    if (!selectedTour) {
      return;
    }

    try {
      const { lng, lat } = convertKATECToWGS84(selectedTour.mapx, selectedTour.mapy);
      if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
        return;
      }

      const position = new window.naver.maps.LatLng(lat, lng);
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom(), 15));

      // 해당 마커 찾아서 인포윈도우 열기
      const marker = markersRef.current.find((m) => {
        const pos = m.getPosition();
        return Math.abs(pos.lat() - lat) < 0.0001 && Math.abs(pos.lng() - lng) < 0.0001;
      });

      if (marker && infoWindowRef.current) {
        const content = createInfoWindowContent(selectedTour);
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      }

      console.log("✅ 선택된 관광지로 지도 이동:", selectedTour.title);
    } catch (err) {
      console.error("❌ 지도 이동 실패:", err);
    }
  }, [selectedTourId, tours, createInfoWindowContent]);

  // 지도 유형 변경
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    try {
      const mapTypeId = window.naver.maps.MapTypeId[mapType];
      mapInstanceRef.current.setMapTypeId(mapTypeId);
      console.log("✅ 지도 유형 변경:", mapType);
    } catch (err) {
      console.error("❌ 지도 유형 변경 실패:", err);
    }
  }, [mapType]);

  // 줌 인/아웃 핸들러
  const handleZoomIn = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(Math.min(currentZoom + 1, 18));
    console.log("🔍 줌 인:", currentZoom + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 7));
    console.log("🔍 줌 아웃:", currentZoom - 1);
  }, []);

  // 지도 유형 변경 핸들러
  const handleMapTypeToggle = useCallback(() => {
    setMapType((prev) => {
      const next = prev === "NORMAL" ? "SATELLITE" : "NORMAL";
      console.log("🗺️ 지도 유형 변경:", next);
      return next;
    });
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
                  Client ID <code className="bg-muted px-1 py-0.5 rounded text-xs">{clientId || "확인 필요"}</code> 선택
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
              <div className="mt-4 pt-4 border-t">
                <a
                  href="/debug-map"
                  className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 font-medium"
                >
                  🔍 자동 진단 페이지 열기
                </a>
                {" | "}
                <a
                  href="/env-check"
                  className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 font-medium"
                >
                  ⚙️ 환경 변수 확인
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지도 컨테이너 */}
      {!error && (
        <div className="relative">
          <div
            ref={mapRef}
            className="h-[400px] w-full rounded-lg border lg:h-[600px]"
            style={{ minHeight: "400px" }}
          />
          
          {/* 지도 컨트롤 버튼 */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* 줌 인/아웃 */}
            <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg border overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="줌 인"
                title="줌 인"
              >
                <ZoomIn className="size-4" />
              </button>
              <div className="h-px bg-gray-200" />
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="줌 아웃"
                title="줌 아웃"
              >
                <ZoomOut className="size-4" />
              </button>
            </div>

            {/* 지도 유형 선택 */}
            <button
              onClick={handleMapTypeToggle}
              className={cn(
                "p-2 bg-white rounded-lg shadow-lg border transition-colors",
                "hover:bg-gray-100"
              )}
              aria-label={mapType === "NORMAL" ? "위성 지도로 전환" : "일반 지도로 전환"}
              title={mapType === "NORMAL" ? "위성 지도" : "일반 지도"}
            >
              {mapType === "NORMAL" ? (
                <Satellite className="size-4" />
              ) : (
                <Map className="size-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 좌표 변환 함수 export (다른 컴포넌트에서도 사용 가능)
export { convertKATECToWGS84 };

