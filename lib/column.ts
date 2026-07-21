// lib/column.ts — 자체 칼럼(블로그) 콘텐츠 로더
// content/column/*.md 파일을 빌드 시점에 읽어 목록·본문으로 제공합니다.
// frontmatter(제목·요약·날짜·태그)는 gray-matter, 본문은 marked로 HTML 변환.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const COLUMN_DIR = path.join(process.cwd(), 'content', 'column');

export type ColumnFaq = { q: string; a: string };
export type ColumnMeta = {
  slug: string;
  title: string;
  description: string;    // 검색·미리보기 요약 (150자 이내 권장)
  date: string;           // 'YYYY-MM-DD'
  tags: string[];
  cover?: string;         // 대표 이미지 경로 (선택)
  readingMin: number;     // 예상 읽는 시간(분)
  faq?: ColumnFaq[];      // (선택) FAQPage 구조화데이터 + 본문 하단 노출용
};

// frontmatter faq: [{ q, a }] 파싱 — 구조화데이터/GEO용. 형식 어긋난 항목은 버림.
function parseFaq(v: unknown): ColumnFaq[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const items = v
    .map((f) => (f && typeof f === 'object' ? (f as Record<string, unknown>) : {}))
    .map((f) => ({ q: String(f.q ?? '').trim(), a: String(f.a ?? '').trim() }))
    .filter((f) => f.q && f.a);
  return items.length ? items : undefined;
}
export type ColumnPost = ColumnMeta & { html: string };

// 한국어 기준 분당 약 500자로 읽는 시간 추정
function estimateReadingMin(raw: string): number {
  const chars = raw.replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}

function readFileNames(): string[] {
  if (!fs.existsSync(COLUMN_DIR)) return [];
  return fs.readdirSync(COLUMN_DIR).filter(f => f.endsWith('.md'));
}

// frontmatter date(KST)가 현재 시각을 지났는지 판정. 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:mm'.
// 예약발행: 지정 시각(한국시간)이 지나야 공개된다. 실제 반영은 그 시각 이후의 재빌드가 필요(크론이 처리).
function isPublishedKST(dateStr: string): boolean {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return true;
  const [, y, mo, d, hh, mi] = m;
  const scheduledUtcMs =
    Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh ?? 0), Number(mi ?? 0)) - 9 * 60 * 60 * 1000;
  return Date.now() >= scheduledUtcMs;
}

function parseFile(file: string): { meta: ColumnMeta; body: string } | null {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(COLUMN_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  if (data.draft === true) return null;                         // 초안 숨김
  const rawDate = String(data.date ?? '');
  // 예약발행: 지정 시각(KST)이 아직 안 됐으면 비공개
  if (rawDate && !isPublishedKST(rawDate)) return null;
  const date = rawDate.slice(0, 10);   // 표시·sitemap용 날짜(시간 제외)
  const meta: ColumnMeta = {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    readingMin: estimateReadingMin(content),
    faq: parseFaq(data.faq),
  };
  return { meta, body: content };
}

// 목록: 초안·예약글 제외, 최신순
export function getAllColumns(): ColumnMeta[] {
  return readFileNames()
    .map(parseFile)
    .filter((x): x is { meta: ColumnMeta; body: string } => x !== null)
    .map(x => x.meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllColumnSlugs(): string[] {
  return getAllColumns().map(p => p.slug);
}

// 본문: slug로 단건 조회 + HTML 변환
export function getColumn(slug: string): ColumnPost | null {
  const file = `${slug}.md`;
  if (!readFileNames().includes(file)) return null;
  const parsed = parseFile(file);
  if (!parsed) return null;
  const html = marked.parse(parsed.body, { async: false }) as string;
  return { ...parsed.meta, html };
}
