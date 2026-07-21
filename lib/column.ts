// lib/column.ts — 자체 칼럼(블로그) 콘텐츠 로더
// content/column/*.md 파일을 빌드 시점에 읽어 목록·본문으로 제공합니다.
// frontmatter(제목·요약·날짜·태그)는 gray-matter, 본문은 marked로 HTML 변환.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const COLUMN_DIR = path.join(process.cwd(), 'content', 'column');

export type ColumnMeta = {
  slug: string;
  title: string;
  description: string;    // 검색·미리보기 요약 (150자 이내 권장)
  date: string;           // 'YYYY-MM-DD'
  tags: string[];
  cover?: string;         // 대표 이미지 경로 (선택)
  readingMin: number;     // 예상 읽는 시간(분)
};
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

function parseFile(file: string): { meta: ColumnMeta; body: string } | null {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(COLUMN_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  if (data.draft === true) return null;                         // 초안 숨김
  const date = String(data.date ?? '');
  // 미래 날짜(예약발행): 오늘 이후면 아직 비공개. (반영은 재배포 필요)
  if (date && date > new Date().toISOString().slice(0, 10)) return null;
  const meta: ColumnMeta = {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    readingMin: estimateReadingMin(content),
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
