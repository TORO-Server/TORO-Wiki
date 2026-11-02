import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { repairDoubleEncodedPath } from './app/core/url-repair';

// サービスワーカー経由の 301 で文字化けした URL (/wiki/%C3%A3%C2%83... ) を、ルーターが読む前に元へ戻す (理由は url-repair.ts)
const repaired = repairDoubleEncodedPath(location.pathname);
if (repaired) history.replaceState(history.state, '', repaired + location.search + location.hash);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
