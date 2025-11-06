/**
 * @file components/tour-detail/detail-info.tsx
 * @description 관광지 상세페이지 - 기본 정보 섹션
 *
 * 이 컴포넌트는 관광지의 기본 정보를 표시합니다.
 * PRD.md의 2.4.1 기본 정보 섹션 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 관광지명 (h1)
 * 2. 대표 이미지 (큰 사이즈)
 * 3. 주소 (복사 버튼)
 * 4. 전화번호 (클릭 시 전화 연결)
 * 5. 홈페이지 링크
 * 6. 개요 (긴 설명)
 * 7. 관광 타입 및 카테고리
 *
 * @dependencies
 * - lib/types/tour: TourDetail, CONTENT_TYPE_NAMES
 * - components/ui/button: Button
 * - next/image: Image
 *
 * @see PRD.md 2.4.1 기본 정보 섹션
 * @see Design.md 3. 상세페이지 - 기본 정보
 */

"use client";

import Image from "next/image";
import { Copy, Phone, ExternalLink, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 기본 정보 섹션 Props
 */
interface DetailInfoProps {
  /** 관광지 상세 정보 */
  tour: TourDetail;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailInfo tour={tourDetail} />
 * ```
 */
export function DetailInfo({ tour, className }: DetailInfoProps) {
  console.group("📋 DetailInfo 렌더링");
  console.log("관광지:", {
    contentId: tour.contentid,
    title: tour.title,
    hasImage: !!tour.firstimage,
    hasAddress: !!tour.addr1,
    hasTel: !!tour.tel,
    hasHomepage: !!tour.homepage,
    hasOverview: !!tour.overview,
  });

  // 이미지 URL (firstimage 우선, 없으면 firstimage2)
  const imageUrl = tour.firstimage || tour.firstimage2 || null;

  // 주소 (addr1 + addr2)
  const fullAddress = [tour.addr1, tour.addr2].filter(Boolean).join(" ");

  // 관광 타입 이름
  const contentTypeName = CONTENT_TYPE_NAMES[tour.contenttypeid] || "관광지";

  /**
   * 주소 복사 핸들러
   */
  const handleCopyAddress = async () => {
    if (!fullAddress) return;

    try {
      await navigator.clipboard.writeText(fullAddress);
      console.log("✅ 주소 복사 완료:", fullAddress);
      // TODO: 토스트 메시지 표시 (추후 구현)
      alert("주소가 복사되었습니다.");
    } catch (error) {
      console.error("❌ 주소 복사 실패:", error);
      alert("주소 복사에 실패했습니다.");
    }
  };

  /**
   * 전화번호 클릭 핸들러
   */
  const handlePhoneClick = (tel: string) => {
    // tel: 링크 형식으로 변환
    window.location.href = `tel:${tel}`;
  };

  console.groupEnd();

  return (
    <div className={cn("space-y-8", className)}>
      {/* 관광지명 및 타입 */}
      <div>
        <h1 className="mb-2 text-3xl font-bold lg:text-4xl">{tour.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {contentTypeName}
          </span>
          {fullAddress && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {fullAddress}
            </span>
          )}
        </div>
      </div>

      {/* 대표 이미지 */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
      )}

      {/* 기본 정보 카드 */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">기본 정보</h2>
        <div className="space-y-4">
          {/* 주소 */}
          {fullAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">주소</p>
                <p className="text-sm text-muted-foreground">{fullAddress}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="mt-2 gap-2"
                >
                  <Copy className="size-4" />
                  주소 복사
                </Button>
              </div>
            </div>
          )}

          {/* 전화번호 */}
          {tour.tel && (
            <div className="flex items-start gap-3">
              <Phone className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">전화번호</p>
                <p className="text-sm text-muted-foreground">{tour.tel}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePhoneClick(tour.tel!)}
                  className="mt-2 gap-2"
                >
                  <Phone className="size-4" />
                  전화 걸기
                </Button>
              </div>
            </div>
          )}

          {/* 홈페이지 */}
          {tour.homepage && (
            <div className="flex items-start gap-3">
              <ExternalLink className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">홈페이지</p>
                <a
                  href={tour.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-primary hover:underline"
                >
                  {tour.homepage}
                </a>
              </div>
            </div>
          )}

          {/* 관광 타입 및 카테고리 */}
          <div className="flex items-start gap-3">
            <div className="mt-1 size-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">관광 타입</p>
              <p className="text-sm text-muted-foreground">{contentTypeName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 개요 */}
      {tour.overview && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">개요</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-muted-foreground">
              {tour.overview}
            </p>
          </div>
        </div>
      )}

      {/* 이미지가 없을 때 플레이스홀더 */}
      {!imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Camera className="mx-auto mb-2 size-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">이미지 없음</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

