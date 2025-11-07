/**
 * @file env-check.ts
 * @description 환경 변수 설정 확인 유틸리티
 *
 * 이 파일은 필요한 환경 변수가 설정되어 있는지 확인하는 함수들을 제공합니다.
 * 개발 중 환경 변수 설정 상태를 확인할 때 사용합니다.
 */

/**
 * 필수 환경 변수 목록
 */
export const REQUIRED_ENV_VARS = {
  // 한국관광공사 API
  NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY,
  TOUR_API_KEY: process.env.TOUR_API_KEY,
  
  // Clerk (이미 설정됨)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  
  // Supabase (이미 설정됨)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

/**
 * 환경 변수 설정 상태 확인
 */
export function checkEnvVars() {
  const results = {
    tourApi: {
      nextPublic: !!REQUIRED_ENV_VARS.NEXT_PUBLIC_TOUR_API_KEY,
      backup: !!REQUIRED_ENV_VARS.TOUR_API_KEY,
      allSet: false,
    },
    clerk: {
      publishable: !!REQUIRED_ENV_VARS.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secret: !!REQUIRED_ENV_VARS.CLERK_SECRET_KEY,
      allSet: false,
    },
    supabase: {
      url: !!REQUIRED_ENV_VARS.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!REQUIRED_ENV_VARS.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRole: !!REQUIRED_ENV_VARS.SUPABASE_SERVICE_ROLE_KEY,
      allSet: false,
    },
  };

  // 전체 설정 여부 확인
  results.tourApi.allSet = results.tourApi.nextPublic || results.tourApi.backup;
  results.clerk.allSet = results.clerk.publishable && results.clerk.secret;
  results.supabase.allSet = results.supabase.url && results.supabase.anonKey && results.supabase.serviceRole;

  return results;
}

/**
 * 환경 변수 설정 상태를 콘솔에 출력 (개발용)
 */
export function logEnvStatus() {
  const status = checkEnvVars();
  
  console.group('🔍 환경 변수 설정 상태');
  
  console.group('📌 한국관광공사 API');
  console.log(`NEXT_PUBLIC_TOUR_API_KEY: ${status.tourApi.nextPublic ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`TOUR_API_KEY: ${status.tourApi.backup ? '✅ 설정됨' : '⚠️ 미설정 (백업)'}`);
  console.log(`전체: ${status.tourApi.allSet ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.group('🔐 Clerk (이미 설정됨)');
  console.log(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${status.clerk.publishable ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`CLERK_SECRET_KEY: ${status.clerk.secret ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`전체: ${status.clerk.allSet ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.group('🗄️ Supabase (이미 설정됨)');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${status.supabase.url ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${status.supabase.anonKey ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${status.supabase.serviceRole ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`전체: ${status.supabase.allSet ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.groupEnd();
  
  return status;
}

