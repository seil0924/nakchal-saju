// /ceo — 서버 껍데기. 입력 폼은 클라이언트, 거장 100인 색인은 서버에서 그린다.
// 색인을 클라이언트로 올리면 거장 데이터(이야기까지)가 사용자 브라우저로 통째로 내려간다.
import CeoClient from './CeoClient';
import { TycoonIndexBlock } from './TycoonIndex';

export default function CeoPage() {
  return (
    <>
      <CeoClient />
      <TycoonIndexBlock />
    </>
  );
}
