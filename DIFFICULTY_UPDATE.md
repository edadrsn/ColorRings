# Zorluk ve oynanış güncellemesi — 26 Ekim 2026

## Başlangıç incelemesi

Kaynakta 40 klasik, beş Challenge, beş Live, günlük havuz, dört görünüm, dört tema, on başarım ve çalışan canlı fizik vardı. Başlangıçta 201 test geçiyordu. İleri bölümlerin çoğunda ilk açıları ayarlayıp beklemek yeterliydi; gerçek bir 100 aşamalık zorluk yolu, oranlı bağlantılar, top bölücüler, fizik kaydından tekrar ve ölçülen istatistikler yoktu. Önceki ödül ve mağaza mantığı yeniden kullanılabildi.

## Tamamlanan içerik

- **40 klasik korunuyor + 100 yeni Ustalık = 140 normal bölüm.** İki yol bağımsız açılır. Ustalık 1 herkese açık; eski klasik ilerleme, altın, yıldız ve envanter silinmez.
- Beş Challenge, beş Live, üç mekanik laboratuvarı ve iki ileri prova ile **155 doğrulanmış düzen** var. Daily, korunan 21–40 havuzundan yerel tarihe göre seçilir; ayrıca 20 yeni düzen olarak sayılmaz.
- Ustalıkta yarıçap, geçit genişliği, cep/başlangıç yerleri, renk ve top sayısı, anahtar düzeni, teslim sırası, bağlantı oranları, hareket bütçeleri ve mekanik kombinasyonları değişir. Rastgele başlangıç açısı değişimi tek çeşitlilik değildir. İlgili veriler `mastery.ts` içinde deterministik aileler halinde tanımlıdır.
- Ustalık 5'in sertifikalı planı iki hazırlık hamlesidir. Ustalık 50 yedi hamle ve dört renk teslim aşaması kullanır. Ustalık 100 sekiz hamle; dönen anahtar, iki oranlı bağlantı, iki renk dönüşümü, iki bölücü ve hareketli engel içerir. Bunlar en kısa çözüm iddiası değildir.
- Hamle sınırları ve halka başına doğrudan hareket bütçeleri oturumda uygulanır; pasif bağlantılı hareket doğrudan hamle bütçesi harcamaz. Undo harcanmış hamleyi geri ödemez.
- Bölücüler aynı fizik dünyasına yeni top ekler. Kazanma, başlangıç top sayısını değil gerçek kova hedeflerini, gerekli anahtarları ve teslim sırasını kontrol eder. Anlık görüntüler yeni topları da korur.
- Hedefler veriden üretilir; gerçek renk dönüşümü sonrası teslim sırası ve anahtar ilerlemesi gösterilir. Koyu temada duvarlar, numaralı anahtarlar/kilitler, bağlantı işaretleri ve renk sembolleri belirginleştirildi. Teknik derece düğmeleri geri eklenmedi.
- 1× / 2× aynı 120 Hz çarpışma adımlarını kullanır. Hız seçenekleri duvar saatinde daha fazla sabit adım çalıştırır. Oyuncu farklı duvar saatlerinde hamle yaparsa farklı fizik anlarına girdi verir; eşdeğerlik aynı fizik anlarındaki aynı komutlar için test edilir.
- Replay gerçek başarılı denemenin açılarını, top doğumlarını, renklerini, konumlarını ve Undo karelerini okur. Yeni çözüm hesaplamaz; ödül, süre ve ilerleme yazmaz. İstenince durur. Planlama hamlelerinin gerçek başlangıç/bitiş konumları kısa animasyonla gösterilir; planlama sırasındaki her fare örneği saklanmaz. Uzun denemelerde bellek sınırı için kareler seyreltilir, başarılı son kare korunur; normal kısa kayıtta 120 Hz veri tutulur.
- 20 özgün Canvas görünümü, gerçek dokudan önizleme, kayıtlı satın alma/seçim. Panda, Star ve Cosmic yalnız belirtilen başarımlarla açılır. Eski dört görünümün kimlik ve fiyatları korunur. Başarım ödülleri yinelenmez.
- Statistics: tamamlanan normal bölümler, yıldız, Perfect, ipucusuz bölüm, ölçülen başarılı deneme ortalaması, aktif süre, Challenge. Eski kayıtlarda ölçülmemiş geçmiş süre/hamle uydurulmaz. Menü, duraklatma, gizli sayfa ve replay süreye eklenmez.
- Live ilk açılışta açıklama ile durur. Beş bölüm yavaş başlayan temel hız, seçili halka vurgusu, Pause/Restart ve ayrı rekor kullanır. Altın ve normal yıldız ilerlemesinden ayrıdır.
- Menü Play / Challenges / Collection etrafında gruplandı. Ses efektleri mevcut kısa, sınırlı ses havuzunu kullanır; tema ve bölücü sesleri eklendi. Ses tercihi korunur.

## Gerçek çalıştırma ve sınırlar

- `npm run validate:levels -- --report`: **155/155** gerçek fizik motoruyla çözüldü. Planlar RingSession üzerinden kilit, bağlantı ve bütçe kurallarına tabi gerçek hamleler olarak uygulanır. [LEVELS.md](LEVELS.md), [DIFFICULTY.md](DIFFICULTY.md).
- Yüz Ustalık planı, fizik adımlarına bağlı komutlarla 1× / 2× çalıştırılıp bütün son top durumları ve sonuçları eşit karşılaştırılır. Ustalık 50 için 72 sabit dış açı örneğinde görev tamamlanmaz; bu sürekli açı uzayının matematiksel ispatı değildir. Ustalık 100'de her kontrol noktasında ek 20 saniye bekleyen çözüm de test edilir.
- `npm test`: **624 geçti, 0 başarısız, 0 atlandı.** Testler kayıt göçü, bağımsız yol kilidi, satın alma, tek seferlik ödüller, bölücü/clone/Undo, hareket bütçesi, ipucu saflığı, replay/Undo ve uzun kayıt sınırını kapsar. Son tam komut çıktısı `overhaul-final-tests.log` içindedir.
- `npm run build`: TypeScript kontrolü ve production build geçti. Vite'ın büyük paket uyarısı sürüyor: Phaser dahil yaklaşık 1,33 MB JavaScript / 372 kB gzip. Bu bir derleme hatası değildir; yavaş ağdaki ilk yükleme ayrıca ölçülmelidir.
- Ayrı 5174 test origininde gerçek tarayıcı UI denemeleri: Ustalık 1 üç yıldız, 2× / Pause / Resume, ödülsüz tekrar ve durdurma, Ustalık 50 dört teslim/yedi hamle, Ustalık 100 anahtar ve ilk bölünmüş teslim, Candy satın alma + yeniden yüklemede kalıcılık, 20 kart/40 gerçek renk önizlemesi, başarım ilerlemeleri, Live 1 başarı ve ayrı skor.
- Hızlı sürüklemede son pointer konumunun kaçması saptanıp bırakma hesabına eklendi; ardından Ustalık 50 mouse ile tamamlandı. Ustalık 100'ün tüm aşamaları bu tarayıcı denemesinde elle tamamlanmadı; otomatik plan ve uzun bekleme testi geçti. Bütün 155 düzenin elle oynandığı iddia edilmez.
- 390×844 ve 320×568 masaüstü tarayıcı viewport denemelerinde yatay taşma görülmedi; dar ekranda alt kontroller en az 48×54 px. Fiziksel Android/iPhone dokunma, gerçek cihaz FPS, sesin işitsel dengesi ve titreşim henüz ölçülmedi. Bunlar mağaza yayını öncesi kalan cihaz testleridir.

## Yerel önizleme

`Oyunu-Baslat.cmd` mevcut 5173 sunucusunu kullanır veya başlatır. Adres `http://localhost:5173/`; aynı tarayıcı ve origin kaydı korur. Bilgisayar yeniden açıldığında yerel sunucuyu yeniden başlatmak gerekir. Bu proje henüz Google Play paketi veya yayınlanmış hosting değildir.

Önerilen commit özeti: `Add certified 100-stage mastery path, recorded replay and collection progression`.
