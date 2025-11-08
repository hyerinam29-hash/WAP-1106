/**
 * @file components/tour-detail/share-button.tsx
 * @description 관광지 상세페이지 - 공유하기 버튼
 *
 * 이 컴포넌트는 관광지 상세페이지의 URL을 클립보드에 복사하는 버튼입니다.
 * TODO.md의 3.6 공유하기 기능 (MVP 2.4.5) 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. URL 복사 버튼
 * 2. 클립보드 API 사용
 * 3. 복사 완료 토스트 메시지
 * 4. 공유 아이콘 표시
 *
 * @dependencies
 * - sonner: toast 메시지 표시
 * - lucide-react: Share2 아이콘
 * - @/components/ui/button: Button 컴포넌트
 *
 * @see TODO.md 3.6 공유하기 기능 (MVP 2.4.5)
 * @see Design.md 3. 상세페이지 - 공유하기 버튼
 */

"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

/**
 * 공유하기 버튼 Props
 */
interface ShareButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  /** 공유할 URL (선택 사항, 없으면 현재 페이지 URL 사용) */
  url?: string;
  /** 공유 시 표시할 제목 (선택 사항) */
  title?: string;
}

/**
 * 관광지 공유하기 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ShareButton url="https://example.com/places/123" />
 *
 * // 제목과 함께 사용
 * <ShareButton
 *   url="https://example.com/places/123"
 *   title="경복궁"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function ShareButton({
  url,
  title = "이 관광지를",
  variant = "outline",
  size = "default",
  className,
  ...props
}: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * URL 복사 핸들러
   */
  const handleShare = async () => {
    // 공유할 URL 결정 (props로 받거나 현재 페이지 URL 사용)
    const urlToShare = url || (typeof window !== "undefined" ? window.location.href : "");

    if (!urlToShare) {
      console.error("❌ 공유할 URL이 없습니다.");
      toast.error("공유할 URL을 찾을 수 없습니다.");
      return;
    }

    console.group("🔗 공유하기 버튼 클릭");
    console.log("공유할 URL:", urlToShare);
    console.log("제목:", title);

    try {
      // Web Share API 지원 여부 확인 (모바일 기기에서 주로 지원)
      if (navigator.share) {
        console.log("📱 Web Share API 사용");
        await navigator.share({
          title: `${title} 공유`,
          url: urlToShare,
        });
        console.log("✅ Web Share API를 통한 공유 성공");
        toast.success("공유가 완료되었습니다.");
      } else {
        // Web Share API 미지원 시 클립보드에 복사
        console.log("📋 클립보드 API 사용");
        await navigator.clipboard.writeText(urlToShare);
        console.log("✅ 클립보드에 URL 복사 완료");

        // 복사 완료 상태 표시
        setIsCopied(true);
        toast.success("링크가 복사되었습니다!");

        // 2초 후 복사 완료 상태 해제
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ 공유 실패:", error);

      // 사용자가 공유를 취소한 경우 (Web Share API)
      if (error instanceof Error && error.name === "AbortError") {
        console.log("ℹ️ 사용자가 공유를 취소했습니다.");
        // 사용자가 취소한 경우에는 에러 메시지를 표시하지 않음
        return;
      }

      toast.error("공유에 실패했습니다.");
    } finally {
      console.groupEnd();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label={isCopied ? "링크 복사 완료" : "공유하기"}
      {...props}
    >
      {isCopied ? (
        <>
          <Check className="size-4" />
          <span className="ml-2 hidden sm:inline">복사 완료</span>
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          <span className="ml-2 hidden sm:inline">공유하기</span>
        </>
      )}
    </Button>
  );
}
