import { Pipe, PipeTransform } from '@angular/core';

const dateFmt = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo' });

/** "2026年10月25日" */
@Pipe({ name: 'jaDate' })
export class JaDatePipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d);
  }
}

/** ISO の日時を YYYY-MM-DD (日本時間) に */
export const isoDay = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);

/** URL の一部を戻す。壊れた % (「#%E0%A4」など) が入っていても例外にせず、そのまま返す */
export const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
