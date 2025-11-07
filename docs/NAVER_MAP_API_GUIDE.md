# 네이버 지도 API 연동 가이드

> 네이버 지도 API를 프로젝트에 연동하는 방법을 단계별로 안내합니다.

## 목차

1. [네이버 클라우드 플랫폼 설정](#1-네이버-클라우드-플랫폼-설정)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [코드 통합](#3-코드-통합)
4. [문제 해결](#4-문제-해결)

---

## 1. 네이버 클라우드 플랫폼 설정

### 1.1 네이버 클라우드 플랫폼 접속

1. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com/) 접속
2. 네이버 계정으로 로그인

### 1.2 Application 등록

1. 좌측 메뉴에서 **Services** 클릭
2. **AI·Application Service** 섹션에서 **AI·NAVER API** 클릭
3. **Application 등록 정보** 메뉴 클릭
4. **+ Application 등록** 버튼 클릭
5. Application 정보 입력:
   - **Application 이름**: 예) `my2025map`
   - **서비스 환경**: Web 서비스 선택
6. **등록** 버튼 클릭

### 1.3 Client ID 확인

1. 등록한 Application 선택
2. **인증 정보** 탭에서 다음 정보 확인:
   - **Client ID** (X-NCP-APIGW-API-KEY-ID): 예) `jz6mn8mwj2`
   - **Client Secret** (X-NCP-APIGW-API-KEY): 나중에 필요할 수 있음

### 1.4 도메인 등록 (중요!)

1. **API 관리** 섹션에서 **인증 정보** 탭 클릭
2. **API 설정** 탭 클릭
3. **Web 서비스 URL** 섹션에서 **추가** 버튼 클릭
4. 다음 URL들을 추가:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   **주의**: 포트 번호(`:3000`)까지 정확히 입력해야 합니다!

5. 프로덕션 도메인도 추가 (배포 시):
   ```
   https://yourdomain.com
   ```

### 1.5 Maps API 서비스 활성화

1. 같은 **API 설정** 탭에서
2. **사용 API** 또는 **APIs** 섹션 찾기
3. **Maps** 체크박스 활성화 확인
4. 체크되어 있지 않으면 체크하기
5. **저장** 버튼 클릭

---

## 2. 환경 변수 설정

### 2.1 .env 파일 생성/수정

프로젝트 루트에 `.env` 파일이 있는지 확인하고, 없으면 생성합니다.

### 2.2 Client ID 추가

`.env` 파일에 다음 내용 추가:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jz6mn8mwj2
```

**중요 사항:**
- 따옴표(`"`) 없이 입력
- 공백 없이 정확히 입력
- `NEXT_PUBLIC_` 접두사 필수 (클라이언트에서 사용하므로)

### 2.3 .env.example 업데이트 (선택사항)

다른 개발자들을 위해 `.env.example` 파일도 업데이트:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

---

## 3. 코드 통합

### 3.1 컴포넌트 사용

네이버 지도 컴포넌트는 이미 구현되어 있습니다:

**홈페이지 (목록 + 지도):**
```tsx
import { NaverMap } from "@/components/naver-map";

<NaverMap
  tours={tours}
  areaCode={areaCode}
  selectedTourId={selectedTourId}
/>
```

**상세페이지 (단일 위치):**
```tsx
import DetailMap from "@/components/tour-detail/detail-map";

<DetailMap
  lat={lat}
  lng={lng}
  title={tourDetail.title}
/>
```

### 3.2 좌표 변환

한국관광공사 API는 KATEC 좌표계를 사용하므로, 네이버 지도용 WGS84로 변환해야 합니다:

```typescript
// KATEC → WGS84 변환
const lng = parseFloat(mapx) / 10000000;
const lat = parseFloat(mapy) / 10000000;
```

---

## 4. 문제 해결

### 4.1 지도가 표시되지 않을 때

#### 증상
- `auth_fail.png` 이미지가 표시됨
- "네이버 지도 API 인증 실패" 메시지

#### 해결 방법

**1단계: 자동 진단 페이지 사용**
```
http://localhost:3000/debug-map
```
"진단 시작" 버튼을 클릭하여 자동으로 문제를 진단합니다.

**2단계: 브라우저 콘솔 확인**
- 개발자 도구(F12) → Console 탭
- 다음 메시지 확인:
  ```
  🗺️ 네이버 지도 API 로드
    Client ID (처리 후): jz6mn8mwj2
    현재 도메인: http://localhost:3000
  ```

**3단계: 네이버 클라우드 플랫폼 확인**
- [콘솔](https://console.ncloud.com/) 접속
- Application 등록 정보 → 해당 Client ID 선택
- API 설정 탭에서:
  - ✅ 서비스 URL에 `http://localhost:3000` 등록 확인
  - ✅ Maps API 서비스 활성화 확인

**4단계: 개발 서버 재시작**
```bash
# 서버 중지 (Ctrl+C)
pnpm dev
```

**5단계: 브라우저 캐시 삭제**
- 하드 새로고침: `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)

### 4.2 일반적인 오류

#### 오류: "Client ID가 설정되지 않았습니다"
**원인**: `.env` 파일에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 없음

**해결**:
1. `.env` 파일 확인
2. `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jz6mn8mwj2` 추가
3. 개발 서버 재시작

#### 오류: "인증 실패: 도메인 미등록"
**원인**: 네이버 클라우드 플랫폼에 현재 도메인이 등록되지 않음

**해결**:
1. 네이버 클라우드 플랫폼 콘솔 접속
2. Application 등록 정보 → 해당 Client ID 선택
3. API 설정 탭 → 서비스 URL에 현재 도메인 추가
4. 저장 후 페이지 새로고침

#### 오류: "window.naver.maps가 없습니다"
**원인**: 스크립트는 로드되었지만 인증 실패

**해결**:
1. Maps API 서비스 활성화 확인
2. 도메인 등록 확인
3. Client ID가 올바른지 확인

### 4.3 네트워크 탭 확인

개발자 도구(F12) → Network 탭에서:

1. `maps.js` 파일 찾기
2. 상태 코드 확인:
   - **200**: 스크립트 로드 성공 (인증은 별도 확인 필요)
   - **403/401**: Client ID 오류 또는 도메인 미등록
   - **404**: URL 오류

3. Response 확인:
   - 인증 실패 시 에러 메시지가 포함될 수 있음

---

## 5. 체크리스트

네이버 지도 API 연동 전 확인사항:

- [ ] 네이버 클라우드 플랫폼에 Application 등록 완료
- [ ] Client ID 확인 및 복사
- [ ] `.env` 파일에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가
- [ ] 서비스 URL에 `http://localhost:3000` 등록
- [ ] Maps API 서비스 활성화 확인
- [ ] 개발 서버 재시작
- [ ] 브라우저 캐시 삭제
- [ ] `/debug-map` 페이지에서 진단 실행
- [ ] 지도 정상 표시 확인

---

## 6. 추가 리소스

- [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com/)
- [네이버 지도 API 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [프로젝트 디버그 페이지](/debug-map)
- [환경 변수 확인 페이지](/env-check)

---

## 7. 문의 및 지원

문제가 계속되면:
1. `/debug-map` 페이지에서 자동 진단 실행
2. 브라우저 콘솔의 에러 메시지 확인
3. 네트워크 탭에서 `maps.js` 요청 상태 확인
4. 네이버 클라우드 플랫폼 고객센터 문의

---

**마지막 업데이트**: 2025년 1월

