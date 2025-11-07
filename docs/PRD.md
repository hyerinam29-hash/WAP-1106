# PRD: 한국 관광지 정보 서비스 (My Trip)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

한국관광공사 공공 API를 활용하여 사용자가 전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스 개발

### 1.2 타겟 유저

- 국내 여행을 계획하는 사용자
- 주변 관광지를 찾는 사용자
- 특정 지역의 관광 정보가 필요한 사용자

### 1.3 핵심 가치

- **편리성**: 전국 관광지 정보를 한 곳에서 검색
- **시각화**: 네이버 지도 연동으로 위치 기반 정보 제공
- **상세성**: 운영시간, 요금, 이미지 등 종합 정보 제공

---

## 2. MVP 핵심 기능

### 2.1 관광지 목록 + 지역/타입 필터

#### 기능 설명

사용자가 지역(시/도)과 관광 타입을 선택하여 해당하는 관광지 목록을 조회

#### 상세 요구사항

- **지역 필터**

  - 시/도 단위 선택 (서울, 부산, 경기 등)
  - 시/군/구 단위 선택 (선택 사항)
  - "전체" 옵션 제공

- **관광 타입 필터**

  - 관광지 (12)
  - 문화시설 (14)
  - 축제/행사 (15)
  - 여행코스 (25)
  - 레포츠 (28)
  - 숙박 (32)
  - 쇼핑 (38)
  - 음식점 (39)
  - "전체" 옵션 제공

- **목록 표시 정보**

  - 썸네일 이미지 (없으면 기본 이미지)
  - 관광지명
  - 주소
  - 관광 타입 뱃지
  - 간단한 개요 (1-2줄)

- **페이지네이션**

  - 페이지당 10-20개 항목
  - 무한 스크롤 또는 페이지 번호 선택

- **정렬 옵션**
  - 최신순 (modifiedtime 기준)
  - 이름순 (가나다순)

#### 사용 API

- `areaCode2`: 지역코드 조회
- `areaBasedList2`: 지역 기반 관광정보 조회

#### UI 요구사항

- 반응형 디자인 (모바일/태블릿/데스크톱)
- 카드 형태의 그리드 레이아웃
- 필터는 상단 또는 사이드바에 배치
- 로딩 상태 표시

---

### 2.2 네이버 지도 연동

#### 기능 설명

관광지 목록의 위치를 네이버 지도에 마커로 표시하고, 사용자 인터랙션 제공

#### 상세 요구사항

- **지도 표시**

  - 초기 중심: 선택된 지역의 중심 좌표
  - 줌 레벨: 지역 범위에 따라 자동 조정
  - 모든 관광지를 마커로 표시

- **마커 기능**

  - 각 관광지를 마커로 표시
  - 마커 클릭 시 인포윈도우 표시
    - 관광지명
    - 간단한 설명
    - "상세보기" 버튼
  - 마커 색상: 관광 타입별로 구분 (선택 사항)

- **지도-리스트 연동**

  - 리스트 항목 클릭 시 해당 마커로 지도 이동
  - 리스트 항목 호버 시 해당 마커 강조 (선택 사항)

- **지도 컨트롤**
  - 줌 인/아웃
  - 지도 유형 선택 (일반/위성)
  - 현재 위치로 이동 버튼 (선택 사항)

#### 기술 요구사항

- **네이버 지도 API** 사용
  - 스크립트 태그로 로드 (`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID`)
  - Client ID 필요 (네이버 클라우드 플랫폼에서 발급)
  - Maps API 서비스 활성화 필요
- **좌표 데이터**: `mapx` (경도), `mapy` (위도)
  - WGS84 좌표계로 변환 필요 → `mapy / 10000000`, `mapx / 10000000`
  - 네이버 지도는 표준 위도(lat)/경도(lng) 사용

#### UI 요구사항

- 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
- 모바일: 탭 형태로 리스트/지도 전환
- 지도 최소 높이: 400px (모바일), 600px (데스크톱)

---

### 2.3 키워드 검색

#### 기능 설명

사용자가 입력한 키워드로 관광지를 검색하고 결과를 표시

#### 상세 요구사항

- **검색 기능**

  - 검색창에 키워드 입력
  - 엔터 또는 검색 버튼 클릭으로 검색 실행
  - 자동완성 기능 (선택 사항)

- **검색 범위**

  - 관광지명
  - 주소
  - 설명 내용

- **검색 결과**

  - 목록 형태로 표시 (2.1과 동일한 카드 레이아웃)
  - 지도에 마커로 표시
  - 검색 결과 개수 표시
  - 결과 없음 시 안내 메시지

- **검색 필터 조합**
  - 키워드 + 지역 필터
  - 키워드 + 관광 타입 필터
  - 모든 필터 동시 적용 가능

#### 사용 API

- `searchKeyword2`: 키워드 검색

#### UI 요구사항

- 헤더에 검색창 고정
- 검색창 너비: 최소 300px (모바일), 500px (데스크톱)
- 검색 아이콘 표시
- 검색 중 로딩 스피너

---

### 2.4 상세페이지

#### 기능 설명

사용자가 관광지를 클릭하면 상세 정보를 보여주는 페이지로 이동

#### 상세 요구사항

##### 2.4.1 기본 정보 섹션

- **표시 항목** (detailCommon2)
  - 관광지명 (대제목)
  - 대표 이미지 (크게 표시)
  - 주소 (복사 기능)
  - 전화번호 (클릭 시 전화 연결)
  - 홈페이지 (링크)
  - 개요 (긴 설명문)
  - 관광 타입 및 카테고리

##### 2.4.2 운영 정보 섹션

- **표시 항목** (detailIntro2)
  - 운영시간 / 개장시간
  - 휴무일
  - 이용요금
  - 주차 가능 여부
  - 수용인원
  - 체험 프로그램 (있는 경우)
  - 유모차/반려동물 동반 가능 여부

##### 2.4.3 이미지 갤러리

- **표시 항목** (detailImage2)
  - 대표 이미지 + 서브 이미지들
  - 이미지 클릭 시 전체화면 모달
  - 이미지 슬라이드 기능
  - 이미지 없으면 기본 이미지

##### 2.4.4 지도 섹션

- **표시 항목**
  - 해당 관광지 위치를 네이버 지도에 표시
  - 마커 1개 (해당 관광지)
  - "길찾기" 버튼 → 네이버 지도 앱/웹 연동
  - 좌표 정보 표시 (선택 사항)

##### 2.4.5 추가 기능

###### 공유하기

- **URL 복사**
  - 클립보드 복사 기능
  - 복사 완료 토스트 메시지
  - 공유 아이콘 버튼 (Share/Link 아이콘)

###### 북마크 (Supabase 연동)

- **기능**

  - 즐겨찾기 추가/제거
  - 별 아이콘 (채워짐/비어있음)
  - 북마크 개수 표시 (선택 사항)

- **데이터 저장**

  - ~~localStorage~~ → Supabase `bookmarks` 테이블
  - 인증된 사용자만 사용 가능
  - 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장

- **북마크 목록 페이지** (`/bookmarks`, 선택 사항)
  - 사용자가 북마크한 관광지 목록
  - 카드 레이아웃 (2.1과 동일)
  - 정렬: 최신순, 이름순, 지역별
  - 일괄 삭제 기능

###### 기술 요구사항

- **클립보드 API**

  - `navigator.clipboard.writeText()`
  - HTTPS 환경 필수

- **Open Graph 메타태그** (SEO 최적화)
  - 동적 메타태그 생성 (Next.js Metadata API)
  - 필수 속성:
    - `og:title`: 관광지명
    - `og:description`: 관광지 설명 (100자 이내)
    - `og:image`: 대표 이미지 (1200x630 권장)
    - `og:url`: 상세페이지 URL
    - `og:type`: "website"

#### 사용 API

- `detailCommon2`: 공통 정보
- `detailIntro2`: 소개 정보
- `detailImage2`: 이미지 목록
- `detailPetTour2`: 반려동물 정보 (선택 사항)

#### URL 구조

```
/places/[contentId]
예: /places/125266
```

#### UI 요구사항

- 단일 컬럼 레이아웃 (모바일 우선)
- 섹션별 구분선 또는 카드
- 뒤로가기 버튼 (헤더)
- 이미지 갤러리: swiper 또는 캐러셀
- 정보 없는 항목은 숨김 처리

---

## 3. 기술 스택

### 3.1 Frontend

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Maps**: 네이버 지도 API

### 3.2 Authentication

- **Clerk**: 사용자 인증 (로그인 필요 시)

### 3.3 Database

- **Supabase**: PostgreSQL (북마크, 사용자 기록 저장 시)

### 3.4 API

- **한국관광공사 공공 API**: KorService2

---

## 4. API 명세

### 4.1 사용 API 목록

| API           | 엔드포인트        | 용도                | 필수 파라미터                                             |
| ------------- | ----------------- | ------------------- | --------------------------------------------------------- |
| 지역코드 조회 | `/areaCode2`      | 지역 필터 생성      | serviceKey, MobileOS, MobileApp                           |
| 지역기반 조회 | `/areaBasedList2` | 관광지 목록         | serviceKey, MobileOS, MobileApp, areaCode, contentTypeId  |
| 키워드 검색   | `/searchKeyword2` | 검색 기능           | serviceKey, MobileOS, MobileApp, keyword                  |
| 공통정보 조회 | `/detailCommon2`  | 상세페이지 기본정보 | serviceKey, MobileOS, MobileApp, contentId                |
| 소개정보 조회 | `/detailIntro2`   | 상세페이지 운영정보 | serviceKey, MobileOS, MobileApp, contentId, contentTypeId |
| 이미지 조회   | `/detailImage2`   | 상세페이지 갤러리   | serviceKey, MobileOS, MobileApp, contentId                |

### 4.2 Base URL

```
https://apis.data.go.kr/B551011/KorService2
```

### 4.3 공통 파라미터

- `serviceKey`: 인증키 (환경변수)
- `MobileOS`: "ETC"
- `MobileApp`: "MyTrip"
- `_type`: "json"
- `numOfRows`: 10-20 (목록 조회 시)
- `pageNo`: 1, 2, 3... (페이지네이션)

### 4.4 Content Type ID (관광 타입)

- `12`: 관광지
- `14`: 문화시설
- `15`: 축제/행사
- `25`: 여행코스
- `28`: 레포츠
- `32`: 숙박
- `38`: 쇼핑
- `39`: 음식점

---

## 5. 데이터 구조

### 5.1 관광지 목록 응답 예시 (areaBasedList2)

```typescript
interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도
  mapy: string; // 위도
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}
```

### 5.2 상세정보 응답 예시 (detailCommon2)

```typescript
interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string;
  mapy: string;
}
```

### 5.3 소개정보 응답 예시 (detailIntro2)

```typescript
interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 타입별로 필드가 다름
  usetime?: string; // 이용시간
  restdate?: string; // 휴무일
  infocenter?: string; // 문의처
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  // ... 기타 타입별 필드
}
```

---

## 6. 페이지 구조

### 6.1 페이지 목록

```
/                          # 홈페이지 (관광지 목록)
/places/[contentId]        # 상세페이지
/search?keyword=xxx        # 검색 결과 (선택 사항, 홈에서 처리 가능)
/bookmarks                 # 내 북마크 목록 (선택 사항)
```

### 6.2 컴포넌트 구조

```
app/
├── page.tsx                    # 홈 (목록 + 필터 + 지도)
├── places/
│   └── [contentId]/
│       └── page.tsx            # 상세페이지
└── bookmarks/
    └── page.tsx                # 북마크 목록 (선택 사항)

components/
├── tour-list.tsx               # 관광지 목록
├── tour-card.tsx               # 관광지 카드
├── tour-filters.tsx            # 필터 (지역/타입)
├── tour-search.tsx             # 검색창
├── naver-map.tsx               # 네이버 지도
├── tour-detail/
│   ├── detail-info.tsx         # 기본정보
│   ├── detail-intro.tsx        # 운영정보
│   ├── detail-gallery.tsx      # 이미지 갤러리
│   ├── detail-map.tsx          # 지도
│   └── share-button.tsx        # URL 복사 공유 버튼
├── bookmarks/
│   ├── bookmark-button.tsx     # 북마크 버튼 (별 아이콘)
│   └── bookmark-list.tsx       # 북마크 목록
└── ui/                         # shadcn 컴포넌트

lib/
├── api/
│   ├── tour-api.ts             # 한국관광공사 API 호출 함수들
│   └── supabase-api.ts         # Supabase 쿼리 함수들 (북마크)
└── types/
    └── tour.ts                 # 관광지 타입 정의
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙

- **모바일 우선**: 반응형 디자인
- **직관성**: 명확한 네비게이션과 정보 계층
- **성능**: 빠른 로딩 (이미지 최적화, 레이지 로딩)
- **접근성**: ARIA 라벨, 키보드 네비게이션

### 7.2 컬러 스킴

- 다크/라이트 모드 지원
- Primary 색상: 관광/여행 느낌 (청록색, 파란색 계열 추천)

### 7.3 로딩 상태

- 리스트 로딩: 스켈레톤 UI
- 지도 로딩: 스피너
- 이미지 로딩: Placeholder 이미지

### 7.4 에러 처리

- API 에러: 에러 메시지 표시 + 재시도 버튼
- 네트워크 에러: 오프라인 안내
- 404: 페이지를 찾을 수 없음

---

## 8. 제약사항 및 고려사항

### 8.1 API 제약사항

- **Rate Limit**: 공공 API 호출 제한 (확인 필요)
- **데이터 품질**: 일부 관광지는 이미지/정보 누락 가능
- **응답 속도**: API 응답 시간 고려 (캐싱 전략 필요)

### 8.2 네이버 지도 제약사항

- 무료 사용량 제공 (네이버 클라우드 플랫폼)
- Client ID 필요 (네이버 클라우드 플랫폼에서 발급)
- Maps API 서비스 활성화 필요
- 일일 호출 제한 확인 필요

### 8.3 DB 고려사항

- 공공 API는 읽기 전용 → 리뷰/평점 등은 supabase DB 필요
- Supabase 활용하여 북마크, 조회수, 랭킹 등 구현 가능

### 8.4 보안 및 환경변수

- API 키는 환경변수로 관리 (`.env`)
- `NEXT_PUBLIC_` 접두사로 클라이언트 노출 허용

**필수 환경변수**:

```bash
# 한국관광공사 API
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# 한국 관광공사 에러가 난다면? NEXT_PUBLIC_TOUR_API_KEY 가 인식안될때?
TOUR_API_KEY=your_tour_api_key

# 네이버 지도
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

---

## 9. 성공 지표 (KPI)

### 9.1 기능적 지표

- ✅ MVP 4가지 핵심 기능 모두 정상 작동 (목록/지도/검색/상세)
- ✅ API 응답 성공률 > 95%
- ✅ 페이지 로딩 시간 < 3초
- 북마크 데이터 정확도 > 99% (선택 사항)
- URL 복사 성공률 > 95%

---

## 10. 개발 일정 (페이지 중심)

### Phase 1: 기본 구조 & 공통 설정

- [ ] 프로젝트 셋업
- [ ] API 클라이언트 구현 (`app/api/tour/route.ts`)
- [ ] 기본 타입 정의 (`lib/types/tour.ts`, `lib/types/festival.ts`)
- [ ] 레이아웃 구조 업데이트 (`app/layout.tsx`)
- [ ] 공통 컴포넌트 (로딩, 에러 처리)

### Phase 2: 홈페이지 (`/`) - 관광지 목록

#### 2.1 페이지 기본 구조
- [ ] `app/page.tsx` 생성 (빈 레이아웃)
- [ ] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)

#### 2.2 관광지 목록 기능 (MVP 2.1)
- [ ] `components/tour-card.tsx` (관광지 카드 - 기본 정보만)
- [ ] `components/tour-list.tsx` (목록 표시 - 하드코딩 데이터로 테스트)
- [ ] API 연동하여 실제 데이터 표시
- [ ] 페이지 확인 및 스타일링 조정

#### 2.3 필터 기능 추가
- [ ] `components/tour-filters.tsx` (지역/타입 필터 UI)
- [ ] 필터 동작 연결 (상태 관리)
- [ ] 필터링된 결과 표시
- [ ] 페이지 확인 및 UX 개선

#### 2.4 검색 기능 추가 (MVP 2.3)
- [ ] `components/tour-search.tsx` (검색창 UI)
- [ ] 검색 API 연동 (`searchKeyword2`)
- [ ] 검색 결과 표시
- [ ] 검색 + 필터 조합 동작
- [ ] 페이지 확인 및 UX 개선

#### 2.5 지도 연동 (MVP 2.2)
- [ ] `components/naver-map.tsx` (기본 지도 표시)
- [ ] 관광지 마커 표시
- [ ] 마커 클릭 시 인포윈도우
- [ ] 리스트-지도 연동 (클릭/호버)
- [ ] 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
- [ ] 페이지 확인 및 인터랙션 테스트

#### 2.6 정렬 & 페이지네이션
- [ ] 정렬 옵션 추가 (최신순, 이름순)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 최종 페이지 확인

### Phase 3: 상세페이지 (`/places/[contentId]`)

#### 3.1 페이지 기본 구조
- [ ] `app/places/[contentId]/page.tsx` 생성
- [ ] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
- [ ] 라우팅 테스트 (홈에서 클릭 시 이동)

#### 3.2 기본 정보 섹션 (MVP 2.4.1)
- [ ] `components/tour-detail/detail-info.tsx`
- [ ] `detailCommon2` API 연동
- [ ] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
- [ ] 주소 복사 기능
- [ ] 전화번호 클릭 시 전화 연결
- [ ] 페이지 확인 및 스타일링

#### 3.3 지도 섹션 (MVP 2.4.4)
- [ ] `components/tour-detail/detail-map.tsx`
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (네이버 지도 연동)
- [ ] 페이지 확인

#### 3.4 공유 기능 (MVP 2.4.5)
- [ ] `components/tour-detail/share-button.tsx`
- [ ] URL 복사 기능 (클립보드 API)
- [ ] 복사 완료 토스트 메시지
- [ ] Open Graph 메타태그 동적 생성
- [ ] 페이지 확인 및 공유 테스트

#### 3.5 추가 정보 섹션 (향후 구현)
- [ ] `components/tour-detail/detail-intro.tsx` (운영 정보)
- [ ] `detailIntro2` API 연동
- [ ] `components/tour-detail/detail-gallery.tsx` (이미지 갤러리)
- [ ] `detailImage2` API 연동
- [ ] 페이지 확인

### Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

#### 4.1 Supabase 설정
- [ ] `supabase/migrations/` 마이그레이션 파일
- [ ] `bookmarks` 테이블 생성
- [ ] RLS 정책 설정

#### 4.2 북마크 기능 구현
- [ ] `components/bookmarks/bookmark-button.tsx`
- [ ] 상세페이지에 북마크 버튼 추가
- [ ] Supabase DB 연동
- [ ] 인증된 사용자 확인
- [ ] 로그인하지 않은 경우 localStorage 임시 저장
- [ ] 상세페이지에서 북마크 동작 확인

#### 4.3 북마크 목록 페이지
- [ ] `app/bookmarks/page.tsx` 생성
- [ ] `components/bookmarks/bookmark-list.tsx`
- [ ] 북마크한 관광지 목록 표시
- [ ] 정렬 옵션 (최신순, 이름순, 지역별)
- [ ] 일괄 삭제 기능
- [ ] 페이지 확인

### Phase 5: 최적화 & 배포

- [ ] 이미지 최적화 (`next.config.ts` 외부 도메인 설정)
- [ ] 전역 에러 핸들링 개선
- [ ] 404 페이지 (`app/not-found.tsx`)
- [ ] SEO 최적화 (메타태그, sitemap, robots.txt)
- [ ] 성능 측정 (Lighthouse 점수 > 80)
- [ ] 환경변수 보안 검증
- [ ] Vercel 배포 및 테스트

---

## 12. 참고 자료

### API 문서

- 한국관광공사 API: https://www.data.go.kr/data/15101578/openapi.do

### 기술 문서

- Next.js: https://nextjs.org/docs
- Naver Maps API v3: https://navermaps.github.io/maps.js.ncp/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---
