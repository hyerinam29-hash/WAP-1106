/**
 * @file lib/types/tour.ts
 * @description 한국관광공사 API 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API의 응답 데이터 구조를 TypeScript 타입으로 정의합니다.
 * PRD.md의 5. 데이터 구조 섹션을 기반으로 작성되었습니다.
 *
 * @dependencies
 * - 한국관광공사 공공 API: KorService2
 * - API 문서: https://www.data.go.kr/data/15101578/openapi.do
 */

/**
 * 관광 타입 (Content Type ID)
 * 
 * @see PRD.md 4.4 Content Type ID
 */
export type ContentType = "12" | "14" | "15" | "25" | "28" | "32" | "38" | "39";

/**
 * 관광 타입 이름 매핑
 */
export const CONTENT_TYPE_NAMES: Record<ContentType, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
} as const;

/**
 * 관광지 목록 아이템
 * 
 * areaBasedList2 API 응답 구조
 * 
 * @see PRD.md 5.1 관광지 목록 응답 예시
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (관광 타입) */
  contenttypeid: ContentType;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보
 * 
 * detailCommon2 API 응답 구조
 * 
 * @see PRD.md 5.2 상세정보 응답 예시
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: ContentType;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 */
  homepage?: string;
  /** 개요 (긴 설명) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
}

/**
 * 관광지 운영 정보
 * 
 * detailIntro2 API 응답 구조
 * 
 * 타입별로 필드가 다르지만, 공통 필드들을 포함합니다.
 * 
 * @see PRD.md 5.3 소개정보 응답 예시
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: ContentType;
  /** 이용시간/운영시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 이용요금 */
  usefee?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대실 가능 여부 */
  chkbabycarriage?: string;
  /** 예약 안내 */
  reservation?: string;
  /** 기타 정보 */
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보
 * 
 * detailImage2 API 응답 구조
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 이미지 번호 */
  imageno?: string;
  /** 원본 이미지 URL */
  originimgurl?: string;
  /** 썸네일 이미지 URL */
  smallimageurl?: string;
  /** 이미지 설명 */
  imgname?: string;
  /** 이미지 순서 */
  serialnum?: string;
}

/**
 * 지역 코드 정보
 * 
 * areaCode2 API 응답 구조
 */
export interface AreaCode {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 상위 지역코드 (시/도는 null) */
  rnum?: string;
}

/**
 * 한국관광공사 API 공통 응답 구조
 */
export interface TourApiResponse<T> {
  /** 응답 코드 */
  response: {
    /** 헤더 */
    header: {
      /** 결과 코드 */
      resultCode: string;
      /** 결과 메시지 */
      resultMsg: string;
    };
    /** 본문 */
    body: {
      /** 데이터 타입 */
      items: {
        /** 아이템 배열 */
        item: T | T[];
      };
      /** 총 개수 */
      totalCount?: number;
      /** 페이지 번호 */
      pageNo?: number;
      /** 페이지당 개수 */
      numOfRows?: number;
    };
  };
}

