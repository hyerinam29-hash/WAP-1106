# My Trip 프로젝트 TODO

한국 관광지 정보 서비스 개발 작업 목록

## 📊 진행 상황 요약

### ✅ 완료된 Phase

**Phase 1: 기본 구조 & 공통 설정** - **100% 완료** ✅

모든 기본 설정과 공통 기능이 완료되었습니다. 좌표 변환 유틸리티와 디버깅 로그가 추가로 개선되었습니다.

#### 생성된 주요 파일들

**타입 정의:**
- `lib/types/tour.ts` - 한국관광공사 API 타입 정의 (TourItem, TourDetail, TourIntro, TourImage, AreaCode, ContentType, PetTourInfo)

**API 클라이언트:**
- `lib/api/tour-api.ts` - 한국관광공사 API 클라이언트 (6개 API 함수 구현, 반려동물 API 추가 예정)

**공통 컴포넌트:**
- `components/ui/loading.tsx` - 로딩 스피너
- `components/ui/skeleton-card.tsx` - 스켈레톤 UI (Skeleton, SkeletonCard, SkeletonList)
- `components/ui/error-message.tsx` - 에러 메시지 (ErrorMessage, NetworkError, ApiError)
- `components/ui/empty-state.tsx` - 빈 상태 메시지 (EmptyState, NoSearchResults, NoFilterResults)
- `components/Navbar.tsx` - 헤더 네비게이션 바 (로고, 로그인 버튼, 언어 선택)

**유틸리티:**
- `lib/utils/env-check.ts` - 환경 변수 확인 유틸리티
- `app/env-check/page.tsx` - 환경 변수 설정 상태 확인 페이지
- `lib/utils/coordinates.ts` - 좌표 변환 유틸리티 (KATEC → WGS84, 한국 좌표 범위 검증)
- `lib/utils/region-coordinates.ts` - 지역별 중심 좌표 설정

**환경 설정:**
- ✅ Next.js 15.5.6 + React 19 + TypeScript
- ✅ Tailwind CSS v4 + shadcn/ui
- ✅ Clerk 인증 + Supabase 연동
- ✅ GitHub + Vercel 배포 설정
- ✅ 한국관광공사 API 키 설정
- ✅ 네이버 지도 API 키 설정

### 🚧 진행 중인 Phase

- Phase 2: 홈페이지 (`/`) - 관광지 목록 (대기 중)
- Phase 3: 상세페이지 (`/places/[contentId]`) - 일부 완료

### 📋 다음 단계

Phase 2 구현을 시작할 준비가 되었습니다:
1. 홈페이지 기본 구조 (`app/page.tsx`)
2. 관광지 카드 컴포넌트 (`components/tour-card.tsx`) - 반려동물 뱃지 추가 예정
3. 관광지 목록 컴포넌트 (`components/tour-list.tsx`)
4. 필터 컴포넌트 (`components/tour-filters.tsx`) - 반려동물 필터 추가 예정
5. 검색 기능 (`components/tour-search.tsx`)
6. 네이버 지도 연동 (`components/naver-map.tsx`)

Phase 3 추가 작업:
7. 반려동물 정보 섹션 (`components/tour-detail/detail-pet.tsx`)

---

## Phase 1: 기본 구조 & 공통 설정 ✅ **완료**

**완료 날짜:** 2025년 1월  
**완료율:** 100% (41/41 항목)

이 Phase에서는 프로젝트의 기본 구조와 공통 기능을 모두 구현했습니다. 좌표 변환 유틸리티가 개선되어 다양한 좌표 스케일을 자동으로 감지하고 변환할 수 있습니다.

### 1.1 프로젝트 환경 설정
- [x] Next.js 15.5.6 프로젝트 셋업
- [x] TypeScript 설정
- [x] Tailwind CSS v4 설정
- [x] shadcn/ui 컴포넌트 설치
- [x] Clerk 인증 연동
- [x] Supabase 연결
- [x] GitHub 저장소 연결
- [x] Vercel 배포 설정

### 1.2 환경 변수 설정
- [x] 한국관광공사 API 키 발급
  - [ ] `NEXT_PUBLIC_TOUR_API_KEY` 설정
  - [x] `TOUR_API_KEY` 설정 (백업)
- [x] 네이버 지도 API 키 발급
  - [x] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정
  - [x] 네이버 클라우드 플랫폼에서 Maps API 서비스 활성화
- [x] Clerk 환경 변수 설정
- [x] Supabase 환경 변수 설정
- [x] 환경 변수 확인 기능 구현
  - [x] `lib/utils/env-check.ts` 생성 (환경 변수 확인 유틸리티)
  - [x] `app/env-check/page.tsx` 생성 (환경 변수 설정 상태 확인 페이지)
  - [x] `/env-check` 페이지에서 환경 변수 설정 상태 확인 후 API 키 발급 완료 체크

### 1.3 기본 타입 정의
- [x] `lib/types/tour.ts` 생성
  - [x] `TourItem` 인터페이스 (관광지 목록)
  - [x] `TourDetail` 인터페이스 (상세 정보)
  - [x] `TourIntro` 인터페이스 (운영 정보)
  - [x] `TourImage` 인터페이스 (이미지)
  - [x] `AreaCode` 인터페이스 (지역 코드)
  - [x] `ContentType` 타입 (관광 타입)
  - [x] `PetTourInfo` 인터페이스 (반려동물 동반 정보)

### 1.4 API 클라이언트 구현
- [x] `lib/api/tour-api.ts` 생성
  - [x] Base URL 설정
  - [x] 공통 파라미터 헬퍼
  - [x] `getAreaCodes()` - 지역코드 조회
  - [x] `getAreaBasedList()` - 지역 기반 관광지 조회
  - [x] `searchKeyword()` - 키워드 검색
  - [x] `getDetailCommon()` - 공통 정보 조회
  - [x] `getDetailIntro()` - 소개 정보 조회
  - [x] `getDetailImage()` - 이미지 조회
  - [x] `getDetailPetTour()` - 반려동물 동반 정보 조회
  - [x] 에러 핸들링 추가

### 1.5 공통 컴포넌트
- [x] `components/ui/loading.tsx` - 로딩 스피너
- [x] `components/ui/skeleton-card.tsx` - 스켈레톤 UI
- [x] `components/ui/error-message.tsx` - 에러 메시지
- [x] `components/ui/empty-state.tsx` - 빈 상태 메시지
- [x] `components/Navbar.tsx` - 헤더 네비게이션 바
  - [x] 로고 (홈 링크)
  - [x] 로그인 버튼 (Clerk 인증 연동)
  - [x] 언어 선택 드롭다운 (7개 언어 지원: 한국어, 영어, 중국어, 일본어, 스페인어, 프랑스어, 독일어)
  - [x] Sticky 헤더 (스크롤 시 상단 고정)
  - [x] 반응형 디자인 (모바일/태블릿/데스크톱)

### 1.6 유틸리티 함수
- [x] `lib/utils/coordinates.ts` - 좌표 변환 유틸리티
  - [x] `toWgs84FromKTO()` - 한국관광공사 좌표를 WGS84로 변환
  - [x] 한국 좌표 범위 상수 정의 (KOREA_LAT_MIN/MAX, KOREA_LNG_MIN/MAX)
  - [x] 다양한 좌표 스케일 자동 감지 및 변환 로직
  - [x] 한국 좌표 범위 검증 로직
  - [x] 상세한 디버깅 로그 (console.group 사용)
- [x] `lib/utils/region-coordinates.ts` - 지역별 중심 좌표 설정

---

## Phase 2: 홈페이지 (`/`) - 관광지 목록 🚧 **진행 중**

**시작 예정:** Phase 1 완료 후  
**완료율:** 약 60% (31/51 항목)

Phase 1의 기반 위에 홈페이지 기능을 구현합니다.

### 2.1 페이지 기본 구조
- [x] `app/page.tsx` 생성
  - [x] 기본 레이아웃 구조
  - [x] 헤더 영역 (검색창)
  - [x] 필터 영역 (사이드바)
  - [x] 메인 영역 (목록 + 지도)
  - [x] 반응형 레이아웃 (모바일/태블릿/데스크톱)

### 2.2 관광지 카드 컴포넌트
- [x] `components/tour-card.tsx` 생성
  - [x] 썸네일 이미지 (placeholder 지원)
  - [x] 관광지명
  - [x] 주소
  - [x] 관광 타입 뱃지
  - [x] 간단한 개요 (상세페이지에서만 표시)
  - [ ] 반려동물 동반 가능 뱃지 표시 (🐾 아이콘, 카드 썸네일에 표시)
  - [ ] 크기별 뱃지 표시 (예: "소형견 OK", "대형견 가능" 등)
  - [x] 클릭 시 상세페이지 이동
  - [x] 호버 효과

### 2.3 관광지 목록 컴포넌트
- [x] `components/tour-list.tsx` 생성
  - [x] 그리드 레이아웃 (반응형)
  - [x] 카드 목록 렌더링
  - [x] 로딩 상태 (Skeleton UI)
  - [x] 빈 상태 처리
  - [x] 에러 상태 처리

### 2.4 필터 컴포넌트 (MVP 2.1)
- [x] `components/tour-filters.tsx` 생성
  - [x] 지역 선택 (시/도 단위)
  - [x] 관광 타입 선택 (12, 14, 15, 25, 28, 32, 38, 39)
  - [x] "전체" 옵션
  - [x] 필터 초기화 버튼
  - [x] 선택된 필터 표시
  - [x] API 연동 및 필터링 로직
  - [x] 반려동물 필터 추가 (MVP 2.5)
    - [x] "반려동물 동반 가능" 토글 추가 (필터 영역)
    - [x] 반려동물 크기별 필터 (소형, 중형, 대형)
    - [x] 반려동물 종류별 필터 (개, 고양이 등)
    - [x] 실내/실외 동반 가능 여부 필터
    - [x] 반응형 디자인: 모바일에서도 필터 가독성 확보

### 2.5 검색 기능 (MVP 2.3)
- [x] `components/tour-search.tsx` 생성
  - [x] 검색창 UI (헤더 고정)
  - [x] 검색 아이콘
  - [x] 검색 실행 (엔터/버튼)
  - [x] 검색 API 연동 (`searchKeyword2`)
  - [x] 검색 중 로딩 표시
  - [x] 검색 결과 개수 표시
  - [x] 검색 + 필터 조합

### 2.6 정렬 & 페이지네이션
- [x] 정렬 옵션 추가
  - [x] 최신순 (modifiedtime)
  - [x] 이름순 (가나다순)
- [x] 페이지네이션 구현
  - [x] 페이지 번호 선택 방식 구현
  - [ ] 무한 스크롤 (선택 사항, 향후 구현 가능)
- [x] 페이지당 항목 수 설정 (20개)

### 2.7 네이버 지도 연동 (MVP 2.2)
- [x] `components/naver-map.tsx` 생성
  - [x] 네이버 지도 API 스크립트 로드 (ncpKeyId 파라미터 사용)
  - [x] 기본 지도 표시
  - [x] 지역별 중심 좌표 설정 (`lib/utils/region-coordinates.ts` 생성)
  - [x] 줌 레벨 자동 조정
  - [x] 좌표 변환 (KATEC → WGS84, `lib/utils/coordinates.ts` 사용)
- [ ] 마커 기능
  - [x] 관광지 마커 표시
  - [x] 마커 클릭 시 인포윈도우
  - [x] 관광지명, 설명, "상세보기" 버튼
  - [x] 관광 타입별 마커 색상 (선택 사항)
- [x] 지도-리스트 연동
  - [x] 리스트 항목 클릭 → 지도 이동
  - [x] 리스트 항목 호버 → 마커 강조 (선택 사항)
- [x] 지도 컨트롤
  - [x] 줌 인/아웃
  - [x] 지도 유형 선택 (일반/위성)
  - [x] 현재 위치로 이동 (선택 사항)
- [x] 반응형 레이아웃
  - [x] 데스크톱: 리스트(좌) + 지도(우) 분할
  - [x] 모바일: 탭 형태 전환

---

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조
- [x] `app/places/[contentId]/page.tsx` 생성
  - [x] Dynamic Route 설정
  - [x] 뒤로가기 버튼
  - [x] 로딩 상태 (loading.tsx)
  - [x] 에러 처리 (404, not-found.tsx)
  - [x] 섹션별 구분

### 3.2 기본 정보 섹션 (MVP 2.4.1)
- [x] `components/tour-detail/detail-info.tsx` 생성
  - [x] `detailCommon2` API 연동
  - [x] 관광지명 (h1)
  - [x] 대표 이미지 (큰 사이즈)
  - [x] 주소 (복사 버튼)
  - [x] 전화번호 (클릭 시 전화 연결)
  - [x] 홈페이지 링크
  - [x] 개요 (긴 설명)
  - [x] 관광 타입 및 카테고리

### 3.3 운영 정보 섹션 (MVP 2.4.2)
- [x] `components/tour-detail/detail-intro.tsx` 생성
  - [x] `detailIntro2` API 연동
  - [x] 운영시간/개장시간
  - [x] 휴무일
  - [x] 이용요금
  - [x] 주차 가능 여부
  - [x] 수용인원
  - [x] 체험 프로그램
  - [x] 유모차/반려동물 동반 가능 여부
  - [x] 정보 없는 항목 숨김 처리

### 3.4 이미지 갤러리 (MVP 2.4.3)
- [x] `components/tour-detail/detail-gallery.tsx` 생성
  - [x] `detailImage2` API 연동
  - [x] 이미지 슬라이더/캐러셀
  - [x] 이미지 클릭 시 전체화면 모달
  - [x] 좌우 네비게이션
  - [x] 썸네일 표시
  - [x] 이미지 없을 때 기본 이미지

### 3.5 지도 섹션 (MVP 2.4.4)
- [x] `components/tour-detail/detail-map.tsx` 생성
  - [x] 네이버 지도 표시
  - [x] 해당 관광지 마커 1개
  - [x] "길찾기" 버튼
    - [x] 네이버 지도 연동 (새 탭으로 길찾기)
    - [x] 좌표 전달 (`https://map.naver.com/v5/directions/-/-/-/-/walk?c=${lng},${lat},15,0,0,0,dh`)
  - [x] 좌표 정보 표시 (선택 사항)
  - [x] 좌표 변환 로직 개선
    - [x] `lib/utils/coordinates.ts` - 한국 좌표 범위 상수 추가
    - [x] 다양한 좌표 스케일 자동 감지 및 변환
    - [x] 한국 좌표 범위 검증 로직 강화
  - [x] 디버깅 로그 추가
    - [x] 원본 좌표 값 상세 로깅
    - [x] 변환 결과 상세 로깅
    - [x] 한국 좌표 범위 검증 로깅
    - [x] 에러 케이스별 상세 로깅

### 3.6 공유하기 기능 (MVP 2.4.5)
- [x] `components/tour-detail/share-button.tsx` 생성
  - [x] URL 복사 버튼
  - [x] 클립보드 API 사용
  - [x] 복사 완료 토스트 메시지
  - [x] 공유 아이콘
- [x] Open Graph 메타태그
  - [x] Next.js Metadata API 사용
  - [x] `og:title` - 관광지명
  - [x] `og:description` - 관광지 설명
  - [x] `og:image` - 대표 이미지
  - [x] `og:url` - 상세페이지 URL
  - [x] `og:type` - website

### 3.7 반려동물 정보 섹션 (MVP 2.5)
- [x] `components/tour-detail/detail-pet.tsx` 생성
  - [x] `detailPetTour2` API 연동
  - [x] 반려동물 동반 가능 여부 표시
  - [x] 반려동물 크기 제한 정보 표시 (소형/중형/대형)
  - [x] 반려동물 입장 가능 장소 표시 (실내/실외)
  - [x] 반려동물 동반 추가 요금 표시
  - [x] 반려동물 전용 시설 정보 표시
  - [x] 주차장 정보 (반려동물 하차 공간)
  - [x] 산책로 정보 (API 응답에 포함 시 표시)
  - [x] 반려동물 배변 봉투 제공 여부 (API 응답에 포함 시 표시)
  - [x] 반려동물 음수대 위치 (API 응답에 포함 시 표시)
  - [ ] 근처 동물병원 정보 (선택 사항, 향후 구현)
  - [x] 반려동물 아이콘 및 뱃지 스타일링 (🐾)
  - [x] 정보 없는 항목 숨김 처리
  - [x] 상세페이지에 섹션 추가 (완료)
  - [x] 아이콘 기반 정보 표시 (직관적)
  - [x] 주의사항 강조 표시
  - [x] 반응형 디자인: 모바일에서도 정보 가독성 확보, 아이콘과 텍스트 조합으로 공간 절약

---

## Phase 4: 북마크 기능 (선택 사항)

### 4.1 데이터베이스 설정
- [x] `users` 테이블 생성 (완료)
- [x] `bookmarks` 테이블 생성
  - [x] `id` (UUID, Primary Key)
  - [x] `user_id` (UUID, Foreign Key → users.id)
  - [x] `content_id` (TEXT, 한국관광공사 contentid)
  - [x] `created_at` (TIMESTAMP)
  - [x] UNIQUE 제약 (user_id, content_id)
- [x] RLS 정책 설정
  - [x] 개발 환경: RLS 비활성화
  - [ ] 프로덕션: 사용자별 접근 제한 (향후 구현)
- [x] 인덱스 생성
  - [x] `idx_bookmarks_user_id`
  - [x] `idx_bookmarks_content_id`
  - [x] `idx_bookmarks_created_at` (정렬 성능 향상)

### 4.2 Supabase API 함수
- [x] `lib/api/supabase-api.ts` 생성
  - [x] `addBookmark(userId, contentId)` - 북마크 추가
  - [x] `removeBookmark(userId, contentId)` - 북마크 제거
  - [x] `getBookmarks(userId)` - 북마크 목록 조회
  - [x] `isBookmarked(userId, contentId)` - 북마크 여부 확인
  - [x] 에러 핸들링

### 4.3 북마크 버튼 컴포넌트
- [ ] `components/bookmarks/bookmark-button.tsx` 생성
  - [ ] 별 아이콘 (채워짐/비어있음)
  - [ ] 클릭 시 북마크 추가/제거
  - [ ] 로딩 상태 표시
  - [ ] 인증 확인
  - [ ] 로그인하지 않은 경우
    - [ ] 로그인 유도 또는
    - [ ] localStorage 임시 저장
  - [ ] 상세페이지에 버튼 추가

### 4.4 북마크 목록 페이지
- [ ] `app/bookmarks/page.tsx` 생성
  - [ ] 페이지 레이아웃
  - [ ] 인증 체크
  - [ ] 로그인 안 된 경우 리다이렉트
- [ ] `components/bookmarks/bookmark-list.tsx` 생성
  - [ ] 북마크한 관광지 목록 표시
  - [ ] 카드 레이아웃 (tour-card 재사용)
  - [ ] 빈 상태 처리
  - [ ] 정렬 옵션
    - [ ] 최신순
    - [ ] 이름순
    - [ ] 지역별
  - [ ] 일괄 삭제 기능
  - [ ] 개별 삭제 버튼

---

## Phase 5: 최적화 & 배포

### 5.1 이미지 최적화
- [ ] `next.config.ts` 외부 도메인 설정
  - [ ] 한국관광공사 이미지 도메인
  - [ ] topis.kr
- [ ] Next.js Image 컴포넌트 사용
- [ ] 레이지 로딩 적용
- [ ] Placeholder 이미지 설정

### 5.2 성능 최적화
- [ ] API 응답 캐싱 전략
  - [ ] React Query 사용
  - [ ] staleTime, cacheTime 설정
- [ ] 코드 스플리팅
  - [ ] Dynamic Import
  - [ ] 페이지별 청크 분리
- [ ] 번들 크기 최적화
  - [ ] 불필요한 라이브러리 제거
  - [ ] Tree shaking 확인

### 5.3 에러 처리
- [ ] 전역 에러 바운더리
  - [ ] `app/error.tsx` 생성
  - [ ] 에러 로깅
  - [ ] 재시도 버튼
- [ ] API 에러 처리
  - [ ] 네트워크 에러
  - [ ] 타임아웃
  - [ ] Rate Limit
- [ ] 404 페이지
  - [ ] `app/not-found.tsx` 생성
  - [ ] 홈으로 돌아가기 버튼

### 5.4 SEO 최적화
- [ ] 메타태그 설정
  - [ ] `app/layout.tsx` - 기본 메타태그
  - [ ] 상세페이지 - 동적 메타태그
- [ ] `app/robots.ts` 생성
- [ ] `app/sitemap.ts` 생성
- [ ] `app/manifest.ts` 생성 (PWA)
- [ ] Open Graph 이미지 최적화

### 5.5 접근성 (A11y)
- [ ] ARIA 라벨 추가
- [ ] 키보드 네비게이션 지원
- [ ] 포커스 관리
- [ ] 스크린 리더 테스트

### 5.6 테스트
- [ ] 단위 테스트 (선택 사항)
- [ ] E2E 테스트 (Playwright)
  - [ ] 홈페이지 필터링
  - [ ] 검색 기능
  - [ ] 상세페이지 이동
  - [ ] 북마크 기능
- [ ] Lighthouse 점수 확인
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

### 5.7 배포
- [x] Vercel 프로젝트 연결
- [ ] Vercel 환경 변수 설정
  - [ ] 한국관광공사 API 키
  - [ ] 네이버 지도 API 키
  - [ ] Clerk 키
  - [ ] Supabase 키
- [ ] 프로덕션 배포
- [ ] 배포 후 테스트
  - [ ] 모든 기능 동작 확인
  - [ ] API 호출 확인
  - [ ] 지도 로딩 확인
  - [ ] 이미지 로딩 확인
- [ ] 모니터링 설정
  - [ ] Vercel Analytics
  - [ ] 에러 로깅

---

## 추가 기능 (향후 구현)

### 리뷰 & 평점
- [ ] 리뷰 테이블 생성
- [ ] 리뷰 작성 컴포넌트
- [ ] 별점 시스템
- [ ] 리뷰 목록 표시
- [ ] 신고 기능

### 추천 시스템
- [ ] 사용자 기반 추천
- [ ] 지역 기반 추천
- [ ] 최근 본 관광지
- [ ] 인기 관광지 랭킹

### 소셜 기능
- [ ] 여행 일정 공유
- [ ] 친구 추천
- [ ] 댓글 기능

---

## 문서화

- [x] README.md 업데이트
- [x] PRD.md 작성
- [x] AGENTS.md 작성
- [ ] API 문서 작성
- [ ] 컴포넌트 Storybook (선택 사항)
- [ ] 배포 가이드 작성

---

## 참고 사항

### API 키 발급
- 한국관광공사: https://www.data.go.kr/data/15101578/openapi.do
- 네이버 클라우드 플랫폼: https://www.ncloud.com/

### 기술 문서
- Next.js: https://nextjs.org/docs
- 네이버 지도 API: https://www.ncloud.com/product/applicationService/maps
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/
- Supabase: https://supabase.com/docs

### 프로젝트 정보
- GitHub: https://github.com/hyerinam29-hash/WAP-1106
- Vercel: 배포 후 URL 추가

