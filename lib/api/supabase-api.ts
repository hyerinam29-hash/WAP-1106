/**
 * @file lib/api/supabase-api.ts
 * @description Supabase 데이터베이스 API 함수들
 *
 * 이 파일은 Supabase 데이터베이스와 상호작용하는 함수들을 제공합니다.
 * 주로 북마크 기능을 위해 사용됩니다.
 *
 * 주요 기능:
 * 1. 북마크 추가
 * 2. 북마크 제거
 * 3. 북마크 목록 조회
 * 4. 북마크 여부 확인
 *
 * @dependencies
 * - @/lib/supabase/service-role: Supabase 서비스 롤 클라이언트 (RLS 우회)
 *
 * @see TODO.md 4.2 Supabase API 함수
 * @see PRD.md 2.4.5 북마크 기능
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 북마크 데이터 타입
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * 북마크 추가
 *
 * @param userId - 사용자 ID (users.id)
 * @param contentId - 한국관광공사 API contentId
 * @returns 생성된 북마크 데이터 또는 에러
 *
 * @example
 * ```typescript
 * const result = await addBookmark("user-uuid", "125266");
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log("북마크 추가 성공:", result.data);
 * }
 * ```
 */
export async function addBookmark(
  userId: string,
  contentId: string
): Promise<ApiResponse<Bookmark>> {
  try {
    console.group("📌 북마크 추가");
    console.log("User ID:", userId);
    console.log("Content ID:", contentId);

    // 입력 검증
    if (!userId || !contentId) {
      console.error("❌ 유효하지 않은 입력:", { userId, contentId });
      console.groupEnd();
      return {
        data: null,
        error: "사용자 ID와 관광지 ID는 필수입니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // 북마크 추가
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ 북마크 추가 실패:", error);
      console.groupEnd();

      // 중복 북마크 에러 처리
      if (error.code === "23505") {
        return {
          data: null,
          error: "이미 북마크한 관광지입니다.",
        };
      }

      return {
        data: null,
        error: `북마크 추가에 실패했습니다: ${error.message}`,
      };
    }

    console.log("✅ 북마크 추가 성공:", data);
    console.groupEnd();

    return {
      data: data as Bookmark,
      error: null,
    };
  } catch (err) {
    console.error("❌ 북마크 추가 중 예외 발생:", err);
    console.groupEnd();

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "북마크 추가 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 제거
 *
 * @param userId - 사용자 ID (users.id)
 * @param contentId - 한국관광공사 API contentId
 * @returns 삭제 성공 여부 또는 에러
 *
 * @example
 * ```typescript
 * const result = await removeBookmark("user-uuid", "125266");
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log("북마크 제거 성공");
 * }
 * ```
 */
export async function removeBookmark(
  userId: string,
  contentId: string
): Promise<ApiResponse<boolean>> {
  try {
    console.group("🗑️ 북마크 제거");
    console.log("User ID:", userId);
    console.log("Content ID:", contentId);

    // 입력 검증
    if (!userId || !contentId) {
      console.error("❌ 유효하지 않은 입력:", { userId, contentId });
      console.groupEnd();
      return {
        data: null,
        error: "사용자 ID와 관광지 ID는 필수입니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // 북마크 삭제
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      console.error("❌ 북마크 제거 실패:", error);
      console.groupEnd();

      return {
        data: null,
        error: `북마크 제거에 실패했습니다: ${error.message}`,
      };
    }

    console.log("✅ 북마크 제거 성공");
    console.groupEnd();

    return {
      data: true,
      error: null,
    };
  } catch (err) {
    console.error("❌ 북마크 제거 중 예외 발생:", err);
    console.groupEnd();

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "북마크 제거 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 목록 조회
 *
 * @param userId - 사용자 ID (users.id)
 * @returns 북마크 목록 또는 에러
 *
 * @example
 * ```typescript
 * const result = await getBookmarks("user-uuid");
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log("북마크 목록:", result.data);
 * }
 * ```
 */
export async function getBookmarks(
  userId: string
): Promise<ApiResponse<Bookmark[]>> {
  try {
    console.group("📋 북마크 목록 조회");
    console.log("User ID:", userId);

    // 입력 검증
    if (!userId) {
      console.error("❌ 유효하지 않은 사용자 ID:", userId);
      console.groupEnd();
      return {
        data: null,
        error: "사용자 ID는 필수입니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // 북마크 목록 조회 (최신순 정렬)
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 북마크 목록 조회 실패:", error);
      console.groupEnd();

      return {
        data: null,
        error: `북마크 목록 조회에 실패했습니다: ${error.message}`,
      };
    }

    console.log("✅ 북마크 목록 조회 성공:", {
      count: data?.length || 0,
    });
    console.groupEnd();

    return {
      data: (data as Bookmark[]) || [],
      error: null,
    };
  } catch (err) {
    console.error("❌ 북마크 목록 조회 중 예외 발생:", err);
    console.groupEnd();

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "북마크 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 여부 확인
 *
 * @param userId - 사용자 ID (users.id)
 * @param contentId - 한국관광공사 API contentId
 * @returns 북마크 여부 또는 에러
 *
 * @example
 * ```typescript
 * const result = await isBookmarked("user-uuid", "125266");
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log("북마크 여부:", result.data);
 * }
 * ```
 */
export async function isBookmarked(
  userId: string,
  contentId: string
): Promise<ApiResponse<boolean>> {
  try {
    console.group("🔍 북마크 여부 확인");
    console.log("User ID:", userId);
    console.log("Content ID:", contentId);

    // 입력 검증
    if (!userId || !contentId) {
      console.error("❌ 유효하지 않은 입력:", { userId, contentId });
      console.groupEnd();
      return {
        data: null,
        error: "사용자 ID와 관광지 ID는 필수입니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // 북마크 존재 여부 확인
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .maybeSingle();

    if (error) {
      console.error("❌ 북마크 여부 확인 실패:", error);
      console.groupEnd();

      return {
        data: null,
        error: `북마크 여부 확인에 실패했습니다: ${error.message}`,
      };
    }

    const bookmarked = !!data;
    console.log("✅ 북마크 여부 확인 성공:", bookmarked);
    console.groupEnd();

    return {
      data: bookmarked,
      error: null,
    };
  } catch (err) {
    console.error("❌ 북마크 여부 확인 중 예외 발생:", err);
    console.groupEnd();

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "북마크 여부 확인 중 오류가 발생했습니다.",
    };
  }
}

