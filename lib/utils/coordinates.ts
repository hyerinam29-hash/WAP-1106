/**
 * @file lib/utils/coordinates.ts
 * @description 좌표 변환 유틸리티 (KorService2 → WGS84)
 */

/**
 * 한국관광공사(KorService2) API의 좌표(mapx, mapy)를 WGS84(lng, lat)로 변환합니다.
 * KorService2의 mapx/mapy는 1e7 스케일의 경도/위도 값이므로 10,000,000으로 한 번만 나눕니다.
 */
export function toWgs84FromKTO(
  mapx: string | number,
  mapy: string | number
): { lng: number; lat: number; valid: boolean } {
  const x = typeof mapx === "number" ? mapx : parseFloat(mapx || "0");
  const y = typeof mapy === "number" ? mapy : parseFloat(mapy || "0");

  const lng = x / 10000000;
  const lat = y / 10000000;

  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  return { lng, lat, valid };
}

/**
 * 호환용 헬퍼: 기존 이름을 사용해야 하는 곳에서 호출할 수 있도록 래핑합니다.
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string
): { lng: number; lat: number } {
  const { lng, lat } = toWgs84FromKTO(mapx, mapy);
  return { lng, lat };
}


