# Spin Sort · Color Rings

Son kalite ve Android test hazırlığı: [ANDROID_READINESS.md](ANDROID_READINESS.md). Son kontrolde 778 test ve production build başarılı; 140 normal + 15 özel bölüm fizik çözümü doğrulandı. Android uygulaması henüz oluşturulmadı. Denetimi yeniden üretmek için `node --experimental-strip-types scripts/audit-mobile-readiness.mjs` çalıştır.

Phaser 3, TypeScript ve Vite ile geliştirilmiş, Canvas üzerinde çalışan mobil bulmaca oyunu. 40 Klasik ve 100 Ustalık bölümü bulunur. İlerleme kayıtları korunur; seçili Klasik ve Ustalık düzenlerine gerçek ek katmanlar eklenmiştir. Oyun tamamen yereldir; reklam ve uygulama içi satın alma sistemi bulunmaz.

## Reklamsız oyun

Reklamlar, ödüllü reklamlar, uygulama içi satın alma, paketler ve bunların test simülatörleri kaldırıldı. Mağazada yalnız oyunda kazanılan altınla açılan kozmetikler bulunur. Eski ilerleme ve açılmış kozmetikler korunur. Güncel değişiklikler ve kontroller: [NO_MONETIZATION.md](NO_MONETIZATION.md). Eski tarihli raporlar önceki sürümlerin arşividir.

## Müzik ve diller

Ayarlar → Dil bölümünde Türkçe, İngilizce, Almanca, İspanyolca, Fransızca, Portekizce, İtalyanca ve Hollandaca olmak üzere 8 dil seçilebilir. Seçim anında uygulanır ve tarayıcıda saklanır. Arka plan müziği 112 BPM ritmik bas, kısa melodi ve hafif davullarla daha hareketli bir düzenlemeye geçti. Top koleksiyonu ve temalar altın fiyatına göre ucuzdan pahalıya sıralanır. Ayrıntılar ve doğrulama: [MUSIC_LANGUAGE_UPDATE.md](MUSIC_LANGUAGE_UPDATE.md).

## Çalıştırma

Windows'ta `Oyunu-Baslat.cmd` dosyasına çift tıklayabilirsin. Oyun zaten açıksa mevcut sunucuyu kullanır; değilse başlatır ve tarayıcıyı açar. Sunucu penceresini oynarken açık tut. Bilgisayar yeniden başlatıldığında bu dosyayı tekrar çalıştır; localhost bağlantısı bir çevrim içi hosting adresi değildir.

Node.js 22.18+ ve npm gerekir.

```sh
npm install
npm run dev
```

Yerel önizleme: http://localhost:5173/ (aynı adresi kullanmak aynı tarayıcı kaydını sürdürür).

```sh
npm test
npm run validate:levels -- --report
npm run build
npm run preview
```

Build, önce TypeScript kontrolünü yapar. Production dosyaları `dist/` içindedir.

## İçerik

- 140 normal bölüm: korunan 40 klasik bölüm ve bağımsız açılan 100 aşamalık Ustalık Yolu. Ustalık başlangıcı için klasik yolu bitirmek gerekmez.
- Ustalık artık en fazla üç bölümlük 34 fikir grubundan oluşur. İlk 12: açık geçitler (1–3), sıralı teslim (4–6), farklı başlangıç katları (7–9), anahtar/kilit (10–12). Ardından renk geçitleri, yan yollar, ritim, bağlı halkalar, bölücüler ve birleşik görevler dönüşümlü gelir. [DIFFICULTY.md](DIFFICULTY.md) gerçek çözüm planlarının hamle ve aşama sayılarını listeler.
- Beş Challenge: hareket bütçesi, ipucusuz çözme, tek deneme ve halka başına hareket sınırı.
- Günlük bulmaca: 20 doğrulanmış düzenin tarih tabanlı havuzu, tek seferlik günlük ödül ve streak.
- Beş deneysel Live bölümü: ilk giriş öğreticisi, kademeli 0,65×–1× temel hız, ayrı skor ve rekor kaydı; altın ödülü yoktur.
- Beş laboratuvar/prova: ayrı bölücü, bağlı halka ve hareket sınırı deneyleri; Ustalık 50 / 100 için ödülsüz provalar.
- 14 tema (Prism ve Velvet test Premium paketinde): Classic, Neon, Candy, Space, Aurora, Ocean, Sunset, Forest, Sakura, Glacier, Desert ve Midnight. Yeni temalarda farklı labirent paletleri ve statik Canvas desenleri; 23 özgün top görünümü (20 temel + 3 test Premium). Panda, Star ve Cosmic yalnız başarımla açılır. Koleksiyon önizlemeleri oyunun gerçek dokularını kullanır.
- On başarım, Perfect Flow ve bölüm bazlı 1–3 yıldız.
- Başarılı denemenin gerçek fizik kaydından ödülsüz Replay Solution; 1× / 2× hız; ölçülmüş oyun istatistikleri. Menü: Play / Challenges / Collection.

## Kontroller

Halkayı mouse veya parmakla sürükle; dokunma 30 derece döndürür. Puzzle Mode'da Play ile akışı başlat. Oyun başladıktan sonra da halkalar bağımsız kontrol edilebilir.

Undo son hareketi geri alır; Restart denemeyi sıfırlar. Hareketli fizik sırasında üstteki Pause/Resume düğmesi kullanılabilir. Menüde fizik bekler. Kovaların altında teknik derece düğmeleri bulunmaz.

Klavyede Canvas'a odaklan: ↑/↓ halka seçer, ←/→ klasiklerde 15°, ileri Ustalık düzenlerinde 5° çevirir, Space Play, R Restart, Z Undo. İlk üç bölüm etkileşimli ve atlanabilir öğreticidir; Ayarlar'dan yeniden başlatılabilir. Hız düğmesi fizik adımını büyütmez: 120 Hz çarpışmalar korunarak daha çok adım çalıştırır.

Yön izi yalnız ilk 0,45 saniyeyi, en fazla 64 dünya birimini aynı fizik motorunda hesaplar. İstenirse kapatılır. Görsel Hint doğrulanmış bir sonraki halkanın yönünü kısa süre gösterir; halkayı oyuncu çevirir. Hint o denemedeki Perfect Flow bonusunu kaldırır.

## Kayıt ve ödüller

Sürümlü kayıt aynı `spin-sort-v1` anahtarında tutulur. v1/v2/v3 verileri v4'e geçirilir; altın, yıldız, koleksiyon ve tercihler korunur. Klasik ve Ustalık kilitleri ayrıdır. Eski kayıtlarda bulunmayan hamle/süre ölçümleri tahmin edilmez; ortalama yalnız güncellemeden sonra ölçülen başarılı denemeleri kullanır. `localhost` ve `127.0.0.1` farklı tarayıcı originleridir ve ayrı kayıt tutar.

Normal ilk tamamlama, daha iyi yıldız için fark ödülü, bölüm başına bir Perfect Flow bonusu, bir günlük ödül ve bir başarım ödülü vardır. Tema/görünüm tekrar seçimi tekrar ücret almaz. Ayrıntılı kurallar [MASTER_UPDATE.md](MASTER_UPDATE.md) içindedir. Günlük ödüller cihaz tarihine dayanır; sunucusuz sistem tarih değiştirmeyi tamamen engelleyemez.

Eski bölümlerde Undo yalnız halkaları değiştirir; teslim edilmiş topu geri çıkarmaz. Anahtar/kilit, renk değiştirme veya hareketli engel içeren bölümlerde hareket başlangıcındaki fizik görüntüsü geri alınır; renk, anahtar, zaman ve doluluk birlikte geri yüklenir. Undo harcanan hamle sayısını silmez.

## Mimari

- `levels.ts`, `content.ts`, `mastery.ts`, `advanced-types.ts`: korunmuş bölümler, 100 aşamalık yol ve mekanik veri tipleri.
- `physics.ts`, `mechanics.ts`: 120 Hz fizik, dönen çarpışma geometrisi ve modüler mekanikler.
- `engine.ts`: normal/özel bölüm oturumu, hareket geçmişi, kurallar ve yaşam döngüsü.
- `solutions.ts`: gerçek fizik motorunda çözüm sertifikası.
- `links.ts`, `clock.ts`, `playback.ts`: oranlı hareket, sabit adımlı hız ve gerçek deneme tekrarı.
- `statistics.ts`, `objectives.ts`, `menu-views.ts`, `skin-motifs.ts`: ölçümler, görevler, veri tabanlı menüler ve özgün görünümler.
- `tutorial.ts`, `preview.ts`, `guidance.ts`, `hints.ts`: öğretici, kısa önizleme ve doğrulanmış görsel yardım.
- `progress.ts`, `meta.ts`, `modes.ts`: veri geçişi, ödüller, başarımlar, tarih ve ek modlar.
- `buckets.ts`, `scene.ts`, `mechanics-view.ts`, `artwork.ts`: kova hesabı ve özgün Canvas çizimleri.
- `themes.ts`, `cosmetics.ts`, `audio.ts`: kataloglar ve sınırlandırılmış sentez sesleri.
- `main.ts`, `style.css`: ortak mobil menüler ve oyun arayüzü.

## Doğrulama

764 otomatik test geçti; 140 normal, 5 Challenge, 5 Live ve 5 laboratuvar/prova için 155 gerçek fizik çözüm sertifikası. [LEVELS.md](LEVELS.md) ve [DIFFICULTY.md](DIFFICULTY.md) yeniden üretilebilir raporlardır. Son inceleme, tarayıcı testleri ve sınırlar [DIFFICULTY_UPDATE.md](DIFFICULTY_UPDATE.md) içindedir. [MASTER_UPDATE.md](MASTER_UPDATE.md) önceki 40 bölümlük sürümün tarihsel raporudur.

Kova/iz/parçacık nesneleri yeniden kullanılır. Sadece etkin bölümün halka dokuları tutulur. Mobil yerleşim 390×844 ve 320×568 boyutlarında kontrol edildi. Gerçek Android/iOS dokunma, donanım titreşimi, ses dengesi ve cihaz üzerinde 60 FPS ölçümü ayrıca gerekir. Çözüm testleri en iyi hamle sayısını veya bütün oyuncu hamlelerini kanıtlamaz.

Önerilen commit: `feat: add certified mastery campaign, recorded replay and collection progression`.

Ücretli top fiyatları yaklaşık %25 artırılıp 10 altına yukarı yuvarlandı: İnci 80, Neon 150, Yıldız tozu 230 altın. Önceki satın almalar korunur; Klasik ücretsiz, başarım görünümleri yalnız başarımla açılır. Tema sayacı katalogdan hesaplanır. Katalog testleri tüm sekiz yeni temanın satın alma, tekrar ücret almama ve kayıt/yeniden yükleme davranışını doğrular.

## Bölüm görsellerini inceleme

Yerel sunucuda /review-captures/index.html, kaydedilmiş 140 ayrı bölüm PNG’sini ve 14 numaralı karşılaştırma sayfasını açar. K4 / U37 gibi kodlarla arama ve büyütme vardır. Color-Rings-140-Bolum.zip çevrim dışı galeri, CSV ve bütün görselleri içerir. /review.html aynı Phaser sahnesinden yeni görseller üretme aracıdır; üretim build'inde de bulunur ve oyuncu kaydına yazmaz. Görseller yenilendikten sonra npm run review:verify ile 140 adet 540×960 PNG ve 14 adet 1500×1120 sayfa kontrol edilir. Ayrıntılar LAYOUT_REVIEW.md içindedir.

Son denetimde 140 bölümün 9.730 çifti karşılaştırıldı; 111 labirent yeniden tasarlandı. Bağımsız döndürme ve aynalama hesaba katıldığında aynı profil veya belirlenen eşik altında yakın çift kalmadı. 140 normal bölümün tamamının fizik çözümü doğrulandı. Tek tek sonuçlar CAMPAIGN_AUDIT.md içindedir. Görsel galerisindeki 140 PNG güncel bölüm verisi ve CRC ile doğrulanır; eski ekran görüntüsü denetimden geçemez. Ortak mekanikler ve çözüm fikirleri tekrar kullanılabilir; geometri denetimi 140 farklı strateji iddiası taşımaz.

## Palet, koleksiyon ve kozmetik mağazası

Collection → Renk paletleri: Pastel, Neon, Candy, Ocean, Galaxy. Toplar, kovalar, renk geçitleri ve izler aynı sunum paletinden çizilir; mantıksal renk kimlikleri değişmez. Semboller Ayarlar’dan açılır. Efekt kalitesi Low / Medium / High ve Reduced Motion kalıcıdır.

Store yalnızca oyun içi kazanılan altınla alınan top görünümleri, temalar ve renk paletlerini içerir. Altın satışı, paketler, reklam gösterimi ve test işlem ekranları kaldırıldı.

Normal ipucu yönü ücretsiz kalır. İstenirse doğrulanmış bir halka dönüşü bir ipucu kredisi veya 25 altın karşılığı uygulanabilir; uygulanamayan dönüş için ücret alınmaz. Challenge’ın ipucu yasağı korunur.

Kendi kaydını etkilemeden denemek için `http://localhost:5173/?sandbox=1` aç. Bu profil ayrı kayıt alanı kullanır; ekranda TEST PROFİLİ yazar. Varsayılan oyun adresi mevcut kaydı kullanır.

Ayrıntılı teslimat, değişen dosyalar, testler, sınırlar ve mobil mağaza geçişi: [PROFESSIONAL_UPDATE.md](PROFESSIONAL_UPDATE.md). 140 bölümün doğrulanmış zorluk profili: [DIFFICULTY_PROFILE.md](DIFFICULTY_PROFILE.md). `node --experimental-strip-types scripts/difficulty-profile.mjs` ile yeniden üretilebilir.

## Görsel yenileme

Açılış menüsü özgün SVG manzarası, büyük COLOR RINGS logosu ve renkli dokunma düğmeleriyle yenilendi. Collection’da 23 gerçek materyal dokusu, büyük detay önizlemesi ve Unlock/Equip akışı; Store’da yalnızca altınla açılan kozmetik kategorileri bulunur. Menü, harita, ödüller ve ayarlar ortak tasarım sistemini kullanır. Classic dekoratif tema seçiliyken renk paleti sahnenin ortamını da değiştirir; ayrıca seçilmiş tema korunur.

Gerçek uygulama ekranlarıyla önce/sonra: `/visual-redesign/index.html`. Referanstaki 14 alan, değişen dosyalar, gerçek test sonuçları ve performans sınırları: [VISUAL_REDESIGN.md](VISUAL_REDESIGN.md).

## Menü geri dönüşleri

Oyun içindeki geri oku ve Escape, gerçek bir ekran geçmişinde bir adım geri gider. Collection / Store / detay / Ayarlar / tema önizlemesi akışlarında sekme, koleksiyon filtresi, kaydırma ve odak korunur. X menüleri kapatıp oyuna döner. `src/menu-history.ts` ve sekiz gezinme testi eklendi; bu aşamada toplam 712 testti.

## Oynanış ve fizik düzenlemesi — 27 Ekim 2026

Labirent normal telefon görünümünde yaklaşık %15 büyüdü; kapsayıcıya göre dinamik Canvas ölçeklemesi, gerçek spin animasyonu, temas normali/şiddetine bağlı esneme, tam Pause, palete özgü izler ve ödül animasyonu atlama eklendi. U32 / U58 / U59 / U63 / U70 / U71 / U72 / U92 için sekiz fizik doğrulamalı anahtar ve bağlı halka düzeni var. Diğer bölüm kimlikleri ve kayıtlar korunur.

729 test; 140 normal + 15 özel bölüm çözümü; 140 güncel PNG ve 14 karşılaştırma sayfası doğrulandı. `npm run audit:gameplay` ile bölüm/hamle/aşama raporunu yeniden üret. Gerçek ekranlar `/gameplay-polish/index.html`; ayrıntılı dosyalar, ölçümler ve kalan mobil işler [GAMEPLAY_POLISH.md](GAMEPLAY_POLISH.md) içindedir. Yalnız ayrı test profilinde `?sandbox=1&level=103` yeni U63'ü açar; normal oyuncu kaydının kilitlerini değiştirmez.

## Final Gameplay Master — Web Release Candidate

İlk bulmaca tek dış halka hareketiyle öğretilir. Seçim / sürükleme / yol hizalama / Play / eşleme / başarı akışı, Skip, tekrar açma ve kaydedilen öğretici ilerlemesi vardır. K7 anahtar, K8 renk değişimi, K9 bağlı halka, K10 sınırlı iki dalga tanıtır; 40 Klasik bölümün yıldızları gerçek doğrulanmış jestlere göre ayarlanır. Kova yaklaşma/iniş, geçit ve çarpışma geri bildirimleri; doğru renk aileleri; kesin hamle ret nedenleri geliştirildi.

764 test, 140 normal + 15 özel gerçek fizik çözümü ve altı hedef bölümün gerçek UI tamamlaması doğrulandı. `npm run audit:release` çözüm ve bağımlılık raporunu üretir. Geliştirme/sandbox Ayarlar'ında 300 kayıtla sınırlı yerel test olayları görülebilir; uzak analitik yoktur. Menü, kovalar, alt kontroller ve kısa ekranlar kontrol edildi.

Detaylar, gerçek ekranlar ve açık mobil sınırlar: [RELEASE_CANDIDATE.md](RELEASE_CANDIDATE.md), `/release-candidate/index.html`, `/review-captures/index.html`. Gerçek telefon dokunma/ses/uzun süreli performans ve native paketleme testleri sonraki adımdır.
