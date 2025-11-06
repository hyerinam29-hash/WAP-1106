/**
 * @file lib/api/tour-api-client.ts
 * @description 한국관광공사 공공 API 클라이언트 (브라우저용)
 *
 * 이 파일은 브라우저에서 사용하는 API 클라이언트입니다.
 * CORS 문제를 해결하기 위해 Next.js API Route를 통해 서버 사이드에서 API를 호출합니다.
 *
 * 주요 기능:
 * 1. 지역 코드 조회 (areaCode2)
 * 2. 지역 기반 관광지 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 *
 * @dependencies
 * - Next.js API Routes: /api/tour/*
 *
 * @see lib/api/tour-api.ts - 서버 사이드 API 함수
 */

import type {
  TourItem,
  ContentType,
  AreaCode,
} from "@/lib/types/tour";

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
 * 지역 코드 조회
 *
 * @param params - 선택 파라미터
 * @returns 지역 코드 목록
 */
export async function getAreaCodes(params?: {
  numOfRows?: number;
  pageNo?: number;
}): Promise<AreaCode[]> {
  console.group("📍 클라이언트 API 호출: getAreaCodes");
  console.log("파라미터:", params);

  try {
    // 쿼리 파라미터 생성
    const searchParams = new URLSearchParams();
    
    if (params?.numOfRows) {
      searchParams.append("numOfRows", String(params.numOfRows));
    }
    if (params?.pageNo) {
      searchParams.append("pageNo", String(params.pageNo));
    }

    const url = `/api/tour/area-codes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    console.log("요청 URL:", url);

    // API Route 호출
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "default", // 지역 코드는 자주 변경되지 않으므로 캐시 사용
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`
      );
    }

    const data: AreaCode[] = await response.json();

    console.log("✅ API 호출 성공:", {
      itemsCount: data.length,
    });
    console.groupEnd();

    return data;
  } catch (error) {
    console.error("❌ API 호출 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 지역 기반 관광지 조회
 *
 * @param params - 필수 파라미터
 * @returns 관광지 목록 및 페이지네이션 정보
 */
export async function getAreaBasedList(params: {
  areaCode?: string;
  contentTypeId?: ContentType;
  numOfRows?: number;
  pageNo?: number;
}): Promise<AreaBasedListResult> {
  console.group("📡 클라이언트 API 호출: getAreaBasedList");
  console.log("파라미터:", params);

  try {
    // 쿼리 파라미터 생성
    const searchParams = new URLSearchParams();
    
    if (params.areaCode) {
      searchParams.append("areaCode", params.areaCode);
    }
    if (params.contentTypeId) {
      searchParams.append("contentTypeId", String(params.contentTypeId));
    }
    if (params.numOfRows) {
      searchParams.append("numOfRows", String(params.numOfRows));
    }
    if (params.pageNo) {
      searchParams.append("pageNo", String(params.pageNo));
    }

    const url = `/api/tour/area-based-list?${searchParams.toString()}`;
    console.log("요청 URL:", url);

    // API Route 호출
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`
      );
    }

    const data: AreaBasedListResult = await response.json();

    console.log("✅ API 호출 성공:", {
      itemsCount: data.items.length,
      totalCount: data.totalCount,
      pageNo: data.pageNo,
    });
    console.groupEnd();

    return data;
  } catch (error) {
    console.error("❌ API 호출 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 키워드 검색
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과 관광지 목록 및 페이지네이션 정보
 */
export async function searchKeyword(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: ContentType;
  numOfRows?: number;
  pageNo?: number;
}): Promise<SearchKeywordResult> {
  console.group("🔍 클라이언트 API 호출: searchKeyword");
  console.log("파라미터:", params);

  if (!params.keyword || params.keyword.trim() === "") {
    throw new Error("검색 키워드는 필수입니다.");
  }

  try {
    // 쿼리 파라미터 생성
    const searchParams = new URLSearchParams();
    
    searchParams.append("keyword", params.keyword.trim());
    
    if (params.areaCode) {
      searchParams.append("areaCode", params.areaCode);
    }
    if (params.contentTypeId) {
      searchParams.append("contentTypeId", String(params.contentTypeId));
    }
    if (params.numOfRows) {
      searchParams.append("numOfRows", String(params.numOfRows));
    }
    if (params.pageNo) {
      searchParams.append("pageNo", String(params.pageNo));
    }

    const url = `/api/tour/search-keyword?${searchParams.toString()}`;
    console.log("요청 URL:", url);

    // API Route 호출
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`
      );
    }

    const data: SearchKeywordResult = await response.json();

    console.log("✅ API 호출 성공:", {
      itemsCount: data.items.length,
      totalCount: data.totalCount,
      pageNo: data.pageNo,
    });
    console.groupEnd();

    return data;
  } catch (error) {
    console.error("❌ API 호출 오류:", error);
    console.groupEnd();
    throw error;
  }
}

