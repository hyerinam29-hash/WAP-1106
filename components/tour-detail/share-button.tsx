/**
 * @file components/tour-detail/share-button.tsx
 * @description 관광지 상세페이지 - 공유하기 버튼
 *
 * 이 컴포넌트는 관광지 상세페이지 URL을 복사하는 공유 기능을 제공합니다.
 * PRD.md의 2.4.5 공유하기 기능 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. URL 복사 버튼
 * 2. 클립보드 API 사용
 * 3. 복사 완료 토스트 메시지
 * 4. 공유 아이콘
 *
 * @dependencies
 * - components/ui/button: Button
 * - lucide-react: Share2, Check 아이콘
 *
 * @see PRD.md 2.4.5 공유하기
 * @see Design.md 3. 상세페이지 - 공유 버튼
 */

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 공유하기 버튼 Props
 */
interface ShareButtonProps {
  /** 공유할 URL */
  url: string;
  /** 버튼 텍스트 (선택 사항) */
  label?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 버튼 크기 */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 스타일 */
  variant?: "default" | "outline" | "ghost";
}

/**
 * 공유하기 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <ShareButton url="https://example.com/places/123" />
 * ```
 */
export function ShareButton({
  url,
  label = "공유하기",
  className,
  size = "default",
  variant = "outline",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /**
   * URL 복사 핸들러
   */
  const handleShare = async () => {
    console.group("🔗 ShareButton 클릭");
    console.log("공유할 URL:", url);

    try {
      // 클립보드 API 사용
      await navigator.clipboard.writeText(url);
      console.log("✅ URL 복사 완료:", url);

      // 복사 상태 업데이트
      setCopied(true);
      setShowToast(true);

      // 2초 후 상태 초기화
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
        console.log("🔄 토스트 메시지 숨김");
      }, 2000);
    } catch (error) {
      console.error("❌ URL 복사 실패:", error);
      // 폴백: prompt로 URL 표시
      alert(`URL을 복사할 수 없습니다. 아래 URL을 수동으로 복사해주세요:\n\n${url}`);
    }

    console.groupEnd();
  };

  return (
    <div className="relative">
      <Button
        onClick={handleShare}
        size={size}
        variant={variant}
        className={cn("gap-2", className)}
        aria-label={copied ? "복사 완료" : "URL 공유하기"}
      >
        {copied ? (
          <>
            <Check className="size-4" />
            복사 완료
          </>
        ) : (
          <>
            <Share2 className="size-4" />
            {label}
          </>
        )}
      </Button>

      {/* 토스트 메시지 */}
      {showToast && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lg whitespace-nowrap",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          )}
          role="alert"
          aria-live="polite"
        >
          URL이 복사되었습니다!
        </div>
      )}
    </div>
  );
}

