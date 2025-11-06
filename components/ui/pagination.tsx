/**
 * @file components/ui/pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * 이 컴포넌트는 페이지 번호 선택 방식의 페이지네이션을 제공합니다.
 * PRD.md의 2.1 관광지 목록 - 페이지네이션 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 페이지 번호 선택
 * 2. 이전/다음 페이지 이동
 * 3. 첫 페이지/마지막 페이지 이동
 * 4. 반응형 디자인
 *
 * @dependencies
 * - lucide-react: ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
 * - components/ui/button: Button
 *
 * @see PRD.md 2.1 관광지 목록 - 페이지네이션
 * @see Design.md 1. 홈페이지 - 페이지네이션
 */

"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 페이지네이션 컴포넌트 Props
 */
interface PaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 표시할 페이지 번호 개수 (기본: 5) */
  maxVisiblePages?: number;
}

/**
 * 페이지네이션 컴포넌트
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}: PaginationProps) {
  // 페이지가 1개 이하면 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  console.log("📄 Pagination 렌더링:", {
    currentPage,
    totalPages,
    maxVisiblePages,
  });

  // 표시할 페이지 번호 배열 생성
  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // 끝에서 시작점 조정
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="페이지네이션"
    >
      {/* 첫 페이지로 이동 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
        aria-label="첫 페이지로 이동"
        className="hidden sm:flex"
      >
        <ChevronsLeft className="size-4" />
      </Button>

      {/* 이전 페이지로 이동 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="이전 페이지로 이동"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* 페이지 번호들 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지가 보이지 않으면 "1 ..." 표시 */}
        {visiblePages[0] > 1 && (
          <>
            <Button
              variant={1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(1)}
              className="min-w-[2.5rem]"
            >
              1
            </Button>
            {visiblePages[0] > 2 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
          </>
        )}

        {/* 표시할 페이지 번호들 */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[2.5rem]"
            aria-label={`${page}페이지로 이동`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        {/* 마지막 페이지가 보이지 않으면 "... 마지막" 표시 */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
            <Button
              variant={totalPages === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="min-w-[2.5rem]"
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* 다음 페이지로 이동 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        aria-label="다음 페이지로 이동"
      >
        <ChevronRight className="size-4" />
      </Button>

      {/* 마지막 페이지로 이동 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={isLastPage}
        aria-label="마지막 페이지로 이동"
        className="hidden sm:flex"
      >
        <ChevronsRight className="size-4" />
      </Button>
    </nav>
  );
}

