/**
 * @file components/tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 이 컴포넌트는 관광지 목록에서 각 관광지를 카드 형태로 표시합니다.
 * PRD.md의 2.1 관광지 목록 + 지역/타입 필터 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (placeholder 지원)
 * 2. 관광지명, 주소, 관광 타입 뱃지 표시
 * 3. 클릭 시 상세페이지 이동
 * 4. 호버 효과
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 라우팅
 * - lib/types/tour: TourItem 타입
 *
 * @see PRD.md 2.1 관광지 목록 + 지역/타입 필터
 * @see Design.md 1. 홈페이지 - LIST VIEW
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Camera } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 관광지 카드 컴포넌트 Props
 */
interface TourCardProps {
  /** 관광지 데이터 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <TourCard tour={tourItem} />
 * ```
 */
export function TourCard({ tour, className }: TourCardProps) {
  // 이미지 URL (firstimage 우선, 없으면 firstimage2, 둘 다 없으면 placeholder)
  const imageUrl = tour.firstimage || tour.firstimage2 || null;
  
  // 주소 표시 (addr1 + addr2)
  const address = [tour.addr1, tour.addr2].filter(Boolean).join(" ");
  
  // 관광 타입 이름
  const contentTypeName = CONTENT_TYPE_NAMES[tour.contenttypeid] || "관광지";
  
  // 상세페이지 URL
  const detailUrl = `/places/${tour.contentid}`;

  console.log("🎴 TourCard 렌더링:", {
    contentId: tour.contentid,
    title: tour.title,
    hasImage: !!imageUrl,
  });

  return (
    <Link
      href={detailUrl}
      className={cn(
        "group relative block rounded-xl border bg-card shadow-sm",
        "transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label={`${tour.title} 상세보기`}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              // 이미지 로드 실패 시 placeholder로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex items-center justify-center h-full bg-muted">
                    <svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Camera className="size-12 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 space-y-3">
        {/* 제목 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        {address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{address}</span>
          </div>
        )}

        {/* 뱃지 영역 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 관광 타입 뱃지 */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              "bg-primary/10 text-primary",
              "border border-primary/20"
            )}
          >
            {contentTypeName}
          </span>

          {/* 지역 코드 (선택 사항) */}
          {tour.areacode && (
            <span className="text-xs text-muted-foreground">
              지역코드: {tour.areacode}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * 관광지 카드 리스트 컴포넌트 Props
 */
interface TourCardListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 그리드 컬럼 수 (기본: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 카드 리스트 컴포넌트
 *
 * @example
 * ```tsx
 * <TourCardList tours={tourItems} columns={3} />
 * ```
 */
export function TourCardList({ tours, columns = 3, className }: TourCardListProps) {
  console.log("📋 TourCardList 렌더링:", {
    count: tours.length,
    columns,
  });

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  if (tours.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        gridClasses[columns],
        className
      )}
    >
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

