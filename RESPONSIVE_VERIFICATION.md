# Chroma Spiral — ekran uyumu doğrulaması

2 Kasım 2026. Bu rapor tarayıcıdaki ekran benzetimlerini gerçek cihaz testinden ayırır.

## Sonuç

13 ekran boyutunda 277 düzen/etkileşim kontrolü geçti; son turda taşma, kesilme, düğme engellenmesi veya JavaScript hatası görülmedi. Bu, tüm olası cihazların veya Safari/WKWebView'in doğrulandığı anlamına gelmez.

İki gerçek arayüz sorunu düzeltildi:

1. 690 pikselden kısa ekranlarda ana menünün sabit üst/alt dolgusu güvenli alanı dikkate almıyordu. Dar/çentikli ekranlarda güvenli alan artık kısa ekran düzeninde de korunuyor.
2. Başarım ödülü bildirimi küçük ekranda yeniden oynama düğmesini kapatabiliyor ve menü dokunmalarını engelleyebiliyordu. Bilgi bildirimleri artık dokunmayı yakalamıyor; bölüm sonucu açıkken fazladan ödül bildirimi görünmüyor. Bölümün altın/yıldız ödülü ve başarım kaydı korunuyor.

Değişiklik src/visual-refresh.css ile sınırlı; bulmaca mantığı, fizik, seviyeler, ekonomi ve kayıt şeması değişmedi. İlk dokunma uyarıları yeni test betiğinin dokunmatik özelliğini oyun açıldıktan sonra etkinleştirmesinden; ilk tam ekran uyarıları da açılış animasyonu bitmeden ölçüm yapılmasından kaynaklandı. Betik doğru başlangıçla ve tamamlanmış animasyonla yeniden çalıştırıldı; bunlar oyun hatası olarak sayılmadı.

## Test matrisi — Chromium ekran benzetimi

| Senaryo | CSS ekranı | Üst/alt güvenli alan |
|---|---|---|
| small-320 | 320 × 568 | 24 / 24 px |
| Android-360 | 360 × 640 | 24 / 24 px |
| iPhone-SE | 375 × 667 | 20 / 0 px |
| A24-size | 384 × 832 | 27 / 0 px |
| iPhone-mini | 360 × 780 | 50 / 34 px |
| iPhone-390 | 390 × 844 | 47 / 34 px |
| iPhone-large | 430 × 932 | 59 / 34 px |
| Android-large | 412 × 915 | 24 / 24 px |
| foldable | 600 × 960 | 24 / 24 px |
| tablet-768 | 768 × 1024 | 24 / 20 px |
| iPad-820 | 820 × 1180 | 24 / 20 px |
| iPad-landscape | 1024 × 768 | 24 / 20 px |
| large-tablet | 1366 × 1024 | 24 / 20 px |

Bu iPhone/iPad isimleri yalnızca boyut senaryolarını belirtir; test motoru Chromium'dur, Safari değildir. Android ve iPhone dikey oyun yerleşimi, tablet ve iPad yatay yerleşimi incelendi. Android/iPhone native ayarları dikey; iPad native ayarları yatayı da destekliyor.

Kontroller: oyun alanı ve Canvas sınırları; üst bilgi/alt kontroller; tam ekran ana menü; Klasik/Ustalık haritaları; son bölüme kaydırma; mağaza; top koleksiyonu; temalar; günlük sayfası; başarımlar; istatistikler; ayarlar; sekiz dilde başlıklar; güvenli alan benzetimi; düğmelerin ulaşılabilirliği. Dört ekran senaryosunda gerçek tarayıcı dokunma olaylarıyla halka sürükleme, Undo, Restart, Play, doğru tamamlanma ve sonuç düğmelerine erişim doğrulandı.

## Gerçek cihaz / iOS sınırı

Bağlı Samsung Galaxy A24 (Android 16) üzerinde uygulamanın kurulu olduğu, 384 × 832 CSS viewport ve uygulama WebView'i incelendi. Ayrı native test profili açıldı; yalnızca sandbox kayıt anahtarlarına yazıldı, gerçek oyuncu kaydı sıfırlanmadı. Menü etkileşim testi tamamlanmadan durduruldu; bu cihazda tüm dokunma/oynanış testlerinin geçtiği iddia edilmiyor. Telefona yeni APK kurulmadı ve telefon testine devam edilmedi. Yerel hata ayıklama bağlantısı çalışma sonunda kaldırıldı.

Gerçek iPhone/iPad, Safari/WKWebView, macOS/Xcode derlemesi bu çalışmada yapılmadı. Windows'taki boyut ve safe-area benzetimleri gerçek iOS testi yerine geçmez. Gerçek cihazlarda sistem font ölçeği, farklı klavye/çoklu pencere ve uzun süreli kullanım ayrıca kontrol edilmeli.

## Çalıştırılan diğer kontroller

- TypeScript + Vite production build: geçti.
- Görsel/mobil hazırlık odaklı testler: 14 geçti, 0 başarısız.
- Mevcut tarayıcı UI akışı: 15 kontrol geçti, 0 JavaScript hatası (dokunma, Undo/Restart/Play, kayıt/ödül korumaları, menüler, sekiz dil, safe-area).
- Bağımsız Android Gradle assembleDebug: BUILD SUCCESSFUL, 183 görev; son derlemede 3 çalıştı / 180 günceldi.
- Capacitor iOS sync: geçti; iOS uygulaması derlenmedi.
- Android, bağımsız masaüstü iOS kopyası ve kaynak iOS public dosyaları production dosyalarıyla SHA-256 üzerinden eşleştirildi. Platforma özel Capacitor köprü dosyaları ayrıca korundu.
- Fizik/140 bölümün tüm testleri bu CSS değişikliği için yeniden çalıştırılmadı; önceki başarılar bu turda yapılmış gibi raporlanmıyor.

## Dosyalar

- Android güncel test APK: masaüstü Chroma Spiral/ColorRings-debug.apk.
- Android ve masaüstü iOS public dosyaları güncellendi. Önceki paketler responsive-proof/asset-backups altında yedeklendi.
- Dated Android/iOS ZIP'leri masaüstüne yeni adlarla oluşturuldu; önceki ZIP'ler ezilmedi.
- Karşılaştırma ekranları ve ayrıntılı JSON ölçümleri, masaüstündeki tam kaynak proje klasörünün responsive-proof dizininde tutuluyor; bu Android deposuna dahil değil.
- Bu rapor ekran doğrulamasının sonuçlarını kaydeder. Android dağıtım dosyaları ve rapor Git ile sürümlenir; tam kaynak proje ve iOS bu depoya dahil değildir.

Tekrar çalıştırmak için paket dosyalarını yerel HTTP sunucusunda sunun, izole Chromium'u CDP 9227 ile başlatın; kaynak proje içinde RESPONSIVE_ORIGIN değerini sunucu adresine ayarlayıp node scripts/verify-responsive.mjs çalıştırın. Native kip ayrı izin ve açık telefon gerektirir; otomatik başlatılmaz.
