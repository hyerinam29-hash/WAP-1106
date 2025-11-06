/**
 * @file app/api/tour/area-codes/route.ts
 * @description 지역 코드 조회 API Route
 *
 * 이 API Route는 CORS 문제를 해결하기 위해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * 클라이언트는 이 Route를 통해 지역 코드 목록을 조회합니다.
 *
 * @method GET
 * @query numOfRows - 페이지당 항목 수 (기본값: 100)
 * @query pageNo - 페이지 번호 (기본값: 1)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAreaCodes } from "@/lib/api/tour-api";
import type { AreaCode } from "@/lib/types/tour";

export async function GET(request: NextRequest) {
  console.group("🌐 API Route: /api/tour/area-codes");
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 쿼리 파라미터 추출
    const numOfRows = searchParams.get("numOfRows")
      ? parseInt(searchParams.get("numOfRows")!, 10)
      : undefined;
    const pageNo = searchParams.get("pageNo")
      ? parseInt(searchParams.get("pageNo")!, 10)
      : undefined;

    console.log("요청 파라미터:", {
      numOfRows,
      pageNo,
    });

    // API 호출
    const result: AreaCode[] = await getAreaCodes({
      numOfRows,
      pageNo,
    });

    console.log("✅ API 호출 성공:", {
      itemsCount: result.length,
    });
    console.groupEnd();

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // 지역 코드는 자주 변경되지 않으므로 1시간 캐시
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

