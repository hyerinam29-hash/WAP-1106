/**
 * @file components/ui/skeleton-card.tsx
 * @description 스켈레톤 UI 컴포넌트
 *
 * 이 컴포넌트는 데이터 로딩 중 콘텐츠의 레이아웃을 미리 보여주는 스켈레톤 UI를 제공합니다.
 * PRD.md의 7.3 로딩 상태 요구사항을 기반으로 작성되었습니다.
 *
 * @see PRD.md 7.3 로딩 상태 - 리스트 로딩: 스켈레톤 UI
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 스켈레톤 기본 컴포넌트
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

/**
 * 스켈레톤 카드 컴포넌트 Props
 */
interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 이미지 높이 (기본: "h-48") */
  imageHeight?: string;
  /** 라인 개수 (기본: 3) */
  lines?: number;
}

/**
 * 관광지 카드용 스켈레톤 UI
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * <SkeletonCard imageHeight="h-64" lines={4} />
 * ```
 */
function SkeletonCard({
  className,
  imageHeight = "h-48",
  lines = 3,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      data-slot="skeleton-card"
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {/* 이미지 스켈레톤 */}
      <Skeleton className={cn("w-full", imageHeight)} />
      
      {/* 텍스트 라인들 */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        {lines > 2 && <Skeleton className="h-4 w-5/6" />}
        {lines > 3 && <Skeleton className="h-4 w-4/5" />}
      </div>
      
      {/* 뱃지 스켈레톤 */}
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

/**
 * 스켈레톤 리스트 컴포넌트
 *
 * @example
 * ```tsx
 * <SkeletonList count={6} />
 * ```
 */
interface SkeletonListProps {
  /** 스켈레톤 카드 개수 */
  count?: number;
  /** 그리드 컬럼 수 (기본: 3) */
  columns?: number;
}

function SkeletonList({
  count = 6,
  columns = 3,
}: SkeletonListProps) {
  return (
    <div
      data-slot="skeleton-list"
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList };

