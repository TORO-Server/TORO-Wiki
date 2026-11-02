/**
 * GitHub Pages は、末尾に / の無いページの URL (/wiki/ルール) を、/ を付けた先 (/wiki/ルール/) へ 301 で飛ばす。
 * そのときの Location ヘッダーに、日本語を UTF-8 の生のバイトのまま書く。
 * サービスワーカーが間に入ると、そのバイトが Latin-1 の文字として読まれ、「ルール」が「ã«ã¼ã«」のような文字化けのまま、
 * もう一度 URL になってしまう (/wiki/%C3%A3%C2%83%C2%AB...)。ページが見つからなくなるので、文字化けした URL を元に戻す。
 *
 * 戻せたら、戻した URL (パスだけ。% でエンコード済み) を返す。文字化けしていない・戻せない URL は null (本当にそういう名前の URL には触らない)。
 */
export function repairDoubleEncodedPath(pathname: string): string | null {
  // UTF-8 を Latin-1 として読み直した文字は、日本語なら必ず 0xC3 か 0xC2 (Ã Â) を含む
  if (!/%C[23]/i.test(pathname)) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  // すべての文字が 1 バイト (0x00-0xFF) に収まり、ASCII でない文字を含むときだけ、元のバイトの並びとして読み直す
  const bytes = new Uint8Array(decoded.length);
  let hasNonAscii = false;
  for (let i = 0; i < decoded.length; i++) {
    const c = decoded.charCodeAt(i);
    if (c > 0xff) return null;
    if (c >= 0x80) hasNonAscii = true;
    bytes[i] = c;
  }
  if (!hasNonAscii) return null;

  let fixed: string;
  try {
    // 正しい UTF-8 として読めるときだけ。「café」のような本物の Latin-1 の名前は、ここで弾かれる
    fixed = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  if (fixed === decoded) return null;
  return fixed.split('/').map(encodeURIComponent).join('/');
}
