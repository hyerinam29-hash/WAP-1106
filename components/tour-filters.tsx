/**
 * @file components/tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 이 컴포넌트는 지역 및 관광 타입 필터를 제공합니다.
 * PRD.md의 2.1 관광지 목록 + 지역/타입 필터 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 지역 선택 (시/도 단위)
 * 2. 관광 타입 선택 (12, 14, 15, 25, 28, 32, 38, 39)
 * 3. "전체" 옵션
 * 4. 필터 초기화 버튼
 * 5. 선택된 필터 표시
 *
 * @dependencies
 * - lib/types/tour: AreaCode, ContentType, CONTENT_TYPE_NAMES
 * - components/ui/button: Button
 * - lib/api/tour-api: getAreaCodes
 *
 * @see PRD.md 2.1 관광지 목록 + 지역/타입 필터
 * @see Design.md 1. 홈페이지 - FILTERS & CONTROLS
 */

"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Tag } from "lucide-react";
import type { AreaCode, ContentType } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { getAreaCodes } from "@/lib/api/tour-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 필터 값 타입
 */
export interface TourFilters {
  /** 선택된 지역 코드 (undefined = 전체) */
  areaCode?: string;
  /** 선택된 관광 타입 (undefined = 전체) */
  contentTypeId?: ContentType;
}

/**
 * 관광지 필터 컴포넌트 Props
 */
interface TourFiltersProps {
  /** 현재 필터 값 */
  filters: TourFilters;
  /** 필터 변경 핸들러 */
  onFiltersChange: (filters: TourFilters) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광 타입 옵션
 */
const CONTENT_TYPE_OPTIONS: ContentType[] = ["12", "14", "15", "25", "28", "32", "38", "39"];

/**
 * 관광지 필터 컴포넌트
 *
 * @example
 * ```tsx
 * <TourFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * ```
 */
export function TourFilters({
  filters,
  onFiltersChange,
  className,
}: TourFiltersProps) {
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [isLoadingAreaCodes, setIsLoadingAreaCodes] = useState(true);

  console.group("🔍 TourFilters 렌더링");
  console.log("현재 필터:", filters);

  // 지역 코드 로드
  useEffect(() => {
    async function loadAreaCodes() {
      try {
        setIsLoadingAreaCodes(true);
        console.log("📍 지역 코드 로딩 시작");
        
        const codes = await getAreaCodes({ numOfRows: 100 });
        console.log("📍 지역 코드 로딩 완료:", codes.length, "개");
        
        setAreaCodes(codes);
      } catch (error) {
        console.error("❌ 지역 코드 로딩 실패:", error);
      } finally {
        setIsLoadingAreaCodes(false);
      }
    }

    loadAreaCodes();
  }, []);

  console.log("지역 코드 개수:", areaCodes.length);
  console.groupEnd();

  // 지역 선택 핸들러
  const handleAreaChange = (areaCode: string | undefined) => {
    console.log("📍 지역 변경:", areaCode);
    onFiltersChange({
      ...filters,
      areaCode,
    });
  };

  // 관광 타입 선택 핸들러
  const handleContentTypeChange = (contentTypeId: ContentType | undefined) => {
    console.log("🎯 관광 타입 변경:", contentTypeId);
    onFiltersChange({
      ...filters,
      contentTypeId,
    });
  };

  // 필터 초기화
  const handleReset = () => {
    console.log("🔄 필터 초기화");
    onFiltersChange({});
  };

  // 필터가 선택되어 있는지 확인
  const hasActiveFilters = filters.areaCode !== undefined || filters.contentTypeId !== undefined;

  // 선택된 지역 이름
  const selectedAreaName = areaCodes.find(
    (area) => area.code === filters.areaCode
  )?.name;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 필터 제목 및 초기화 버튼 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">필터</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <X className="size-3" />
            초기화
          </Button>
        )}
      </div>

      {/* 지역 필터 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4" />
          지역
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 전체 옵션 */}
          <Button
            variant={filters.areaCode === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleAreaChange(undefined)}
            className="text-xs"
          >
            전체
          </Button>

          {/* 지역 옵션들 */}
          {isLoadingAreaCodes ? (
            <div className="text-xs text-muted-foreground">로딩 중...</div>
          ) : (
            areaCodes.map((area) => (
              <Button
                key={area.code}
                variant={filters.areaCode === area.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleAreaChange(area.code)}
                className="text-xs"
              >
                {area.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* 관광 타입 필터 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Tag className="size-4" />
          관광 타입
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 전체 옵션 */}
          <Button
            variant={filters.contentTypeId === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleContentTypeChange(undefined)}
            className="text-xs"
          >
            전체
          </Button>

          {/* 관광 타입 옵션들 */}
          {CONTENT_TYPE_OPTIONS.map((typeId) => (
            <Button
              key={typeId}
              variant={filters.contentTypeId === typeId ? "default" : "outline"}
              size="sm"
              onClick={() => handleContentTypeChange(typeId)}
              className="text-xs"
            >
              {CONTENT_TYPE_NAMES[typeId]}
            </Button>
          ))}
        </div>
      </div>

      {/* 선택된 필터 표시 */}
      {hasActiveFilters && (
        <div className="pt-2 border-t space-y-1">
          <div className="text-xs font-medium text-muted-foreground">선택된 필터:</div>
          <div className="flex flex-wrap gap-2">
            {selectedAreaName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                <MapPin className="size-3" />
                {selectedAreaName}
                <button
                  onClick={() => handleAreaChange(undefined)}
                  className="hover:text-primary/70"
                  aria-label={`${selectedAreaName} 필터 제거`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {filters.contentTypeId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                <Tag className="size-3" />
                {CONTENT_TYPE_NAMES[filters.contentTypeId]}
                <button
                  onClick={() => handleContentTypeChange(undefined)}
                  className="hover:text-primary/70"
                  aria-label={`${CONTENT_TYPE_NAMES[filters.contentTypeId]} 필터 제거`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

