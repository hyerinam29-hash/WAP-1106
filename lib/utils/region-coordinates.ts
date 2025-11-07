/**
 * @file lib/utils/region-coordinates.ts
 * @description 지역별 중심 좌표 및 줌 레벨 매핑
 *
 * 이 파일은 한국 주요 지역(시/도)의 중심 좌표와 적절한 줌 레벨을 제공합니다.
 * 네이버 지도에서 지역별로 지도를 표시할 때 사용됩니다.
 *
 * @see PRD.md 2.2 네이버 지도 연동 - 지역별 중심 좌표 설정
 */

/**
 * 지역별 중심 좌표 및 줌 레벨 정보
 */
interface RegionCenter {
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
  /** 줌 레벨 (7-11 권장) */
  zoom: number;
}

/**
 * 지역 코드별 중심 좌표 매핑
 *
 * 지역 코드는 한국관광공사 API의 areaCode를 기준으로 합니다.
 */
const REGION_CENTERS: Record<string, RegionCenter> = {
  // 특별시/광역시
  "1": { lat: 37.5665, lng: 126.9780, zoom: 11 }, // 서울
  "2": { lat: 37.4563, lng: 126.7052, zoom: 11 }, // 인천
  "3": { lat: 36.3504, lng: 127.3845, zoom: 11 }, // 대전
  "4": { lat: 35.8714, lng: 128.6014, zoom: 11 }, // 대구
  "5": { lat: 35.1595, lng: 126.8526, zoom: 11 }, // 광주
  "6": { lat: 35.1796, lng: 129.0756, zoom: 11 }, // 부산
  "7": { lat: 35.5384, lng: 129.3114, zoom: 11 }, // 울산
  "8": { lat: 36.4800, lng: 127.2890, zoom: 11 }, // 세종

  // 도
  "31": { lat: 37.4138, lng: 127.5183, zoom: 10 }, // 경기
  "32": { lat: 37.8228, lng: 128.1555, zoom: 9 }, // 강원
  "33": { lat: 36.8000, lng: 127.7000, zoom: 10 }, // 충북
  "34": { lat: 36.5184, lng: 126.8000, zoom: 10 }, // 충남
  "35": { lat: 35.7175, lng: 127.1530, zoom: 10 }, // 전북
  "36": { lat: 34.8679, lng: 126.9910, zoom: 10 }, // 전남
  "37": { lat: 36.4919, lng: 128.8889, zoom: 10 }, // 경북
  "38": { lat: 35.4606, lng: 128.2132, zoom: 10 }, // 경남
  "39": { lat: 33.4996, lng: 126.5312, zoom: 10 }, // 제주
} as const;

/**
 * 기본 중심 좌표 (전국)
 */
const DEFAULT_CENTER: RegionCenter = {
  lat: 36.5,
  lng: 127.5,
  zoom: 7,
};

/**
 * 지역 코드에 따른 중심 좌표 및 줌 레벨 가져오기
 *
 * @param areaCode - 지역 코드 (예: "1" = 서울, "6" = 부산)
 * @returns 중심 좌표 및 줌 레벨 정보
 *
 * @example
 * ```typescript
 * const center = getRegionCenter("1"); // 서울
 * // { lat: 37.5665, lng: 126.9780, zoom: 11 }
 * ```
 */
export function getRegionCenter(areaCode?: string): RegionCenter {
  if (!areaCode) {
    return DEFAULT_CENTER;
  }

  return REGION_CENTERS[areaCode] || DEFAULT_CENTER;
}

/**
 * 지역 코드 목록 (타입 안전성을 위한 상수)
 */
export const REGION_CODES = Object.keys(REGION_CENTERS) as Array<
  keyof typeof REGION_CENTERS
>;

