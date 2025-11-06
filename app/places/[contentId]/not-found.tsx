/**
 * @file app/places/[contentId]/not-found.tsx
 * @description 관광지 상세페이지 404 에러 페이지
 *
 * 이 페이지는 존재하지 않는 관광지 ID로 접근했을 때 표시됩니다.
 *
 * @see PRD.md 7.4 에러 처리 - 404 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

/**
 * 404 Not Found 페이지
 */
export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="mb-2 text-2xl font-semibold">관광지를 찾을 수 없습니다</h2>
        <p className="mb-8 text-muted-foreground">
          요청하신 관광지 정보가 존재하지 않거나 삭제되었습니다.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="default" className="gap-2">
            <Link href="/">
              <Home className="size-4" />
              홈으로 돌아가기
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Search className="size-4" />
              다른 관광지 찾기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

