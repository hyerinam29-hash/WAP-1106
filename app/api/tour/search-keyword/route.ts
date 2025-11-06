/**
 * @file app/api/tour/search-keyword/route.ts
 * @description 키워드 검색 API Route
 *
 * 이 API Route는 CORS 문제를 해결하기 위해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * 클라이언트는 이 Route를 통해 키워드로 관광지를 검색합니다.
 *
 * @method GET
 * @query keyword - 검색 키워드 (필수)
 * @query areaCode - 지역 코드 (선택)
 * @query contentTypeId - 콘텐츠 타입 ID (선택)
 * @query numOfRows - 페이지당 항목 수 (기본값: 20)
 * @query pageNo - 페이지 번호 (기본값: 1)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  searchKeyword,
  type SearchKeywordResult,
} from "@/lib/api/tour-api";

export async function GET(request: NextRequest) {
  console.group("🔍 API Route: /api/tour/search-keyword");
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 쿼리 파라미터 추출
    const keyword = searchParams.get("keyword");
    
    if (!keyword || keyword.trim() === "") {
      console.error("❌ 검색 키워드가 없습니다.");
      console.groupEnd();
      
      return NextResponse.json(
        {
          error: "검색 키워드는 필수입니다.",
          items: [],
          totalCount: 0,
          pageNo: 1,
          numOfRows: 20,
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const areaCode = searchParams.get("areaCode") || undefined;
    const contentTypeId = searchParams.get("contentTypeId") || undefined;
    const numOfRows = searchParams.get("numOfRows")
      ? parseInt(searchParams.get("numOfRows")!, 10)
      : undefined;
    const pageNo = searchParams.get("pageNo")
      ? parseInt(searchParams.get("pageNo")!, 10)
      : undefined;

    console.log("요청 파라미터:", {
      keyword,
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    // API 호출
    const result: SearchKeywordResult = await searchKeyword({
      keyword: keyword.trim(),
      areaCode,
      contentTypeId: contentTypeId as any,
      numOfRows,
      pageNo,
    });

    console.log("✅ API 호출 성공:", {
      itemsCount: result.items.length,
      totalCount: result.totalCount,
      pageNo: result.pageNo,
    });
    console.groupEnd();

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ API Route 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        items: [],
        totalCount: 0,
        pageNo: 1,
        numOfRows: 20,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

