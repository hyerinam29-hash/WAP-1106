/**
 * @file components/Navbar.tsx
 * @description 헤더 네비게이션 바 컴포넌트
 *
 * 이 컴포넌트는 헤더 네비게이션 바를 표시합니다.
 * Design.md의 헤더 디자인을 기반으로 작성되었습니다.
 *
 * 주요 기능:
 * 1. 로고 (홈 링크)
 * 2. 로그인 버튼 (Clerk 인증)
 * 3. 언어 선택 드롭다운 (한국어, 영어, 중국어, 일본어 등)
 *
 * @dependencies
 * - @clerk/nextjs: SignedOut, SignInButton, SignedIn, UserButton
 * - @/components/ui/button: Button
 * - lucide-react: Globe, ChevronDown
 *
 * @see Design.md 1. 홈페이지 - HEADER
 */

"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 지원 언어 목록
 */
const LANGUAGES = [
  { code: "ko", name: "한국어", nativeName: "한국어" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "中文", nativeName: "中文" },
  { code: "ja", name: "日本語", nativeName: "日本語" },
  { code: "es", name: "Español", nativeName: "Español" },
  { code: "fr", name: "Français", nativeName: "Français" },
  { code: "de", name: "Deutsch", nativeName: "Deutsch" },
] as const;

/**
 * 언어 타입
 */
type LanguageCode = (typeof LANGUAGES)[number]["code"];

/**
 * 헤더 네비게이션 바 컴포넌트
 */
const Navbar = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("ko");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 언어 정보
  const currentLanguage = LANGUAGES.find((lang) => lang.code === selectedLanguage) || LANGUAGES[0];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = (languageCode: LanguageCode) => {
    console.group("🌐 언어 변경");
    console.log("이전 언어:", selectedLanguage);
    console.log("새 언어:", languageCode);
    
    setSelectedLanguage(languageCode);
    setIsLanguageDropdownOpen(false);
    
    // TODO: 실제 i18n 라이브러리 연동 시 여기서 언어 변경 처리
    // 예: i18n.changeLanguage(languageCode);
    
    console.log("✅ 언어 변경 완료");
    console.groupEnd();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          My Trip
        </Link>

        {/* 우측 메뉴 (언어 선택 + 로그인) */}
        <div className="flex items-center gap-4">
          {/* 언어 선택 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="gap-2"
              aria-label="언어 선택"
              aria-expanded={isLanguageDropdownOpen}
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isLanguageDropdownOpen && "rotate-180"
                )}
              />
            </Button>

            {/* 드롭다운 메뉴 */}
            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-popover shadow-lg">
                <div className="p-1">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        selectedLanguage === language.code &&
                          "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{language.nativeName}</span>
                        {selectedLanguage === language.code && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 로그인 버튼 */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
