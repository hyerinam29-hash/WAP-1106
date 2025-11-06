/**
 * @file lib/api/tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 파일은 한국관광공사 공공 API(KorService2)를 호출하는 함수들을 제공합니다.
 * PRD.md의 4. API 명세 섹션을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광지 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 공통 정보 조회 (detailCommon2)
 * 5. 소개 정보 조회 (detailIntro2)
 * 6. 이미지 조회 (detailImage2)
 *
 * @dependencies
 * - 한국관광공사 공공 API: KorService2
 * - 환경 변수: TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY
 *
 * @see PRD.md 4. API 명세
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  AreaCode,
  ContentType,
  TourApiResponse,
} from "@/lib/types/tour";

/**
 * API Base URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * API 키 가져오기
 * NEXT_PUBLIC_TOUR_API_KEY 우선, 없으면 TOUR_API_KEY 사용
 */
function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY를 설정하세요."
    );
  }

  return apiKey;
}

/**
 * 공통 파라미터 생성
 *
 * @see PRD.md 4.3 공통 파라미터
 */
function createCommonParams(): Record<string, string> {
  // API 키를 URL 인코딩 (이미 인코딩된 키는 그대로 사용)
  const apiKey = getApiKey();
  
  return {
    serviceKey: apiKey,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * API 호출 함수
 *
 * @param endpoint - API 엔드포인트
 * @param params - 추가 파라미터
 * @returns API 응답 데이터
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<TourApiResponse<T>> {
  console.group(`📡 API 호출: ${endpoint}`);
  console.log("파라미터:", params);

  try {
    // 공통 파라미터와 추가 파라미터 병합
    const allParams = {
      ...createCommonParams(),
      ...params,
    };

    // undefined 값 제거
    Object.keys(allParams).forEach((key) => {
      if (allParams[key] === undefined) {
        delete allParams[key];
      }
    });

    // URL 생성
    const searchParams = new URLSearchParams(
      Object.entries(allParams).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>
      )
    );

    const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;
    console.log("요청 URL:", url.replace(getApiKey(), "***"));

    // 타임아웃 설정 (30초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // API 호출
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MyTrip/1.0",
        },
        signal: controller.signal,
        // 개발 중에는 캐싱 비활성화
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "응답 본문을 읽을 수 없습니다.");
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}\n응답: ${errorText.substring(0, 200)}`
        );
      }

      const data: TourApiResponse<T> = await response.json();

    // API 응답 코드 확인
    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 오류: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`
      );
    }

      console.log("응답 성공:", {
        resultCode: data.response.header.resultCode,
        totalCount: data.response.body.totalCount,
      });
      console.groupEnd();

      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // AbortError인 경우 타임아웃 에러로 처리
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const timeoutError = new Error("API 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.");
        console.error(`❌ API 호출 타임아웃 (${endpoint}):`, timeoutError);
        console.groupEnd();
        throw timeoutError;
      }
      
      // 네트워크 에러인 경우
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        const networkError = new Error("네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.");
        console.error(`❌ 네트워크 오류 (${endpoint}):`, networkError);
        console.error("원본 에러:", fetchError);
        console.groupEnd();
        throw networkError;
      }
      
      // 기타 에러는 그대로 전달
      throw fetchError;
    }
  } catch (error) {
    console.error(`❌ API 호출 오류 (${endpoint}):`, error);
    
    // 더 자세한 에러 정보 로깅
    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      if (error.stack) {
        console.error("에러 스택:", error.stack);
      }
    }
    
    console.groupEnd();
    throw error;
  }
}

/**
 * 배열이 아닌 단일 객체를 배열로 변환
 */
function normalizeItem<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

/**
 * 지역코드 조회
 *
 * @param params - 선택 파라미터
 * @returns 지역 코드 목록
 *
 * @see PRD.md 4.1 사용 API 목록 - areaCode2
 */
export async function getAreaCodes(params?: {
  numOfRows?: number;
  pageNo?: number;
}): Promise<AreaCode[]> {
  const response = await fetchTourApi<AreaCode>("/areaCode2", params);

  const items = response.response.body.items?.item;
  if (!items) {
    return [];
  }

  return normalizeItem(items);
}

/**
 * 지역 기반 관광지 조회 결과
 */
export interface AreaBasedListResult {
  /** 관광지 목록 */
  items: TourItem[];
  /** 총 개수 */
  totalCount: number;
  /** 현재 페이지 번호 */
  pageNo: number;
  /** 페이지당 개수 */
  numOfRows: number;
}

/**
 * 지역 기반 관광지 조회
 *
 * @param params - 필수 파라미터
 * @returns 관광지 목록 및 페이지네이션 정보
 *
 * @see PRD.md 4.1 사용 API 목록 - areaBasedList2
 */
export async function getAreaBasedList(params: {
  areaCode?: string;
  contentTypeId?: ContentType;
  numOfRows?: number;
  pageNo?: number;
}): Promise<AreaBasedListResult> {
  const response = await fetchTourApi<TourItem>("/areaBasedList2", params);

  const items = response.response.body.items?.item;
  const normalizedItems = items ? normalizeItem(items) : [];

  return {
    items: normalizedItems,
    totalCount: response.response.body.totalCount || 0,
    pageNo: response.response.body.pageNo || 1,
    numOfRows: response.response.body.numOfRows || 20,
  };
}

/**
 * 키워드 검색 결과
 */
export interface SearchKeywordResult {
  /** 관광지 목록 */
  items: TourItem[];
  /** 총 개수 */
  totalCount: number;
  /** 현재 페이지 번호 */
  pageNo: number;
  /** 페이지당 개수 */
  numOfRows: number;
}

/**
 * 키워드 검색
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과 관광지 목록 및 페이지네이션 정보
 *
 * @see PRD.md 4.1 사용 API 목록 - searchKeyword2
 */
export async function searchKeyword(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: ContentType;
  numOfRows?: number;
  pageNo?: number;
}): Promise<SearchKeywordResult> {
  if (!params.keyword || params.keyword.trim() === "") {
    throw new Error("검색 키워드는 필수입니다.");
  }

  const response = await fetchTourApi<TourItem>("/searchKeyword2", params);

  const items = response.response.body.items?.item;
  const normalizedItems = items ? normalizeItem(items) : [];

  return {
    items: normalizedItems,
    totalCount: response.response.body.totalCount || 0,
    pageNo: response.response.body.pageNo || 1,
    numOfRows: response.response.body.numOfRows || 20,
  };
}

/**
 * 공통 정보 조회 (상세페이지 기본 정보)
 *
 * @param contentId - 콘텐츠 ID
 * @returns 관광지 상세 정보
 *
 * @see PRD.md 4.1 사용 API 목록 - detailCommon2
 */
export async function getDetailCommon(
  contentId: string
): Promise<TourDetail | null> {
  if (!contentId) {
    throw new Error("contentId는 필수입니다.");
  }

  const response = await fetchTourApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  const items = response.response.body.items?.item;
  if (!items) {
    return null;
  }

  const item = Array.isArray(items) ? items[0] : items;
  return item || null;
}

/**
 * 소개 정보 조회 (상세페이지 운영 정보)
 *
 * @param params - 필수 파라미터
 * @returns 관광지 운영 정보
 *
 * @see PRD.md 4.1 사용 API 목록 - detailIntro2
 */
export async function getDetailIntro(params: {
  contentId: string;
  contentTypeId: ContentType;
}): Promise<TourIntro | null> {
  if (!params.contentId) {
    throw new Error("contentId는 필수입니다.");
  }

  if (!params.contentTypeId) {
    throw new Error("contentTypeId는 필수입니다.");
  }

  const response = await fetchTourApi<TourIntro>("/detailIntro2", params);

  const items = response.response.body.items?.item;
  if (!items) {
    return null;
  }

  const item = Array.isArray(items) ? items[0] : items;
  return item || null;
}

/**
 * 이미지 조회 (상세페이지 갤러리)
 *
 * @param params - 필수 파라미터
 * @returns 관광지 이미지 목록
 *
 * @see PRD.md 4.1 사용 API 목록 - detailImage2
 */
export async function getDetailImage(params: {
  contentId: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourImage[]> {
  if (!params.contentId) {
    throw new Error("contentId는 필수입니다.");
  }

  const response = await fetchTourApi<TourImage>("/detailImage2", params);

  const items = response.response.body.items?.item;
  if (!items) {
    return [];
  }

  return normalizeItem(items);
}

