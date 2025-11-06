/**
 * @file components/ui/empty-state.tsx
 * @description 빈 상태 메시지 컴포넌트
 *
 * 이 컴포넌트는 데이터가 없을 때 표시되는 빈 상태 메시지를 제공합니다.
 * 검색 결과가 없거나, 필터링 결과가 없을 때 사용됩니다.
 *
 * @see PRD.md 2.1 관광지 목록 - 검색 결과 없음 시 안내 메시지
 */

import * as React from "react";
import { Search, Filter, MapPin, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * 빈 상태 아이콘 타입
 */
type EmptyStateIcon = "search" | "filter" | "location" | "inbox";

/**
 * 아이콘 매핑
 */
const iconMap: Record<EmptyStateIcon, React.ComponentType<{ className?: string }>> = {
  search: Search,
  filter: Filter,
  location: MapPin,
  inbox: Inbox,
};

/**
 * 빈 상태 컴포넌트 Props
 */
interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이콘 타입 */
  icon?: EmptyStateIcon;
  /** 커스텀 아이콘 */
  customIcon?: React.ReactNode;
  /** 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 액션 버튼 */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * 빈 상태 컴포넌트
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="search"
 *   title="검색 결과가 없습니다"
 *   description="다른 키워드로 검색해보세요."
 * />
 * <EmptyState
 *   icon="filter"
 *   title="조건에 맞는 관광지가 없습니다"
 *   description="필터 조건을 변경해보세요."
 *   action={{
 *     label: "필터 초기화",
 *     onClick: () => resetFilters()
 *   }}
 * />
 * ```
 */
function EmptyState({
  className,
  icon = "inbox",
  customIcon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center",
        className
      )}
      {...props}
    >
      {customIcon || (
        <IconComponent
          className="size-12 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * 검색 결과 없음 컴포넌트
 *
 * @example
 * ```tsx
 * <NoSearchResults onReset={() => setKeyword("")} />
 * ```
 */
interface NoSearchResultsProps {
  keyword?: string;
  onReset?: () => void;
}

function NoSearchResults({ keyword, onReset }: NoSearchResultsProps) {
  return (
    <EmptyState
      icon="search"
      title="검색 결과가 없습니다"
      description={
        keyword
          ? `"${keyword}"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`
          : "검색어를 입력해주세요."
      }
      action={onReset ? {
        label: "검색 초기화",
        onClick: onReset,
      } : undefined}
    />
  );
}

/**
 * 필터 결과 없음 컴포넌트
 *
 * @example
 * ```tsx
 * <NoFilterResults onReset={() => resetFilters()} />
 * ```
 */
interface NoFilterResultsProps {
  onReset?: () => void;
}

function NoFilterResults({ onReset }: NoFilterResultsProps) {
  return (
    <EmptyState
      icon="filter"
      title="조건에 맞는 관광지가 없습니다"
      description="선택한 필터 조건에 맞는 관광지가 없습니다. 필터를 변경해보세요."
      action={onReset ? {
        label: "필터 초기화",
        onClick: onReset,
      } : undefined}
    />
  );
}

export { EmptyState, NoSearchResults, NoFilterResults };
export type { EmptyStateIcon, EmptyStateProps };

