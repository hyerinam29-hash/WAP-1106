-- Bookmarks 테이블 생성
-- 사용자가 북마크한 관광지 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- 동일한 사용자가 동일한 관광지를 중복으로 북마크하지 못하도록 제약
    UNIQUE(user_id, content_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmarks OWNER TO postgres;

-- Row Level Security (RLS) 비활성화
-- 개발 단계에서는 RLS를 끄고, 프로덕션에서는 활성화하는 것을 권장합니다
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmarks TO anon;
GRANT ALL ON TABLE public.bookmarks TO authenticated;
GRANT ALL ON TABLE public.bookmarks TO service_role;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON public.bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- 테이블 코멘트
COMMENT ON TABLE public.bookmarks IS '사용자가 북마크한 관광지 정보';
COMMENT ON COLUMN public.bookmarks.id IS '북마크 고유 ID';
COMMENT ON COLUMN public.bookmarks.user_id IS '사용자 ID (users 테이블 참조)';
COMMENT ON COLUMN public.bookmarks.content_id IS '한국관광공사 API contentId';
COMMENT ON COLUMN public.bookmarks.created_at IS '북마크 생성 일시';

