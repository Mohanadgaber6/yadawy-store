// ============================================================
// YADAWY ARABIC PAGE RENDERERS
// Professional, natural, non-literal Arabic translations
// ============================================================

// 1. ABOUT / OUR STORY PAGE (ARABIC)
function renderAboutPageArabic(config = {}) {
    setTimeout(() => {
        if (typeof window.initStoryBrandVideo === 'function') {
            window.initStoryBrandVideo();
        }
    }, 50);

    return `
        <div class="story-page-wrapper" dir="rtl">
            <!-- 1. EDITORIAL HERO HEADER -->
            <header class="story-hero">
                <div class="story-hero-inner">
                    <div class="story-badge">
                        <span class="story-badge-icon">✦</span>
                        <span>فن النسيج اليدوي المصري الأصيل</span>
                        <span class="story-badge-icon">✦</span>
                    </div>
                    <h1 class="story-hero-title">قصتنا وأصالة التراث</h1>
                    <p class="story-hero-subtitle">"يدوي.. قطعة تروي حكاية."</p>
                </div>
            </header>

            <!-- 2. PROMINENT CINEMATIC BRAND FILM -->
            <section class="story-film-section" aria-label="Brand Film">
                <div class="story-film-container">
                    <div class="story-film-frame" id="story-video-wrapper" onclick="handleStoryVideoFrameClick(event)">
                        <video 
                            id="story-brand-video"
                            class="story-film-video"
                            autoplay 
                            playsinline
                            webkit-playsinline
                            loop
                            preload="auto"
                            poster="/images/story/brand_film_poster.jpg"
                        >
                            <source src="/images/story/fixed-video.mp4" type="video/mp4">
                            <source src="/uploads/videos/our_story_brand_film.mp4" type="video/mp4">
                            متصفحك لا يدعم تشغيل الفيديو.
                        </video>
                        <div class="story-film-overlay">
                            <div class="story-film-tag">
                                <span class="tag-pulse"></span>
                                <span>فيديو الحرفة التراثية الحية</span>
                            </div>
                            <div class="story-film-controls">
                                <button type="button" id="story-sound-btn" class="story-film-btn" onclick="toggleStoryVideoSound(event, this)" aria-label="تشغيل الصوت">
                                    <span class="btn-icon">${SVG_ICONS.soundOff || ''}</span>
                                    <span class="btn-text">تشغيل الصوت</span>
                                </button>
                                <button type="button" id="story-play-btn" class="story-film-btn paused" onclick="toggleStoryVideoPlay(event, this)" aria-label="إيقاف / تشغيل">
                                    <span class="btn-icon">${SVG_ICONS.play || '▶'}</span>
                                    <span class="btn-text">تشغيل</span>
                                </button>
                            </div>
                        </div>
                        <div id="story-sound-prompt" class="story-sound-prompt" onclick="enableStoryVideoSound(event)">
                            <span class="prompt-icon">${SVG_ICONS.soundOn || '🔊'}</span>
                            <span class="prompt-text">مشاهدة مع الصوت</span>
                        </div>
                    </div>
                    <div class="story-film-caption">
                        <span class="caption-line"></span>
                        <p class="caption-text">داخل ورش يدوي: نساجون مصريون ينسجون كل خيط وعقدة يدوياً على نول خشبي تقليدي متوارث عبر الأجيال.</p>
                        <span class="caption-line"></span>
                    </div>
                </div>
            </section>

            <div class="story-content-container">
                <!-- 3. LEAD QUOTE & ARTISAN FOUNDATION -->
                <section class="story-quote-section">
                    <div class="story-quote-grid">
                        <div class="story-quote-card">
                            <div class="quote-mark">“</div>
                            <blockquote class="editorial-quote-text">
                                "كل قطعة من يدوي تصنع يدوياً بنسبة 100% بأنامل أمهر الحرفيين المصريين باستخدام تقنيات النول التقليدية المتوارثة. كل سجادة أو كليم تحفة متفردة يستغرق إبداعها أسابيع من الصبر والشغف."
                            </blockquote>
                            <div class="quote-signature">
                                <span class="signature-line"></span>
                                <span class="signature-label">حرفيو ومعلمو يدوي</span>
                            </div>
                        </div>
                        <div class="story-quote-image-wrap">
                            <img 
                                src="/images/story/story_artisan_loom.webp" 
                                alt="حرفي مصري ينسج على نول خشبي تقليدي" 
                                class="story-quote-image"
                                loading="lazy"
                            />
                            <div class="image-corner-tag">صناعة يدوية في مصر</div>
                        </div>
                    </div>
                </section>

                <!-- 4. CHAPTER 01: THE STORY BEHIND EGYPTIAN KILIMS -->
                <section class="story-chapter-split">
                    <div class="story-chapter-text-col">
                        <div class="chapter-eyebrow">
                            <span class="eyebrow-num">01</span>
                            <span class="eyebrow-divider">/</span>
                            <span class="eyebrow-title">الأصالة والجذور</span>
                        </div>
                        <h2 class="editorial-block-title">حكاية الكليم والسجاد اليدوي المصري</h2>
                        <div class="story-paragraphs">
                            <p class="editorial-text">
                                يُعد الكليم المصري جزءاً لا يتجزأ من تراث الحرف اليدوية الأصيلة الممتدة لآلاف السنين. فمن خلال ألوانه الحية ونقوشه الهندسية البديعة، تعكس كل قطعة حكاية وروح الحرفي الذي أبدعها.
                            </p>
                            <p class="editorial-text">
                                في <strong>يدوي</strong>، نحيي هذا التراث العريق بتقديم قطع طبيعية فريدة، تمنح مساحتك الدفء والفخامة وشخصية مميزة لا تتكرر.
                            </p>
                        </div>
                        <div class="story-detail-badges">
                            <div class="detail-badge-item">
                                <span class="detail-icon">✦</span>
                                <div>
                                    <strong>تراث حي متصل</strong>
                                    <span>قرون من إرث حياكة السجاد في مصر</span>
                                </div>
                            </div>
                            <div class="detail-badge-item">
                                <span class="detail-icon">✦</span>
                                <div>
                                    <strong>قطعة فريدة واحدة</strong>
                                    <span>لا توجد قطعتان متطابقتان تماماً</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="story-chapter-media-col">
                        <div class="story-media-stack">
                            <div class="story-image-frame primary-frame">
                                <img 
                                    src="/images/story/story_editorial_rug_vignette.webp" 
                                    alt="كليم مصري أصيل في غرفة معيشة راقية" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <div class="story-photo-caption">كليم مصري أصيل يضفي دفئاً وسحراً استثنائياً على ديكور منزلك</div>
                            </div>
                            <div class="story-image-frame secondary-inset">
                                <img 
                                    src="/images/story/story_interior_detail.webp" 
                                    alt="تفاصيل النسيج اليدوي الفاخر" 
                                    class="story-photo-inset"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 5. FULL-WIDTH ATMOSPHERIC CRAFT INTERLUDE -->
                <section class="story-visual-break" aria-label="Visual Craftsmanship Showcase">
                    <div class="story-visual-break-inner">
                        <img 
                            src="/images/story/story_workshop_heritage.webp" 
                            alt="ورش صناعة السجاد والكليم اليدوي" 
                            class="story-visual-break-img"
                            loading="lazy"
                        />
                        <div class="story-visual-break-scrim">
                            <div class="story-break-content">
                                <span class="break-tag">أناقة أصيلة تدوم لأجيال</span>
                                <h3 class="break-quote">"نسيج من روح مصر، صُنع ليمنح كل بيت دفئاً وفخامة لا تزول."</h3>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 6. CHAPTER 02: MATERIALS & CRAFTSMANSHIP -->
                <section class="story-chapter-split reverse-split">
                    <div class="story-chapter-media-col">
                        <div class="story-media-dual">
                            <div class="dual-image-card">
                                <img 
                                    src="/images/story/story_wool_macro.webp" 
                                    alt="خيوط صوف مصري طبيعي مغزول يدوياً" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <span class="dual-caption">صوف مصري طبيعي خالص</span>
                            </div>
                            <div class="dual-image-card">
                                <img 
                                    src="/images/story/story_editorial_craft_detail.webp" 
                                    alt="سدى قطني متين للنسيج اليدوي" 
                                    class="story-photo"
                                    loading="lazy"
                                />
                                <span class="dual-caption">قاعدة قطنية متينة</span>
                            </div>
                        </div>
                    </div>
                    <div class="story-chapter-text-col">
                        <div class="chapter-eyebrow">
                            <span class="eyebrow-num">02</span>
                            <span class="eyebrow-divider">/</span>
                            <span class="eyebrow-title">الخامات والإتقان</span>
                        </div>
                        <h2 class="editorial-block-title">الخامات الطبيعية والحرفية العالية</h2>
                        <div class="story-paragraphs">
                            <p class="editorial-text">
                                تُنسج قطعنا من أجود خيوط الصوف المصري النقي على سدى قطني متين، اختيرت بعناية فائقة لتضمن عمراً طويلاً وملمساً أصيلاً يزداد جمالاً مع مرور الزمن.
                            </p>
                            <p class="editorial-text">
                                مع العناية البسيطة الصحيحة، يدوم كليم وسجاد يدوي لأكثر من <strong>20 إلى 50 عاماً وأكثر</strong>. ولضمان ثقتك وراحة بالك التامة، تأتي كل قطعة من يدوي مصحوبة بـ <strong>ضمان لمدة عام كامل</strong> مع توفير خدمات التنظيف والعناية المتخصصة.
                            </p>
                        </div>
                        <div class="story-durability-banner">
                            <div class="durability-item">
                                <span class="durability-num">20–50+</span>
                                <span class="durability-label">سنة عمر افتراضي</span>
                            </div>
                            <div class="durability-divider"></div>
                            <div class="durability-item">
                                <span class="durability-num">سنة كاملة</span>
                                <span class="durability-label">ضمان شامل معتمد</span>
                            </div>
                            <div class="durability-divider"></div>
                            <div class="durability-item">
                                <span class="durability-num">100%</span>
                                <span class="durability-label">ألياف طبيعية نقية</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 7. BRAND PILLARS GRID -->
                <section class="story-pillars-section">
                    <div class="pillars-section-header">
                        <span class="pillars-badge">التزامنا تجاهكم</span>
                        <h3 class="pillars-main-title">وعد يدوي لعملائنا</h3>
                    </div>
                    <div class="about-pillars-grid">
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">صناعة يدوية 100%</h3>
                            <p class="pillar-text">منسوجة خيطاً بخيط وعقدة بعقدة على نول تقليدي بأيدي حرفيين مصريين مهرة.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">صوف مصري خالص</h3>
                            <p class="pillar-text">أصواف طبيعية محلية منتقاة بعناية على قاعدة قطنية متينة وعالية التحمل.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">ضمان لمدة عام</h3>
                            <p class="pillar-text">ضمان كامل ضد عيوب الصناعة مع توفير خدمات الاستشارات والتنظيف المتخصص.</p>
                        </div>
                        <div class="about-pillar-card">
                            <div class="pillar-icon-box">
                                <span class="pillar-icon">✦</span>
                            </div>
                            <h3 class="pillar-title">توصيل لكافة المحافظات</h3>
                            <p class="pillar-text">توصيل خلال 3–5 أيام عمل للقاهرة، الإسكندرية، الجيزة وكافة المحافظات مع الدفع عند الاستلام.</p>
                        </div>
                    </div>
                </section>

                <!-- 8. EDITORIAL ACTION & CONCIERGE BAR -->
                <section class="story-cta-section">
                    <div class="story-cta-card">
                        <div class="cta-badge">اكتشف يدوي</div>
                        <h3 class="cta-title">اقتنِ قطعة مصرية أصيلة تحكي قصة منزلك</h3>
                        <p class="cta-subtitle">تصفح الكتالوج الكامل أو تواصل مباشرة مع خبرائنا لاختيار المقاس المثالي.</p>
                        <div class="editorial-cta-bar">
                            <a href="#/kilim-guide" class="editorial-btn">دليل الكليم اليدوي ←</a>
                            <a href="#/shop" class="editorial-btn-secondary">تصفح المجموعة ←</a>
                            <a href="https://wa.me/201069005565" target="_blank" rel="noopener" class="editorial-btn-whatsapp">
                                <span style="display:inline-flex; align-items:center; gap:8px;">${SVG_ICONS.whatsapp}<span>محادثة واتساب مباشرة</span></span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
}

// 2. CONTACT US PAGE (ARABIC)
function renderContactPageArabic(config = {}) {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">يسعدنا التواصل معك دائماً</div>
            <h1 class="editorial-hero-title">تواصل معنا</h1>
            <p class="editorial-hero-subtitle">فريق يدوي جاهز لمساعدتك في اختيار المقاس والتصميم المثالي لمساحتك.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="contact-grid-layout">
                <!-- Right: Official Contact Cards -->
                <div class="contact-channels-column">
                    <!-- Mobile Phones Card -->
                    <div class="contact-channel-card">
                        <div class="channel-card-header">
                            <span class="channel-card-icon">${SVG_ICONS.whatsapp}</span>
                            <div>
                                <h3 class="channel-card-title">الهاتف المحمول وواتساب</h3>
                                <p class="channel-card-subtitle">للاستفسارات والطلبات المباشرة ومساعدة المقاسات</p>
                            </div>
                        </div>
                        <div class="channel-links-group">
                            <div class="channel-item">
                                <a href="tel:01069005565" class="channel-phone-link">0106 900 5565</a>
                                <a href="https://wa.me/201069005565" target="_blank" rel="noopener" class="channel-wa-badge">محادثة واتساب ←</a>
                            </div>
                            <div class="channel-item">
                                <a href="tel:01039555155" class="channel-phone-link">0103 955 5155</a>
                                <a href="https://wa.me/201039555155" target="_blank" rel="noopener" class="channel-wa-badge">محادثة واتساب ←</a>
                            </div>
                            <div class="channel-item">
                                <a href="tel:01225910140" class="channel-phone-link">0122 591 0140</a>
                                <span class="channel-phone-badge">مكالمات فقط</span>
                            </div>
                        </div>
                    </div>

                    <!-- Landline Card -->
                    <div class="contact-channel-card">
                        <div class="channel-card-header">
                            <span class="channel-card-icon">${SVG_ICONS.phone}</span>
                            <div>
                                <h3 class="channel-card-title">الهاتف الأرضي</h3>
                                <p class="channel-card-subtitle">اتصال هاتفي مباشر</p>
                            </div>
                        </div>
                        <div class="channel-links-group">
                            <a href="tel:035427565" class="channel-phone-link highlight">03 542 7565</a>
                        </div>
                    </div>

                    <!-- Direct Order Assurance -->
                    <div class="contact-assurance-box" style="background:#FAF7F2; border:1px solid var(--color-gold); border-radius:6px; padding:18px;">
                        <h4 style="color:var(--color-maroon); margin-bottom:8px; font-size:14px; font-weight:700;">خدمة الشحن والمعاينة عند الاستلام</h4>
                        <p style="font-size:13px; line-height:1.6; color:var(--color-text-secondary); margin:0;">
                            نوفر خدمة التوصيل السريع لباب المنزل مع إمكانية المعاينة قبل السداد لكافة مناطق القاهرة والإسكندرية والجيزة ومختلف محافظات مصر.
                        </p>
                    </div>
                </div>

                <!-- Left: Contact Form -->
                <div class="contact-form-column">
                    <div class="contact-form-card">
                        <h2 class="contact-form-title">أرسل لنا استفسارك</h2>
                        <p class="contact-form-subtitle">يرجى كتابة رسالتك وسيتواصل معك فريق خدمة العملاء في أقرب وقت.</p>

                        <form id="contact-form" onsubmit="handleContactSubmit(event)">
                            <div class="form-group">
                                <label class="form-label">الاسم بالكامل *</label>
                                <input type="text" class="form-input" name="name" required placeholder="أدخل اسمك الكريم">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف أو واتساب *</label>
                                    <input type="tel" class="form-input" name="phone" required placeholder="01XXXXXXXXX">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني (اختياري)</label>
                                    <input type="email" class="form-input" name="email" placeholder="name@example.com">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">موضوع الاستفسار</label>
                                <input type="text" class="form-input" name="subject" placeholder="مثال: استفسار عن مقاس كليم معين">
                            </div>
                            <div class="form-group">
                                <label class="form-label">الرسالة أو التفاصيل *</label>
                                <textarea class="form-textarea" name="message" required rows="4" placeholder="اكتب استفسارك بالتفصيل..."></textarea>
                            </div>
                            <button type="submit" class="contact-submit-btn" id="contact-submit-btn">إرسال الرسالة</button>
                        </form>
                        <div id="contact-msg" style="margin-top:14px; font-size:13px; font-weight:600;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 3. RETURN & REFUND POLICY PAGE (ARABIC)
function renderReturnPolicyPageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">عناية العميل وضمان الجودة</div>
            <h1 class="editorial-hero-title">سياسة الاستبدال والاسترجاع</h1>
            <p class="editorial-hero-subtitle">تسوق بكل ثقة وراحة بال تامة من مرحلة الاختيار وحتى استلام قطعتك.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="policy-card">
                <p class="policy-intro">
                    في "يدوي"، نحرص دائماً على أن تكون تجربة اقتنائك لقطعنا التراثية تجربة مريحة وموثوقة، وتليق بقيمة فن النسيج اليدوي.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">مهلة الاستبدال والاسترجاع (14 يوماً)</h2>
                    <p class="policy-text">
                        يحق لك طلب استبدال أو استرجاع المنتج خلال <strong>14 يوماً من تاريخ استلام الطلب</strong>، بشرط أن تكون القطعة بحالتها الأصلية تماماً، غير مستخدمة، ومحتفظة بغلافها الأصلي وبطاقات التعريف الخاصة بها.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">المنتجات المستثناة من الاسترجاع</h2>
                    <ul class="policy-list">
                        <li>القطع المصنوعة خصيصاً بمقاسات أو تصميمات مفصلة بناءً على طلب العميل.</li>
                        <li>المنتجات المباعة ضمن عروض التصفية النهائية، ما لم يوجد بها عيب مصنعي مثبت.</li>
                    </ul>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">القطع المتضررة أو غير المطابقة</h2>
                    <p class="policy-text">
                        في حال وصول قطعة متضررة أو غير مطابقة لطلبك، يرجى التواصل معنا خلال <strong>48 ساعة من الاستلام</strong> مع إرفاق صور واضحة، وسيقوم فريقنا باستبدال القطعة فوراً دون أي تكلفة إضافية عليك.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">آلية استرداد الأموال</h2>
                    <ul class="policy-list">
                        <li>بمجرد استلام القطعة المرتجعة وفحص حالتها والتأكد من سلامتها، يتم رد المبلغ خلال <strong>7 إلى 10 أيام عمل</strong> بنفس طريقة السداد الأصلية.</li>
                        <li>يتحمل العميل مصاريف شحن الإرجاع إلا إذا كان سبب الاسترجاع عيباً في الصناعة أو خطأ من جانبنا.</li>
                    </ul>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">هل تحتاج لمساعدة في الاسترجاع أو الاستبدال؟</h3>
                    <p class="policy-contact-desc">فريق خدمة العملاء متواجد لمساعدتك في أي وقت:</p>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201039555155" style="font-weight:700; color:var(--color-maroon);"><bdi dir="ltr">0103 955 5155</bdi></a>
                    </div>
                    <div class="policy-contact-landline">الهاتف الأرضي: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">يدوي.. قطعة تروي حكاية.</p>
                </div>
            </div>
        </div>
    `;
}

// 4. SHIPPING POLICY PAGE (ARABIC)
function renderShippingPolicyPageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">الشحن والتسليم</div>
            <h1 class="editorial-hero-title">سياسة الشحن والتوصيل</h1>
            <p class="editorial-hero-subtitle">كل قطعة من يدوي تروي حكاية، ونحن نحرص على وصولها إليك بأعلى درجات الأمان والعناية.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="policy-card">
                <p class="policy-intro">
                    نهتم بوصول سجادك وكليمك بأفضل حالة، مغلفاً بعناية فائقة ضد الأتربة والرطوبة لضمان حماية الألياف الطبيعية أثناء النقل.
                </p>

                <div class="policy-section-block">
                    <h2 class="policy-heading">نطاق التغطية ومواعيد التوصيل</h2>
                    <p class="policy-text">
                        نشحن حالياً داخل <strong>جمهورية مصر العربية</strong> لكافة مناطق القاهرة، الجيزة، الإسكندرية، وجميع المدن ومحافظات الوجهين البحري والقبلي.
                    </p>
                    <p class="policy-text">
                        يتم التوصيل عادةً خلال <strong>3 إلى 5 أيام عمل</strong> للقطع المتوفرة بالمخزون.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">تكلفة الشحن</h2>
                    <p class="policy-text">
                        تُحسب تكلفة الشحن بوضوح عند إتمام الطلب وتظهر في ملخص الفاتورة قبل التأكيد النهائي.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">متابعة مسار الشحنة</h2>
                    <p class="policy-text">
                        بمجرد خروج طلبك للشحن، يتم إرسال بيانات المتابعة ورقم بوليصة الشحن عبر <strong>رسالة نصية SMS</strong> ورسالة بريد إلكتروني.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">طريقة الدفع والمعاينة</h2>
                    <p class="policy-text">
                        نوفر ميزة <strong>الدفع نقداً عند الاستلام (COD)</strong> مع أحقية المعاينة الكاملة للتأكد من جودة وأبعاد القطعة قبل إتمام السداد لمندوب الشحن.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <h3 class="policy-contact-title">لأي استفسار بخصوص شحنتك</h3>
                    <div class="policy-contact-numbers">
                        <a href="tel:+201069005565" style="font-weight:700; color:var(--color-maroon);">0106 900 5565</a>
                    </div>
                    <div class="policy-contact-landline">الهاتف الأرضي: <a href="tel:035427565">03 542 7565</a></div>
                    <p class="policy-tagline">يدوي.. قطعة تروي حكاية.</p>
                </div>
            </div>
        </div>
    `;
}

// 5. FREQUENTLY ASKED QUESTIONS (FAQS) PAGE (ARABIC)
function renderFaqPageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">الأسئلة الشائعة والمساعدة</div>
            <h1 class="editorial-hero-title">الأسئلة الأكثر تكراراً</h1>
            <p class="editorial-hero-subtitle">تعرف على عالم الكليم والسجاد اليدوي مع يدوي — من أسرار الحرفة والخامات حتى اختيار المقاس والعناية.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <!-- Category 1 -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">عن الكليم والسجاد والحرفة اليدوية</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>ما هو الكليم اليدوي وما الفرق بينه وبين السجاد التقليدي؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            الكليم هو نسيج يدوي مسطح يُصنع بدون وبرة أو عقد بارزة، مما يجعله خفيف الوزن وسهل النقل والتنظيف وعملياً للغاية. بينما السجاد التقليدي يتميز بوجود وبرة سميكة وعقد كثيفة.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>هل كل منتجات يدوي مصنوعة يدوياً بالفعل؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            نعم بكل تأكيد! كل قطعة في "يدوي" تصنع يدوياً بنسبة 100% بأنامل حرفيين ونساجين مصريين مهرة على أنوال خشبية تقليدية متوارثة، وكل قطعة فريدة تستغرق أسابيع لإتمامها.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>ما هي الخامات المستخدمة في صناعة كليم وسجاد يدوي؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            نستخدم أجود خيوط الصوف المصري الطبيعي الخالص على قاعدة (سدى) من القطن المصري المتين لضمان ثبات القطعة ومتانتها الفائقة.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>كم سنة يدوم الكليم اليدوي؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            مع العناية البسيطة الصحيحة، يدوم الكليم اليدوي من 20 إلى 50 عاماً أو أكثر، ويزداد رونقه وقيمته مع مرور السنين. كما تأتي كل قطعة من يدوي بضمان رسمي لمدة عام كامل.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category 2 -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">العناية والتنظيف والخدمات</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>كيف أنظف الكليم في المنزل؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            يُفضل استخدام المكنسة الكهربائية على سرعة هادئة بدون الفرشاة الدوارة. وفي حال حدوث بقعة، تُجفف فوراً بقطعة قماش قطنية بيضاء نظيفة بضغط خفيف مع ماء فاتر وصابون صوف معتدل، وتجنب الفرك الشديد.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>هل توفرون خدمة تنظيف احترافي للسجاد؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            نعم، نوفر لعملائنا الكرام خدمة غسيل وتنظيف احترافي متخصص بالقطع المنسوجة يدوياً لحماية الأصباغ الطبيعية والصوف الأصيل.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category 3 -->
            <div class="faq-category-card">
                <h2 class="faq-category-title">الطلب، الشحن، والدفع</h2>
                <div class="faq-items-list">
                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>هل يمكنني معاينة القطعة قبل الدفع؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            نعم تماماً، نوفر خدمة الدفع عند الاستلام مع إمكانية فحص ومعاينة القطعة والتأكد من أبعادها وجودتها قبل سداد قيمتها للمندوب.
                        </div>
                    </div>

                    <div class="faq-accordion-item">
                        <button class="faq-question-btn" onclick="toggleFaq(this)">
                            <span>كم يستغرق توصيل الطلب؟</span>
                            <span class="faq-toggle-icon">+</span>
                        </button>
                        <div class="faq-answer-body">
                            يستغرق التوصيل عادةً ما بين 3 إلى 5 أيام عمل لكافة محافظات مصر.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 6. KILIM GUIDE PAGE ("WHAT IS A KILIM RUG?") (ARABIC)
function renderKilimGuidePageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">دليل المعرفة والنسيج</div>
            <h1 class="editorial-hero-title">ما هو الكليم اليدوي؟</h1>
            <p class="editorial-hero-subtitle">فن النسيج المسطح الأصيل الذي يجمع بين عراقة التراث وإتقان الصنعة اليدوية.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="guide-article">
                <!-- Section 1 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">1. تعريف الكليم اليدوي</h2>
                    <p class="guide-section-text">
                        الكليم هو نوع من السجاد المنسوج يدوياً بنظام النسيج المسطح بدون وبرة أو عقد بارزة. يتميز بخفة وزنه وقوة تحمله وجمال نقوشه الهندسية التراثية.
                    </p>
                    <p class="guide-section-text">
                        تتميز كل قطعة بطابعها الخاص، وتضفي لمسة من الدفء والأصالة على الأرضيات أو حتى المعلقات الجدارية.
                    </p>
                </div>

                <!-- Section 2 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">2. الفرق بين الكليم والسجاد التقليدي</h2>
                    <p class="guide-section-text">
                        يكمن الفارق الجوهري في طريقة الصنع؛ فالكليم منسوج نسيجاً مسطحاً وخفيفاً يسهل لفه وتغيير مكانه بسهولة، بينما السجاد ذو الوبرة يكون أكثر سماكة وثقلاً.
                    </p>
                    <p class="guide-section-text">
                        يعتمد الاختيار بينهما على طبيعة المكان واستخدامك المفضل والديكور العام للمنزل.
                    </p>
                </div>

                <!-- Section 3 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">3. كيف يُصنع الكليم اليدوي؟</h2>
                    <p class="guide-section-text">
                        يُنسج الكليم يدوياً على نول خشبي عمودي، حيث يمرر الحرفي خيوط اللحمة الصوفية بين خيوط السدى القطنية بحركات محسوبة لتشكيل الزخارف والنقوش صفاً بعد صف.
                    </p>
                    <p class="guide-section-text">
                        وبعد اكتمال الرسم، تُعقد الأطراف وتُشطب الحواف يدوياً بعناية متناهية. إنها عملية تتطلب وقتاً ومهارة فائقة تجعل من كل قطعة عملاً فنياً لا نظير له.
                    </p>
                </div>

                <!-- Section 4 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">4. نصائح أساسية للعناية بالكليم</h2>
                    <ul class="guide-checklist">
                        <li>✦ كنس هادئ ومنتظم بالمكنسة الكهربائية دون استخدام الفرشاة الدوارة.</li>
                        <li>✦ تجفيف الانسكابات فوراً بقطعة قماش قطنية نظيفة دون فرك.</li>
                        <li>✦ تجنب تعريض القطعة لأشعة الشمس الحارقة المباشرة لفترات طويلة.</li>
                        <li>✦ الاستعانة بالتنظيف المتخصص لدى خبراء السجاد اليدوي عند الحاجة.</li>
                        <li>✦ عند التخزين، يُلف الكليم رولاً ولا يُطوى لتجنب ظهور الثنيات.</li>
                    </ul>
                </div>

                <!-- Section 5 -->
                <div class="guide-section-block">
                    <h2 class="guide-section-title">5. حكاية الكليم في الثقافة المصرية</h2>
                    <p class="guide-section-text">
                        يمثل الكليم المصري تراثاً حياً متوارثاً عبر مئات السنين في قرى وواحات مصر. ومن خلال ألوانه المستوحاة من الطبيعة وتشكيلاته الرمزية، يعكس هوية الحرفي المصري وبيئته الغنية.
                    </p>
                    <p class="guide-section-text">
                        في "يدوي"، نحتفي بهذا الفن العريق ونقدمه بلمسة راقية تناسب أرقى المنازل العصرية.
                    </p>
                </div>

                <div class="policy-contact-box" style="margin-top:40px">
                    <p class="policy-tagline" style="font-size:18px">يدوي.. قطعة تروي حكاية.</p>
                    <div style="margin-top:16px">
                        <a href="#/shop?section=kilims" class="editorial-btn">تصفح مجموعة الكليم الأصيل ←</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 7. SIZE GUIDE PAGE (ARABIC)
function renderSizeGuidePageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">دليل المقاسات والأبعاد</div>
            <h1 class="editorial-hero-title">دليل اختيار المقاس المثالي</h1>
            <p class="editorial-hero-subtitle">نصائح وإرشادات لمساعدتك على اختيار المقاس الأنسب لغرفة المعيشة وغرفة النوم وطاولة الطعام.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="guide-article">
                <div class="guide-section-block">
                    <h2 class="guide-section-title">1. غرفة المعيشة والأنتريه</h2>
                    <p class="guide-section-text">
                        • <strong>المقاسات الكبيرة (200×300 سم أو 250×350 سم):</strong> تُوضع بحيث تستقر الأرجل الأمامية للكنب والكراسي فوق السجادة، مما يمنح الغرفة ترابطاً وفخامة بصرية مريحة.
                    </p>
                    <p class="guide-section-text">
                        • <strong>المقاسات المتوسطة (160×240 سم أو 140×200 سم):</strong> مثالية لتحديد منطقة الجلسة وتربيزة الصالون مع ترك مسافة حرة حول الأثاث.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">2. غرفة السفرة وطاولة الطعام</h2>
                    <p class="guide-section-text">
                        يجب أن تمتد السجادة أو الكليم مسافة <strong>60 إلى 75 سم</strong> على الأقل خارج أطراف الطاولة من جميع الجهات، حتى تظل أرجل الكراسي بالكامل فوق السجادة عند سحبها للجلوس.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">3. غرفة النوم</h2>
                    <p class="guide-section-text">
                        • <strong>سجادة رئيسية أسفل السرير:</strong> تمتد أسفل الثلثين السفليين من السرير وتبرز من الجانبين لتوفر موطئ قدم ناعم ودافئ عند الاستيقاظ.
                    </p>
                    <p class="guide-section-text">
                        • <strong>مشايات جانبية (Runners):</strong> مقاس 80×150 سم أو 80×200 سم على جانبي السرير وأسفل القدمين.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">4. الممرات والمداخل</h2>
                    <p class="guide-section-text">
                        مشايات الممرات الأنيقة تضفي عمقاً وترحيباً دافئاً على مدخل البيت، ويُفضل ترك مسافة 10-15 سم من الأرضية ظاهرة على الجانبين.
                    </p>
                </div>

                <div class="policy-contact-box" style="margin-top:40px">
                    <h3 class="policy-contact-title">محتار في تحديد المقاس؟</h3>
                    <p class="policy-contact-desc">فريقنا يسعده مساعدتك في اختيار المقاس المناسب لمساحة منزلك مجاناً:</p>
                    <div style="margin-top:14px">
                        <a href="https://wa.me/201069005565" target="_blank" rel="noopener" class="editorial-btn-whatsapp" style="display:inline-flex; align-items:center; gap:8px;">
                            ${SVG_ICONS.whatsapp}
                            <span>استشارة مقاسات عبر واتساب</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 8. CARE GUIDE PAGE (ARABIC)
function renderCareGuidePageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">إرشادات العناية والتنظيف</div>
            <h1 class="editorial-hero-title">دليل العناية بالسجاد والكليم اليدوي</h1>
            <p class="editorial-hero-subtitle">خطوات بسيطة وسهلة للحفاظ على نضارة الصوف الطبيعي والألوان لتدوم لأجيال.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="guide-article">
                <div class="guide-section-block">
                    <h2 class="guide-section-title">1. الكنس الدوري اليومي والأسبوعي</h2>
                    <p class="guide-section-text">
                        يُكنس الكليم والسجاد بانتظام باستخدام المكنسة الكهربائية على قوة شفط هادئة، مع تحريك الفوهة باتجاه اتجاه نسج الصوف. تجنب تماماً استخدام الفرشاة الدوارة التوربينية حتى لا تسحب خيوط الصوف الدقيقة.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">2. التعامل الفوري مع الانسكابات الطارئة</h2>
                    <p class="guide-section-text">
                        • جفف السائل المنسكب فوراً بالضغط بقطعة قماش قطنية بيضاء نظيفة أو مناديل ورقية سميكة لامتصاص السائل قبل أن يتغلغل في الألياف.
                    </p>
                    <p class="guide-section-text">
                        • <strong>تنبيه هام:</strong> لا تفرك البقعة أبداً حتى لا تنتشر إلى مساحة أوسع، بل اضغط برفق من الخارج باتجاه الداخل.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">3. تدوير السجادة بانتظام</h2>
                    <p class="guide-section-text">
                        يُنصح بتدوير السجادة 180 درجة كل 6 إلى 12 شهراً لضمان توزيع متوازن للمشي وحركة الأقدام وضوء النهار عبر جميع أجزائها.
                    </p>
                </div>

                <div class="guide-section-block">
                    <h2 class="guide-section-title">4. التخزين الموسمي الصحيح</h2>
                    <p class="guide-section-text">
                        عند الرغبة في تخزين السجادة، قم بلفها على شكل أسطوانة (رول) مع جعل وجه السجادة للداخل، واحفظها في مكان جاف وجيد التهوية بعيداً عن الرطوبة وأشعة الشمس المباشرة. لا تطوِ السجادة أبداً لتفادي تكسر الخطوط.
                    </p>
                </div>

                <div class="policy-contact-box" style="margin-top:40px">
                    <h3 class="policy-contact-title">خدمة التنظيف الاحترافي المتخصص</h3>
                    <p class="policy-contact-desc">نوفر خدمة غسيل وعناية دورية متخصصة بالسجاد اليدوي على أيدي خبراء:</p>
                    <div style="margin-top:14px">
                        <a href="tel:01069005565" class="editorial-btn">طلب خدمة الغسيل والعناية: 01069005565</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 9. PRIVACY POLICY PAGE (ARABIC)
function renderPrivacyPolicyPageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">الأمان والخصوصية</div>
            <h1 class="editorial-hero-title">سياسة الخصوصية</h1>
            <p class="editorial-hero-subtitle">نلتزم في متجر يدوي بحماية بياناتك الشخصية والحفاظ على سريتها التامة.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="policy-card">
                <div class="policy-section-block">
                    <h2 class="policy-heading">جمع المعلومات واستخدامها</h2>
                    <p class="policy-text">
                        نقوم بجمع البيانات الضرورية فقط لمعالجة وتوصيل طلبك، مثل: الاسم، رقم الهاتف، وعنوان التوصيل، والبريد الإلكتروني لتأكيد تفاصيل الشحن.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">حماية البيانات والسرية</h2>
                    <p class="policy-text">
                        نضمن عدم مشاركة أو بيع أي من معلوماتك الشخصية لأي طرف ثالث، باستثناء شركات الشحن المسؤولة عن تسليم الطلب إلى باب منزلك.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">التواصل وخدمة العملاء</h2>
                    <p class="policy-text">
                        يتم استخدام رقم هاتفك فقط للتواصل معك بخصوص تأكيد الطلب، تنسيق موعد التسليم، أو الرد على استفساراتك.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <p class="policy-tagline">يدوي.. امتداد الشركة الإيرانية — جميع الحقوق محفوظة © 2024</p>
                </div>
            </div>
        </div>
    `;
}

// 10. TERMS OF SERVICE PAGE (ARABIC)
function renderTermsPageArabic() {
    return `
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">الاتفاقية القانونية</div>
            <h1 class="editorial-hero-title">الشروط والأحكام</h1>
            <p class="editorial-hero-subtitle">شروط الاستخدام والطلب لمتجر يدوي الإلكتروني.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <div class="policy-card">
                <div class="policy-section-block">
                    <h2 class="policy-heading">طبيعة المنتجات اليدوية</h2>
                    <p class="policy-text">
                        نظراً لأن جميع منتجات "يدوي" تُصنع يدوياً بنسبة 100% بأنامل حرفيين على نول تقليدي، فقد توجد فروقات طفيفة طبيعية في تدرج الألوان أو المقاسات بمقدار بسيط (±2-3 سم)، وهي سمة أصيلة تؤكد فرادة وقيمة العمل اليدوي.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">الأسعار والدفع</h2>
                    <p class="policy-text">
                        جميع الأسعار المعروضة بالجنيه المصري (LE)، وتتاح إمكانية الدفع نقداً عند الاستلام بعد المعاينة لكافة أنحاء مصر.
                    </p>
                </div>

                <div class="policy-section-block">
                    <h2 class="policy-heading">حقوق الملكية الفكرية</h2>
                    <p class="policy-text">
                        جميع الصور والتصميمات والنصوص والعلامة التجارية "يدوي" (امتداد الشركة الإيرانية) محمية بموجب القوانين المنظمة للملكية الفكرية.
                    </p>
                </div>

                <div class="policy-contact-box">
                    <p class="policy-tagline">يدوي.. قطعة تروي حكاية.</p>
                </div>
            </div>
        </div>
    `;
}

// 11. FEATURED COLLECTIONS PAGE (ARABIC)
async function renderCollectionsPageArabic() {
    try {
        const data = await API.getCollections();
        const collections = data.collections || [];

        return `
            <div class="collections-page" dir="rtl">
                <div class="collections-page-header">
                    <span class="collections-page-badge">المجموعات الحرفية</span>
                    <h1 class="collections-page-title">المجموعات المختارة</h1>
                    <p class="collections-page-subtitle">تشكيلة منتقاة من السجاد المصري والكليم اليدوي الأصيل لبيوت متميزة</p>
                </div>
                <div class="collections-grid">
                    ${collections.map(c => renderCollectionCard(c)).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Collections error:', err);
        return '<div class="empty-state"><div class="empty-state-icon">!</div><h2 class="empty-state-title">تعذر تحميل المجموعات</h2></div>';
    }
}

// ============================================================
// 12. WHY YADAWY? PAGE (ARABIC)
// ============================================================
async function renderWhyYadawyPageArabic() {
    let reviews = [];
    let hasMore = false;
    let total = 0;
    try {
        const res = await API.getReviews({ page: 1, limit: 4 });
        reviews = res.reviews || [];
        hasMore = Boolean(res.hasMore);
        total = res.total || 0;
    } catch (e) {
        console.warn('Failed to load reviews in Arabic:', e);
    }

    window.whyReviewsState = {
        page: 1,
        limit: 4,
        hasMore: hasMore,
        total: total,
        isLoading: false,
        displayedIds: new Set(reviews.map(r => r.id))
    };

    const reviewsHtml = reviews.length > 0
        ? `
            <div class="why-reviews-grid" id="why-reviews-grid" dir="rtl">
                ${reviews.map(r => renderReviewCard(r, true)).join('')}
            </div>
            ${hasMore ? `
                <div class="why-reviews-loadmore-wrap" id="why-reviews-loadmore-wrap">
                    <button type="button" class="why-reviews-loadmore-btn" id="why-reviews-loadmore-btn" onclick="handleLoadMoreReviews(event)">
                        <span>عرض المزيد من التقييمات</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            ` : ''}
        `
        : `
            <div class="why-reviews-empty" dir="rtl">
                <span class="why-empty-icon">✦</span>
                <h3 class="why-empty-title">كن أول من يشاركنا رأيه</h3>
                <p class="why-empty-desc">لم يتم نشر تقييمات بعد. يسعدنا أن تشاركنا رأيك وتجربتك عبر النموذج أدناه!</p>
            </div>
        `;

    return `
        <!-- Hero Section -->
        <div class="editorial-page-hero" dir="rtl">
            <div class="editorial-hero-badge">وعد يدوي للأصالة</div>
            <h1 class="editorial-hero-title">ليه تختار يدوي؟</h1>
            <p class="editorial-hero-subtitle">التزام راسخ بالحرفة الأصيلة والصوف المصري الطبيعي. كل سجادة وكليم من يدوي ينسج بأنامل أمهر الحرفيين ليروي حكاية فخر تعيش وتتوارثها الأجيال.</p>
        </div>

        <div class="editorial-content-container" dir="rtl">
            <!-- 3 Main Selling Point Cards -->
            <div class="why-features-grid">
                <!-- Card 1: 100% Handmade -->
                <div class="why-feature-card">
                    <div class="why-card-icon-wrap">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            <circle cx="12" cy="12" r="9"/>
                        </svg>
                    </div>
                    <span class="why-card-badge">نسيج يدوي أصيل</span>
                    <h2 class="why-card-title">صناعة يدوية 100%</h2>
                    <p class="why-card-desc">كل قطعة في يدوي تُنسج يدوياً بنسبة 100% على الأنوال الخشبية التقليدية بأنامل شيوخ الصنعة في مصر. غرزة بغرزة وعقدة بعقدة، دون أي تدخل للآلات الصناعية أو خطوط الإنتاج السريعة، معتمدين على الصوف المصري الطبيعي 100% والمغزول يدوياً على سدى قطني فائق المتانة.</p>
                    <ul class="why-card-list">
                        <li><span>✦</span> صناعة يدوية مصرية 100% عقدة بعقدة</li>
                        <li><span>✦</span> صوف مصري طبيعي 100% عالي النقاء</li>
                        <li><span>✦</span> أنوال خشبية تراثية أصيلة متوارثة</li>
                    </ul>
                </div>

                <!-- Card 2: Experience & Craftsmanship -->
                <div class="why-feature-card why-feature-card-featured">
                    <div class="why-card-icon-wrap">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <span class="why-card-badge">تراث ممتد منذ 1982</span>
                    <h2 class="why-card-title">خبرة وحرفية</h2>
                    <p class="why-card-desc">يدوي هي الامتداد الطبيعي لخبرات «الشركة الإيرانية للسجاد» الرائدة لأكثر من 40 عاماً في عالم السجاد والمفروشات الفاخرة. نمتلك إرثاً عميقاً وأسراراً متوارثة في انتقاء خيوط الصوف، وتثبيت الأصباغ النباتية الطبيعية، وفهم أدق تفاصيل النقوش الهندسية والتراثية الأصيلة.</p>
                    <ul class="why-card-list">
                        <li><span>✦</span> خبرة تتجاوز 40 عاماً في فنون السجاد</li>
                        <li><span>✦</span> امتداد عريق للشركة الإيرانية للسجاد</li>
                        <li><span>✦</span> أسرار الصباغة والنقوش التراثية</li>
                    </ul>
                </div>

                <!-- Card 3: Quality & Warranty -->
                <div class="why-feature-card">
                    <div class="why-card-icon-wrap">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                        </svg>
                    </div>
                    <span class="why-card-badge">راحة بال واطمئنان تام</span>
                    <h2 class="why-card-title">جودة مضمونة</h2>
                    <p class="why-card-desc">ثقتنا في جودة قطعنا لا حدود لها؛ لذا نقدم ضماناً شاملاً لمدة عام كامل على كل قطعة ضد عيوب الصناعة. كما نوفر لعملائنا سياسة استبدال واسترجاع مرنة خلال 14 يوماً، إلى جانب خدمات الغسيل المتخصص والعناية الدورية بالسجاد للحفاظ على بريقه ورونقه لعقود.</p>
                    <ul class="why-card-list">
                        <li><span>✦</span> ضمان شامل لمدة عام كامل ضد عيوب الصناعة</li>
                        <li><span>✦</span> استبدال واسترجاع خلال 14 يوماً</li>
                        <li><span>✦</span> خدمات غسيل وصيانة متخصصة بعد البيع</li>
                    </ul>
                </div>
            </div>

            <!-- Customer Reviews Section -->
            <section class="why-reviews-section" id="customer-reviews">
                <div class="why-reviews-header">
                    <span class="why-reviews-badge">آراء وتجارب</span>
                    <h2 class="why-reviews-title">آراء عملائنا</h2>
                    <p class="why-reviews-subtitle">تجارب وكلمات حقيقية من عملائنا وأصحاب الذوق الرفيع الذين زينت قطع يدوي منازلهم.</p>
                </div>

                ${reviewsHtml}
            </section>

            <!-- Customer Review Submission Form -->
            <section class="why-form-section" id="submit-review">
                <div class="why-form-card">
                    <div class="why-form-header">
                        <span class="why-form-badge">شاركنا رأيك</span>
                        <h2 class="why-form-title">شاركنا رأيك في يدوي</h2>
                        <p class="why-form-subtitle">رأيك يهمنا ويساعدنا في التطوير المستمر. شاركنا تجربتك وانطباعك بكل شفافية.</p>
                    </div>

                    <div id="review-form-alert" class="review-alert" style="display:none;"></div>

                    <form class="why-review-form" onsubmit="handleReviewSubmit(event)">
                        <div class="why-form-row">
                            <div class="why-form-group">
                                <label class="why-form-label" for="review-customer-name-ar">الاسم بالإنجليزية (الاسم الأول واسم العائلة) *</label>
                                <input type="text" id="review-customer-name-ar" name="customer_name" class="why-form-input" placeholder="مثال: Mariam Ahmed" dir="ltr" style="text-align:left;" required minlength="3" maxlength="100">
                            </div>
                            <div class="why-form-group">
                                <label class="why-form-label" for="review-customer-email-ar">البريد الإلكتروني * (سري ولن يظهر للعامة)</label>
                                <input type="email" id="review-customer-email-ar" name="customer_email" class="why-form-input" placeholder="name@example.com" dir="ltr" style="text-align:left;" required maxlength="150">
                            </div>
                        </div>

                        <!-- Star Rating Selection -->
                        <div class="why-form-group">
                            <label class="why-form-label">تقييمك للقطعة والخدمة *</label>
                            <input type="hidden" name="rating" id="review-rating-input" value="5">
                            <div class="review-stars-selector">
                                <div class="review-stars-btns">
                                    <button type="button" class="review-star-btn active" onclick="setReviewRating(1)" aria-label="نجمة واحدة">★</button>
                                    <button type="button" class="review-star-btn active" onclick="setReviewRating(2)" aria-label="نجمتان">★</button>
                                    <button type="button" class="review-star-btn active" onclick="setReviewRating(3)" aria-label="3 نجوم">★</button>
                                    <button type="button" class="review-star-btn active" onclick="setReviewRating(4)" aria-label="4 نجوم">★</button>
                                    <button type="button" class="review-star-btn active" onclick="setReviewRating(5)" aria-label="5 نجوم">★</button>
                                </div>
                                <span class="review-rating-label" id="review-rating-label">ممتاز (5/5)</span>
                            </div>
                        </div>

                        <div class="why-form-group">
                            <label class="why-form-label" for="review-text-ar">رأيك وتجربتك بالتفصيل *</label>
                            <textarea id="review-text-ar" name="review_text" class="why-form-textarea" rows="4" placeholder="اكتب لنا عن رأيك في جودة القطعة، الألوان، الخامة، سرعة التوصيل، وانطباعك العام..." required minlength="5" maxlength="1000"></textarea>
                        </div>

                        <div class="why-form-actions">
                            <button type="submit" class="why-form-submit-btn">
                                <span>إرسال التقييم</span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    `;
}

window.renderWhyYadawyPageArabic = renderWhyYadawyPageArabic;

