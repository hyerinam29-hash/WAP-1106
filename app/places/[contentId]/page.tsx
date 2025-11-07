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
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { getDetailCommon, getDetailIntro, getDetailImage } from "@/lib/api/tour-api";
import type { TourDetail, TourIntro, TourImage } from "@/lib/types/tour";
import type { Metadata } from "next";
import DetailMap from "@/components/tour-detail/detail-map";
import { toWgs84FromKTO } from "@/lib/utils/coordinates";

/**
 * 상세페이지 Props
 */
interface DetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 동적 메타데이터 생성 (Open Graph 포함)
 *
 * @see PRD.md 2.4.5 공유하기 - Open Graph 메타태그
 */
export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const tourDetail = await getDetailCommon(contentId);

    if (!tourDetail) {
      return {
        title: "관광지 정보를 찾을 수 없습니다",
      };
    }

    // 기본 URL (환경 변수 또는 기본값 사용)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const pageUrl = `${baseUrl}/places/${contentId}`;

    // 설명 텍스트 (개요가 있으면 100자로 제한, 없으면 기본값)
    const description = tourDetail.overview
      ? tourDetail.overview.replace(/<[^>]*>/g, "").slice(0, 100) + "..."
      : `${tourDetail.title} 관광지 정보를 확인해보세요.`;

    // 이미지 URL (대표 이미지가 있으면 사용)
    const imageUrl = tourDetail.firstimage || tourDetail.firstimage2 || undefined;

    console.log("📄 메타데이터 생성:", {
      title: tourDetail.title,
      description: description.slice(0, 50) + "...",
      imageUrl: imageUrl ? "있음" : "없음",
      url: pageUrl,
    });

    return {
      title: `${tourDetail.title} | My Trip`,
      description,
      openGraph: {
        title: tourDetail.title,
        description,
        url: pageUrl,
        siteName: "My Trip",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: tourDetail.title,
              },
            ]
          : [],
        locale: "ko_KR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: tourDetail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("❌ 메타데이터 생성 실패:", error);
    return {
      title: "관광지 정보",
    };
  }
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
  let tourIntro: TourIntro | null = null;
  let tourImages: TourImage[] = [];
  let error: Error | null = null;

  try {
    console.log("🔍 관광지 상세 정보 로드 시작:", contentId);
    tourDetail = await getDetailCommon(contentId);
    console.log("✅ 관광지 상세 정보 로드 완료:", tourDetail ? "성공" : "데이터 없음");
    
    // 기본 정보가 있으면 운영 정보와 이미지도 로드 시도
    if (tourDetail) {
      try {
        console.log("🕒 관광지 운영 정보 로드 시작:", contentId);
        tourIntro = await getDetailIntro({
          contentId: tourDetail.contentid,
          contentTypeId: tourDetail.contenttypeid,
        });
        console.log("✅ 관광지 운영 정보 로드 완료:", tourIntro ? "성공" : "데이터 없음");
      } catch (introErr) {
        // 운영 정보 로드 실패는 치명적이지 않으므로 경고만 출력
        console.warn("⚠️ 관광지 운영 정보 로드 실패 (무시됨):", introErr);
      }

      try {
        console.log("🖼️ 관광지 이미지 로드 시작:", contentId);
        tourImages = await getDetailImage({
          contentId: tourDetail.contentid,
          numOfRows: 20, // 최대 20개 이미지
        });
        console.log("✅ 관광지 이미지 로드 완료:", tourImages.length, "개");
      } catch (imageErr) {
        // 이미지 로드 실패는 치명적이지 않으므로 경고만 출력
        console.warn("⚠️ 관광지 이미지 로드 실패 (무시됨):", imageErr);
      }
    }
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

  // 공유 URL 생성
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/places/${contentId}`;

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
      <DetailInfo tour={tourDetail} shareUrl={shareUrl} />

      {/* 섹션별 구분을 위한 플레이스홀더 */}
      <div className="mt-8 space-y-8">
        {/* 운영 정보 섹션 */}
        <DetailIntro intro={tourIntro} />

        {/* 이미지 갤러리 섹션 */}
        <DetailGallery images={tourImages} title={tourDetail.title} />

        {/* 지도 섹션 */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">위치 정보</h2>
          {(() => {
            const { lng, lat, valid } = toWgs84FromKTO(
              tourDetail!.mapx,
              tourDetail!.mapy
            );

            if (!valid) {
              return (
                <p className="text-sm text-muted-foreground">
                  좌표 정보가 없어 지도를 표시할 수 없습니다.
                </p>
              );
            }

            return (
              <DetailMap lat={lat} lng={lng} title={tourDetail!.title} />
            );
          })()}
        </section>
      </div>
    </div>
  );
}

