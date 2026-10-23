'use client';
// 관리자 화면을 연 기기는 손님 조회수에서 뺀다(lib/track markOperatorDevice).
import { useEffect } from 'react';
import { markOperatorDevice } from '@/lib/track';

export default function MarkOperator() {
  useEffect(() => { markOperatorDevice(); }, []);
  return null;
}
