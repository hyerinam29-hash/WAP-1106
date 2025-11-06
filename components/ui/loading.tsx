/**
 * @file components/ui/loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 이 컴포넌트는 데이터를 로딩하는 동안 표시되는 스피너를 제공합니다.
 * PRD.md의 7.3 로딩 상태 요구사항을 기반으로 작성되었습니다.
 *
 * @see PRD.md 7.3 로딩 상태
 */

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 로딩 스피너 컴포넌트 Props
 */
interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 로딩 메시지 */
  message?: string;
  /** 크기 (기본: "default") */
  size?: "sm" | "default" | "lg";
}

/**
 * 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * <Loading />
 * <Loading message="데이터를 불러오는 중..." />
 * <Loading size="lg" />
 * ```
 */
function Loading({
  className,
  message,
  size = "default",
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
  };

  return (
    <div
      data-slot="loading"
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
        aria-label="로딩 중"
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

export { Loading };

