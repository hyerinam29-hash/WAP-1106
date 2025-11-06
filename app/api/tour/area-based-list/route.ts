/**
 * @file app/api/tour/area-based-list/route.ts
 * @description 지역 기반 관광지 목록 API Route
 *
 * 이 API Route는 CORS 문제를 해결하기 위해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * 클라이언트는 이 Route를 통해 관광지 목록을 조회합니다.
 *
 * @method GET
 * @query areaCode - 지역 코드 (선택)
 * @query contentTypeId - 콘텐츠 타입 ID (선택)
 * @query numOfRows - 페이지당 항목 수 (기본값: 20)
 * @query pageNo - 페이지 번호 (기본값: 1)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAreaBasedList,
  type AreaBasedListResult,
} from "@/lib/api/tour-api";

export async function GET(request: NextRequest) {
  console.group("🌐 API Route: /api/tour/area-based-list");
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 쿼리 파라미터 추출
    const areaCode = searchParams.get("areaCode") || undefined;
    const contentTypeId = searchParams.get("contentTypeId") || undefined;
    const numOfRows = searchParams.get("numOfRows")
      ? parseInt(searchParams.get("numOfRows")!, 10)
      : undefined;
    const pageNo = searchParams.get("pageNo")
      ? parseInt(searchParams.get("pageNo")!, 10)
      : undefined;

    console.log("요청 파라미터:", {
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    // API 호출
    const result: AreaBasedListResult = await getAreaBasedList({
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

