const fallback=[
  ['چرا یک رله مستقل برای Delta Chat مهم است؟','رله مستقل یعنی کنترل بیشتر روی هویت، داده‌ها و مسیر ارتباط.'],
  ['راهنمای شروع با Delta Chat و R.I.S.E','در چند دقیقه اولین گفت‌وگوی خصوصی خود را شروع کنید.'],
  ['امنیت بدون پیچیدگی اضافه','از rate limit تا حداقل‌سازی داده؛ کنترل‌هایی که بی‌سروصدا محافظت می‌کنند.']
];
const paint=()=>{document.querySelectorAll('.post-grid').forEach(grid=>{if(grid.children.length)return;fallback.forEach(([title,excerpt])=>{const card=document.createElement('article');card.className='fallback-post';card.innerHTML=`<div class="post-meta">R.I.S.E</div><h3>${title}</h3><p>${excerpt}</p><span>ادامه مطلب <span aria-hidden="true">→</span></span>`;grid.appendChild(card)})})};
window.addEventListener('DOMContentLoaded',paint);setInterval(paint,700);
