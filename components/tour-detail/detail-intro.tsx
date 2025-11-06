/**
 * @file components/tour-detail/detail-intro.tsx
 * @description 관광지 상세페이지 - 운영 정보 섹션
 *
 * 이 컴포넌트는 관광지의 운영 정보를 표시합니다.
 * PRD.md의 2.4.2 운영 정보 섹션 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 운영시간/개장시간
 * 2. 휴무일
 * 3. 이용요금
 * 4. 주차 가능 여부
 * 5. 수용인원
 * 6. 체험 프로그램
 * 7. 유모차/반려동물 동반 가능 여부
 * 8. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - lib/types/tour: TourIntro
 * - lucide-react: 아이콘
 *
 * @see PRD.md 2.4.2 운영 정보 섹션
 * @see Design.md 3. 상세페이지 - 운영 정보
 */

"use client";

import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  Sparkles,
  Baby,
  Dog,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 운영 정보 섹션 Props
 */
interface DetailIntroProps {
  /** 관광지 운영 정보 */
  intro: TourIntro | null;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 정보 항목 타입
 */
interface InfoItem {
  /** 아이콘 */
  icon: React.ReactNode;
  /** 라벨 */
  label: string;
  /** 값 */
  value: string | undefined;
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailIntro intro={tourIntro} />
 * ```
 */
export function DetailIntro({ intro, className }: DetailIntroProps) {
  console.group("🕒 DetailIntro 렌더링");
  console.log("운영 정보:", {
    contentId: intro?.contentid,
    hasUsetime: !!intro?.usetime,
    hasRestdate: !!intro?.restdate,
    hasUsefee: !!intro?.usefee,
    hasParking: !!intro?.parking,
    hasAccomcount: !!intro?.accomcount,
    hasExpguide: !!intro?.expguide,
    hasChkbabycarriage: !!intro?.chkbabycarriage,
    hasChkpet: !!intro?.chkpet,
  });

  // intro가 없으면 null 반환
  if (!intro) {
    console.log("⚠️ 운영 정보가 없습니다.");
    console.groupEnd();
    return null;
  }

  // 정보 항목 배열 생성 (값이 있는 것만)
  const infoItems: InfoItem[] = [
    {
      icon: <Clock className="size-5 shrink-0 text-muted-foreground" />,
      label: "운영시간",
      value: intro.usetime,
    },
    {
      icon: <CalendarX className="size-5 shrink-0 text-muted-foreground" />,
      label: "휴무일",
      value: intro.restdate,
    },
    {
      icon: <DollarSign className="size-5 shrink-0 text-muted-foreground" />,
      label: "이용요금",
      value: intro.usefee,
    },
    {
      icon: <Car className="size-5 shrink-0 text-muted-foreground" />,
      label: "주차",
      value: intro.parking,
    },
    {
      icon: <Users className="size-5 shrink-0 text-muted-foreground" />,
      label: "수용인원",
      value: intro.accomcount,
    },
    {
      icon: <Sparkles className="size-5 shrink-0 text-muted-foreground" />,
      label: "체험 프로그램",
      value: intro.expguide,
    },
    {
      icon: <Baby className="size-5 shrink-0 text-muted-foreground" />,
      label: "유모차 동반",
      value: intro.chkbabycarriage,
    },
    {
      icon: <Dog className="size-5 shrink-0 text-muted-foreground" />,
      label: "반려동물 동반",
      value: intro.chkpet,
    },
  ].filter((item) => item.value && item.value.trim() !== ""); // 값이 있는 항목만 필터링

  // 정보가 하나도 없으면 null 반환
  if (infoItems.length === 0) {
    console.log("⚠️ 표시할 운영 정보가 없습니다.");
    console.groupEnd();
    return null;
  }

  console.log(`✅ ${infoItems.length}개의 운영 정보 항목 표시`);
  console.groupEnd();

  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <h2 className="mb-6 text-xl font-semibold">운영 정보</h2>
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">{item.icon}</div>
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

