/**
 * @file lib/utils/coordinates.ts
 * @description 좌표 변환 유틸리티 (KorService2 → WGS84)
 */

/**
 * 한국 좌표 범위 상수
 */
const KOREA_LAT_MIN = 33.0;
const KOREA_LAT_MAX = 38.6;
const KOREA_LNG_MIN = 124.0;
const KOREA_LNG_MAX = 132.0;

/**
 * 한국관광공사(KorService2) API의 좌표(mapx, mapy)를 WGS84(lng, lat)로 변환합니다.
 * 
 * 변환 로직:
 * 1. 원본 값이 이미 한국 좌표 범위 내에 있으면 그대로 사용 (이미 변환된 값)
 * 2. 값이 1,000,000 이상이면 10,000,000으로 나누기 (정수형 스케일 좌표)
 * 3. 그 외의 경우는 10,000,000으로 나누기 시도
 * 
 * @param mapx - 경도 (longitude) 원본 값
 * @param mapy - 위도 (latitude) 원본 값
 * @returns 변환된 WGS84 좌표와 유효성 검증 결과
 */
export function toWgs84FromKTO(
  mapx: string | number,
  mapy: string | number
): { lng: number; lat: number; valid: boolean } {
  // 원본 값 로깅
  console.group("📍 좌표 변환 시작");
  console.log("원본 값:", { mapx, mapy, mapxType: typeof mapx, mapyType: typeof mapy });

  const x = typeof mapx === "number" ? mapx : parseFloat(String(mapx || "0")) || 0;
  const y = typeof mapy === "number" ? mapy : parseFloat(String(mapy || "0")) || 0;

  console.log("파싱된 값:", { x, y });

  // 값의 크기를 확인하여 적절한 변환 방법 선택
  let lng: number;
  let lat: number;

  // 이미 한국 좌표 범위 내에 있는 경우 (이미 변환된 소수점 값)
  if (
    x >= KOREA_LNG_MIN &&
    x <= KOREA_LNG_MAX &&
    y >= KOREA_LAT_MIN &&
    y <= KOREA_LAT_MAX
  ) {
    console.log("✅ 이미 변환된 좌표로 판단 (한국 범위 내)");
    lng = x;
    lat = y;
  }
  // 값이 큰 정수형인 경우 (1,000,000 이상이면 스케일 좌표로 판단)
  else if (Math.abs(x) >= 1000000 || Math.abs(y) >= 1000000) {
    console.log("✅ 정수형 스케일 좌표로 판단 (10,000,000으로 나누기)");
    lng = x / 10000000;
    lat = y / 10000000;
  }
  // 그 외의 경우도 10,000,000으로 나누기 시도
  else {
    console.log("⚠️ 작은 값 감지, 10,000,000으로 나누기 시도");
    lng = x / 10000000;
    lat = y / 10000000;
    
    // 변환 후에도 한국 범위를 벗어나면 원본 값을 그대로 사용 시도
    if (
      (lng < KOREA_LNG_MIN || lng > KOREA_LNG_MAX) &&
      (x >= KOREA_LNG_MIN && x <= KOREA_LNG_MAX)
    ) {
      console.warn("⚠️ 변환 후 범위 벗어남, 원본 값 사용 시도");
      lng = x;
      lat = y;
    }
  }

  console.log("변환된 좌표:", { lng, lat });

  // 한국 좌표 범위 검증
  const isInKoreaRange =
    lat >= KOREA_LAT_MIN &&
    lat <= KOREA_LAT_MAX &&
    lng >= KOREA_LNG_MIN &&
    lng <= KOREA_LNG_MAX;

  // 기본 유효성 검증
  const isFinite = Number.isFinite(lat) && Number.isFinite(lng);
  const isNonZero = lat !== 0 && lng !== 0;
  const isInWorldRange =
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  const valid = isFinite && isNonZero && isInWorldRange;

  console.log("유효성 검증:", {
    isFinite,
    isNonZero,
    isInWorldRange,
    isInKoreaRange,
    valid,
  });

  if (!isInKoreaRange && valid) {
    console.warn(
      "⚠️ 좌표가 한국 범위를 벗어남:",
      `위도 ${lat.toFixed(6)} (범위: ${KOREA_LAT_MIN}~${KOREA_LAT_MAX}),`,
      `경도 ${lng.toFixed(6)} (범위: ${KOREA_LNG_MIN}~${KOREA_LNG_MAX})`
    );
  }

  console.groupEnd();

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


