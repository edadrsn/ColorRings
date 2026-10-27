# Color Rings — oynanış, fizik ve bölüm düzenlemesi

27 Ekim 2026. Önce mevcut sürüm `f67606a` commit'iyle `origin/main` üzerindeki GitHub deposuna gönderildi. Bu rapor sonraki oynanış değişikliklerini açıklar. Proje sıfırdan oluşturulmadı; Phaser 3.90, TypeScript 5.9, Vite 7 ve Canvas kullanılıyor. Yeni bağımlılık eklenmedi.

## Değişen dosyalar ve sistemler

- `src/main.ts`: kompakt oyun yerleşimi, gerçek kapsayıcı boyutunu izleyen ResizeObserver, arka planda duraklatma, ödül animasyonunu atlama, yıldız sesleri, halka durum metni; yalnız ayrı test profilinde çalışan `?sandbox=1&level=103` inceleme adresi.
- `src/scene.ts`: daha büyük top resmi, gerçek spin ile yüzey dönmesi, fizik temasına bağlı esneme/parçacık, duraklatılan tween ve zamanlayıcılar, Restart seçim temizliği, kısa sonuç gecikmesi, palete özgü iz/parlama.
- `src/gameplay-presentation.ts`: fizik ölçülerinden ayrı görünüm boyutları, materyal hareket profilleri ve temas şiddeti hesabı.
- `src/physics.ts`: temas noktası, normali ve bağıl çarpışma şiddeti bildirilir. Yerçekimi, hız integrasyonu, 120 Hz adım, duvar çözümü, 14 px çarpışma yarıçapı korunur.
- `src/engine.ts`: bağlı takipçi kilitliyken sürücü de döndürülemez; yanıltıcı boş sürükleme önlenir.
- `src/effects.ts`, `src/audio.ts`: Low modunda izler kapalı; roll/select/star sesleri ve döndürme/yuvarlanma ses hız sınırları.
- `src/relay-levels.ts`, `src/levels.ts`: sekiz doğrulanmış bölüm düzenlemesi; kimlikler ve 40 Klasik + 100 Ustalık ayrımı korunur.
- `src/solutions.ts`, `src/hints.ts`, `src/plan-search.ts`: geçici kararsız durumda doğrulanmış bekleme ipucu, gerçek fizikle sınırlı çözüm sadeleştirme araması.
- `src/visual-system.css`: daha geniş oyun alanı, kompakt üst bölüm, kısa ekran uyarlaması ve sonuç animasyonu atlama.
- `tests/gameplay-polish.test.ts`, `tests/audio.test.ts`: 17 yeni test; canlı anahtar, bağlı kilit, zorunlu hareket, tepki gecikmesi, temas, arama, ses sınırları ve değişmeyen fizik kontrolleri.
- `scripts/audit-gameplay.mjs`, `scripts/probe-relays.mjs`, `scripts/install-relays.mjs`: tekrar üretilebilir doğrulama ve çevrim dışı bölüm tasarımı araçları. Arama oyun döngüsünde çalışmaz.
- `scripts/import-review-captures.mjs`, `scripts/pack-review.mjs`: gerçek tarayıcı görsellerini içe alma ve çevrim dışı galeriyi paketleme.
- `README.md`, zorluk raporları, 140 PNG, 14 karşılaştırma sayfası, manifest ve ZIP güncellendi.

## Labirent ve responsive düzen

390×844 görünümünde aynı Klasik 3 bölümünün tuvali yaklaşık 326 px yerine 390 px genişlikte çizilir. Eski 1.04 kamera yakınlaştırması kaldırıldığı için labirentin görünen çapı yaklaşık 298 → 343 px, yani %15 büyür. Normal telefonlarda kullanılabilir oyun sütununun yaklaşık %88'ini doldurur.

320×568 gibi kısa ekranlarda öğretici ve erişilebilir 44 px kontroller korunur; labirent bunlarla birlikte yaklaşık %70 genişliğe inebilir. Başlık ve durum metni kısa ekranda görsel olarak gizlenir, erişilebilir içerik korunur. Bütün ekranlarda %90 boyut iddia edilmez.

Öğretici veya uzun hedef metni açıldığında Phaser'ın yalnız pencere boyutuna bakması kovaları kontrollerin arkasında bırakabiliyordu. ResizeObserver gerçek oyun kapsayıcısını ölçüp `scale.setParentSize` uygular. Bu hata 320×568 ekran görüntüsünde yakalandı ve düzeltildi. Safe-area CSS ve viewport-fit korunur. Mantıksal fizik koordinatları değişmez.

## Top hareketleri, fizik ve geri bildirim

Top doku görüntüsü 62 → 66 mantıksal piksel; çarpışma yarıçapı hâlâ 14 px. Halo ve yüzey görsel ölçüdür. Önceki sinüs sallanması yerine gerçek fizik spin'i iki simülasyon durumu arasında enterpole edilir. Yansıma katmanı yüzeyden ayrı hareket eder; duran top gereksiz dönmez.

Çarpışmalar artık kareler arasındaki hız farkından tahmin edilmez. Gerçek duvar temasının normali ve şiddeti kısa, en fazla yaklaşık %11 esnemeyi ve sınırlı parçacık sayısını belirler. Fizik gövdesi esnemez. Sesler aynı anda en fazla sekiz ses sınırını, çarpışma için 100 ms ve yuvarlanma için 240 ms aralığını korur. Yeni ses dosyası veya ağ isteği yoktur.

Kova sıçraması, dolma, renkli halka ve combo efektleri korunur. Sonuç açılma gecikmesi 760 → 260 ms; Reduced Motion'da 0 ms. Yıldızlar ve altın sayımı beklenmeden Next Level kullanılabilir; Animasyonu atla bunları anında son hâline getirir. Play'in tek simülasyon koruması, gerçek 120 Hz adımlı 1×/2× ve Undo'nun mevcut hamle sayma kuralları korunur.

Pause artık tween'leri ve sahne zamanlayıcılarını da durdurur. Arka plan görünürlüğü fizik duraklatmasını yönetir; manuel Pause durumu geri dönüşte kaybolmaz. Restart parçacıkları, zamanlayıcıları, kova durumunu ve eski halka seçimini temizler.

## Paletler

Beş mevcut palet ve koleksiyon materyalleri korunur. Pastel daha hafif iz/parlama, Neon en belirgin kısa iz ve camgöbeği halka vurgusu, Candy şeker pembesi vurgu, Ocean serin yansıma, Galaxy mor vurgu ve mevcut yıldız zemini kullanır. Galaxy yıldız nefesi artık etkin görsel tema üzerinden çalışır. Mantıksal renk kimlikleri değişmez; top, kova, renkli geçit ve iz aynı palet eşlemesini kullanır. Low modunda iz yoktur, Reduced Motion'da parçacık ve iz yoktur.

## Bölüm çeşitliliği ve zorluk

Son seçki: **U32, U58, U59, U63, U70, U71, U72, U92**. Rastgele 100 bölüm üretilmedi. Diğer 132 normal bölüm korunur.

Üç bölümde önce anahtarın alınması, sonra dış halkanın açılması gerekir. Beş uzman bölümde anahtar, kilit, bağlı halkalar ve teslim dalgaları birleşir: iç halkayı kurtaran hareket dış yolu da birlikte açar. İki halkayı birkaç kare içinde ayrı ayrı ayarlama zorunluluğu kaldırıldı. Yıldız eşikleri gerçek doğrulanmış hamle sayısına göre yenilendi; uzman örneklerde bir ek hamle paylı bütçe var. Eski yıldızlar, tamamlanmalar ve sahip olunan ürünler silinmez.

Tasarımlar doğrudan gerçek RingSession ve PhysicsWorld ile denendi. Dar zamanlama pencereleri olan adaylar çıkarıldı. Seçili planların anahtar aşamasında 0 / 0.25 / 0.5 / 1 / 2 saniye bekleme sonrası devamı otomatik test edilir; çevrim dışı aday araması ayrıca ara 50 ms örnekleri kullanır. Bütün olası oyuncu zamanlamalarının başarı garantisi verilmez. Uzman kurtarma hareketi silindiğinde kanonik çözüm başarısız olur.

Sınırlı solver plan içindeki tek hareketleri silerek daha kısa doğrulanmış aday arar; anahtar, bağlı halka ve bütçeleri gerçek oyun mantığıyla uygular. Soyut bir yol bulup fizikte çalıştığını varsaymaz. Seçilen beş uzman planında tek hareket silme ile daha kısa bir yol bulunmadı. Bu, bütün sürekli açı ve zamanlar üzerinde global minimum kanıtı değildir.

Kampanya bütünü için halka/top/renk/anahtar/kilit/bağ/tek yön/dönüşüm/bütçe/hamle/aşama tablosu `gameplay-polish/LEVEL_VALIDATION.md` içindedir. Ustalık 41–60 ortalama 5.15 hamle / 2.75 aşama; 61–80 5.90 / 3.50; 81–100 6.45 / 3.80. Her ardışık bölümün kesin daha zor olduğu veya Klasik bölümlerin tamamının yeni 1–100 şemasına taşındığı iddia edilmez. İlk 40 Klasik düzen ve mevcut mekanik tanıtım sırası korunmuştur.

## Gerçek tarayıcı doğrulaması

Asıl oyuncu kaydı yerine `spin-sort-sandbox:` alanı kullanıldı.

- Klasik 1: iki gerçek mouse sürüklemesi → Play → iki doğru kova → üç yıldız. Undo, Restart, animasyonu atlama, Next Level → Klasik 2 çalıştı.
- Ustalık 63: gerçek arayüzde doğrulanmış tek halka ipuçlarıyla iki hazırlık, anahtar, bağlı halkayı açma, mavi dalga, son dönüş ve pembe dalga; **4 hareket / 4 teslim / 3 yıldız**. Bu bir elle çözüm keşfi olarak sunulmaz.
- Pause tuvalinin iki farklı anda alınan ekran görüntüsü byte olarak aynıydı. Resume, 2× → 1× ve Restart test edildi.
- Aynı Klasik 3 bölümünde Pastel ve Neon seçildi; Pastel seçimi reload sonrası korundu. Galaxy önce/sonra görseli ayrıca kaydedildi.
- 320×568, 390×844, 430×932, 768×1024 ve 1024×768 CSS viewport kontrolleri: `responsive.json`. Fiziksel telefon üzerinde dokunma testi değildir.
- Son tarayıcı konsol hataları kontrol edilir. 140 bölümün ayrı PNG'si ve 14 karşılaştırma sayfası gerçek Phaser inceleme ekranından tekrar üretildi; manifest/CRC ve bütün bölüm kaynakları doğrulandı.

## Test, build ve performans

- `npm test`: **729 geçti, 0 başarısız**.
- `npm run build`: TypeScript ve Vite production build geçti.
- `npm run audit:gameplay`: **140/140 normal + 15/15 Challenge/Live/Lab** gerçek fizik çözümü.
- `npm run audit:campaign`: **9.730 çift**, 0 aynı ve 0 eşik altı benzer geometri profili. Bu ölçü 140 farklı strateji kanıtı değildir.
- `npm run review:verify`: **140/140 PNG**, 14/14 karşılaştırma sayfası, tam kaynak eşleşmesi ve CRC geçti.
- Masaüstü tarayıcı örneği: 240 görünür kare, 144.0 FPS, p95 7.2 ms, 44 doku, yaklaşık 15.9 MB ham RGBA, 53.1 MB JS heap (`performance.txt`). Bu kısa masaüstü örneği telefonda 60 FPS veya GPU belleği ölçümü değildir.

## Korunan sistemler ve kalan mobil işler

Main Menu, Level Map, Collection, Store, Themes, Challenges, Daily, Achievements, Statistics, Live, Coin Economy, test satın alma/reklamlar ve kayıt anahtarı/sürümü korunur. Yeni kayıt migrasyonu gerekmez. Premium ve reklamlar hâlâ açıkça TEST sistemleridir.

Gerçek Android/iOS cihazlarında dokunma, safe-area, ses dengesi, uzun süreli bellek/ısı/FPS, uygulama yaşam döngüsü ve mağaza SDK doğrulaması yapılmadı. Üretim paketinde mevcut büyük Phaser chunk uyarısı sürer. Bu güncelleme mağazaya yayınlandığı veya mobil performansın onaylandığı anlamına gelmez.

Önce/sonra: `/gameplay-polish/index.html`. Güncel bütün bölüm görselleri: `/review-captures/index.html`.
