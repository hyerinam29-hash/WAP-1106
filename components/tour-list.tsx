/**
 * @file components/tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 이 컴포넌트는 관광지 목록을 표시하고, 로딩/에러/빈 상태를 처리합니다.
 * PRD.md의 2.1 관광지 목록 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 그리드 레이아웃 (반응형)
 * 2. 카드 목록 렌더링
 * 3. 로딩 상태 (Skeleton UI)
 * 4. 빈 상태 처리
 * 5. 에러 상태 처리
 *
 * @dependencies
 * - components/tour-card: TourCard, TourCardList
 * - components/ui/skeleton-card: SkeletonList
 * - components/ui/error-message: ApiError
 * - components/ui/empty-state: EmptyState, NoFilterResults
 *
 * @see PRD.md 2.1 관광지 목록 + 지역/타입 필터
 */

"use client";

import { useMemo } from "react";
import type { TourItem } from "@/lib/types/tour";
import { TourCardList } from "./tour-card";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { ApiError } from "@/components/ui/error-message";
import { NoFilterResults, EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

/**
 * 정렬 옵션
 */
export type SortOption = "latest" | "name";

/**
 * 관광지 목록 컴포넌트 Props
 */
interface TourListProps {
  /** 관광지 목록 데이터 */
  tours?: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 에러 재시도 함수 */
  onRetry?: () => void;
  /** 빈 상태 타입 */
  emptyStateType?: "filter" | "search" | "default";
  /** 빈 상태 초기화 함수 */
  onReset?: () => void;
  /** 검색 키워드 (검색 결과 없을 때 표시용) */
  keyword?: string;
  /** 그리드 컬럼 수 (기본: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** 정렬 옵션 (기본: "latest") */
  sortBy?: SortOption;
  /** 추가 클래스명 */
  className?: string;
  /** 카드 클릭 핸들러 (지도 연동용) */
  onCardClick?: (tourId: string) => void;
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 카드 호버 핸들러 (지도 연동용, 선택 사항) */
  onCardHover?: (tourId: string | undefined) => void;
  /** 호버된 관광지 ID (선택 사항) */
  hoveredTourId?: string;
}

/**
 * 관광지 목록 정렬 함수
 */
function sortTours(tours: TourItem[], sortBy: SortOption): TourItem[] {
  const sorted = [...tours];

  switch (sortBy) {
    case "latest":
      // 최신순 (modifiedtime 기준, 내림차순)
      return sorted.sort((a, b) => {
        const timeA = new Date(a.modifiedtime).getTime();
        const timeB = new Date(b.modifiedtime).getTime();
        return timeB - timeA;
      });

    case "name":
      // 이름순 (가나다순)
      return sorted.sort((a, b) => {
        return a.title.localeCompare(b.title, "ko");
      });

    default:
      return sorted;
  }
}

/**
 * 관광지 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <TourList
 *   tours={tourItems}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function TourList({
  tours = [],
  isLoading = false,
  error = null,
  onRetry,
  emptyStateType = "default",
  onReset,
  keyword,
  columns = 3,
  sortBy = "latest",
  className,
  onCardClick,
  selectedTourId,
  onCardHover,
  hoveredTourId,
}: TourListProps) {
  console.group("📋 TourList 렌더링");
  console.log("상태:", {
    toursCount: tours.length,
    isLoading,
    hasError: !!error,
    emptyStateType,
    sortBy,
    columns,
  });

  // 정렬된 관광지 목록
  const sortedTours = useMemo(() => {
    if (tours.length === 0) return [];
    return sortTours(tours, sortBy);
  }, [tours, sortBy]);

  console.log("정렬된 목록:", sortedTours.length, "개");
  console.groupEnd();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <SkeletonList count={6} columns={columns} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <ApiError
          message={error.message || "관광지 목록을 불러오는데 실패했습니다."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // 빈 상태
  if (sortedTours.length === 0) {
    if (emptyStateType === "filter") {
      return (
        <div className={cn("w-full", className)}>
          <NoFilterResults onReset={onReset} />
        </div>
      );
    }

    if (emptyStateType === "search") {
      return (
        <div className={cn("w-full", className)}>
          <EmptyState
            icon="search"
            title="검색 결과가 없습니다"
            description={
              keyword
                ? `"${keyword}"에 대한 검색 결과를 찾을 수 없습니다.`
                : "검색어를 입력해주세요."
            }
            action={onReset ? { label: "검색 초기화", onClick: onReset } : undefined}
          />
        </div>
      );
    }

    return (
      <div className={cn("w-full", className)}>
        <EmptyState
          icon="inbox"
          title="관광지가 없습니다"
          description="조건을 변경하여 다시 검색해보세요."
        />
      </div>
    );
  }

  // 정상 상태: 목록 표시
  return (
    <div className={cn("w-full", className)}>
      {/* 결과 개수 표시 (선택 사항) */}
      <div className="mb-4 text-sm text-muted-foreground">
        총 {sortedTours.length}개의 관광지를 찾았습니다.
      </div>

      {/* 관광지 카드 리스트 */}
      <TourCardList
        tours={sortedTours}
        columns={columns}
        onCardClick={onCardClick}
        selectedTourId={selectedTourId}
        onCardHover={onCardHover}
        hoveredTourId={hoveredTourId}
      />
    </div>
  );
}

