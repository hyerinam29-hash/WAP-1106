/**
 * @file components/tour-detail/detail-pet.tsx
 * @description 관광지 상세페이지 - 반려동물 정보 섹션
 *
 * 이 컴포넌트는 관광지의 반려동물 동반 여행 정보를 표시합니다.
 * TODO.md의 3.7 반려동물 정보 섹션 (MVP 2.5) 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. detailPetTour2 API 연동
 * 2. 반려동물 동반 가능 여부 표시
 * 3. 반려동물 크기 제한 정보 표시 (소형/중형/대형)
 * 4. 반려동물 입장 가능 장소 표시 (실내/실외)
 * 5. 반려동물 동반 추가 요금 표시
 * 6. 반려동물 전용 시설 정보 표시
 * 7. 주차장 정보 (반려동물 하차 공간)
 *
 * @dependencies
 * - lib/types/tour: PetTourInfo
 * - lucide-react: 아이콘
 *
 * @see TODO.md 3.7 반려동물 정보 섹션 (MVP 2.5)
 * @see PRD.md 2.4.6 반려동물 정보 섹션
 * @see PRD.md 2.5 반려동물 동반 여행
 */

"use client";

import {
  Dog,
  Info,
  DollarSign,
  Car,
  TreePine,
  Trash2,
  Droplet,
  Home,
  AlertCircle,
} from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 반려동물 정보 섹션 Props
 */
interface DetailPetProps {
  /** 반려동물 동반 여행 정보 */
  petInfo: PetTourInfo | null;
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
  /** 중요 정보 여부 (강조 표시) */
  important?: boolean;
}

/**
 * 관광지 반려동물 정보 섹션 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailPet petInfo={petTourInfo} />
 * ```
 */
export function DetailPet({ petInfo, className }: DetailPetProps) {
  console.group("🐾 DetailPet 렌더링");
  console.log("반려동물 정보:", {
    contentId: petInfo?.contentid,
    hasPetTursmInfo: !!petInfo?.petTursmInfo,
    hasChkpetleash: !!petInfo?.chkpetleash,
    hasChkpetsize: !!petInfo?.chkpetsize,
    hasChkpetplace: !!petInfo?.chkpetplace,
    hasChkpetfee: !!petInfo?.chkpetfee,
    hasPetinfo: !!petInfo?.petinfo,
    hasParking: !!petInfo?.parking,
    hasAcmpyNeedMtr: !!petInfo?.acmpyNeedMtr,
    hasRelaFrnshPrdlst: !!petInfo?.relaFrnshPrdlst,
  });

  // petInfo가 없으면 null 반환
  if (!petInfo) {
    console.log("⚠️ 반려동물 정보가 없습니다.");
    console.groupEnd();
    return null;
  }

  // HTML 태그 제거 함수
  const cleanText = (text: string): string => {
    return text
      .replace(/<br\s*\/?>/gi, "\n") // <br> 태그를 줄바꿈으로 변환
      .replace(/<[^>]*>/g, "") // 나머지 HTML 태그 제거
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  // 정보 항목 배열 생성 (값이 있는 것만)
  const infoItems: InfoItem[] = [
    // 기본 반려동물 정보 (간단한 버전)
    {
      icon: <Dog className="size-5 shrink-0 text-primary" />,
      label: "반려동물 동반 가능 여부",
      value: petInfo.chkpetleash ? cleanText(petInfo.chkpetleash) : undefined,
      important: true,
    },
    {
      icon: <Info className="size-5 shrink-0 text-muted-foreground" />,
      label: "반려동물 크기 제한",
      value: petInfo.chkpetsize ? cleanText(petInfo.chkpetsize) : undefined,
    },
    {
      icon: <Home className="size-5 shrink-0 text-muted-foreground" />,
      label: "입장 가능 장소 (실내/실외)",
      value: petInfo.chkpetplace ? cleanText(petInfo.chkpetplace) : undefined,
    },
    {
      icon: <DollarSign className="size-5 shrink-0 text-muted-foreground" />,
      label: "반려동물 동반 추가 요금",
      value: petInfo.chkpetfee ? cleanText(petInfo.chkpetfee) : undefined,
    },
    {
      icon: <Car className="size-5 shrink-0 text-muted-foreground" />,
      label: "주차장 정보 (반려동물 하차 공간)",
      value: petInfo.parking ? cleanText(petInfo.parking) : undefined,
    },

    // 상세 반려동물 정보 (detailPetTour2 API 응답)
    {
      icon: <Info className="size-5 shrink-0 text-primary" />,
      label: "반려동물 동반 관광지 정보",
      value: petInfo.petTursmInfo ? cleanText(petInfo.petTursmInfo) : undefined,
      important: true,
    },
    {
      icon: <AlertCircle className="size-5 shrink-0 text-muted-foreground" />,
      label: "동반 필요 사항",
      value: petInfo.acmpyNeedMtr
        ? cleanText(petInfo.acmpyNeedMtr)
        : petInfo.acmpyNeedMtrEtc
          ? cleanText(petInfo.acmpyNeedMtrEtc)
          : undefined,
    },
    {
      icon: <TreePine className="size-5 shrink-0 text-muted-foreground" />,
      label: "반려동물 전용 시설",
      value: petInfo.relaFrnshPrdlst
        ? cleanText(petInfo.relaFrnshPrdlst)
        : petInfo.relaFrnshPrdlstEtc
          ? cleanText(petInfo.relaFrnshPrdlstEtc)
          : undefined,
    },
    {
      icon: <Info className="size-5 shrink-0 text-muted-foreground" />,
      label: "기타 반려동물 정보",
      value: petInfo.petinfo ? cleanText(petInfo.petinfo) : undefined,
    },
    {
      icon: <Home className="size-5 shrink-0 text-muted-foreground" />,
      label: "관련 숙박시설",
      value: petInfo.relaAcmdtnNm
        ? cleanText(petInfo.relaAcmdtnNm)
        : petInfo.relaAcmdtnNmEtc
          ? cleanText(petInfo.relaAcmdtnNmEtc)
          : undefined,
    },
  ].filter((item) => item.value && item.value.trim() !== ""); // 값이 있는 항목만 필터링

  // 정보가 하나도 없으면 null 반환
  if (infoItems.length === 0) {
    console.log("⚠️ 표시할 반려동물 정보가 없습니다.");
    console.groupEnd();
    return null;
  }

  console.log(`✅ ${infoItems.length}개의 반려동물 정보 항목 표시`);
  console.groupEnd();

  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      {/* 섹션 제목 */}
      <div className="mb-6 flex items-center gap-2">
        <Dog className="size-6 text-primary" />
        <h2 className="text-xl font-semibold">반려동물 동반 정보</h2>
      </div>

      {/* 정보 항목 목록 */}
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 transition-colors",
              item.important && "bg-primary/5 border border-primary/20"
            )}
          >
            <div className="mt-0.5">{item.icon}</div>
            <div className="flex-1 space-y-1">
              <p
                className={cn(
                  "font-medium",
                  item.important && "text-primary"
                )}
              >
                {item.label}
              </p>
              <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 rounded-lg bg-muted/50 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            반려동물 동반 시 해당 관광지의 규정을 반드시 확인하시고, 다른 방문객들을 위해 예절을 지켜주세요.
            <br />
            정보는 관광지 사정에 따라 변경될 수 있으니 방문 전 전화로 확인하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}

