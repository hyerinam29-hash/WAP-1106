/**
 * @file app/places/[contentId]/loading.tsx
 * @description 관광지 상세페이지 로딩 UI
 *
 * 이 파일은 Next.js의 자동 Suspense 경계를 사용하여
 * 상세페이지 로딩 중에 표시되는 UI를 제공합니다.
 *
 * @see Next.js 15 App Router - loading.tsx
 */

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton-card";

/**
 * 상세페이지 로딩 UI
 */
export default function DetailPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 스켈레톤 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          뒤로가기
        </Button>
      </div>

      {/* 제목 스켈레톤 */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>

      {/* 섹션 스켈레톤 */}
      <div className="space-y-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

