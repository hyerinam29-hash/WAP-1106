/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세페이지
 *
 * 이 페이지는 관광지의 상세 정보를 표시합니다.
 * PRD.md의 Phase 3: 상세페이지 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. Dynamic Route를 통한 관광지 상세 정보 표시
 * 2. 뒤로가기 버튼
 * 3. 로딩 상태 표시
 * 4. 에러 처리 (404 포함)
 * 5. 섹션별 구분 레이아웃
 *
 * @dependencies
 * - lib/api/tour-api: getDetailCommon
 * - lib/types/tour: TourDetail
 * - components/ui/loading: Loading
 * - components/ui/error-message: ErrorMessage, ApiError
 *
 * @see PRD.md 2.4 상세페이지
 * @see Design.md 3. 상세페이지 (`/places/[contentId]`)
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/components/ui/error-message";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourDetail } from "@/lib/types/tour";

/**
 * 상세페이지 Props
 */
interface DetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 관광지 상세페이지 컴포넌트
 *
 * @example
 * URL: /places/1234567
 */
export default async function DetailPage({ params }: DetailPageProps) {
  // Next.js 15: params는 Promise이므로 await 필요
  const { contentId } = await params;

  console.group("📄 DetailPage 렌더링");
  console.log("contentId:", contentId);

  // contentId 유효성 검사
  if (!contentId || typeof contentId !== "string") {
    console.error("❌ 유효하지 않은 contentId:", contentId);
    notFound();
  }

  // 데이터 로딩
  let tourDetail: TourDetail | null = null;
  let error: Error | null = null;

  try {
    console.log("🔍 관광지 상세 정보 로드 시작:", contentId);
    tourDetail = await getDetailCommon(contentId);
    console.log("✅ 관광지 상세 정보 로드 완료:", tourDetail ? "성공" : "데이터 없음");
  } catch (err) {
    console.error("❌ 관광지 상세 정보 로드 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  // 데이터가 없으면 404
  if (!error && !tourDetail) {
    console.warn("⚠️ 관광지 정보를 찾을 수 없음:", contentId);
    notFound();
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    console.groupEnd();
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link href="/">
              <ArrowLeft className="size-4" />
              뒤로가기
            </Link>
          </Button>
        </div>
        <ApiError
          message={error.message || "관광지 정보를 불러오는데 실패했습니다."}
        />
      </div>
    );
  }

  // tourDetail이 null이면 타입스크립트 에러 방지를 위해 early return
  if (!tourDetail) {
    notFound();
  }

  console.groupEnd();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2"
        >
          <Link href="/">
            <ArrowLeft className="size-4" />
            뒤로가기
          </Link>
        </Button>
      </div>

      {/* 기본 정보 섹션 */}
      <DetailInfo tour={tourDetail} />

      {/* 섹션별 구분을 위한 플레이스홀더 */}
      <div className="mt-8 space-y-8">

        {/* 운영 정보 섹션 (추후 구현) */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">운영 정보</h2>
          <p className="text-sm text-muted-foreground">
            운영 정보 섹션이 여기에 표시됩니다. (3.3에서 구현 예정)
          </p>
        </section>

        {/* 이미지 갤러리 섹션 (추후 구현) */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">이미지 갤러리</h2>
          <p className="text-sm text-muted-foreground">
            이미지 갤러리 섹션이 여기에 표시됩니다. (3.4에서 구현 예정)
          </p>
        </section>

        {/* 지도 섹션 (추후 구현) */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">위치 정보</h2>
          <p className="text-sm text-muted-foreground">
            지도 섹션이 여기에 표시됩니다. (3.5에서 구현 예정)
          </p>
        </section>
      </div>
    </div>
  );
}

