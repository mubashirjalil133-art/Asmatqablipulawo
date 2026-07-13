/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Translation, Dish, Testimonial, GalleryItem, Table, Waiter } from './types';

// Import our custom premium generated images
import heroBgImg from './assets/images/asmat_hero_bg_1783516346741.jpg';
import kabuliPulaoImg from './assets/images/asmat_kabuli_pulao_1783516290661.jpg';
import muttonKarahiImg from './assets/images/asmat_mutton_karahi_1783516313014.jpg';

export const HERO_BG_IMAGE = heroBgImg;

export const translations: Record<'en' | 'ur', Translation> = {
  en: {
    // Navigation
    home: "Home",
    about: "About Us",
    menu: "Menu",
    rms: "RMS Dashboard",
    gallery: "Gallery",
    contact: "Contact Us",
    comingSoon: "Coming Soon",
    reserveTable: "Reserve Table",

    // Hero
    heroWelcome: "Welcome to Asmat Kabuli Pulao & Hotel",
    heroTitle: "Asmat Kabuli Pulao & Hotel",
    heroSubheading: "Experience the legendary taste of traditional Kabuli Pulao, sizzling Karahis, and premium family dining in Sarai Naurang, KP.",
    viewMenuBtn: "Explore Menu",
    reserveTableBtn: "Reserve Table",

    // About
    aboutTitle: "Our Culinary Legacy",
    aboutSubtitle: "Serving Authenticity & Comfort Since 1995",
    aboutP1: "For over two decades, Asmat Kabuli Pulao & Hotel has stood as a beacon of rich Pakhtun culinary heritage and unmatched hospitality. Strategically located on Main G.T. Road, Sarai Naurang, our family restaurant serves as a vital oasis of flavor and comfort for both local food lovers and long-route travelers crossing Khyber Pakhtunkhwa.",
    aboutP2: "Our legendary Kabuli Pulao is prepared using a meticulously guarded family recipe. We steam long-grain Basmati rice in flavorful broth, topping it with tender mutton shanks, caramelized julienned carrots, and rich raisins. Every bite tells a story of authenticity, craftsmanship, and pure taste.",
    aboutP3: "We take pride in our spotless hygiene, premium ingredients, and hospitable family atmosphere. Our separate family seating halls are tailored for absolute comfort, and our digital-ready Restaurant Management System ensures every order is prepared and served with top-tier precision.",
    aboutStatExperience: "28+",
    aboutStatExperienceLabel: "Years of Culinary Legacy",
    aboutStatDishes: "2,500+",
    aboutStatGuests: "4.8★",
    aboutStatGuestsLabel: "Average Customer Rating",
    aboutStatDishesLabel: "Satisfied Guests Daily",

    // Dishes / Menu
    menuTitle: "Featured Masterpieces",
    menuSubtitle: "Indulge in our most sought-after signature dishes, prepared by traditional master chefs using premium ingredients.",
    allCategories: "All Specialties",
    pulaoCategory: "Kabuli Pulao",
    karahiCategory: "Karahis",
    bbqCategory: "Barbecue & Grills",
    fastFoodCategory: "Pizza & Fast Food",
    teaCategory: "Chai & Beverages",
    priceSymbol: "PKR ",
    viewFullMenu: "View Interactive Menu",

    // Gallery
    galleryTitle: "Visual Journey",
    gallerySubtitle: "Take a virtual tour of our premium dining hall and sizzling kitchen delicacies.",
    galleryAll: "Show All",
    galleryFood: "Delicious Food",
    galleryDining: "Dining Atmosphere",

    // Testimonials
    reviewsTitle: "Word of Mouth",
    reviewsSubtitle: "Hear what our distinguished guests and traveler families have to say about our food and hospitality.",
    verifiedGuest: "Verified Guest",
    addReviewBtn: "Share Your Experience",
    namePlaceholder: "Enter your name",
    ratingLabel: "Select Rating",
    reviewPlaceholder: "Write your honest review here...",
    submitReview: "Submit Review",
    reviewSuccess: "Thank you! Your review has been submitted successfully for verification.",

    // Contact
    contactTitle: "Reach Out to Us",
    contactSubtitle: "Drop by for an unforgettable culinary experience, or contact our reception desk for direct bookings.",
    businessName: "Asmat Kabuli Pulao & Hotel",
    locationLabel: "Our Address",
    locationValue: "Main G.T. Road, Sarai Naurang, Khyber Pakhtunkhwa, Pakistan",
    phoneLabel: "Phone Numbers",
    hoursLabel: "Operating Hours",
    hoursValue: "Open 24 Hours / 7 Days a Week",
    sendMessageBtn: "Send Message",
    callNowBtn: "Call Reception",
    whatsappChatBtn: "WhatsApp Order Support",
    formName: "Full Name",
    formPhone: "Phone Number",
    formMessage: "Your Message / Query",
    formSuccess: "Your message has been sent successfully. We will contact you shortly!",

    // Reservation Modal
    reservationTitle: "Table Reservation",
    resGuests: "Number of Guests",
    resDate: "Reservation Date",
    resTime: "Preferred Time",
    resNotes: "Special Notes (e.g., family section, mild spice)",
    resSubmit: "Confirm Reservation",
    resSuccess: "Your table reservation request has been received. We will call you within 10 minutes to confirm!"
  },
  ur: {
    // Navigation
    home: "ہوم",
    about: "ہمارے بارے میں",
    menu: "مینیو",
    rms: "آر ایم ایس ڈیش بورڈ",
    gallery: "گیلری",
    contact: "رابطہ کریں",
    comingSoon: "جلد آ رہا ہے",
    reserveTable: "ٹیبل بک کریں",

    // Hero
    heroWelcome: "عصمت کابلی پلاؤ اینڈ ہوٹل میں خوش آمدید",
    heroTitle: "عصمت قابلی پلاؤ اینڈ ہوٹل",
    heroSubheading: "روایتی قابلی پلاؤ کا لاجواب ذائقہ، دہکتی کڑاہی، اور مین جی ٹی روڈ سرائے نورنگ پر خاندانوں کے لیے بہترین فیملی ڈائننگ کا تجربہ۔",
    viewMenuBtn: "مینیو دیکھیں",
    reserveTableBtn: "ٹیبل بک کریں",

    // About
    aboutTitle: "ہمارا روایتی سفر",
    aboutSubtitle: "۱۹۹۵ سے ذائقہ، معیار اور خدمت کا امین",
    aboutP1: "پچھلی اڑھائی دہائیوں سے، عصمت کابلی پلاؤ اینڈ ہوٹل پختون کھانوں اور روایتی مہمان نوازی کا ایک روشن مینار بن کر کھڑا ہے۔ مین جی ٹی روڈ، سرائے نورنگ پر واقع ہمارا فیملی ریسٹورنٹ، مقامی افراد اور خیبر پختونخوا کے راستوں سے گزرنے والے مسافروں کے لیے ذائقہ اور آرام کا ایک بے مثال مرکز ہے۔",
    aboutP2: "ہمارا قابلی پلاؤ ایک خاندانی اور خاص ترکیب کے تحت تیار کیا جاتا ہے۔ ہم خوشبودار باسمتی چاولوں کو لذیز یخنی میں پکاتے ہیں، اور اس کے اوپر نرم و ملائم مٹن شینک، شیریں گاجر کی لیر اور میٹھی کشمش سجاتے ہیں۔ اس کا ہر لقمہ ذائقے، خوشبو اور روایت کا شاہکار ہے۔",
    aboutP3: "ہمیں اپنی بہترین صفائی ستھرائی، اعلیٰ معیار کے اجزاء اور پُروقار فیملی ماحول پر فخر ہے۔ ہمارے پردہ دار فیملی ہالز آپ کے آرام اور پرائیویسی کے لیے موزوں ہیں، اور ہمارا جدید ڈیجیٹل سسٹم یقینی بناتا ہے کہ آپ کا ہر آرڈر بالکل درست اور بروقت تیار ہو۔",
    aboutStatExperience: "۲۸+",
    aboutStatExperienceLabel: "سالہ روایتی تاریخ",
    aboutStatDishes: "۲,۵۰۰+",
    aboutStatGuests: "۴.۸★",
    aboutStatGuestsLabel: "گاہکوں کی اوسط ریٹنگ",
    aboutStatDishesLabel: "روزانہ مطمئن گاہک",

    // Dishes / Menu
    menuTitle: "ہمارے خاص روایتی پکوان",
    menuSubtitle: "ہمارے ماہر اور روایتی باورچیوں کے ہاتھ سے بنے لذیذ پکوانوں کا مینیو دریافت کریں۔",
    allCategories: "تمام پکوان",
    pulaoCategory: "قابلی پلاؤ",
    karahiCategory: "کڑاہی سپیشل",
    bbqCategory: "باربی کیو اور گرلز",
    fastFoodCategory: "پیزا اور فاسٹ فوڈ",
    teaCategory: "چائے اور مشروبات",
    priceSymbol: "روپے ",
    viewFullMenu: "مکمل مینیو دیکھیں",

    // Gallery
    galleryTitle: "ایک تصویری سفر",
    gallerySubtitle: "ہمارے خوبصورت ڈائننگ ہال اور کچن کی لذیذ تیاریوں کا ایک منظر۔",
    galleryAll: "سب دیکھیں",
    galleryFood: "لذیذ کھانے",
    galleryDining: "رونق اور ماحول",
    // Testimonials
    reviewsTitle: "گاہکوں کی زبانی",
    reviewsSubtitle: "ہمارے معزز مہمانوں اور مسافر خاندانوں کی آراء جو ہمارے ذائقے اور خدمت کے گواہ ہیں۔",
    verifiedGuest: "مصدقہ گاہک",
    addReviewBtn: "اپنی رائے دیں",
    namePlaceholder: "اپنا نام لکھیں",
    ratingLabel: "ستارے منتخب کریں",
    reviewPlaceholder: "اپنا دیانتدارانہ تبصرہ یہاں تحریر کریں...",
    submitReview: "تبصرہ بھیجیں",
    reviewSuccess: "بہت شکریہ! آپ کا تبصرہ موصول ہو گیا ہے اور جلد شائع کر دیا جائے گا۔",

    // Contact
    contactTitle: "ہم سے رابطہ کریں",
    contactSubtitle: "ایک یادگار ضیافت کے لیے ہمارے پاس تشریف لائیں یا بکنگ کے لیے فون کریں۔",
    businessName: "عصمت کابلی پلاؤ اینڈ ہوٹل",
    locationLabel: "ہمارا پتہ",
    locationValue: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا، پاکستان",
    phoneLabel: "فون نمبرز",
    hoursLabel: "اوقات کار",
    hoursValue: "۲۴ گھنٹے کھلا ہے - ہر وقت خدمت کے لیے تیار",
    sendMessageBtn: "پیغام بھیجیں",
    callNowBtn: "رابطہ کریں",
    whatsappChatBtn: "واٹس ایپ آرڈر سپورٹ",
    formName: "پورا نام",
    formPhone: "فون نمبر",
    formMessage: "آپ کا پیغام / سوال",
    formSuccess: "آپ کا پیغام موصول ہو گیا ہے۔ ہم جلد ہی آپ سے رابطہ کریں گے!",

    // Reservation Modal
    reservationTitle: "ٹیبل بکنگ فارم",
    resGuests: "مہمانوں کی تعداد",
    resDate: "بکنگ کی تاریخ",
    resTime: "پسندیدہ وقت",
    resNotes: "خصوصی ہدایات (مثلاً فیملی سیکشن، کم مرچیں)",
    resSubmit: "ٹیبل بکنگ کی تصدیق کریں",
    resSuccess: "ٹیبل بکنگ کی درخواست موصول ہو گیا ہے۔ ہم تصدیق کے لیے ۱۰ منٹ میں آپ کو کال کریں گے!"
  }
};

export const dishesData: Dish[] = [
  {
    id: "dish-1",
    nameEn: "Special Kabuli Pulao (Sella Rice & Mutton Shank)",
    nameUr: "خصوصی مٹن قابلی پلاؤ (سیلہ چاول اور مٹن شینک)",
    descriptionEn: "Our famous culinary masterpiece: Long-grain sella rice steamed in aromatic mutton stock, topped with succulent slow-cooked mutton, sweet julienned carrots, and rich raisins.",
    descriptionUr: "ہمارا عالمی شہرت یافتہ شاہکار: لذیز مٹن یخنی میں دم کیے گئے سیلہ چاول جس کے اوپر نرم و ملائم مٹن شینک، میٹھی گاجریں اور کشمش سجائی جاتی ہے۔",
    price: 1150,
    category: "pulao",
    image: kabuliPulaoImg,
    isFeatured: true,
    tagEn: "Legendary Best-Seller",
    tagUr: "سب سے زیادہ مقبول",
    isAvailable: true
  },
  {
    id: "dish-2",
    nameEn: "Asmat Special Peshawari Mutton Karahi",
    nameUr: "عصمت سپیشل پشاور مٹن کڑاہی",
    descriptionEn: "Fresh premium mutton cooked in its own natural fat with tomatoes, ginger, garlic, and freshly ground black pepper in an iron wok (Karahi) over roaring flames.",
    descriptionUr: "لوہے کی روایتی کڑاہی میں پکی ہوئی مٹن کڑاہی جس میں ٹماٹر، ادرک، لہسن اور کالی مرچ کا روایتی ذائقہ سمیٹا گیا ہے۔",
    price: 2800,
    category: "bbq",
    image: muttonKarahiImg,
    isFeatured: true,
    tagEn: "Sizzling & Spicy",
    tagUr: "دہکتا ذائقہ",
    isAvailable: true
  },
  {
    id: "dish-3",
    nameEn: "Asmat Special Chicken White Karahi",
    nameUr: "عصمت سپیشل چکن وائٹ کڑاہی",
    descriptionEn: "Tender chicken chunks cooked in a rich, velvety creamy sauce, yogurt, mild green chilies, and whole green coriander.",
    descriptionUr: "نرم چکن کے ٹکڑے جو دہی، بالائی (کریم)، ہری مرچوں اور دھنیے کی ایک مخملی چٹنی میں تیار کیے جاتے ہیں۔",
    price: 1650,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    tagEn: "Chef Recommended",
    tagUr: "شیف کی پسند",
    isAvailable: true
  },
  {
    id: "dish-4",
    nameEn: "Signature Charcoal Seekh Kabab (Beef/Chicken)",
    nameUr: "روایتی کوئلہ سیخ کباب (بیف یا چکن)",
    descriptionEn: "Perfectly minced meat blended with coriander, mint, onions, and local organic spices, grilled on open embers until smoky and juicy.",
    descriptionUr: "دھنیے، پودینے اور پیاز سے سجے قیمے کے کباب، جو دہکتے کوئلوں پر پکا کر انتہائی رس دار پیش کیے جاتے ہیں۔",
    price: 900,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    tagEn: "Smoky Hot",
    tagUr: "گرما گرم کوئلہ کباب",
    isAvailable: true
  },
  {
    id: "dish-5",
    nameEn: "Premium Chicken Tikka Boti",
    nameUr: "پریمیم چکن تکہ بوٹی",
    descriptionEn: "Boneless chicken thighs marinated overnight in mustard oil, yogurt, Peshawari spices, and red chili, char-broiled to smoky perfection.",
    descriptionUr: "سرسوں کے تیل، دہی اور روایتی پشاوری مصالحوں میں تیار چکن بوٹی جسے کوئلے پر لال کیا جاتا ہے۔",
    price: 850,
    category: "bbq",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: false
  },
  {
    id: "dish-6",
    nameEn: "Asmat Special Chicken Fajita Pizza",
    nameUr: "عصمت سپیشل چکن فجیتا پیزا",
    descriptionEn: "Hand-tossed crust loaded with seasoned grilled chicken, sweet bell peppers, onions, rich tomato paste, and premium melting Mozzarella cheese.",
    descriptionUr: "ہاتھ سے گوندھا ہوا تازہ پیزا جس پر مصالحہ دار چکن, شملہ مرچ، پیاز اور کثیر مقدار میں پریمیم پگھلا ہوا موزریلا چیز ڈالا جاتا ہے۔",
    price: 600,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    tagEn: "Kids & Family Choice",
    tagUr: "بچوں کا پسندیدہ",
    isAvailable: true,
    sizes: [
      { name: "Small", price: 600 },
      { name: "Medium", price: 1100 },
      { name: "Large", price: 1600 },
      { name: "X-Large", price: 2100 }
    ]
  },
  {
    id: "dish-12",
    nameEn: "Asmat Special Tikka Pizza",
    nameUr: "عصمت سپیشل چکن تکہ پیزا",
    descriptionEn: "Spicy chicken tikka chunks, hot onions, green chilies, and a thick layer of premium bubbling mozzarella cheese.",
    descriptionUr: "چکن تکہ کے مصالحہ دار بوٹی، پیاز، ہری مرچیں اور کثیر مقدار میں پگھلا ہوا موزریلا چیز۔",
    price: 650,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: true,
    sizes: [
      { name: "Small", price: 650 },
      { name: "Medium", price: 1200 },
      { name: "Large", price: 1750 },
      { name: "X-Large", price: 2200 }
    ]
  },
  {
    id: "dish-11",
    nameEn: "Crispy Chicken Zinger Burger",
    nameUr: "کرسپی چکن زنگر برگر",
    descriptionEn: "Golden crispy fried chicken breast with fresh lettuce and rich mayonnaise in a sesame seed bun.",
    descriptionUr: "خستہ اور خستہ فرائیڈ چکن، ہرا سلاد اور مایونیز کا ایک لذیذ برگر۔",
    price: 350,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "dish-9",
    nameEn: "Chilled Soft Drinks (Pepsi / Coca-Cola)",
    nameUr: "ٹھنڈی سافٹ ڈرنکس (پیپسی / کوکا کولا)",
    descriptionEn: "Refreshing chilled carbonated drinks served with ice.",
    descriptionUr: "برف کے ساتھ ٹھنڈی اور تازگی بخش سافٹ ڈرنکس۔",
    price: 120,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "dish-10",
    nameEn: "Fresh Sweet Lassi",
    nameUr: "تازہ میٹھی لسی",
    descriptionEn: "Traditional yogurt drink, blended sweet, chilled and creamy.",
    descriptionUr: "دہی، دودھ اور کریم سے تیار کردہ روایتی ٹھنڈی اور میٹھی لسی۔",
    price: 250,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "dish-7",
    nameEn: "Zafrani Elaichi Chai (Saffron Tea)",
    nameUr: "زعفرانی الائچی چائے",
    descriptionEn: "A comforting blend of black tea, organic green cardamom pods, and premium saffron filaments brewed slowly in whole milk.",
    descriptionUr: "کڑک چائے، ہری الائچی اور پریمیم زعفران کا ایک دلفریب اور شاہانہ امتزاج جو خالص دودھ میں تیار کیا جاتا ہے۔",
    price: 180,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    tagEn: "The Perfect Ending",
    tagUr: "لاجواب اختتام",
    isAvailable: true
  },
  {
    id: "dish-8",
    nameEn: "Traditional Peshawari Qahwa (Green Tea)",
    nameUr: "روایتی پشاوری قہوہ",
    descriptionEn: "Authentic Peshawari green tea brewed with cardamoms, mint, and served warm with lemon and sugar candy.",
    descriptionUr: "سبز پتی اور الائچی کا روایتی قہوہ، جو ہاضمے کے لیے بہترین ہے اور لیموں کے ساتھ پیش کیا جاتا ہے۔",
    price: 90,
    category: "drinks",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80",
    isAvailable: true
  },
  {
    id: "dish-naan",
    nameEn: "Tandoori Naan",
    nameUr: "تندوری نان",
    descriptionEn: "Freshly baked hot tandoori naan from our clay oven.",
    descriptionUr: "تندور سے تازہ پکا ہوا گرما گرم نان۔",
    price: 90,
    category: "roti_naan",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "dish-roghni",
    nameEn: "Special Roghni Naan",
    nameUr: "خصوصی روغنی نان",
    descriptionEn: "Soft and fluffy naan topped with sesame seeds and brushed with melted butter.",
    descriptionUr: "تلوں والا نرم و ملائم روغنی نان جس پر مکھن لگایا گیا ہو۔",
    price: 120,
    category: "roti_naan",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    isAvailable: true
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: "review-1",
    nameEn: "Engr. Mubashir Jalil",
    nameUr: "انجینئر مبشر جلیل",
    rating: 5,
    textEn: "Asmat Kabuli Pulao is an absolute culinary legend! The mutton is incredibly tender and literally slides off the bone, while the rice holds the perfect amount of savory cardamoms and sweet carrots. The hospitality of the hosts running it is warm and outstanding. Highly recommended for families!",
    textUr: "عصمت قابلی پلاؤ ایک لافانی ذائقہ ہے! مٹن اتنا نرم اور پکا ہوا ہوتا ہے کہ ہڈی سے خود الگ ہو جاتا ہے، اور چاولوں میں گاجر اور کشمش کا تناسب لاجواب ہے۔ ریسٹورنٹ کے عملے کی مہمان نوازی دل جیت لیتی ہے۔ فیملیز کے لیے بہترین جگہ ہے!",
    date: "July 2, 2026",
    roleEn: "Local Elite Guide",
    roleUr: "لوکل ایلیٹ گائیڈ"
  },
  {
    id: "review-2",
    nameEn: "Kamran Khan",
    nameUr: "کامران خان",
    rating: 5,
    textEn: "We were driving from Islamabad to Bannu and stopped here for dinner. The Peshawari Mutton Karahi we ordered was prepared fresh in front of us and tasted phenomenal. Best restaurant in Naurang! Very quick and clean dining experience.",
    textUr: "ہم اسلام آباد سے بنوں جا رہے تھے اور یہاں کھانے کے لیے رکے۔ جو مٹن کڑاہی ہم نے آرڈر کی وہ ہمارے سامنے تازہ تیار کی گئی اور ذائقہ لاجواب تھا۔ نورنگ کا بہترین ریسٹورنٹ! بہت تیز اور صاف ستھرا ڈائننگ ہال۔",
    date: "June 28, 2026",
    roleEn: "Traveler & Family Man",
    roleUr: "فیملی مسافر"
  },
  {
    id: "review-3",
    nameEn: "Fatima Shah",
    nameUr: "فاطمہ شاہ",
    rating: 5,
    textEn: "I love their separate and fully carpeted traditional family dining section. It is very respectful, quiet, and hygienic. Their special Zafrani Chai is a masterpiece. It's the only place my family stops at whenever we travel on the G.T. road.",
    textUr: "مجھے ان کا خواتین اور فیملیز کے لیے علیحدہ اور صاف ستھرا روایتی پردہ دار سیکشن بہت پسند آیا۔ یہ انتہائی پرسکون اور حفظان صحت کے مطابق ہے۔ ان کی خاص زعفرانی چائے ایک کمال چیز ہے۔ جب بھی ہم جی ٹی روڈ پر سفر کرتے ہیں، یہی ہمارا واحد پڑاؤ ہوتا ہے۔",
    date: "June 15, 2026",
    roleEn: "Peshawar Tourist",
    roleUr: "سیاح خاتون"
  }
];

export const galleryData: GalleryItem[] = [
  {
    id: "gal-1",
    titleEn: "Our Signature Kabuli Pulao",
    titleUr: "ہمارا روایتی قابلی پلاؤ",
    category: "food",
    image: kabuliPulaoImg
  },
  {
    id: "gal-2",
    titleEn: "Traditional Sizzling Karahi",
    titleUr: "روایتی دہکتی مٹن کڑاہی",
    category: "food",
    image: muttonKarahiImg
  },
  {
    id: "gal-4",
    titleEn: "Luxury Family Dining Section",
    titleUr: "خاندانوں کا صاف ڈائننگ ہال",
    category: "dining",
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-5",
    titleEn: "Premium Delicacies on Display",
    titleUr: "کچن میں تیار کباب اور BBQ",
    category: "food",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-7",
    titleEn: "Vibrant Main Dining Atmosphere",
    titleUr: "مرکزی ریسٹورنٹ ہال کی رونق",
    category: "dining",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gal-8",
    titleEn: "Fresh Saffron Tea Brewing",
    titleUr: "گرما گرم زعفرانی چائے کی تیاری",
    category: "food",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"
  }
];

// Default Tables
export const defaultTables: Table[] = [
  { id: 't1', number: 1, status: 'vacant', capacity: 4 },
  { id: 't2', number: 2, status: 'vacant', capacity: 4 },
  { id: 't3', number: 3, status: 'vacant', capacity: 6 },
  { id: 't4', number: 4, status: 'vacant', capacity: 6 },
  { id: 't5', number: 5, status: 'vacant', capacity: 8 },
  { id: 't6', number: 6, status: 'vacant', capacity: 2 },
  { id: 't7', number: 7, status: 'vacant', capacity: 4 },
  { id: 't8', number: 8, status: 'vacant', capacity: 4 },
  { id: 't9', number: 9, status: 'vacant', capacity: 4 },
  { id: 't10', number: 10, status: 'vacant', capacity: 4 },
  { id: 't11', number: 11, status: 'vacant', capacity: 4 },
  { id: 't12', number: 12, status: 'vacant', capacity: 6 },
  { id: 't13', number: 13, status: 'vacant', capacity: 6 },
  { id: 't14', number: 14, status: 'vacant', capacity: 8 },
  { id: 't15', number: 15, status: 'vacant', capacity: 12 }, // VIP Majlis Table
  { id: 't16', number: 16, status: 'vacant', capacity: 2 },
  { id: 't17', number: 17, status: 'vacant', capacity: 4 },
  { id: 't18', number: 18, status: 'vacant', capacity: 4 },
  { id: 't19', number: 19, status: 'vacant', capacity: 4 },
  { id: 't20', number: 20, status: 'vacant', capacity: 8 }
];

// Default Waiters
export const defaultWaiters: Waiter[] = [
  { id: 'w1', nameEn: "Mubashir Jalil", nameUr: "مبشر جلیل", phone: "0302-1112223" },
  { id: 'w2', nameEn: "Azlan Shah", nameUr: "ازلان شاہ", phone: "0303-4445556" },
  { id: 'w3', nameEn: "Zeeshan", nameUr: "ذیشان", phone: "0304-7778889" },
  { id: 'w4', nameEn: "Ismatullah", nameUr: "عصمت اللہ", phone: "0305-9990001" }
];
