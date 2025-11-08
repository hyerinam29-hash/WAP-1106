# 네이버 지도 API 인증 실패 해결 가이드

## 현재 상황
- **Client ID**: jz6mn8mwj2
- **접속 URL**: http://localhost:3000
- **에러**: 401 Unauthorized (navermap_authFailure)
- **네트워크 요청**: http://oapi.map.naver.com/v3/auth?ncpKeyId=jz6mn8mwj2&url=http%3A%2F%2Flocalhost%3A3000%2F

## ✅ 코드 검증 완료
- [x] `ncpKeyId` 파라미터 사용 (최신 방식)
- [x] 환경변수 설정 (`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`)
- [x] 올바른 스크립트 로딩 방식

## 🔍 네이버 클라우드 플랫폼 콘솔 설정 확인

### 1단계: 콘솔 접속 및 Application 확인
1. https://console.ncloud.com/ 접속
2. 상단 메뉴: **AI·Application Service** → **AI·NAVER API**
3. 왼쪽 메뉴: **Application 등록 정보** 클릭
4. **Client ID: jz6mn8mwj2** 찾기
   - ❌ 만약 없다면: Client ID가 잘못되었거나 삭제됨
   - ✅ 있다면: 다음 단계 진행

### 2단계: 서비스 URL 등록 확인 (가장 중요!)
1. Client ID **jz6mn8mwj2** 클릭
2. **"API 설정"** 탭 선택
3. **"서비스 URL"** 섹션 확인

#### 필수 등록 URL (정확히 이렇게!)
```
http://localhost:3000
```

#### ⚠️ 흔한 실수들
- ❌ `http://localhost:3000/` (끝에 슬래시 있음)
- ❌ `localhost:3000` (http:// 없음)
- ❌ `http://127.0.0.1:3000` (localhost와 127.0.0.1은 다름!)
- ✅ `http://localhost:3000` (정확!)

#### 추가 권장 URL
개발 편의를 위해 다음도 함께 등록 권장:
```
http://localhost:3000
http://127.0.0.1:3000
http://localhost:3001
```

### 3단계: Maps API 서비스 활성화 확인
1. 같은 페이지에서 **"사용 API"** 또는 **"Maps"** 섹션 찾기
2. **"Web Dynamic Map"** 또는 **"Maps"** 서비스 확인
   - ❌ 회색/비활성화: 토글 클릭하여 파란색으로 활성화
   - ✅ 파란색/활성화: 정상

### 4단계: 저장 및 적용
1. 변경사항 **"저장"** 버튼 클릭
2. ⏱️ **5~10분 대기** (설정 반영 시간)
3. 브라우저에서 **Ctrl + Shift + R** (강력 새로고침)

## 🧪 테스트 방법

### 방법 1: 간단한 브라우저 테스트
1. 개발 서버 실행: `pnpm dev`
2. 브라우저에서 http://localhost:3000/dev/naver-map 접속
3. F12 개발자 도구 → Network 탭 확인
4. `auth?ncpKeyId=` 요청 찾기
5. Status Code 확인:
   - **401**: 서비스 URL 미등록 또는 Client ID 오류
   - **403**: Client ID는 맞지만 Maps API 미활성화
   - **200**: 성공! 🎉

### 방법 2: 직접 인증 URL 테스트
브라우저 주소창에 입력:
```
http://oapi.map.naver.com/v3/auth?ncpKeyId=jz6mn8mwj2&url=http://localhost:3000&time=1736000000000&callback=test
```

**성공 응답 예시:**
```javascript
test({"result": true});
```

**실패 응답 예시:**
```javascript
test({"result": false, "error": {...}});
```

## 🔧 대안 솔루션

### 대안 1: 127.0.0.1 사용
1. `.env` 파일의 Client ID 확인
2. 콘솔에서 `http://127.0.0.1:3000` 추가 등록
3. 브라우저에서 http://127.0.0.1:3000 접속

### 대안 2: 포트 변경
1. `package.json` 수정:
   ```json
   "dev": "next dev --port 3001"
   ```
2. 콘솔에서 `http://localhost:3001` 등록
3. 서버 재시작

### 대안 3: 새 Client ID 발급
1. 네이버 클라우드 플랫폼 콘솔에서
2. **Application 등록 정보** → **Application 등록** 버튼
3. 새로운 Client ID 발급
4. `.env` 파일 업데이트
5. 서버 재시작

## 📋 최종 체크리스트

- [ ] Client ID가 콘솔에 존재하는지 확인
- [ ] 서비스 URL에 `http://localhost:3000` 정확히 등록
- [ ] Maps API (Web Dynamic Map) 활성화됨
- [ ] 변경사항 저장 후 5~10분 대기
- [ ] 브라우저 강력 새로고침 (Ctrl + Shift + R)
- [ ] 개발자 도구 Network 탭에서 auth 요청 Status Code 확인
- [ ] 캐시 삭제 (브라우저 설정 → 쿠키 및 사이트 데이터 삭제)

## 🆘 여전히 안 될 경우

1. **스크린샷 준비**:
   - 네이버 클라우드 콘솔의 "API 설정" 탭 전체
   - 브라우저 개발자 도구의 Network 탭 (auth 요청)
   - Console 탭의 에러 메시지

2. **네이버 클라우드 고객센터**:
   - https://www.ncloud.com/support/question
   - "Maps API 인증 실패 (401)" 제목으로 문의
   - 준비한 스크린샷 첨부

3. **Client ID 재생성**:
   - 기존 Application 삭제
   - 새로운 Application 생성
   - 새 Client ID로 재시도

## 💡 참고사항

- **설정 반영 시간**: 보통 즉시 반영되지만, 최대 10분 소요
- **캐시 문제**: 브라우저 캐시가 문제일 수 있으므로 시크릿 모드 시도
- **방화벽**: 회사 네트워크의 경우 방화벽이 API 요청을 차단할 수 있음
- **VPN**: VPN 사용 시 해제 후 재시도

---

**작성일**: 2025-01-08
**대상 버전**: Naver Maps API v3 (NCP 기반)

