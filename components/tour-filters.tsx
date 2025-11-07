/**
 * @file components/tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 이 컴포넌트는 지역, 관광 타입, 반려동물 필터를 제공합니다.
 * PRD.md의 2.1 관광지 목록 + 지역/타입 필터 및 2.5 반려동물 동반 여행 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 지역 선택 (시/도 단위)
 * 2. 관광 타입 선택 (12, 14, 15, 25, 28, 32, 38, 39)
 * 3. 반려동물 필터 (동반 가능, 크기별, 종류별, 실내/실외)
 * 4. "전체" 옵션
 * 5. 필터 초기화 버튼
 * 6. 선택된 필터 표시
 *
 * @dependencies
 * - lib/types/tour: AreaCode, ContentType, CONTENT_TYPE_NAMES
 * - components/ui/button: Button
 * - lib/api/tour-api: getAreaCodes
 *
 * @see PRD.md 2.1 관광지 목록 + 지역/타입 필터
 * @see PRD.md 2.5 반려동물 동반 여행
 * @see Design.md 1. 홈페이지 - FILTERS & CONTROLS
 */

"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Tag, Heart } from "lucide-react";
import type { AreaCode, ContentType } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { getAreaCodes } from "@/lib/api/tour-api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 반려동물 크기 타입
 */
export type PetSize = "small" | "medium" | "large";

/**
 * 반려동물 종류 타입
 */
export type PetType = "dog" | "cat";

/**
 * 반려동물 입장 가능 장소 타입
 */
export type PetPlace = "indoor" | "outdoor";

/**
 * 필터 값 타입
 */
export interface TourFilters {
  /** 선택된 지역 코드 (undefined = 전체) */
  areaCode?: string;
  /** 선택된 관광 타입 (undefined = 전체) */
  contentTypeId?: ContentType;
  /** 반려동물 동반 가능 여부 (true = 동반 가능만 표시) */
  petAllowed?: boolean;
  /** 반려동물 크기 필터 (소형, 중형, 대형) */
  petSize?: PetSize;
  /** 반려동물 종류 필터 (개, 고양이) */
  petType?: PetType;
  /** 실내/실외 동반 가능 여부 필터 */
  petPlace?: PetPlace;
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

  // 반려동물 동반 가능 토글 핸들러
  const handlePetAllowedToggle = () => {
    console.log("🐾 반려동물 동반 가능 토글:", !filters.petAllowed);
    onFiltersChange({
      ...filters,
      petAllowed: !filters.petAllowed,
      // 토글이 꺼지면 반려동물 관련 필터도 초기화
      ...(filters.petAllowed ? {} : { petSize: undefined, petType: undefined, petPlace: undefined }),
    });
  };

  // 반려동물 크기 선택 핸들러
  const handlePetSizeChange = (size: PetSize | undefined) => {
    console.log("🐾 반려동물 크기 변경:", size);
    onFiltersChange({
      ...filters,
      petSize: size,
      petAllowed: true, // 크기 선택 시 자동으로 반려동물 필터 활성화
    });
  };

  // 반려동물 종류 선택 핸들러
  const handlePetTypeChange = (type: PetType | undefined) => {
    console.log("🐾 반려동물 종류 변경:", type);
    onFiltersChange({
      ...filters,
      petType: type,
      petAllowed: true, // 종류 선택 시 자동으로 반려동물 필터 활성화
    });
  };

  // 실내/실외 선택 핸들러
  const handlePetPlaceChange = (place: PetPlace | undefined) => {
    console.log("🐾 실내/실외 변경:", place);
    onFiltersChange({
      ...filters,
      petPlace: place,
      petAllowed: true, // 장소 선택 시 자동으로 반려동물 필터 활성화
    });
  };

  // 필터가 선택되어 있는지 확인
  const hasActiveFilters = 
    filters.areaCode !== undefined || 
    filters.contentTypeId !== undefined ||
    filters.petAllowed === true ||
    filters.petSize !== undefined ||
    filters.petType !== undefined ||
    filters.petPlace !== undefined;

  // 선택된 지역 이름
  const selectedAreaName = areaCodes.find(
    (area) => area.code === filters.areaCode
  )?.name;

  // 반려동물 크기 이름 매핑
  const petSizeNames: Record<PetSize, string> = {
    small: "소형",
    medium: "중형",
    large: "대형",
  };

  // 반려동물 종류 이름 매핑
  const petTypeNames: Record<PetType, string> = {
    dog: "개",
    cat: "고양이",
  };

  // 실내/실외 이름 매핑
  const petPlaceNames: Record<PetPlace, string> = {
    indoor: "실내",
    outdoor: "실외",
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* 필터 제목 및 초기화 버튼 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold">필터</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs sm:text-sm"
            aria-label="필터 초기화"
          >
            <X className="size-3 sm:size-4" />
            <span className="hidden sm:inline">초기화</span>
          </Button>
        )}
      </div>

      {/* 지역 필터 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
          <MapPin className="size-4 shrink-0" />
          <span>지역</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* 전체 옵션 */}
          <Button
            variant={filters.areaCode === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleAreaChange(undefined)}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            전체
          </Button>

          {/* 지역 옵션들 */}
          {isLoadingAreaCodes ? (
            <div className="text-xs sm:text-sm text-muted-foreground">로딩 중...</div>
          ) : (
            areaCodes.map((area) => (
              <Button
                key={area.code}
                variant={filters.areaCode === area.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleAreaChange(area.code)}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {area.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* 관광 타입 필터 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
          <Tag className="size-4 shrink-0" />
          <span>관광 타입</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* 전체 옵션 */}
          <Button
            variant={filters.contentTypeId === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleContentTypeChange(undefined)}
            className="text-xs sm:text-sm px-2 sm:px-3"
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
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              {CONTENT_TYPE_NAMES[typeId]}
            </Button>
          ))}
        </div>
      </div>

      {/* 반려동물 필터 */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Heart className="size-4 shrink-0" />
          <span className="whitespace-nowrap">반려동물 동반</span>
        </div>

        {/* 반려동물 동반 가능 토글 */}
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors">
          <span className="text-sm sm:text-base">반려동물 동반 가능</span>
          <Button
            variant={filters.petAllowed ? "default" : "outline"}
            size="sm"
            onClick={handlePetAllowedToggle}
            className="text-xs sm:text-sm min-w-[60px] sm:min-w-[70px]"
            aria-label={filters.petAllowed ? "반려동물 필터 활성화됨" : "반려동물 필터 비활성화됨"}
          >
            {filters.petAllowed ? "ON" : "OFF"}
          </Button>
        </div>

        {/* 반려동물 필터 옵션들 (petAllowed가 true일 때만 표시) */}
        {filters.petAllowed && (
          <div className="space-y-3 sm:space-y-4 pl-2 sm:pl-3 border-l-2 border-primary/20">
            {/* 반려동물 크기별 필터 */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">크기</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filters.petSize === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePetSizeChange(undefined)}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  전체
                </Button>
                {(["small", "medium", "large"] as PetSize[]).map((size) => (
                  <Button
                    key={size}
                    variant={filters.petSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePetSizeChange(size)}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {petSizeNames[size]}
                  </Button>
                ))}
              </div>
            </div>

            {/* 반려동물 종류별 필터 */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">종류</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filters.petType === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePetTypeChange(undefined)}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  전체
                </Button>
                {(["dog", "cat"] as PetType[]).map((type) => (
                  <Button
                    key={type}
                    variant={filters.petType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePetTypeChange(type)}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {petTypeNames[type]}
                  </Button>
                ))}
              </div>
            </div>

            {/* 실내/실외 동반 가능 여부 필터 */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">입장 가능 장소</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filters.petPlace === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePetPlaceChange(undefined)}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  전체
                </Button>
                {(["indoor", "outdoor"] as PetPlace[]).map((place) => (
                  <Button
                    key={place}
                    variant={filters.petPlace === place ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePetPlaceChange(place)}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {petPlaceNames[place]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 필터 표시 */}
      {hasActiveFilters && (
        <div className="pt-2 sm:pt-3 border-t space-y-1 sm:space-y-2">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">선택된 필터:</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
            {filters.petAllowed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-xs sm:text-sm text-primary">
                <Heart className="size-3 sm:size-4 shrink-0" />
                <span className="whitespace-nowrap">반려동물 동반 가능</span>
                {filters.petSize && <span className="hidden sm:inline"> · {petSizeNames[filters.petSize]}</span>}
                {filters.petType && <span className="hidden sm:inline"> · {petTypeNames[filters.petType]}</span>}
                {filters.petPlace && <span className="hidden sm:inline"> · {petPlaceNames[filters.petPlace]}</span>}
                <button
                  onClick={handlePetAllowedToggle}
                  className="hover:text-primary/70 shrink-0"
                  aria-label="반려동물 필터 제거"
                >
                  <X className="size-3 sm:size-4" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

