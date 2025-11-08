/**
 * @file components/tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 이 컴포넌트는 키워드 검색 기능을 제공합니다.
 * PRD.md의 2.3 키워드 검색 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 검색창 UI (헤더 고정)
 * 2. 검색 아이콘
 * 3. 검색 실행 (엔터/버튼)
 * 4. 검색 중 로딩 표시
 * 5. 검색 결과 개수 표시
 *
 * @dependencies
 * - components/ui/button: Button
 * - components/ui/input: Input
 * - lucide-react: Search 아이콘
 *
 * @see PRD.md 2.3 키워드 검색
 * @see Design.md 1. 홈페이지 - HEADER (검색창)
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 관광지 검색 컴포넌트 Props
 */
interface TourSearchProps {
  /** 현재 검색 키워드 */
  keyword?: string;
  /** 검색 실행 핸들러 */
  onSearch: (keyword: string) => void;
  /** 검색 초기화 핸들러 */
  onReset?: () => void;
  /** 검색 결과 개수 (선택 사항) */
  resultCount?: number;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** placeholder 텍스트 (기본: "관광지 검색...") */
  placeholder?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 검색 컴포넌트
 *
 * @example
 * ```tsx
 * <TourSearch
 *   keyword={keyword}
 *   onSearch={(keyword) => handleSearch(keyword)}
 *   onReset={() => setKeyword("")}
 *   resultCount={searchResults.length}
 * />
 * ```
 */
export function TourSearch({
  keyword = "",
  onSearch,
  onReset,
  resultCount,
  isLoading = false,
  placeholder = "관광지 검색...",
  className,
}: TourSearchProps) {
  const [inputValue, setInputValue] = useState(keyword);

  console.log("🔍 TourSearch 렌더링:", {
    keyword,
    inputValue,
    resultCount,
    isLoading,
  });

  // 검색 실행
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedKeyword = inputValue.trim();
    
    if (trimmedKeyword) {
      console.log("🔍 검색 실행:", trimmedKeyword);
      onSearch(trimmedKeyword);
    }
  };

  // 검색 초기화
  const handleReset = () => {
    console.log("🔄 검색 초기화");
    setInputValue("");
    if (onReset) {
      onReset();
    }
  };

  // keyword prop 변경 시 inputValue 동기화
  useEffect(() => {
    if (keyword !== inputValue) {
      setInputValue(keyword);
    }
  }, [keyword]);

  return (
    <div className={cn("w-full", className)}>
      {/* 검색창 */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              // 엔터 키 처리 (명시적으로)
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmedKeyword = inputValue.trim();
                if (trimmedKeyword) {
                  console.log("🔍 엔터 키로 검색 실행:", trimmedKeyword);
                  onSearch(trimmedKeyword);
                }
              }
            }}
            placeholder={placeholder}
            className={cn("pl-10", inputValue ? "pr-20" : "pr-12")}
            disabled={isLoading}
            aria-label="관광지 검색"
          />
          {/* 우측 버튼 영역 (초기화 또는 검색 버튼) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* 초기화 버튼 (입력값이 있을 때만 표시) */}
            {inputValue && (
              <button
                type="button"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="검색 초기화"
              >
                <X className="size-4" />
              </button>
            )}
            {/* 검색 버튼 (인라인) */}
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-7 px-2"
              size="sm"
              variant="ghost"
              aria-label="검색 실행"
            >
              {isLoading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 검색 결과 개수 표시 */}
      {resultCount !== undefined && resultCount >= 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {resultCount > 0 ? (
            <span>검색 결과: <strong className="text-foreground">{resultCount}</strong>개</span>
          ) : keyword ? (
            <span>&quot;<strong className="text-foreground">{keyword}</strong>&quot;에 대한 결과가 없습니다.</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

