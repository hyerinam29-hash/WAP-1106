/**
 * @file app/page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 이 페이지는 관광지 목록, 필터, 검색 기능을 제공합니다.
 * PRD.md의 Phase 2: 홈페이지 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시
 * 2. 지역/타입 필터
 * 3. 키워드 검색
 * 4. 정렬 및 페이지네이션
 * 5. 반응형 레이아웃 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - components/tour-list: TourList
 * - components/tour-filters: TourFilters
 * - components/tour-search: TourSearch
 * - lib/api/tour-api-client: getAreaBasedList, searchKeyword (클라이언트용, API Route 호출)
 * - lib/types/tour: TourItem, TourFilters
 *
 * @see PRD.md Phase 2: 홈페이지 (`/`) - 관광지 목록
 * @see Design.md 1. 홈페이지 (`/`) - 데스크톱/모바일
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { TourList } from "@/components/tour-list";
import { TourFilters, type TourFilters as TourFiltersType } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { Pagination } from "@/components/ui/pagination";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api-client";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 검색 모드
 */
type SearchMode = "filter" | "search";

/**
 * 홈페이지 컴포넌트
 */
export default function HomePage() {
  // 상태 관리
  const [tours, setTours] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TourFiltersType>({});
  const [keyword, setKeyword] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("filter");
  const [sortBy, setSortBy] = useState<"latest" | "name">("latest");
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [numOfRows] = useState(20); // 페이지당 항목 수

  console.group("🏠 HomePage 렌더링");
  console.log("상태:", {
    toursCount: tours.length,
    isLoading,
    hasError: !!error,
    filters,
    keyword,
    searchMode,
    sortBy,
    currentPage,
    totalCount,
  });

  // 관광지 목록 로드 (필터 기반)
  const loadToursByFilter = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("📡 필터 기반 관광지 목록 로드 시작:", { filters, page });

      const result = await getAreaBasedList({
        areaCode: filters.areaCode,
        contentTypeId: filters.contentTypeId,
        numOfRows: numOfRows,
        pageNo: page,
      });

      console.log("✅ 필터 기반 관광지 목록 로드 완료:", {
        itemsCount: result.items.length,
        totalCount: result.totalCount,
        pageNo: result.pageNo,
      });
      
      setTours(result.items);
      setTotalCount(result.totalCount);
      setCurrentPage(result.pageNo);
      setSearchMode("filter");
    } catch (err) {
      console.error("❌ 필터 기반 관광지 목록 로드 실패:", err);
      setError(err instanceof Error ? err : new Error("관광지 목록을 불러오는데 실패했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, [filters, numOfRows]);

  // 관광지 목록 로드 (검색 기반)
  const loadToursBySearch = useCallback(async (keyword: string, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔍 검색 기반 관광지 목록 로드 시작:", { keyword, page });

      const result = await searchKeyword({
        keyword: keyword,
        areaCode: filters.areaCode,
        contentTypeId: filters.contentTypeId,
        numOfRows: numOfRows,
        pageNo: page,
      });

      console.log("✅ 검색 기반 관광지 목록 로드 완료:", {
        itemsCount: result.items.length,
        totalCount: result.totalCount,
        pageNo: result.pageNo,
      });
      
      setTours(result.items);
      setTotalCount(result.totalCount);
      setCurrentPage(result.pageNo);
      setSearchMode("search");
    } catch (err) {
      console.error("❌ 검색 기반 관광지 목록 로드 실패:", err);
      setError(err instanceof Error ? err : new Error("검색 결과를 불러오는데 실패했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, [filters, numOfRows]);

  // 필터 변경 시 목록 다시 로드 (페이지 1로 리셋)
  useEffect(() => {
    if (searchMode === "filter" && !keyword) {
      setCurrentPage(1);
      loadToursByFilter(1);
    }
  }, [filters, searchMode, keyword, loadToursByFilter]);

  // 초기 로드 (필터 없이 전체 목록)
  useEffect(() => {
    if (tours.length === 0 && !isLoading && !error && searchMode === "filter" && !keyword) {
      console.log("🚀 초기 관광지 목록 로드");
      loadToursByFilter(1);
    }
  }, []);

  // 필터 변경 핸들러
  const handleFiltersChange = (newFilters: TourFiltersType) => {
    console.log("🔧 필터 변경:", newFilters);
    setFilters(newFilters);
    setKeyword(""); // 필터 변경 시 검색 초기화
    setCurrentPage(1); // 페이지 1로 리셋
  };

  // 검색 실행 핸들러
  const handleSearch = (keyword: string) => {
    console.log("🔍 검색 실행:", keyword);
    setKeyword(keyword);
    setCurrentPage(1); // 페이지 1로 리셋
    if (keyword.trim()) {
      loadToursBySearch(keyword, 1);
    } else {
      // 빈 검색어면 필터 모드로 전환
      setSearchMode("filter");
      loadToursByFilter(1);
    }
  };

  // 검색 초기화 핸들러
  const handleSearchReset = () => {
    console.log("🔄 검색 초기화");
    setKeyword("");
    setCurrentPage(1);
    setSearchMode("filter");
    loadToursByFilter(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log("📄 페이지 변경:", page);
    setCurrentPage(page);
    
    if (searchMode === "search" && keyword) {
      loadToursBySearch(keyword, page);
    } else {
      loadToursByFilter(page);
    }
    
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 재시도 핸들러
  const handleRetry = () => {
    console.log("🔄 재시도");
    if (searchMode === "search" && keyword) {
      loadToursBySearch(keyword, currentPage);
    } else {
      loadToursByFilter(currentPage);
    }
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / numOfRows);

  console.groupEnd();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 좌측 사이드바: 필터 */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* 검색 */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <TourSearch
                keyword={keyword}
                onSearch={handleSearch}
                onReset={handleSearchReset}
                resultCount={tours.length}
                isLoading={isLoading}
              />
            </div>

            {/* 필터 */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <TourFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* 정렬 옵션 */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="space-y-2">
                <div className="text-sm font-medium">정렬</div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSortBy("latest")}
                    className={cn(
                      "text-left px-3 py-2 rounded-md text-sm transition-colors",
                      sortBy === "latest"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortBy("name")}
                    className={cn(
                      "text-left px-3 py-2 rounded-md text-sm transition-colors",
                      sortBy === "name"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    이름순
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 우측 메인 영역: 목록 */}
        <main className="lg:col-span-3">
          <TourList
            tours={tours}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            emptyStateType={
              searchMode === "search" ? "search" : 
              searchMode === "filter" && (filters.areaCode || filters.contentTypeId) ? "filter" : 
              "default"
            }
            onReset={searchMode === "search" ? handleSearchReset : () => setFilters({})}
            keyword={keyword}
            columns={3}
            sortBy={sortBy}
          />

          {/* 페이지네이션 */}
          {!isLoading && !error && tours.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
