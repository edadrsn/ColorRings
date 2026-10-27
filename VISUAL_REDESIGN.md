# Color Rings · Görsel yenileme teslimatı

## Görsel olarak değişen dört ana ekran

**Main Menu:** Özgün SVG manzara, mavi gökyüzü, bulutlar, katmanlı tepeler, pastel ağaçlar ve kısa hareketli ışık noktaları. İki satırlı, renkli ve kabartma hissi veren COLOR RINGS logosu. Büyük yeşil Play, turuncu Challenges, mor Collection; çizilmiş ikonlarla alt erişim. Altın sayacı belirgin. Açılış artık bu menüyü gösterir; Play kayıtlı bölüme döner.

**Collection:** Koyu lacivert vitrin, büyük materyal görselleri, renkli ortam ışığı, sahiplik/seçili durumu ve nadirlik etiketi. Topa dokunulduğunda büyük önizleme, hafif yüzey hareketi, iki gerçek oyun renginin örneği ve çalışan Unlock/Equip düğmesi açılır. Beyaz inci, altın metal, kristal yüzey, yıldızlı galaksi, neon halka, gökkuşağı, alev, buz ve karakter yüzleri özgün Canvas materyalleridir. Dış renk mührü, alt renk işareti ve isteğe bağlı sembol hedef kovayı belirtir.

**Store:** Metin listesi yerine özgün ürün çizimleri ve renkli kartlar. Remove Ads simgesi, taçlı sandık, para yığını, Neon/Galaxy küre paketleri. Paket içerikleri gerçek oyun dokularından çizilir. Sekmeler ve satın alma düğmeleri belirgin. Başarılı test işleminin üstte kısa onay animasyonu vardır. TEST etiketleri ve ücretsiz test açıklaması korunur.

**Gameplay:** Renkli metal kenarlı daha belirgin halkalar, derinlik/gölge ve parlak geçit uçları. Top materyalleri yenilendi; kürenin görsel yüzeyi biraz büyüdü, fiziksel yarıçap sabit kaldı. Kova/karakter renk eşleşmesi, hareket izleri, kısa esneme, çarpışma sesi ve mevcut combo korunur. Görev kartında gerçek paletten renk sembolleri gösterilir. Sonuç ekranı lacivert panel, altın yıldız/ödül ve güçlü yeşil düğmelerle yenilendi.

## Referanstaki 14 alanın karşılaştırması

| Referans alanı | Uygulamadaki karşılığı ve değişiklik |
| --- | --- |
| 1. Renk paletleri | Beş paletin önizlemesi artık aynı Canvas küre çizicisinden üretilir. Classic dekoratif tema seçiliyken Neon/Candy/Ocean/Galaxy paleti sahne ortamını da değiştirir. Kullanıcı ayrıca bir dekoratif tema seçtiyse o tema korunur. |
| 2. Top görünümleri | 23 materyal; büyük vitrin ve detay önizlemesi. Yalnız aynı renkli yüzeye farklı küçük desen basılması yaklaşımı değiştirildi. Kimlik, sahiplik, fiyat ve açılma şartları korunur. |
| 3. Animasyonlar | Yuvarlanma, parlama, iz, çarpışma, kova patlaması, combo ve ödül korunur. Yeni materyal önizlemesi, açılma dalgası, satın alma onayı ve kısa basılma hareketi eklendi. Reduced Motion bu yeni hareketleri kapatır. |
| 4. Örnek bölüm tasarımları | Gerçek iki/dört katlı labirentler aynı bölüm verisinden çizilir. Bölüm geometrisi bu görevde değiştirilmedi; görünüm güncellendi. |
| 5. Görev gösterimi | Okunaklı kart ve o bölümün hedef kovalarıyla aynı renk/simge işaretleri. Mevcut anahtar/sıra/hamle koşulları gerçek veriden gelir. |
| 6. Ana menü | Canlı gökyüzü, büyük özgün logo, parlak Play ve renkli ikincil düğmeler. Referans ekran görüntüsü arka plan olarak kullanılmadı. |
| 7. Bölüm haritası | Bölüm numarası küreleri, tamamlanan/seçili/kilitli renkleri, altın yıldızlar ve bölümlenmiş kartlar. Mevcut 40/100 ilerleme kilitleri korunur. |
| 8. Store | Büyük ürün görseli, renkli kart, gerçek küre küçük önizlemeleri, belirgin fiyat/test düğmesi ve sahiplik durumu. |
| 9. Reklam ekranları | Ödül sandığı ve büyük ödül kartları; ne kazanılacağı açık. TEST AD, iptal/yükleme hatası ve tek ödül koruması devam eder. |
| 10. Statistics/Achievements | Lacivert ortak paneller, çizilmiş altın ikonlar, kontrastlı sayılar ve mint ilerleme çubukları. Sayılar gerçek kayıttan gelir. |
| 11. Live Mode | Aynı yenilenen sahne, okunaklı öğretici ve kontrol panelleri. Toplar hareket ederken gerçek halka kontrolü ve ayrı ilerleme korunur. |
| 12. Hız kontrolü | 1×/2× düğmeleri yüksek kontrastlı ortak kontrol stilini kullanır. Sabit fizik adımı değişmedi. |
| 13. Ayarlar | Koyu panel, okunaklı metin, büyük dokunma alanları ve kalıcı seçenekler. Gerçek kare/doku gözlemini gösteren tanılama düğmesi eklendi. |
| 14. İleri mekanikler | Bağlı halkalar, bölücüler ve sınırlı dönüş verileri korunur. Anahtar/kilit çizimleri daha belirgin; ileri görevler sertifika testlerinden geçti. |

## Önce / sonra kanıtları

`visual-redesign/index.html` dört ekranı yan yana karşılaştırır. Önce ve sonra görüntüleri aynı gerçek kayıtta, aynı Ustalık 2 başlangıç düzeninde ve aynı masaüstü tarayıcı boyutunda alındı. Menüdeki kozmetik incelemelerde asıl oyuncunun altını harcanmadı.

- `visual-redesign/before/{home,collection,store,gameplay}.jpg`
- `visual-redesign/after/{home,collection,store,gameplay}.jpg`
- Ek mobil örnekler: `visual-redesign/after/` içinde harita, istatistik, başarımlar, Daily, Challenges, paletler, Themes, Settings ve Live.

## Değiştirilen dosyalar

Yeni modüller:

- `src/materials.ts`: 23 özgün, önbelleklenen küre materyalinin Canvas çizimi.
- `src/ui-art.ts`: özgün SVG ürün çizimleri, ikonlar ve manzara.
- `src/home-view.ts`: gerçek menü düğmeleri ve büyük logo yerleşimi.
- `src/visual-theme.ts`: dekoratif tema/palet sunum önceliği ve önizleme tonları.
- `src/palette-preview.ts`: aynı küre çizicisiyle palet önizlemeleri; beşli önbellek.
- `src/visual-system.css`: ortak renk, tipografi, kart, düğme, gölge, ölçü ve hareket sistemi.
- `src/render-telemetry.ts`: son 240 görünür sahne karesinin sınırlı gözlemi.
- `tests/visual-redesign.test.ts`: materyal kimliği/renk mührü, palet önceliği, menü rotaları, önizleme durumları, ürün çizimleri, kare gözlemi ve Daily ödül metni kontrolleri.

Güncellenenler: `src/artwork.ts`, `src/scene.ts`, `src/main.ts`, `src/menu-views.ts`, `src/store-view.ts`, `src/store-controller.ts`, `src/mechanics-view.ts`, `README.md`. Fizik motoru, bölüm geometri verisi, kayıt anahtarı, fiyatlar ve ödeme/reklam sağlayıcı arayüzleri değiştirilmedi.

## Gerçekten yapılan testler

- **704 otomatik test geçti; 0 başarısız, 0 atlanan.** `visual-redesign/tests-final.log`.
- **155/155 gerçek fizik çözümü:** 140 normal, 5 Challenge, 5 Live, 5 laboratuvar. `npm run validate:levels -- --report` çalıştırıldı.
- **TypeScript ve production build başarılı.** Mevcut büyük Phaser chunk uyarısı sürüyor.
- 390×844 ve 320×568 tarayıcı boyutları kontrol edildi. Küçük ekranda ana menü düğmeleri düzeltildi; Store’un beş kartında içerik genişliği kart genişliğini aşmıyor. Vitrin ışıkları/küre haleleri kart içinde tasarım gereği kırpılır; sayfa yatay taşmaz.
- Ayrı `?sandbox=1` profilinde İnci’nin büyük önizlemesi açıldı; 80 altın harcanıp görünüm açıldı/Equip edildi; yeniden yüklemede korundu. Asıl kayıt bakiyesi bu testlerde harcanmadı.
- Galaxy paleti seçildiğinde gerçek sahne Space ortamına, toplar/kovalar Galaxy tonlarına geçti. Palet/tasarım rengi ile fiziksel renk kimlikleri ayrıdır.
- Test Gold ürünü yeni görselli karttan alındı ve onay görüldü. TEST AD iptalinde altın verilmedi; tamamlanmada 100 altın verildi; aynı olayın ikinci kez ödül vermesi engellendi.
- Yeni materyallerle Klasik 2’nin iki topu doğru kovaya ulaştı, üç yıldız ve ödül ekranı görüldü. Next Level ile Klasik 3’e geçildi. 2×, Pause, Restart, gerçek pointer sürükleme ve Undo denendi.
- Main Menu, Level Map, Gameplay, Collection, Store, paletler, Themes, Challenges, Daily, Achievements, Statistics, Settings ve Live ekranları tarayıcıda kontrol edildi. Daily metnindeki eski bir şablon ifadesi hatası düzeltilip teste bağlandı.

## Performans gözlemi

Yerel masaüstü tarayıcıda görünür 240 karelik kısa örnek: yaklaşık **144 FPS**, p95 **7,3 ms**. Ölçüm gerçek `performance.now()` kare aralıklarından alınır; fizik motorunun sabit adımından FPS türetilmez. Menü açık ve belge görünmezken yeni örnek eklenmez. Bu, telefon performansı veya uzun süreli stres testi değildir.

Collection dört kez açılıp kapatıldığında doku sayısı **158**, hesaplanan ham RGBA doku miktarı **22,5 MB** olarak sabit kaldı. Aynı gözlemlerde tarayıcının sunduğu JS heap **49,1–51,3 MB** aralığındaydı. Bunlar toplam cihaz RAM’i/GPU belleği veya sızıntı kanıtı değildir. Ham kayıtlar `visual-redesign/performance.txt` ve `visual-redesign/texture-cache-check.txt` içindedir.

Materyaller her kare yeniden çizilmez; 128×128 Canvas dokuları tekrar kullanılır. Ürün çizimleri yerel SVG, manzara tek SVG, parçacık havuzu ve efekt kalitesi sınırları korunur. Ağdan font/asset veya yeni kütüphane eklenmedi.

## Referansla kalan farklar ve sınırlar

Referansın gerçek 3D render görünümü bütünüyle kopyalanmadı. Uygulama 2D Canvas gradient, kırılma yüzeyleri, önceden çizilen dokular ve kısa CSS/Phaser animasyonları kullanır; dönen üç boyutlu mesh, gerçek zamanlı yansıma veya GPU materyal shader’ı yoktur. Cat/Panda görünümleri özgün çizilmiş karakter yüzleridir. Ana menüdeki manzara ve ürün illüstrasyonları da özgündür.

Gerçek reklam/ödeme altyapısı eklenmedi; test hakları gerçek mağaza satın alma doğrulaması değildir. Gerçek Android/iOS dokunma, ses/vibrasyon, düşük donanım, ısı, uzun oturum ve mağaza SDK testleri yapılmadı. Önceki 140 bölümün kayıtlı inceleme PNG’leri geometrik inceleme arşividir; bu yeni görsel dilin tamamı o arşive yeniden basılmadı.
