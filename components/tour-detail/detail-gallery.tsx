/**
 * @file components/tour-detail/detail-gallery.tsx
 * @description 관광지 상세페이지 - 이미지 갤러리 섹션
 *
 * 이 컴포넌트는 관광지의 이미지 갤러리를 표시합니다.
 * PRD.md의 2.4.3 이미지 갤러리 요구사항을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 이미지 슬라이더/캐러셀
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 좌우 네비게이션
 * 4. 썸네일 표시
 * 5. 이미지 없을 때 기본 이미지
 *
 * @dependencies
 * - lib/types/tour: TourImage
 * - components/ui/dialog: Dialog
 * - next/image: Image
 * - lucide-react: 아이콘
 *
 * @see PRD.md 2.4.3 이미지 갤러리
 * @see Design.md 3. 상세페이지 - 이미지 갤러리
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TourImage } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 이미지 갤러리 섹션 Props
 */
interface DetailGalleryProps {
  /** 관광지 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (이미지 alt 텍스트용) */
  title?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 이미지 갤러리 섹션 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailGallery images={tourImages} title={tourTitle} />
 * ```
 */
export function DetailGallery({
  images,
  title = "관광지",
  className,
}: DetailGalleryProps) {
  console.group("🖼️ DetailGallery 렌더링");
  console.log("이미지 개수:", images.length);

  // 상태 관리 (hooks는 항상 최상단에 위치)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 이미지가 없으면 null 반환
  if (!images || images.length === 0) {
    console.log("⚠️ 이미지가 없습니다.");
    console.groupEnd();
    return null;
  }

  // 이미지 URL이 있는 이미지만 필터링 및 정리
  const validImages = images
    .map((img, idx) => ({
      ...img,
      originalIndex: idx,
      mainUrl: img.originimgurl || img.smallimageurl || null,
      thumbnailUrl: img.smallimageurl || img.originimgurl || null,
    }))
    .filter((img) => img.mainUrl && img.thumbnailUrl);

  // 유효한 이미지가 없으면 null 반환
  if (validImages.length === 0) {
    console.log("⚠️ 유효한 이미지가 없습니다.");
    console.groupEnd();
    return null;
  }

  console.log(`✅ ${validImages.length}개의 유효한 이미지 표시`);
  console.groupEnd();

  /**
   * 다음 이미지로 이동
   */
  const handleNext = () => {
    const next = (currentIndex + 1) % validImages.length;
    console.log("➡️ 다음 이미지로 이동:", {
      from: currentIndex,
      to: next,
      total: validImages.length,
    });
    setCurrentIndex(next);
  };

  /**
   * 이전 이미지로 이동
   */
  const handlePrev = () => {
    const next = (currentIndex - 1 + validImages.length) % validImages.length;
    console.log("⬅️ 이전 이미지로 이동:", {
      from: currentIndex,
      to: next,
      total: validImages.length,
    });
    setCurrentIndex(next);
  };

  /**
   * 썸네일 클릭 핸들러
   */
  const handleThumbnailClick = (index: number) => {
    console.log("🖼️ 썸네일 클릭:", {
      from: currentIndex,
      to: index,
      imageUrl: validImages[index]?.mainUrl,
    });
    setCurrentIndex(index);
    // 이미지 에러 상태 초기화
    setImageErrors(new Set());
  };

  /**
   * 이미지 클릭 핸들러 (모달 열기)
   */
  const handleImageClick = (index: number) => {
    console.log("🖼️ 메인 이미지 클릭 (모달 열기):", {
      index,
      imageUrl: validImages[index]?.mainUrl,
    });
    setModalIndex(index);
    setIsModalOpen(true);
  };

  /**
   * 모달에서 다음 이미지로 이동
   */
  const handleModalNext = () => {
    const next = (modalIndex + 1) % validImages.length;
    console.log("➡️ 모달에서 다음 이미지로 이동:", {
      from: modalIndex,
      to: next,
      total: validImages.length,
    });
    setModalIndex(next);
  };

  /**
   * 모달에서 이전 이미지로 이동
   */
  const handleModalPrev = () => {
    const next = (modalIndex - 1 + validImages.length) % validImages.length;
    console.log("⬅️ 모달에서 이전 이미지로 이동:", {
      from: modalIndex,
      to: next,
      total: validImages.length,
    });
    setModalIndex(next);
  };

  /**
   * 이미지 로드 에러 핸들러
   */
  const handleImageError = (index: number, type: "main" | "thumbnail") => {
    console.error(`❌ 이미지 로드 실패 (${type}):`, index);
    setImageErrors((prev) => new Set(prev).add(index));
  };

  /**
   * 키보드 네비게이션 (모달 열려있을 때)
   */
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleModalPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleModalNext();
      } else if (e.key === "Escape") {
        console.log("🔙 ESC 키로 모달 닫기");
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalIndex, validImages.length, handleModalNext, handleModalPrev]);

  // 현재 이미지
  const currentImage = validImages[currentIndex];
  const hasError = imageErrors.has(currentIndex);

  /**
   * currentIndex 변경 추적
   */
  useEffect(() => {
    if (validImages.length > 0 && currentImage) {
      console.log("🔄 메인 이미지 변경:", {
        index: currentIndex,
        imageUrl: currentImage.mainUrl,
        imageName: currentImage.imgname,
      });
    }
  }, [currentIndex, validImages, currentImage]);

  /**
   * modalIndex 변경 추적
   */
  useEffect(() => {
    if (isModalOpen && validImages.length > 0 && validImages[modalIndex]) {
      console.log("🔄 모달 이미지 변경:", {
        index: modalIndex,
        imageUrl: validImages[modalIndex].mainUrl,
        imageName: validImages[modalIndex].imgname,
      });
    }
  }, [modalIndex, isModalOpen, validImages]);

  return (
    <>
      <div className={cn("rounded-lg border bg-card p-6", className)}>
        <h2 className="mb-6 text-xl font-semibold">이미지 갤러리</h2>

        {/* 메인 이미지 슬라이더 */}
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {currentImage && !hasError && currentImage.mainUrl ? (
            <>
              <Image
                key={`main-${currentIndex}-${currentImage.mainUrl}`}
                src={currentImage.mainUrl}
                alt={currentImage.imgname || `${title} 이미지 ${currentIndex + 1}`}
                fill
                className="cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                onClick={() => handleImageClick(currentIndex)}
                priority={currentIndex === 0}
                onError={() => handleImageError(currentIndex, "main")}
                unoptimized={currentImage.mainUrl?.includes("data.go.kr")}
              />

              {/* 좌우 네비게이션 버튼 */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft className="size-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="다음 이미지"
                  >
                    <ChevronRight className="size-6" />
                  </Button>
                </>
              )}

              {/* 이미지 인덱스 표시 */}
              {validImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  {currentIndex + 1} / {validImages.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <div className="text-center">
                <Camera className="mx-auto mb-2 size-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">이미지를 불러올 수 없습니다</p>
              </div>
            </div>
          )}
        </div>

        {/* 썸네일 그리드 */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {validImages.map((image, index) => {
              const isError = imageErrors.has(index);
              const isActive = currentIndex === index;

              return (
                <button
                  key={`thumb-${index}-${image.thumbnailUrl}`}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                    isActive
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent hover:border-muted-foreground/50",
                    isError && "opacity-50"
                  )}
                  aria-label={`이미지 ${index + 1} 선택`}
                  disabled={isError}
                >
                  {!isError && image.thumbnailUrl ? (
                    <Image
                      key={`thumb-img-${index}-${image.thumbnailUrl}`}
                      src={image.thumbnailUrl}
                      alt={image.imgname || `${title} 썸네일 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 16.67vw, 12.5vw"
                      onError={() => handleImageError(index, "thumbnail")}
                      unoptimized={image.thumbnailUrl?.includes("data.go.kr")}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <Camera className="size-6 text-muted-foreground/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black border-none [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>이미지 갤러리</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {validImages[modalIndex] && validImages[modalIndex].mainUrl ? (
              <>
                <Image
                  key={`modal-${modalIndex}-${validImages[modalIndex].mainUrl}`}
                  src={validImages[modalIndex].mainUrl}
                  alt={
                    validImages[modalIndex].imgname ||
                    `${title} 이미지 ${modalIndex + 1}`
                  }
                  fill
                  className="object-contain"
                  sizes="95vw"
                  priority
                  onError={() => {
                    console.error("❌ 모달 이미지 로드 실패:", modalIndex);
                  }}
                  unoptimized={validImages[modalIndex].mainUrl?.includes("data.go.kr")}
                />

                {/* 닫기 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="닫기"
                >
                  <X className="size-6" />
                </Button>

                {/* 좌우 네비게이션 버튼 */}
                {validImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                      onClick={handleModalPrev}
                      aria-label="이전 이미지"
                    >
                      <ChevronLeft className="size-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                      onClick={handleModalNext}
                      aria-label="다음 이미지"
                    >
                      <ChevronRight className="size-8" />
                    </Button>

                    {/* 이미지 인덱스 표시 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-4 py-2 text-white">
                      {modalIndex + 1} / {validImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center text-white">
                <Camera className="mx-auto mb-2 size-16 text-white/50" />
                <p className="text-sm">이미지를 불러올 수 없습니다</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
