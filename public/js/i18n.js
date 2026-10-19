// ============================================================
// YADAWY BILINGUAL LOCALIZATION (ARABIC / ENGLISH)
// Full Natural, Professional Arabic Translation & RTL Support
// ============================================================

const I18N = {
    // Current active language (persisted in localStorage, default 'ar')
    lang: localStorage.getItem('yadawy_lang') || 'ar',

    // Product name prefix translations
    productPrefixes: {
        'Antique Rugs': 'سجاد أنتيك فاخر',
        'Handmade Rugs - New': 'سجاد يدوي صوف - جديد',
        'Antique Kilims': 'كليم أنتيك تراثي',
        'Tableaux / Wall Hangings': 'معلقات جدارية وتابلوهات',
        'Fine Wool Kilim': 'كليم صوف ناعم فاخر',
        'Patterned Wool Kilim': 'كليم صوف منقوش',
        'New Zealand Wool Kilim': 'كليم صوف نيوزيلندي فاخر',
        'Regular Cotton Kilim': 'كليم قطن طبيعي',
        'Patterned Cotton & Wool Kilim': 'كليم قطن وصوف منقوش'
    },

    // Category translations
    categories: {
        'Antique Rugs': 'سجاد أنتيك',
        'Handmade Rugs - New': 'سجاد يدوي جديد',
        'Antique Kilims': 'كليم أنتيك',
        'Tableaux / Wall Hangings': 'معلقات وتابلوهات',
        'Fine Wool Kilim': 'كليم صوف ناعم',
        'Patterned Wool Kilim': 'كليم صوف منقوش',
        'New Zealand Wool Kilim': 'كليم صوف نيوزيلندي',
        'Regular Cotton Kilim': 'كليم قطن',
        'Patterned Cotton & Wool Kilim': 'كليم قطن وصوف',
        'Carpets & Rugs': 'سجاد وبسط',
        'Kilims & Flatweaves': 'كليم ومنسوجات مسطحة',
        'All Products': 'جميع المنتجات',
        'All Pieces': 'كل القطع'
    },

    // Collections translations
    collections: {
        'Heritage Collection': 'مجموعة التراث الأصيل',
        'Modern Artisan': 'حرفية عصرية',
        'Nomadic Series': 'سلسلة الكليم البدوي',
        'Seasonal Sale': 'عروض الموسم'
    },

    // UI Dictionary
    dict: {
        // Brand & Statements
        'site_title': {
            en: 'YADAWY — Handwoven Rugs & Kilim | A Piece That Tells a Story',
            ar: 'يدوي — سجاد يدوي وكليم طبيعي | قطعة تروي حكاية'
        },
        'brand_name': { en: 'Yadawy', ar: 'يدوي' },
        'brand_tagline': { en: 'A Piece That Tells a Story.', ar: 'يدوي.. قطعة تروي حكاية' },
        'iranian_statement': { en: 'امتداد الشركة الإيرانية', ar: 'امتداد الشركة الإيرانية' },

        // Header & Nav
        'nav_all_products': { en: 'ALL PRODUCTS', ar: 'جميع المنتجات' },
        'nav_all_pieces': { en: 'All Products', ar: 'جميع المنتجات' },
        'nav_carpets': { en: 'Carpets & Rugs', ar: 'سجاد' },
        'nav_kilims': { en: 'Kilims & Flatweaves', ar: 'كليم ومنسوجات مسطحة' },
        'nav_new_arrivals': { en: 'New Arrivals', ar: 'وصل حديثًا' },
        'nav_best_sellers': { en: 'Best Sellers', ar: 'الأكثر مبيعًا' },
        'nav_customize': { en: 'CUSTOMIZE', ar: 'تفصيل حسب الطلب' },
        'nav_why_yadawy': { en: 'WHY YADAWY?', ar: 'ليه تختار يدوي؟' },
        'nav_guides': { en: 'GUIDES & CARE', ar: 'الأدلة والعناية' },
        'nav_guides_policies': { en: 'GUIDES & POLICIES', ar: 'الأدلة والسياسات' },
        'nav_what_is_kilim': { en: 'WHAT IS A KILIM?', ar: 'ما هو الكليم؟' },
        'nav_size_guide': { en: 'SIZE GUIDE', ar: 'دليل المقاسات' },
        'nav_care_guide': { en: 'CARE & CLEANING', ar: 'العناية والتنظيف' },
        'nav_faqs': { en: 'FREQUENTLY ASKED QUESTIONS', ar: 'الأسئلة الشائعة' },
        'nav_dropdown_faqs': { en: 'FAQs', ar: 'الأسئلة الشائعة' },
        'nav_our_story': { en: 'OUR STORY', ar: 'قصتنا' },
        'nav_contact': { en: 'CONTACT', ar: 'تواصل معنا' },
        'nav_shop_group': { en: 'SHOP', ar: 'جميع المنتجات' },
        'nav_search': { en: 'SEARCH', ar: 'بحث' },
        'nav_cart': { en: 'CART', ar: 'السلة' },
        'lang_toggle': { en: 'العربية', ar: 'English' },

        // Customize Page
        'customize_hero_badge': { en: 'BESPOKE ARTISAN WEAVING', ar: 'حرفية يدوية حسب طلبك' },
        'customize_hero_title': { en: 'Custom Rugs & Kilims', ar: 'تفصيل حسب الطلب' },
        'customize_hero_subtitle': {
            en: 'Tailor a one-of-a-kind handwoven rug or kilim to your desired dimensions, color palette, and living space. 100% handspun Egyptian wool woven on authentic wooden looms.',
            ar: 'فصّل سجادتك أو كليمك بالمقاسات والألوان والتصميمات التي تناسب منزلك ومساحتك الخاصة، منسوجة يدوياً بنسبة 100% بأنامل أمهر الحرفيين في مصر.'
        },
        'customize_card1_title': { en: 'Custom Dimensions', ar: 'مقاسات مخصصة لمساحتك' },
        'customize_card1_desc': { en: 'From compact bedside accents to oversized living room anchors and hallway runners, specify exact dimensions.', ar: 'من المقاسات الصغيرة وحتى أطول المشايات وسجاد المساحات الكبرى، ننسج لك المقاس الدقيق الذي تطلبه.' },
        'customize_card2_title': { en: 'Harmonious Palettes', ar: 'ألوان متناسقة مع ديكورك' },
        'customize_card2_desc': { en: 'Choose your preferred earthy dyes, neutral tones, or vibrant accents from natural Egyptian wool.', ar: 'اختر درجات الألوان الطبيعية المفضلة لك من الصوف المصري المغزول يدوياً لتتناغم تماماً مع أثاثك.' },
        'customize_card3_title': { en: 'Authentic Heritage Loom', ar: 'صناعة يدوية على نول خشبي' },
        'customize_card3_desc': { en: 'Zero machine shortcuts. Every bespoke piece is handwoven knot by knot with 1-year craftsmanship warranty.', ar: 'دون أي تدخل صناعي، عقدة بعقدة وغرزة بغرزة على الأنوال الخشبية الأصيلة مع ضمان كامل لمدة عام.' },
        'customize_catalog_title': { en: 'Pieces Available for Customization', ar: 'قطع متاحة للتفصيل حسب الطلب' },
        'customize_catalog_subtitle': { en: 'Choose a design below as an inspiration foundation, or request a complete custom pattern.', ar: 'اختر تصميماً من القطع أدناه لتفصيله بمقاساتك، أو استفسر عن تصميم خاص بك.' },
        'customize_request_btn': { en: 'Request Customization', ar: 'اطلب تفصيل هذه القطعة' },
        'customize_general_cta': { en: 'Have a Custom Design Idea? Chat with Us', ar: 'لديك مقاس أو فكرة تصميم في بالك؟ تواصل معنا' },
        'customize_modal_title': { en: 'Customization Inquiry', ar: 'طلب تفصيل قطعة خاصة' },
        'customize_modal_size': { en: 'Desired Dimensions (e.g., 2 × 3 m)', ar: 'المقاس المطلوب (مثال: ٢ × ٣ متر)' },
        'customize_modal_color': { en: 'Preferred Colors / Palette', ar: 'الألوان والتدرجات المفضلة' },
        'customize_modal_notes': { en: 'Design Preferences & Notes', ar: 'ملاحظات وتفاصيل إضافية' },
        'customize_modal_send': { en: 'Send Customization Request on WhatsApp', ar: 'إرسال طلب التفصيل عبر واتساب' },
        'customize_disclaimer': {
            en: 'Final pricing and weaving timeline are confirmed by our artisan team upon reviewing your desired dimensions and specifications.',
            ar: 'يتم تحديد التكلفة النهائية ومدة التنفيذ بدقة بعد مراجعة المقاس والمواصفات من قِبل فريق الحرفيين.'
        },

        // Search Overlay
        'search_placeholder': { en: 'Search catalog, rugs, kilims, colors...', ar: 'ابحث في الكتالوج، سجاد، كليم، ألوان...' },
        'search_results': { en: 'Search Results', ar: 'نتائج البحث' },
        'search_no_results': { en: 'No pieces found matching your search.', ar: 'لم نتمكن من العثور على قطع تطابق بحثك.' },
        'search_type_prompt': { en: 'Type to discover authentic pieces...', ar: 'اكتب للبحث عن القطع الفاخرة...' },
        'search_close': { en: 'Close Search', ar: 'إغلاق البحث' },

        // Homepage
        'hero_title': { en: 'Handwoven Masterpieces That Tell a Story', ar: 'تحف منسوجة يدوياً تروي حكاية' },
        'hero_subtitle': { en: '100% Egyptian Wool • Handcrafted on Wooden Looms • 1-Year Warranty', ar: 'صوف مصري طبيعي 100% • مصنوع على نول يدوي • ضمان سنة كاملة' },
        'hero_cta': { en: 'EXPLORE COLLECTION', ar: 'اكتشف المجموعة' },
        'collections_title': { en: 'Featured Collections', ar: 'المجموعات المختارة' },
        'collections_subtitle': { en: 'Curated artisanal rugs and flatweaves for distinguished homes', ar: 'تشكيلة مختارة من السجاد والكليم الطبيعي لتزيين أرقى المساحات' },
        'new_arrivals_title': { en: 'New Arrivals', ar: 'أحدث القطع المنسوجة' },
        'best_sellers_title': { en: 'Best Sellers', ar: 'القطع الأكثر طلباً' },
        'explore_all': { en: 'EXPLORE ALL PIECES →', ar: 'تصفح كل المعروضات ←' },
        'view_all': { en: 'VIEW ALL', ar: 'عرض الكل' },

        // Story Section
        'story_badge': { en: 'AUTHENTIC CRAFTSMANSHIP', ar: 'حرفية مصرية أصيلة' },
        'story_title': { en: 'A Piece That Tells a Story', ar: 'يدوي.. قطعة تروي حكاية' },
        'story_content': {
            en: 'Every Yadawy piece is meticulously handwoven by skilled Egyptian artisans using pure local wool and heritage wooden looms. A continuation of genuine carpet-weaving mastery that infuses warmth, character, and legacy into your living space.',
            ar: 'كل قطعة من "يدوي" تصنع يدوياً بنسبة 100% بأنامل أمهر الحرفيين المصريين باستخدام أصواف محلية طبيعية ونول خشبي تقليدي متوارث عبر الأجيال. ننسج الأصالة والدفء لنمنح منزلك قطعة فريدة لا تتكرر.'
        },
        'story_cta': { en: 'DISCOVER OUR HERITAGE', ar: 'اكتشف رحلة يدوي' },

        // Store Location
        'store_location_title': { en: 'Visit Our Store', ar: 'زوروا معرض يدوي' },
        'store_location_address': { en: '204 Ahmed Shawky St., Bulkeley, Alexandria, Egypt', ar: '٢٠٤ شارع أحمد شوقي، بولكلي، الإسكندرية' },
        'store_location_btn': { en: 'Get Directions', ar: 'افتح الموقع على الخريطة' },

        // Why Yadawy Page & Customer Reviews
        'why_hero_badge': { en: 'THE YADAWY PROMISE', ar: 'وعد يدوي للأصالة' },
        'why_hero_title': { en: 'Why Yadawy?', ar: 'ليه تختار يدوي؟' },
        'why_hero_subtitle': {
            en: 'A commitment to timeless artisanry, natural Egyptian wool, and museum-grade craftsmanship. Each piece is handwoven to tell a story that endures for generations.',
            ar: 'التزام راسخ بالحرفة الأصيلة والصوف المصري الطبيعي. كل سجادة وكليم من يدوي ينسج بأنامل أمهر الحرفيين ليروي حكاية فخر تعيش وتتوارثها الأجيال.'
        },
        'why_card1_badge': { en: '100% HANDWOVEN', ar: 'نسيج يدوي أصيل' },
        'why_card1_title': { en: '100% Handmade', ar: 'صناعة يدوية 100%' },
        'why_card1_desc': {
            en: 'Every kilim and rug in our collection is 100% handwoven by master Egyptian artisans on traditional upright wooden looms. Knot by knot, with zero mass-machine shortcuts, using pure natural Egyptian wool spun on durable cotton foundation.',
            ar: 'كل قطعة في يدوي تُنسج يدوياً بنسبة 100% على الأنوال الخشبية التقليدية بأنامل شيوخ الصنعة في مصر. غرزة بغرزة وعقدة بعقدة، دون أي تدخل للآلات الصناعية أو خطوط الإنتاج السريعة، معتمدين على الصوف المصري الطبيعي 100% والمغزول يدوياً على سدى قطني فائق المتانة.'
        },
        'why_card1_point1': { en: '100% Handwoven by Egyptian Artisans', ar: 'صناعة يدوية مصرية 100% عقدة بعقدة' },
        'why_card1_point2': { en: 'Pure Natural Egyptian Wool', ar: 'صوف مصري طبيعي 100% عالي النقاء' },
        'why_card1_point3': { en: 'Traditional Upright Wooden Looms', ar: 'أنوال خشبية تراثية أصيلة متوارثة' },

        'why_card2_badge': { en: 'HERITAGE SINCE 1982', ar: 'تراث ممتد منذ 1982' },
        'why_card2_title': { en: 'Experience & Craftsmanship', ar: 'خبرة وحرفية' },
        'why_card2_desc': {
            en: 'An organic continuation of the renowned Iranian Carpet Company (امتداد الشركة الإيرانية للسجاد), carrying over 40 years of accumulated connoisseurship and weaving legacy. We bring deep mastery of dye secrets, geometric storytelling, and authentic Persian & Oriental design standards.',
            ar: 'يدوي هي الامتداد الطبيعي لخبرات «الشركة الإيرانية للسجاد» الرائدة لأكثر من 40 عاماً في عالم السجاد والمفروشات الفاخرة. نمتلك إرثاً عميقاً وأسراراً متوارثة في انتقاء خيوط الصوف، وتثبيت الأصباغ النباتية الطبيعية، وفهم أدق تفاصيل النقوش الهندسية والتراثية الأصيلة.'
        },
        'why_card2_point1': { en: 'Over 40 Years of Carpet Heritage', ar: 'خبرة تتجاوز 40 عاماً في فنون السجاد' },
        'why_card2_point2': { en: 'Extension of the Iranian Carpet Company', ar: 'امتداد عريق للشركة الإيرانية للسجاد' },
        'why_card2_point3': { en: 'Ancient Weaving Secrets & Curated Dyes', ar: 'أسرار الصباغة والنقوش التراثية' },

        'why_card3_badge': { en: 'PEACE OF MIND', ar: 'راحة بال واطمئنان تام' },
        'why_card3_title': { en: 'Quality & Warranty', ar: 'جودة مضمونة' },
        'why_card3_desc': {
            en: 'We stand with utmost confidence behind every thread. Every Yadawy piece comes with a comprehensive 1-Year Craftsmanship Guarantee, a 14-Day Return & Exchange policy, and lifelong specialized cleaning and preservation support.',
            ar: 'ثقتنا في جودة قطعنا لا حدود لها؛ لذا نقدم ضماناً شاملاً لمدة عام كامل على كل قطعة ضد عيوب الصناعة. كما نوفر لعملائنا سياسة استبدال واسترجاع مرنة خلال 14 يوماً، إلى جانب خدمات الغسيل المتخصص والعناية الدورية بالسجاد للحفاظ على بريقه ورونقه لعقود.'
        },
        'why_card3_point1': { en: '1-Year Comprehensive Warranty', ar: 'ضمان شامل لمدة عام كامل ضد عيوب الصناعة' },
        'why_card3_point2': { en: '14-Day Easy Return & Exchange', ar: 'إمكانية الاستبدال والاسترجاع خلال 14 يوماً' },
        'why_card3_point3': { en: 'Professional Rug Cleaning & Support', ar: 'خدمات غسيل وصيانة متخصصة بعد البيع' },

        // Reviews Section
        'reviews_section_title': { en: 'What Our Customers Say', ar: 'آراء عملائنا' },
        'reviews_section_subtitle': {
            en: 'Authentic stories and honest feedback from homeowners who welcomed Yadawy into their spaces.',
            ar: 'تجارب وكلمات حقيقية من عملائنا وأصحاب الذوق الرفيع الذين زينت قطع يدوي منازلهم.'
        },
        'reviews_empty_title': { en: 'Be the first to share your experience', ar: 'كن أول من يشاركنا رأيه' },
        'reviews_empty_desc': {
            en: 'No approved reviews yet. We would love to hear your thoughts below!',
            ar: 'لم يتم نشر تقييمات بعد. يسعدنا أن تشاركنا رأيك وتجربتك عبر النموذج أدناه!'
        },
        'reviews_demo_badge': { en: 'DEMO PREVIEW', ar: 'معاينة تجريبية' },

        // Review Submission Form
        'review_form_title': { en: 'Share Your Experience', ar: 'شاركنا رأيك في يدوي' },
        'review_form_subtitle': {
            en: 'Your opinion matters to us. Help other craft lovers discover the story behind Yadawy.',
            ar: 'رأيك يهمنا ويساعدنا في التطوير المستمر. شاركنا تجربتك وانطباعك بكل شفافية.'
        },
        'review_field_name': { en: 'Customer Name *', ar: 'الاسم الكريم *' },
        'review_field_name_placeholder': { en: 'e.g. Mariam Ahmed', ar: 'مثال: مريم أحمد' },
        'review_field_email': { en: 'Email Address * (Never shared publicly)', ar: 'البريد الإلكتروني * (لن يُنشر للعامة إطلاقاً)' },
        'review_field_email_placeholder': { en: 'your.email@example.com', ar: 'your.email@example.com' },
        'review_field_rating': { en: 'Your Rating *', ar: 'تقييمك للقطعة والخدمة *' },
        'review_field_text': { en: 'Review Text *', ar: 'رأيك وتجربتك بالتفصيل *' },
        'review_field_text_placeholder': {
            en: 'Tell us about the craftsmanship, textures, colors, delivery, and overall experience...',
            ar: 'اكتب لنا عن رأيك في جودة القطعة، الألوان، الخامة، سرعة التوصيل، وانطباعك العام...'
        },
        'review_submit_btn': { en: 'Submit Review', ar: 'إرسال التقييم' },
        'review_submitting': { en: 'Submitting review...', ar: 'جاري إرسال التقييم...' },
        'review_success_msg': {
            en: 'Thank you for sharing your feedback! Your review will appear after approval.',
            ar: 'شكرًا ليك على تقييمك ❤️ رأيك مهم عندنا، وهيظهر بعد ما فريق يدوي يراجعه.'
        },

        // Newsletter
        'newsletter_title': { en: 'Stay In Touch with Artistry', ar: 'ابقَ على تواصل مع الأصالة' },
        'newsletter_subtitle': { en: 'Be the first to explore limited edition drops, weaving stories, and private offers.', ar: 'كن أول من يتعرف على أحدث القطع النادرة وقصص الحرفيين والعروض الخاصة.' },
        'newsletter_placeholder': { en: 'Enter your email address', ar: 'أدخل بريدك الإلكتروني' },
        'newsletter_submit': { en: 'SUBSCRIBE', ar: 'اشترك الآن' },
        'newsletter_success': { en: 'Thank you for subscribing to Yadawy!', ar: 'شكراً لاشتراكك في عائلة يدوي!' },

        // Product Details
        'view_details': { en: 'VIEW DETAILS', ar: 'عرض التفاصيل' },
        'size_options': { en: 'Size Options', ar: 'خيارات المقاس' },
        'quantity': { en: 'Quantity', ar: 'الكمية' },
        'add_to_cart': { en: 'ADD TO CART', ar: 'أضف إلى السلة' },
        'buy_now': { en: 'BUY NOW', ar: 'اشتري الآن' },
        'out_of_stock': { en: 'OUT OF STOCK', ar: 'نفد المخزون' },
        'size_out_of_stock': { en: '(Out of Stock)', ar: '(غير متوفر)' },
        'inquire_whatsapp': { en: 'Enquire via WhatsApp', ar: 'استفسار وطلب عبر واتساب' },
        'sharing_image': { en: 'Preparing piece details...', ar: 'جاري تحضير تفاصيل وصورة القطعة...' },
        'you_may_also_like': { en: 'You May Also Like', ar: 'قطع أخرى قد تنال إعجابك' },
        'product_not_found': { en: 'Product not found', ar: 'عذراً، لم نتمكن من العثور على هذا المنتج' },
        'back_to_shop': { en: 'Back to Shop', ar: 'العودة للمتجر' },

        // Product Accordions
        'acc_description': { en: 'DESCRIPTION & ARTISTRY', ar: 'الوصف وتفاصيل الحرفة' },
        'acc_specifications': { en: 'SPECIFICATIONS', ar: 'المواصفات الفنية' },
        'acc_care': { en: 'CARE INSTRUCTIONS', ar: 'إرشادات العناية والتنظيف' },
        'acc_shipping': { en: 'SHIPPING & RETURNS', ar: 'الشحن والاسترجاع' },

        // Default accordion texts
        'desc_fallback': {
            en: 'Masterfully crafted by Egyptian artisans using centuries-old traditional weaving techniques. Each piece carries unique character, cultural narrative, and enduring natural textures.',
            ar: 'قطعة فنية أبدعها حرفيون مصريون باستخدام تقنيات النسيج اليدوي التقليدية المتوارثة عبر الأجيال. تتميز بملمسها الطبيعي الفاخر ومتانتها العالية وقيمتها التراثية الثابتة.'
        },
        'spec_material': { en: 'Material: 100% Fine Handspun Egyptian Wool on Cotton Foundation', ar: 'الخامة: صوف مصري طبيعي 100% مغزول يدوياً على سدى قطني متين' },
        'spec_origin': { en: 'Origin: 100% Handwoven in Egypt', ar: 'المنشأ: صناعة يدوية 100% بأنامل مصرية' },
        'spec_warranty': { en: 'Warranty: 1-Year Craftsmanship Guarantee', ar: 'الضمان: ضمان شامل لمدة عام كامل ضد عيوب الصناعة' },
        'spec_delivery': { en: 'Delivery: 3–5 Business Days across Egypt', ar: 'الشحن والتوصيل: خلال 3-5 أيام عمل لكافة محافظات مصر' },

        'care_fallback': {
            en: '• Vacuum regularly on gentle setting without a rotating brush.\n• Blot liquid spills immediately with an undyed dry cotton cloth.\n• For stubborn stains, use mild wool detergent and lukewarm water.\n• Professional specialized rug cleaning recommended annually.\n• Rotate rug periodically to ensure balanced natural wear.',
            ar: '• يُنظف بالمكنسة الكهربائية بانتظام على سرعة هادئة بدون استخدام الفرشاة الدوارة.\n• عند حدوث أي انسكاب، يُجفف فوراً بقطعة قماش قطنية بيضاء نظيفة عن طريق الضغط وليس الفرك.\n• للبقع السطحية، يُستخدم صابون لطيف مخصص للصوف مع ماء فاتر.\n• يُفضل الغسيل والتنظيف الاحترافي لدى متخصصي السجاد اليدوي مرة كل عام.\n• يُنصح بتدوير السجادة بانتظام لضمان الاستخدام المتوازن لكافة أطرافها.'
        },

        'shipping_fallback': {
            en: '• Fast doorstep delivery across all Egyptian governorates within 3-5 business days.\n• Carefully packaged in weather-resistant protective wrapping.\n• 14-day hassle-free exchange and return policy for full peace of mind.\n• Cash on Delivery available across Egypt.',
            ar: '• توصيل سريع حتى باب المنزل لكافة محافظات جمهورية مصر العربية خلال 3 إلى 5 أيام عمل.\n• تغليف فاخر ومحكم لحماية السجاد والكليم من الرطوبة والأتربة أثناء النقل.\n• إمكانية المعاينة عند الاستلام مع سياسة استبدال واسترجاع مرنة خلال 14 يوماً.\n• الدفع نقداً عند الاستلام متوفر لكافة الطلبات.'
        },

        // Badges
        'badge_sale': { en: 'SALE', ar: 'تخفيض' },
        'badge_best_seller': { en: 'BEST SELLER', ar: 'الأكثر طلباً' },
        'badge_sold_out': { en: 'SOLD OUT', ar: 'نفد المخزون' },

        // Catalog / Shop Page
        'catalog_title': { en: 'Artisanal Catalog', ar: 'كتالوج التحف اليدوية' },
        'catalog_subtitle': { en: 'Discover our complete collection of genuine handmade rugs and flatwoven kilims', ar: 'تصفح التشكيلة الكاملة من أفخر أنواع السجاد اليدوي والكليم الطبيعي' },
        'filter_all': { en: 'All Pieces', ar: 'جميع المعروضات' },
        'filter_carpets': { en: 'Carpets & Rugs', ar: 'سجاد وبسط' },
        'filter_kilims': { en: 'Kilims & Flatweaves', ar: 'كليم ومنسوجات مسطحة' },
        'sort_newest': { en: 'Newest Pieces', ar: 'الأحدث أولاً' },
        'sort_price_asc': { en: 'Price: Low to High', ar: 'السعر: من الأقل للأعلى' },
        'sort_price_desc': { en: 'Price: High to Low', ar: 'السعر: من الأعلى للأقل' },
        'sort_best_seller': { en: 'Best Sellers', ar: 'الأكثر طلباً' },

        // Cart Page
        'cart_badge': { en: 'SHOPPING BAG', ar: 'حقيبة التسوق' },
        'cart_title': { en: 'Your Shopping Cart', ar: 'سلة المشتريات' },
        'cart_subtitle': { en: 'Review your selected authentic pieces before checkout', ar: 'مراجعة القطع المنسوجة المختارة وتأكيد المقاسات' },
        'cart_col_product': { en: 'Product', ar: 'القطعة' },
        'cart_col_size': { en: 'Size', ar: 'المقاس' },
        'cart_col_quantity': { en: 'Quantity', ar: 'الكمية' },
        'cart_col_total': { en: 'Total', ar: 'الإجمالي' },
        'cart_empty_title': { en: 'Your cart is empty', ar: 'سلتك فارغة حالياً' },
        'cart_empty_text': { en: 'Discover our collection of handwoven masterpieces and choose your unique piece.', ar: 'اكتشف مجموعتنا الاستثنائية من السجاد والكليم الطبيعي واختر قطعتك الفريدة.' },
        'continue_shopping': { en: 'CONTINUE SHOPPING →', ar: '← متابعة التسوق' },
        'cart_summary_title': { en: 'Order Summary', ar: 'ملخص الطلب' },
        'cart_subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
        'cart_shipping': { en: 'Shipping (Egypt)', ar: 'الشحن والتوصيل' },
        'cart_total': { en: 'Total Amount', ar: 'المبلغ الإجمالي' },
        'proceed_checkout': { en: 'PROCEED TO CHECKOUT', ar: 'متابعة إتمام الطلب' },
        'shipping_calculated': { en: 'Calculated at checkout', ar: 'يُحدد في خطوة إتمام الطلب' },
        'remove_item': { en: 'Remove', ar: 'حذف' },

        // Checkout Page
        'checkout_badge': { en: 'SECURE CHECKOUT', ar: 'إتمام الشراء بأمان' },
        'checkout_title': { en: 'Shipping & Order Details', ar: 'بيانات الشحن وتأكيد الطلب' },
        'checkout_subtitle': { en: 'Please enter your delivery details to complete your order', ar: 'يرجى إدخال عنوان التوصيل بدقة لضمان سرعة التسليم' },
        'customer_info': { en: 'Customer Information', ar: 'بيانات العميل' },
        'full_name': { en: 'Full Name', ar: 'الاسم بالكامل' },
        'full_name_placeholder': { en: 'Enter your full name', ar: 'أدخل اسمك بالكامل' },
        'mobile_phone': { en: 'Mobile Phone Number', ar: 'رقم الهاتف المحمول' },
        'mobile_placeholder': { en: 'e.g. 01012345678', ar: 'مثال: 01012345678' },
        'alt_phone': { en: 'Alternative Phone (Optional)', ar: 'رقم هاتف إضافي (اختياري)' },
        'governorate': { en: 'Governorate', ar: 'المحافظة' },
        'select_gov': { en: 'Select your governorate', ar: 'اختر المحافظة' },
        'city': { en: 'City / District', ar: 'المدينة / المنطقة' },
        'city_placeholder': { en: 'e.g. Maadi, New Cairo, Montaza', ar: 'مثال: المعادي، التجمع الخامس، سموحة' },
        'address': { en: 'Detailed Address', ar: 'العنوان بالتفصيل' },
        'address_placeholder': { en: 'Street, Building number, Apartment, Landmark', ar: 'الشارع، رقم العمارة، رقم الشقة، علامة مميزة' },
        'delivery_notes': { en: 'Delivery Notes (Optional)', ar: 'ملاحظات إضافية للتوصيل (اختياري)' },
        'notes_placeholder': { en: 'Special instructions for courier...', ar: 'أي إرشادات خاصة للمندوب...' },
        'payment_method': { en: 'Payment Method', ar: 'طريقة الدفع' },
        'cod_title': { en: 'Cash on Delivery (COD)', ar: 'الدفع نقداً عند الاستلام' },
        'cod_desc': { en: 'Inspect and receive your piece with total confidence before payment.', ar: 'عاين قطعتك وتأكد من جودتها ومقاسها عند الاستلام قبل السداد.' },
        'confirm_order_btn': { en: 'CONFIRM & PLACE ORDER', ar: 'تأكيد وإتمام الطلب' },
        'order_success_title': { en: 'Order Placed Successfully!', ar: 'تم استلام طلبك بنجاح!' },
        'order_success_msg': {
            en: 'Thank you for choosing Yadawy. Our customer care team will contact you shortly to confirm delivery.',
            ar: 'شكراً لاختيارك متجر يدوي. سيتواصل معك فريق خدمة العملاء قريباً لتأكيد موعد الشحن والتوصيل.'
        },
        'order_id_label': { en: 'Order Reference:', ar: 'رقم الطلب المرجعي:' },
        'back_home': { en: 'BACK TO HOME', ar: 'العودة للصفحة الرئيسية' },

        // Toast Messages
        'toast_cart_added': { en: 'Added to your shopping cart', ar: 'تمت إضافة القطعة إلى سلتك' },
        'toast_cart_updated': { en: 'Cart updated', ar: 'تم تحديث السلة' },
        'toast_link_copied': { en: 'Product link copied to clipboard', ar: 'تم نسخ رابط القطعة بنجاح' },

        // Footer
        'footer_brand_desc': {
            en: 'Every Yadawy piece is 100% handwoven by Egyptian artisans using traditional techniques passed down through generations. Made with high-quality Egyptian wool on a durable cotton foundation.',
            ar: 'كل قطعة من "يدوي" تصنع يدوياً بنسبة 100% بأنامل أمهر الحرفيين المصريين باستخدام تقنيات النول التقليدية المتوارثة عبر الأجيال، وبأجود خيوط الصوف المصري النقي على قاعدة قطنية متينة.'
        },
        'footer_discover': { en: 'DISCOVER & GUIDES', ar: 'اكتشف والأدلة' },
        'footer_policies': { en: 'OUR POLICIES', ar: 'سياسات المتجر' },
        'footer_contact': { en: 'CONTACT & SUPPORT', ar: 'خدمة العملاء والتواصل' },
        'footer_rights': {
            en: '© 2024 Yadawy Store (Extension of the Iranian Company). All rights reserved.',
            ar: '© 2024 متجر يدوي (امتداد الشركة الإيرانية). جميع الحقوق محفوظة.'
        },
        'footer_phone_only': { en: 'Phone Calls Only', ar: 'اتصال هاتفي فقط' },
        'footer_wa_chat': { en: 'WhatsApp Chat', ar: 'محادثة واتساب' },

        // Floating WhatsApp
        'floating_wa_tooltip': { en: 'Chat with us on WhatsApp', ar: 'تواصل معنا مباشرة عبر واتساب' },

        // Product Metadata & Badges
        'material': { en: 'Material', ar: 'الخامة' },
        'dimensions': { en: 'Dimensions', ar: 'المقاس والأبعاد' },
        'color': { en: 'Color', ar: 'الألوان والصبغة' },
        'availability': { en: 'Availability', ar: 'حالة التوفر' },
        'in_stock': { en: 'In Stock', ar: 'متوفر للطلب الفوري' },
        'handwoven_details': { en: 'Handwoven Details', ar: 'تفاصيل الصنعة اليدوية' },
        'where_to_place': { en: 'Where to Place It', ar: 'أفضل الأماكن المقترحة للمنزل' },
        'video_showcase': { en: 'VIDEO SHOWCASE', ar: 'فيديو القطعة على الطبيعة' },
        'home_breadcrumb': { en: 'Home', ar: 'الرئيسية' },

        // Filter & Sort UI
        'sort_label': { en: 'SORT BY:', ar: 'ترتيب حسب:' },
        'sort_oldest': { en: 'Oldest First', ar: 'الأقدم أولاً' },
        'sort_name_asc': { en: 'Name: A to Z', ar: 'الاسم: أ إلى ي' },
        'sort_name_desc': { en: 'Name: Z to A', ar: 'الاسم: ي إلى أ' },
        'all_items': { en: 'All Items', ar: 'جميع القطع' },
        'clear_filters': { en: 'Clear Filters', ar: 'إلغاء الفلاتر' },
        'min_price': { en: 'Price Min', ar: 'أقل سعر' },
        'max_price': { en: 'Price Max', ar: 'أعلى سعر' },
        'all_pieces_badge': { en: 'AUTHENTIC CATALOG', ar: 'الكتالوج الأصيل' },
        'carpets_section_badge': { en: 'CARPETS SECTION', ar: 'قسم السجاد والبسط' },
        'kilims_section_badge': { en: 'KILIMS SECTION', ar: 'قسم الكليم والمنسوجات' },
        'pieces_count_text': { en: 'authentic piece(s) available', ar: 'قطعة معروضة' },

        // Checkout Labels & Summary
        'coupon_placeholder': { en: 'Enter coupon code', ar: 'أدخل كود الخصم' },
        'apply_coupon': { en: 'APPLY', ar: 'تطبيق' },
        'discount_label': { en: 'Discount', ar: 'قيمة الخصم' },
        'shipping_cost_label': { en: 'Shipping Cost', ar: 'تكلفة الشحن' },
        'free_shipping': { en: 'FREE', ar: 'شحن مجاني' },
        'final_total': { en: 'Final Total', ar: 'الإجمالي النهائي' },
        'email_label': { en: 'Email *', ar: 'البريد الإلكتروني *' },
        'phone_label': { en: 'Phone *', ar: 'رقم الهاتف *' },
        'address_label': { en: 'Address *', ar: 'العنوان التفصيلي *' },
        'landmark_label': { en: 'Apartment, Suite, Landmark', ar: 'رقم الشقة، العمارة، علامة مميزة' },
        'city_label': { en: 'City / Area *', ar: 'المدينة / المنطقة *' },
        'gov_label': { en: 'State / Governorate', ar: 'المحافظة' },
        'country_label': { en: 'Country *', ar: 'الدولة *' },
        'country_val': { en: 'Egypt', ar: 'مصر' },
        'order_notes_label': { en: 'Order Notes', ar: 'ملاحظات إضافية للطلب' },
        'order_notes_placeholder': { en: 'Special requests or delivery instructions...', ar: 'أي إرشادات أو مواعيد مفضلة للتسليم...' },
        'processing_order': { en: 'PROCESSING...', ar: 'جاري المعالجة...' },
        'thank_you_order': { en: 'Thank You for Your Order!', ar: 'شكراً جزيلاً لطلبك من يدوي!' },
        'order_confirmation_email': { en: "We've received your order and will begin processing it shortly. A confirmation has been sent to your email.", ar: 'تم استلام طلبك بنجاح وسيتواصل معك فريق خدمة العملاء لتأكيد تفاصيل وموعد التوصيل.' },

        // Why Yadawy Page & Customer Reviews
        'why_hero_badge': { en: 'THE YADAWY PROMISE', ar: 'وعد يدوي للأصالة' },
        'why_hero_title': { en: 'Why Choose Yadawy?', ar: 'ليه تختار يدوي؟' },
        'why_hero_subtitle': {
            en: 'Unwavering commitment to authentic Egyptian craftsmanship, 100% natural wool, and heritage wooden looms. A legacy of master carpet weaving designed to be cherished for generations.',
            ar: 'التزام راسخ بالحرفة الأصيلة والصوف المصري الطبيعي. كل سجادة وكليم من يدوي ينسج بأنامل أمهر الحرفيين ليروي حكاية فخر تعيش وتتوارثها الأجيال.'
        },
        'why_card1_badge': { en: 'AUTHENTIC HANDWEAVE', ar: 'نسيج يدوي أصيل' },
        'why_card1_title': { en: '100% Handmade', ar: 'صناعة يدوية 100%' },
        'why_card1_desc': {
            en: 'Every single Yadawy piece is 100% handwoven on traditional Egyptian wooden looms by generational master weavers. Stitch by stitch and knot by knot, without automated industrial machines or mass production.',
            ar: 'كل قطعة في يدوي تُنسج يدوياً بنسبة 100% على الأنوال الخشبية التقليدية بأنامل شيوخ الصنعة في مصر. غرزة بغرزة وعقدة بعقدة، دون أي تدخل للآلات الصناعية أو خطوط الإنتاج السريعة.'
        },
        'why_card1_point1': { en: '100% Egyptian handwoven craftsmanship', ar: 'صناعة يدوية مصرية 100% عقدة بعقدة' },
        'why_card1_point2': { en: 'Pure natural Egyptian wool', ar: 'صوف مصري طبيعي 100% عالي النقاء' },
        'why_card1_point3': { en: 'Heritage wooden looms passed down generations', ar: 'أنوال خشبية تراثية أصيلة متوارثة' },

        'why_card2_badge': { en: 'LEGACY SINCE 1982', ar: 'تراث ممتد منذ 1982' },
        'why_card2_title': { en: 'Experience & Craftsmanship', ar: 'خبرة وحرفية' },
        'why_card2_desc': {
            en: 'Yadawy is the natural modern continuation of the Iranian Carpet Company, boasting over 40 years of distinguished expertise in luxury carpets and kilims with time-honored dyeing and weaving secrets.',
            ar: 'يدوي هي الامتداد الطبيعي لخبرات «الشركة الإيرانية للسجاد» الرائدة لأكثر من 40 عاماً في عالم السجاد والمفروشات الفاخرة، مع أسرار الصباغة النباتية والنقوش التراثية.'
        },
        'why_card2_point1': { en: 'Over 40 years of carpet heritage', ar: 'خبرة تتجاوز 40 عاماً في فنون السجاد' },
        'why_card2_point2': { en: 'Direct extension of the Iranian Carpet Company', ar: 'امتداد عريق للشركة الإيرانية للسجاد' },
        'why_card2_point3': { en: 'Generational dye & weaving mastery', ar: 'أسرار الصباغة والنقوش التراثية' },

        'why_card3_badge': { en: 'TOTAL PEACE OF MIND', ar: 'راحة بال واطمئنان تام' },
        'why_card3_title': { en: 'Quality & Warranty', ar: 'جودة مضمونة' },
        'why_card3_desc': {
            en: 'We stand firmly behind the excellence of our craft. Every piece includes a full 1-year warranty against craftsmanship defects, flexible 14-day exchange/returns, and specialized after-sales cleaning care.',
            ar: 'ثقتنا في جودة قطعنا لا حدود لها؛ لذا نقدم ضماناً شاملاً لمدة عام كامل على كل قطعة ضد عيوب الصناعة، مع سياسة استبدال واسترجاع خلال 14 يوماً وخدمات صيانة وغسيل متخصصة.'
        },
        'why_card3_point1': { en: 'Full 1-Year Craftsmanship Warranty', ar: 'ضمان شامل لمدة عام كامل ضد عيوب الصناعة' },
        'why_card3_point2': { en: '14-Day Exchange & Return Policy', ar: 'استبدال واسترجاع خلال 14 يوماً' },
        'why_card3_point3': { en: 'Specialized rug care and cleaning services', ar: 'خدمات غسيل وصيانة متخصصة بعد البيع' },

        'reviews_section_title': { en: 'What Our Customers Say', ar: 'آراء عملائنا' },
        'reviews_section_subtitle': {
            en: 'Genuine reflections from valued clients who brought Yadawy woven art into their homes.',
            ar: 'تجارب وانطباعات حقيقية شاركنا بها عملاؤنا الكرام بعد اقتناء قطع يدوي في منازلهم.'
        },
        'reviews_empty_title': { en: 'Be the First to Share Your Experience', ar: 'كن أول من يشاركنا رأيه' },
        'reviews_empty_desc': {
            en: 'No approved reviews published yet. We invite you to share your feedback below!',
            ar: 'لم يتم نشر تقييمات بعد. يسعدنا أن تشاركنا رأيك وتجربتك عبر النموذج أدناه!'
        },
        'reviews_see_more': { en: 'See More Reviews', ar: 'عرض المزيد من التقييمات' },
        'reviews_loading_more': { en: 'Loading more reviews...', ar: 'جاري تحميل المزيد...' },

        'review_form_title': { en: 'Share Your Experience', ar: 'شاركنا رأيك في يدوي' },
        'review_form_subtitle': {
            en: 'Your feedback shapes our craft. Submitted reviews are published after quick review.',
            ar: 'رأيك يسعدنا ويساعدنا دائماً. يتم نشر التقييمات بعد مراجعة سريعة من فريق يدوي.'
        },
        'review_field_name': { en: 'Full Name in English (First & Last Name)', ar: 'الاسم بالإنجليزية (الاسم الأول واسم العائلة)' },
        'review_field_name_placeholder': { en: 'e.g. Mariam Ahmed', ar: 'مثال: Mariam Ahmed' },
        'review_field_name_error': {
            en: 'Please enter your first and last name in English (e.g. Mariam Ahmed).',
            ar: 'يرجى إدخال اسمك الأول واسم العائلة باللغة الإنجليزية (مثال: Mariam Ahmed).'
        },
        'review_field_email': { en: 'Email Address (Admin Only - Kept Private)', ar: 'البريد الإلكتروني (سري ولن يظهر للعامة)' },
        'review_field_email_placeholder': { en: 'e.g. yourname@example.com', ar: 'مثال: name@example.com' },
        'review_field_rating': { en: 'Your Rating', ar: 'تقييمك' },
        'review_field_text': { en: 'Your Review', ar: 'تفاصيل رأيك وتجربتك' },
        'review_field_text_placeholder': {
            en: 'Share what you loved about your rug or kilim, the colors, textures, and service...',
            ar: 'شاركنا انطباعك عن السجادة أو الكليم، جودة الصوف، تناسق الألوان وسرعة التوصيل...'
        },
        'review_submit_btn': { en: 'Submit Review', ar: 'إرسال التقييم' },
        'review_submitting_btn': { en: 'Submitting...', ar: 'جاري الإرسال...' },
        'review_success_msg': {
            en: 'Thank you for sharing your feedback! Your review will appear after approval.',
            ar: 'شكرًا ليك على تقييمك ❤️ رأيك مهم عندنا، وهيظهر بعد ما فريق يدوي يراجعه.'
        }
    },

    // Initialization
    init() {
        this.applyLang(this.lang, false);
    },

    // Get current language
    getLang() {
        return this.lang;
    },

    // Translate a key
    t(key, fallback = '') {
        const entry = this.dict[key];
        if (!entry) return fallback || key;
        return entry[this.lang] || entry['en'] || fallback || key;
    },

    // Translate dynamic product name
    translateProductName(name) {
        if (!name) return '';
        if (this.lang !== 'ar') return name;

        // Check if there is an exact match
        if (this.productPrefixes[name]) return this.productPrefixes[name];

        // Match pattern: "Prefix #123"
        const match = name.match(/^(.+?)\s*(#\d+.*)$/);
        if (match) {
            const prefix = match[1].trim();
            const rest = match[2].trim();
            if (this.productPrefixes[prefix]) {
                return `${this.productPrefixes[prefix]} ${rest}`;
            }
        }

        // Partial replacement for known words
        let result = name;
        for (const [en, ar] of Object.entries(this.productPrefixes)) {
            if (result.includes(en)) {
                result = result.replace(en, ar);
                break;
            }
        }
        return result;
    },

    // Translate category / collection name
    translateCategory(name) {
        if (!name) return '';
        if (this.lang !== 'ar') return name;
        return this.categories[name] || this.productPrefixes[name] || name;
    },

    // Translate collection name
    translateCollection(name) {
        if (!name) return '';
        if (this.lang !== 'ar') return name;
        return this.collections[name] || name;
    },

    // Apply language changes to DOM
    applyLang(lang, shouldRerender = true) {
        this.lang = lang;
        localStorage.setItem('yadawy_lang', lang);

        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';

        if (lang === 'ar') {
            document.body.classList.add('rtl-mode');
            document.title = this.t('site_title');
        } else {
            document.body.classList.remove('rtl-mode');
            document.title = this.t('site_title');
        }

        if (shouldRerender) {
            if (typeof initAppShell === 'function') {
                initAppShell();
            }
            if (typeof handleRoute === 'function') {
                handleRoute();
            }
        }
    },

    // Toggle between 'ar' and 'en'
    toggleLang() {
        const newLang = this.lang === 'ar' ? 'en' : 'ar';
        this.applyLang(newLang, true);
    }
};

// Expose globally
window.I18N = I18N;
I18N.init();
