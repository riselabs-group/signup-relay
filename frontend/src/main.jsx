import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  Globe2,
  Camera,
  Laptop,
  Link2,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  Moon,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  X,
  CirclePlay,
  Zap,
} from 'lucide-react';
import './styles.css';
import './mobile.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
const idempotencyKey = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const copy = {
  fa: {
    direction: 'rtl',
    nav: ['صفحه اصلی', 'امکانات', 'امنیت', 'مجله R.I.S.E', 'سؤالات متداول'],
    login: 'ورود',
    signup: 'ثبت‌نام',
    magazine: 'مجله R.I.S.E',
    eyebrow: 'حریم خصوصی برای گفت‌وگوهای بهتر',
    titleA: 'آدرس شما،',
    titleB: 'فضای شما.',
    subtitle: 'خانه‌ای خصوصی و امن برای گفت‌وگوهای شما',
    create: 'ساخت آدرس رایگان',
    trust: ['بدون ردیابی', 'رمزنگاری سرتاسری', 'همیشه در دسترس'],
    welcome: 'خوش آمدید',
    choose: 'نام کاربری خود را انتخاب کنید',
    username: 'نام کاربری',
    address: 'آدرس اختصاصی شما',
    usernameHint: 'با انتخاب نام کاربری، یک آدرس اختصاصی و امن از R.I.S.E دریافت می‌کنید.',
    continue: 'ادامه',
    passwordTitle: 'یک رمز عبور امن بسازید',
    password: 'رمز عبور',
    passwordAgain: 'تکرار رمز عبور',
    terms: 'قوانین استفاده و سیاست حریم خصوصی را می‌پذیرم.',
    back: 'بازگشت',
    finish: 'ساخت حساب',
    creating: 'در حال ساخت حساب…',
    success: 'حساب شما با موفقیت ساخته شد.',
    connection: 'اطلاعات اتصال',
    newAccount: 'ساخت حساب دیگر',
    errors: {
      username: 'نام کاربری باید ۳ تا ۳۲ نویسه و فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط باشد.',
      password: 'رمز عبور باید حداقل ۱۲ نویسه داشته باشد.',
      mismatch: 'تکرار رمز عبور یکسان نیست.',
      terms: 'پذیرش قوانین برای ساخت حساب ضروری است.',
      network: 'ارتباط با سرور برقرار نشد. کمی بعد دوباره تلاش کنید.',
    },
    stats: [
      ['+۵۰۰٬۰۰۰', 'کاربر فعال'],
      ['۹۹٫۹٪', 'حفظ حریم خصوصی'],
      ['در دسترس در', 'همه دستگاه‌ها'],
      ['تجربه‌ای امن، سریع و هوشمند', 'برای نسل جدید گفت‌وگو'],
    ],
    benefits: [
      ['رمزنگاری سرتاسری', 'تمام گفت‌وگوهای شما به‌صورت سرتاسری رمزنگاری می‌شوند.'],
      ['بدون ردیابی', 'داده‌های شما را ذخیره یا برای تبلیغات ردیابی نمی‌کنیم.'],
      ['همیشه در دسترس', 'در هر زمان و از هر دستگاه، با ثبات و سرعت بالا.'],
      ['فضایی برای ایده‌های بزرگ‌تر', 'محیطی آرام و متمرکز برای فکرکردن و خلق ایده‌های جدید.'],
    ],
    blogEyebrow: 'از مجله R.I.S.E',
    blogTitle: 'تازه‌ترین نوشته‌ها',
    blogSubtitle: 'درباره حریم خصوصی، ارتباط امن و ساختن اینترنتی انسانی‌تر بخوانید.',
    read: 'ادامه مطلب',
    more: 'نمایش مطالب بیشتر',
    allShown: 'همه مطالب نمایش داده شد',
    noPosts: 'هنوز مطلبی منتشر نشده است.',
    backHome: 'بازگشت به صفحه اصلی',
    footerTagline: 'اینترنتی خصوصی‌تر، برای فردایی روشن‌تر.',
    footer: ['درباره ما', 'تماس با ما', 'قوانین', 'حریم خصوصی'],
    menu: 'بازکردن منو',
    close: 'بستن منو',
  },
  en: {
    direction: 'ltr',
    nav: ['Home', 'Features', 'Security', 'R.I.S.E Journal', 'FAQ'],
    login: 'Sign in',
    signup: 'Sign up',
    magazine: 'R.I.S.E Journal',
    eyebrow: 'Privacy for better conversations',
    titleA: 'Your address,',
    titleB: 'your space.',
    subtitle: 'A private, secure home for your conversations',
    create: 'Create a free address',
    trust: ['No tracking', 'End-to-end encrypted', 'Always available'],
    welcome: 'Welcome',
    choose: 'Choose your username',
    username: 'Username',
    address: 'Your private address',
    usernameHint: 'Choose a username to receive your private, secure R.I.S.E address.',
    continue: 'Continue',
    passwordTitle: 'Create a secure password',
    password: 'Password',
    passwordAgain: 'Repeat password',
    terms: 'I accept the terms of service and privacy policy.',
    back: 'Back',
    finish: 'Create account',
    creating: 'Creating account…',
    success: 'Your account was created successfully.',
    connection: 'Connection details',
    newAccount: 'Create another account',
    errors: {
      username: 'Use 3–32 letters, numbers, dots, hyphens, or underscores.',
      password: 'Your password must contain at least 12 characters.',
      mismatch: 'The passwords do not match.',
      terms: 'You must accept the terms to create an account.',
      network: 'Could not reach the server. Please try again shortly.',
    },
    stats: [
      ['500,000+', 'active users'],
      ['99.9%', 'privacy protection'],
      ['Available on', 'every device'],
      ['Secure, fast, intelligent', 'built for better conversations'],
    ],
    benefits: [
      ['End-to-end encryption', 'Every conversation is protected with end-to-end encryption.'],
      ['No tracking', 'We never profile your activity or sell data to advertisers.'],
      ['Always available', 'Reliable access from every device, whenever you need it.'],
      ['Space for bigger ideas', 'A calm, focused environment for thinking and creating.'],
    ],
    blogEyebrow: 'From the R.I.S.E Journal',
    blogTitle: 'Latest stories',
    blogSubtitle: 'Explore privacy, secure communication, and a more humane internet.',
    read: 'Read article',
    more: 'Show more articles',
    allShown: 'All articles are visible',
    noPosts: 'No articles have been published yet.',
    backHome: 'Back to home',
    footerTagline: 'A more private internet, for a brighter mind.',
    footer: ['About', 'Contact', 'Terms', 'Privacy'],
    menu: 'Open menu',
    close: 'Close menu',
  },
};

const fallbackPosts = [
  {
    slug: 'private-conversations',
    title: 'چرا گفت‌وگوی خصوصی اهمیت دارد؟',
    excerpt: 'حریم خصوصی فقط یک تنظیم نرم‌افزاری نیست؛ بخشی از حق انتخاب و آزادی ما در ارتباط است.',
    content: 'وقتی گفت‌وگوها خصوصی می‌مانند، افراد می‌توانند بدون نگرانی از ردیابی و پروفایل‌سازی با یکدیگر ارتباط برقرار کنند. R.I.S.E برای همین تجربه ساخته شده است: ارتباطی ساده، شفاف و تحت کنترل خود شما.',
    published_at: '2026-08-28T10:00:00Z',
    cover_url: '',
  },
  {
    slug: 'secure-password',
    title: 'راهنمای ساخت رمز عبور امن',
    excerpt: 'چند اصل ساده برای ساخت رمزی که هم به‌یادماندنی باشد و هم از حساب شما بهتر محافظت کند.',
    content: 'یک عبارت طولانی و منحصربه‌فرد انتخاب کنید و آن را در سرویس‌های دیگر تکرار نکنید. استفاده از مدیر رمز عبور و فعال‌کردن لایه‌های امنیتی تکمیلی، ریسک دسترسی غیرمجاز را به‌شدت کاهش می‌دهد.',
    published_at: '2026-08-19T10:00:00Z',
    cover_url: '',
  },
  {
    slug: 'delta-chat-relay',
    title: 'رله Delta Chat چگونه کار می‌کند؟',
    excerpt: 'نگاهی ساده به زیرساختی که پیام‌ها را امن، پایدار و مستقل میان دستگاه‌های شما جابه‌جا می‌کند.',
    content: 'رله R.I.S.E ورودی امن شما به سرویس‌های مرکزی است. اتصال‌ها با TLS محافظت می‌شوند و Stalwart مدیریت استاندارد حساب، SMTP و IMAP را انجام می‌دهد؛ بدون اینکه رمز مدیریتی در مرورگر قرار بگیرد.',
    published_at: '2026-08-08T10:00:00Z',
    cover_url: '',
  },
  {
    slug: 'digital-independence',
    title: 'استقلال دیجیتال از کجا شروع می‌شود؟',
    excerpt: 'انتخاب سرویس‌های باز و قابل اعتماد، قدم کوچکی است که کنترل بیشتری روی هویت دیجیتال می‌دهد.',
    content: 'استقلال دیجیتال یعنی بتوانید ابزار ارتباطی و محل نگهداری داده خود را آگاهانه انتخاب کنید. معماری چندرله‌ای R.I.S.E امکان توسعه سرویس‌های محلی با یک هسته امن و قابل مدیریت را فراهم می‌کند.',
    published_at: '2026-07-27T10:00:00Z',
    cover_url: '',
  },
  {
    slug: 'anti-tracking',
    title: 'ردیابی کمتر، تمرکز بیشتر',
    excerpt: 'وقتی محصولی برای جلب توجه ساخته نشده باشد، ارتباط دوباره ساده و انسانی می‌شود.',
    content: 'مدل‌های تبلیغاتی معمولاً به جمع‌آوری داده و نگه‌داشتن کاربر در صفحه وابسته‌اند. یک سرویس ارتباطی خصوصی می‌تواند هدف دیگری داشته باشد: رساندن پیام شما، بدون ایجاد پروفایل رفتاری.',
    published_at: '2026-07-13T10:00:00Z',
    cover_url: '',
  },
  {
    slug: 'open-protocols',
    title: 'قدرت پروتکل‌های باز',
    excerpt: 'استانداردهای باز کمک می‌کنند ارتباطات به یک شرکت یا یک اپلیکیشن خاص محدود نمانند.',
    content: 'SMTP، IMAP و JMAP استانداردهایی هستند که امکان تعامل میان ابزارهای مختلف را فراهم می‌کنند. استفاده از این پایه‌های باز، مهاجرت‌پذیری و دوام سرویس را افزایش می‌دهد.',
    published_at: '2026-06-30T10:00:00Z',
    cover_url: '',
  },
];

const benefitIcons = [LockKeyhole, ShieldCheck, Zap, MessageCircleMore];
const trustIcons = [LockKeyhole, ShieldCheck, Zap];
const statIcons = [UsersRound, ShieldCheck, Globe2, Sparkles];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="R.I.S.E home">
      <span className="brand-word">R.I.S.E</span>
      <span className="brand-mark">R</span>
      <small>A private space for better conversations</small>
    </a>
  );
}

function Topbar({ lang, setLang, text, onSignup, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    ['#top', text.nav[0]],
    ['#features', text.nav[1]],
    ['#security', text.nav[2]],
    ['#journal', text.nav[3]],
    ['#faq', text.nav[4]],
  ];

  return (
    <>
      <header className="topbar" id="top">
        <Logo />
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {items.map(([href, label], index) => (
            <a className={index === 0 ? 'active' : ''} href={href} key={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="mobile-nav-actions">
            <button type="button" className="outline-button">{text.login}</button>
            <button type="button" className="lime-button" onClick={onSignup}>{text.signup}</button>
          </div>
        </nav>
        <div className="top-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'deeper' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun size={17} />
            <Moon size={16} />
          </button>
          <button type="button" className="language-button" onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}>
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>
          <button type="button" className="outline-button desktop-only">{text.login}</button>
          <button type="button" className="lime-button desktop-only" onClick={onSignup}>
            {text.signup} <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? text.close : text.menu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <a className="mobile-magazine" href="#journal">
        <BookOpen size={18} />
        <span>{text.magazine}</span>
        <ChevronLeft size={20} />
      </a>
    </>
  );
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="field">
      <Icon size={20} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input aria-label={label} {...props} />
    </label>
  );
}

function SignupCard({ text, domain, spotlight, cardRef }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', password: '', password_confirmation: '', accept_terms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const username = form.username.trim().toLowerCase();

  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  }

  function nextStep() {
    if (!/^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/.test(username)) {
      setError(text.errors.username);
      return;
    }
    setStep(2);
  }

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 12) return setError(text.errors.password);
    if (form.password !== form.password_confirmation) return setError(text.errors.mismatch);
    if (!form.accept_terms) return setError(text.errors.terms);

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey() },
        body: JSON.stringify({ ...form, username }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload.detail || Object.values(payload).flat().find(Boolean) || text.errors.network;
        throw new Error(String(message));
      }
      setResult(payload);
    } catch (requestError) {
      // Browser network/CORS failures intentionally have no HTTP response.
      // Give the operator a useful local-development hint instead of exposing
      // the browser's unhelpful "Failed to fetch" message to an end user.
      setError(requestError instanceof TypeError ? text.errors.network : (requestError.message || text.errors.network));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setResult(null);
    setError('');
    setForm({ username: '', password: '', password_confirmation: '', accept_terms: false });
  }

  return (
    <section ref={cardRef} className={`signup-card${spotlight ? ' spotlight' : ''}`} aria-labelledby="signup-title">
      <div className="step-line">
        <b>{String(step).padStart(2, '0')}</b><span>/</span><span>02</span><i />
        <span className="welcome">👋 {text.welcome}</span>
      </div>

      {result ? (
        <div className="success-panel">
          <span className="success-icon"><Check /></span>
          <h2>{text.success}</h2>
          <div className="connection-box">
            <small>{text.connection}</small>
            <strong>{result.email || `${username}@${domain}`}</strong>
            {result.imap_host && <span>IMAP · {result.imap_host}</span>}
            {result.smtp_host && <span>SMTP · {result.smtp_host}</span>}
          </div>
          <button type="button" className="form-primary" onClick={reset}>{text.newAccount}</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          {step === 1 ? (
            <>
              <h2 id="signup-title"><UserRound size={21} /> {text.choose}</h2>
              <Field
                icon={UserRound}
                label={text.username}
                name="username"
                value={form.username}
                onChange={update}
                placeholder="yourname"
                autoComplete="username"
                inputMode="email"
                dir="ltr"
              />
              <div className="field static-field" dir="ltr">
                <Link2 size={20} />
                <span>{username || 'yourname'}@{domain}</span>
              </div>
              <p className="form-hint">{text.usernameHint}</p>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="button" className="form-primary" onClick={nextStep}>
                <ArrowLeft size={21} /> {text.continue}
              </button>
            </>
          ) : (
            <>
              <h2><LockKeyhole size={21} /> {text.passwordTitle}</h2>
              <Field
                icon={LockKeyhole}
                label={text.password}
                name="password"
                value={form.password}
                onChange={update}
                placeholder={text.password}
                type="password"
                autoComplete="new-password"
              />
              <Field
                icon={ShieldCheck}
                label={text.passwordAgain}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={update}
                placeholder={text.passwordAgain}
                type="password"
                autoComplete="new-password"
              />
              <label className="terms-check">
                <input type="checkbox" name="accept_terms" checked={form.accept_terms} onChange={update} />
                <span>{text.terms}</span>
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-buttons">
                <button type="button" className="form-secondary" onClick={() => setStep(1)}>{text.back}</button>
                <button type="submit" className="form-primary" disabled={loading}>
                  {loading ? text.creating : text.finish}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </section>
  );
}

function DeviceStage() {
  return (
    <div className="device-stage" aria-hidden="true">
      <span className="scribble">Private<br />Secure<br />Yours</span>
      <div className="laptop">
        <div className="laptop-screen">
          <div className="mock-sidebar">
            <b>R.I.S.E <i>R</i></b>
            <span className="selected">گفت‌وگوها</span>
            <span>خانه</span><span>تنظیمات</span><span>امنیت</span>
          </div>
          <div className="mock-chat"><i>R</i><strong>سلام!<br />چطور می‌توانم امروز<br />به شما کمک کنم؟</strong><span>پیام خود را بنویسید…</span></div>
        </div>
        <div className="laptop-base" />
      </div>
      <div className="phone">
        <div className="phone-top"><Moon size={9} /><b>R.I.S.E <i>R</i></b></div>
        <div className="phone-copy"><strong>آدرس شما،<br /><em>فضای شما.</em></strong><small>ارتباط امن و خصوصی</small></div>
        <div className="phone-menu"><span>گفت‌وگوی جدید</span><span>دوستان و مخاطبان</span><span>امنیت و پشتیبانی</span><span>تنظیمات</span></div>
      </div>
    </div>
  );
}

function BlogSection({ posts, text, lang, onOpen }) {
  const [visible, setVisible] = useState(3);
  const shown = posts.slice(0, visible);

  return (
    <section className="journal section-shell" id="journal">
      <div className="section-heading">
        <span>{text.blogEyebrow}</span>
        <h2>{text.blogTitle}</h2>
        <p>{text.blogSubtitle}</p>
      </div>
      {shown.length ? (
        <div className="post-grid">
          {shown.map((post, index) => (
            <article className="post-card" key={post.slug || post.id || index}>
              <div className={`post-art art-${index % 3}`} style={post.cover_url ? { backgroundImage: `url(${post.cover_url})` } : undefined}>
                {!post.cover_url && <><span /><i /><b>R</b></>}
              </div>
              <div className="post-body">
                <time>{new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.published_at || Date.now()))}</time>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button type="button" onClick={() => onOpen(post)}>{text.read} <ArrowLeft size={17} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="empty-posts">{text.noPosts}</p>}
      {posts.length > 3 && (
        <div className="load-more-wrap">
          {visible < posts.length ? (
            <button type="button" className="load-more" onClick={() => setVisible((count) => count + 3)}>
              {text.more}<ChevronLeft size={20} />
            </button>
          ) : <span className="all-shown"><Check size={17} /> {text.allShown}</span>}
        </div>
      )}
    </section>
  );
}

function ArticleView({ post, text, onBack }) {
  return (
    <main className="article-page">
      <button type="button" className="article-back" onClick={onBack}><ArrowRight size={19} /> {text.backHome}</button>
      <article>
        <div className="article-visual"><span>R.I.S.E</span></div>
        <time>{new Date(post.published_at || Date.now()).toLocaleDateString()}</time>
        <h1>{post.title}</h1>
        <p className="article-lead">{post.excerpt}</p>
        <div className="article-content">{post.content || post.excerpt}</div>
      </article>
    </main>
  );
}

function Footer({ text }) {
  return (
    <footer className="site-footer section-shell" id="faq">
      <Logo />
      <span className="footer-tagline">{text.footerTagline}</span>
      <nav>{text.footer.map((item) => <a href="#top" key={item}>{item}</a>)}</nav>
      <div className="socials"><Send /><X /><Camera /><CirclePlay /></div>
    </footer>
  );
}

function App() {
  const [lang, setLang] = useState('fa');
  const [theme, setTheme] = useState('dark');
  const [config, setConfig] = useState({ domain: 'riseai.com', registration_open: true });
  const [posts, setPosts] = useState(fallbackPosts);
  const [article, setArticle] = useState(null);
  const [spotlight, setSpotlight] = useState(false);
  const signupRef = useRef(null);
  const text = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = text.direction;
  }, [lang, text.direction]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      fetch(`${API_BASE}/config/`, { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject()),
      fetch(`${API_BASE}/blog/`, { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([configResponse, postsResponse]) => {
      if (configResponse.status === 'fulfilled') setConfig((current) => ({ ...current, ...configResponse.value }));
      if (postsResponse.status === 'fulfilled') {
        const data = postsResponse.value.results || postsResponse.value;
        if (Array.isArray(data) && data.length) setPosts(data);
      }
    });
    return () => controller.abort();
  }, []);

  const localizedPosts = useMemo(() => posts.map((post) => ({
    ...post,
    title: lang === 'en' ? (post.title_en || post.title) : (post.title_fa || post.title),
    excerpt: lang === 'en' ? (post.excerpt_en || post.excerpt) : (post.excerpt_fa || post.excerpt),
    content: lang === 'en' ? (post.content_en || post.content) : (post.content_fa || post.content),
  })), [posts, lang]);

  function focusSignup() {
    signupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSpotlight(true);
    window.setTimeout(() => setSpotlight(false), 1150);
  }

  function openArticle(post) {
    setArticle(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`app theme-${theme}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="page-shell">
        <Topbar lang={lang} setLang={setLang} text={text} onSignup={focusSignup} theme={theme} setTheme={setTheme} />
        {article ? (
          <ArticleView post={article} text={text} onBack={() => setArticle(null)} />
        ) : (
          <main>
            <section className="hero">
              <SignupCard text={text} domain={config.domain || 'riseai.com'} spotlight={spotlight} cardRef={signupRef} />
              <div className="hero-copy">
                <span className="hero-eyebrow">{text.eyebrow}</span>
                <h1>{text.titleA}<strong>{text.titleB}</strong></h1>
                <p>{text.subtitle}</p>
                <button type="button" className="mobile-primary-cta" onClick={focusSignup}>
                  {text.create}<ArrowLeft size={20} />
                </button>
                <div className="trust-row">
                  {text.trust.map((label, index) => {
                    const Icon = trustIcons[index];
                    return <div key={label}><Icon /><span>{label}</span></div>;
                  })}
                </div>
              </div>
              <DeviceStage />
            </section>

            <section className="stats-strip" aria-label="Service statistics">
              {text.stats.map(([value, label], index) => {
                const Icon = statIcons[index];
                return <div className={`stat stat-${index}`} key={label}><span className="stat-icon"><Icon /></span><p><strong>{value}</strong><small>{label}</small></p></div>;
              })}
            </section>

            <section className="benefits section-shell" id="features">
              {text.benefits.map(([title, body], index) => {
                const Icon = benefitIcons[index];
                return <article id={index === 0 ? 'security' : undefined} key={title}><span><Icon /></span><div><h2>{title}</h2><p>{body}</p></div></article>;
              })}
            </section>

            <BlogSection posts={localizedPosts} text={text} lang={lang} onOpen={openArticle} />
          </main>
        )}
        <Footer text={text} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
