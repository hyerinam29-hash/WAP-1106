/**
 * @file components/ui/error-message.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 이 컴포넌트는 에러 발생 시 사용자에게 표시되는 에러 메시지와 재시도 버튼을 제공합니다.
 * PRD.md의 7.4 에러 처리 요구사항을 기반으로 작성되었습니다.
 *
 * @see PRD.md 7.4 에러 처리
 */

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * 에러 메시지 컴포넌트 Props
 */
interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 에러 제목 */
  title?: string;
  /** 에러 메시지 */
  message: string;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 (기본: "다시 시도") */
  retryLabel?: string;
  /** 에러 타입 (기본: "error") */
  variant?: "error" | "warning" | "info";
}

/**
 * 에러 메시지 컴포넌트
 *
 * @example
 * ```tsx
 * <ErrorMessage message="데이터를 불러오는데 실패했습니다." />
 * <ErrorMessage
 *   title="네트워크 오류"
 *   message="인터넷 연결을 확인해주세요."
 *   onRetry={() => refetch()}
 * />
 * ```
 */
function ErrorMessage({
  className,
  title,
  message,
  onRetry,
  retryLabel = "다시 시도",
  variant = "error",
  ...props
}: ErrorMessageProps) {
  const variantStyles = {
    error: "border-destructive/50 bg-destructive/10 text-destructive",
    warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  return (
    <div
      data-slot="error-message"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <AlertCircle className="size-8" aria-hidden="true" />
      
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-semibold">{title}</h3>
        )}
        <p className="text-sm">{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          <RefreshCw className="size-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * 네트워크 에러 컴포넌트
 *
 * @example
 * ```tsx
 * <NetworkError onRetry={() => window.location.reload()} />
 * ```
 */
interface NetworkErrorProps {
  onRetry?: () => void;
}

function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorMessage
      title="네트워크 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요."
      onRetry={onRetry}
      variant="error"
    />
  );
}

/**
 * API 에러 컴포넌트
 *
 * @example
 * ```tsx
 * <ApiError
 *   message="데이터를 불러오는데 실패했습니다."
 *   onRetry={() => refetch()}
 * />
 * ```
 */
interface ApiErrorProps {
  message?: string;
  onRetry?: () => void;
}

function ApiError({ message, onRetry }: ApiErrorProps) {
  return (
    <ErrorMessage
      title="데이터 로딩 실패"
      message={message || "데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."}
      onRetry={onRetry}
      variant="error"
    />
  );
}

export { ErrorMessage, NetworkError, ApiError };

