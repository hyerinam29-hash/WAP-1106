/**
 * @file components/bookmarks/bookmark-button.tsx
 * @description 관광지 북마크 버튼 컴포넌트
 *
 * 이 컴포넌트는 관광지를 북마크하거나 북마크를 해제하는 버튼입니다.
 * TODO.md의 4.3 북마크 버튼 컴포넌트 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 별 아이콘 (채워짐/비어있음)
 * 2. 클릭 시 북마크 추가/제거
 * 3. 로딩 상태 표시
 * 4. 인증 확인
 * 5. 로그인하지 않은 경우 로그인 유도
 *
 * @dependencies
 * - @clerk/nextjs: useUser, useAuth, SignInButton
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient
 * - @/lib/api/supabase-api: addBookmark, removeBookmark, isBookmarked
 * - sonner: toast 메시지 표시
 * - lucide-react: Star 아이콘
 * - @/components/ui/button: Button 컴포넌트
 *
 * @see TODO.md 4.3 북마크 버튼 컴포넌트
 * @see PRD.md 2.4.5 북마크 기능
 */

"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "@/lib/api/supabase-api";
import type { ButtonProps } from "@/components/ui/button";

/**
 * 북마크 버튼 Props
 */
interface BookmarkButtonProps extends Omit<ButtonProps, "onClick"> {
  /** 한국관광공사 API contentId */
  contentId: string;
  /** 관광지명 (선택 사항, 토스트 메시지에 사용) */
  title?: string;
}

/**
 * 관광지 북마크 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <BookmarkButton contentId="125266" />
 *
 * // 제목과 함께 사용
 * <BookmarkButton
 *   contentId="125266"
 *   title="경복궁"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function BookmarkButton({
  contentId,
  title = "이 관광지",
  variant = "outline",
  size = "default",
  className,
  ...props
}: BookmarkButtonProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const supabase = useClerkSupabaseClient();

  const [isBookmarkedState, setIsBookmarkedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  /**
   * Supabase user ID 가져오기 (clerk_id로 조회)
   */
  useEffect(() => {
    const fetchSupabaseUserId = async () => {
      if (!isUserLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        console.group("🔍 Supabase User ID 조회");
        console.log("Clerk User ID:", user.id);

        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (error) {
          console.error("❌ Supabase User ID 조회 실패:", error);
          setIsChecking(false);
          return;
        }

        if (data) {
          console.log("✅ Supabase User ID:", data.id);
          setSupabaseUserId(data.id);
        } else {
          console.warn("⚠️ Supabase에 사용자 정보가 없습니다.");
        }

        setIsChecking(false);
        console.groupEnd();
      } catch (err) {
        console.error("❌ Supabase User ID 조회 중 예외 발생:", err);
        setIsChecking(false);
        console.groupEnd();
      }
    };

    fetchSupabaseUserId();
  }, [isUserLoaded, user, supabase]);

  /**
   * 북마크 여부 확인
   */
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!supabaseUserId || !contentId) {
        return;
      }

      try {
        console.group("🔍 북마크 여부 확인");
        console.log("User ID:", supabaseUserId);
        console.log("Content ID:", contentId);

        const result = await isBookmarked(supabaseUserId, contentId);

        if (result.error) {
          console.error("❌ 북마크 여부 확인 실패:", result.error);
          return;
        }

        console.log("✅ 북마크 여부:", result.data);
        setIsBookmarkedState(result.data ?? false);
        console.groupEnd();
      } catch (err) {
        console.error("❌ 북마크 여부 확인 중 예외 발생:", err);
        console.groupEnd();
      }
    };

    checkBookmarkStatus();
  }, [supabaseUserId, contentId]);

  /**
   * 북마크 토글 핸들러
   */
  const handleToggleBookmark = async () => {
    // 로그인하지 않은 경우
    if (!isSignedIn || !user) {
      console.log("ℹ️ 로그인이 필요합니다.");
      toast.info("북마크 기능을 사용하려면 로그인이 필요합니다.");
      return;
    }

    // Supabase User ID가 없는 경우
    if (!supabaseUserId) {
      console.error("❌ Supabase User ID가 없습니다.");
      toast.error("사용자 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      console.group(isBookmarkedState ? "🗑️ 북마크 제거" : "📌 북마크 추가");
      console.log("User ID:", supabaseUserId);
      console.log("Content ID:", contentId);
      console.log("Title:", title);

      if (isBookmarkedState) {
        // 북마크 제거
        const result = await removeBookmark(supabaseUserId, contentId);

        if (result.error) {
          console.error("❌ 북마크 제거 실패:", result.error);
          toast.error(result.error);
          return;
        }

        console.log("✅ 북마크 제거 성공");
        setIsBookmarkedState(false);
        toast.success(`${title} 북마크를 제거했습니다.`);
      } else {
        // 북마크 추가
        const result = await addBookmark(supabaseUserId, contentId);

        if (result.error) {
          console.error("❌ 북마크 추가 실패:", result.error);
          toast.error(result.error);
          return;
        }

        console.log("✅ 북마크 추가 성공:", result.data);
        setIsBookmarkedState(true);
        toast.success(`${title} 북마크에 추가했습니다.`);
      }

      console.groupEnd();
    } catch (err) {
      console.error("❌ 북마크 토글 중 예외 발생:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "북마크 처리 중 오류가 발생했습니다."
      );
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인하지 않은 경우 - 로그인 버튼 표시
  if (!isSignedIn && isUserLoaded) {
    return (
      <SignInButton mode="modal">
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label="북마크하려면 로그인이 필요합니다"
          {...props}
        >
          <Star className="size-4" />
          <span className="ml-2 hidden sm:inline">북마크</span>
        </Button>
      </SignInButton>
    );
  }

  // 로딩 중 또는 확인 중인 경우
  if (isChecking || isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        aria-label="북마크 처리 중"
        {...props}
      >
        <Loader2 className="size-4 animate-spin" />
        <span className="ml-2 hidden sm:inline">처리 중...</span>
      </Button>
    );
  }

  // 북마크 버튼
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      className={className}
      aria-label={
        isBookmarkedState
          ? `${title} 북마크 해제`
          : `${title} 북마크 추가`
      }
      {...props}
    >
      {isBookmarkedState ? (
        <>
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="ml-2 hidden sm:inline">북마크됨</span>
        </>
      ) : (
        <>
          <Star className="size-4" />
          <span className="ml-2 hidden sm:inline">북마크</span>
        </>
      )}
    </Button>
  );
}

