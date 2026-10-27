# Color Rings — Final Gameplay Master / Web Release Candidate

27 Ekim 2026. Başlangıç sürümü `024ffaf`; değişiklikten önce `codex/pre-master-update` yedek dalı oluşturuldu. Phaser 3 / TypeScript / Vite / Canvas projesi korundu. Yeni bağımlılık, backend, uzak analitik veya yerel Android/iOS kod tabanı eklenmedi.

## Gameplay

- Dokunma artık yalnız halkayı seçer. Bir tamamlanmış sürükleme bir hamledir; bağlı halkaların birlikte dönmesi ikinci hamle sayılmaz. Undo mevcut tasarıma uygun olarak harcanan hamleyi iade etmez. Bu kurallar Ayarlar'da açıklanır.
- Kilitli halka, kilitli takipçi, bölüm hamle sınırı ve tek halka hakkının bitmesi ayrı, gerçek nedene dayanan mesajlar üretir. İlk öğreticide yanlış iç halkayı döndürme ve yol açılmadan Play/Space başlatma engellenir; Skip normal kontrolü serbest bırakır.
- Gerçek dışa halka geçişi ayrı kısa parçacık/ses olayı üretir. Başlangıçta zaten dış katmanda bulunan top için sahte geçiş olayı üretilmez.
- Hafif ve güçlü çarpışmalar gerçek temas şiddetine göre farklı ses yüksekliği/perdesi üretir. Ses havuzu, hız sınırları, mute, Low ve Reduced Motion korunur. Hareket izi hıza göre hafifler; duran topun izi söner.
- Yaklaşan doğru kova yalnız güvenilir son koridorda hafifçe vurgulanır. Renk ve teslim sırası, kalan duvarlar, hareketli engeller, bölücüler ve başka toplarla olası çarpışmalar şüphe yaratıyorsa efekt gösterilmez. Bu kontrol fizik veya kazanma koşulunu değiştirmez.
- Başarılı top önce kova ağzının içine iner, ardından kısa sıçrama/sönme yapar. Mevcut dolum sayacı, parçacık havuzu, ripple ve combo korunur.
- Öğretici halkaları/topları gerçek güncel konumlarında vurgular. Hareket başladıktan sonra başlangıç noktasında hayalet top halkaları bırakılması düzeltildi. İlk sürükleme oku doğrulanmış ilk yolun dönüş yönünü gösterir.
- Yanlış kovada hangi renk topun hangi kovaya düştüğü; kaçırılan kapta topun dışarı düştüğü açıklanır. Sonuç ekranında kullanılan ipucu ve Perfect Flow durumu belirtilir. Animasyon atlama ve hızlı Next Level korunur.
- Candy ve Ocean'ın bazı eski tonları mantıksal renk adlarıyla çelişiyordu: örneğin mavi kimlik pembe görünüyordu. Beş paletin tamamında renk aileleri korunacak şekilde eşleme düzeltildi; pastel sarı netleştirildi. Top/kova/geçit eşlemesi ve satın alınan paletler korunur.

## Level Design

**Dört gerçek başlangıç/mekanik düzenlemesi** yapıldı; ayrıca **40 Klasik bölümün tamamına gerçek hamle planı ve bu plana göre yıldız hedefi** sağlandı. Yeni 100 rastgele bölüm üretilmedi; mevcut 140 bölümün kimlikleri ve labirent duvarları korundu. Ustalık yolunun mevcut 100 bölümü ve önceki sekiz röle düzeni korundu.

| Bölüm | Değişiklik |
|---|---|
| K1 | İç halka başlangıçta hazır; dış halkayı tek dönüşle hizalayıp Play. 3 yıldız hedefi gerçekten 1 hamle. |
| K2–6 | Geçit hizalama, iki renk, farklı katlar ve kısa gerçek hareket önizlemesi; yıldızlar doğrulanmış jestlere göre. |
| K7 | Fiziksel olarak toplanan ilk anahtar ve ona bağlı gerçek dış geçit kilidi. |
| K8 | Pembe → sarı renk değiştirici ve sarı kova. Hedef sayaçları dönüşmüş renge göre 1/1 olarak tanımlandı. |
| K9 | Mevcut bağlı halkayı gerçek sürücü hareketiyle öğreten kısa tanıtım. |
| K10 | Mavi ve pembe teslim dalgaları; 3 hamlelik plan, toplam 4 hamle sınırı ve halka hakları. |

Anahtar, renk değiştirici, bağlı halka, hamle sınırı, tek yön ve bölücü için K7/K8/K9/K10/K28/K39'da gerçek oyun üzerinde kısa açıklamalar vardır. Mekanik yalnız açıklamaya göre tamamlanmaz: anahtar, dönüşüm, bağlı sürücü ve bölücü dersleri ilgili gerçek olayı bekler. Yeni kontroller sınırsız sahte hamle veya otomatik tutorial zaferi üretmez.

### Ölçülen derinlik farkı

| Örnek | Doğrulanmış hamle | Fizik aşaması | Silinince planı bozan hareket | Sırası önemli denenmiş çift |
|---|---|---|---|---|
| K5 | 3 | 1 | 3 | 0 |
| K20 | 5 | 2 | 4 | 1 |
| U50 | 7 | 4 | 7 | 3 |

K5 temel hizalama; K20 iki dalga ve canlı yeniden konumlandırma; U50 dört renk, renk değiştirici, tek yön, teslim sırası ve sınırlı hamle içerir. K30 iki anahtarlı daha kısa bir nefes bölümüdür; her komşu bölümün daha zor olduğu iddia edilmez.

`npm run audit:release` tüm 140 bölümün çözümünü, hamlesini, aşamasını, mekaniklerini, kurallarını ve geçerli planını `release-candidate/puzzle-audit.json` içine yazar. Altı hedef bölümde tek eylem silme ve komşu eylem sırası değiştirme deneyleri yapılır. Bulunan alternatifler yalnız bu örneklemdir; bütün sürekli açılar/zamanlar için global minimum veya toplam alternatif sayısı kanıtı değildir. U51–100 içinde bilinen doğrulanmış planı iki veya daha az hamle olan bölüm bulunmadı. Bütün olası rastgele hareketler taranmış gibi sunulmaz.

**140/140 normal + 15/15 Challenge/Live/Lab çözümü gerçek RingSession ve 120 Hz PhysicsWorld ile geçti.** Challenge ve Lab kaynakları eski düzenin kopyalarından beslenerek başlangıç öğreticisi değişikliğinin bu modları değiştirmesi önlendi. Daily ve mevcut kayıt kimlikleri korundu.

## Tutorial

İlk ders seçim → sürükleme → gerçekten açık yol → Play → hareketli top/kova eşlemesi → gerçek başarı adımlarını kullanır. Doğru ilk sürükleme zaten yolu açıyorsa gereksiz bir onay adımı eklenmez. İlk zaferde “İlk bulmacanı çözdün!” gösterilir.

Skip, Ayarlar'dan tekrar açma ve ilerlemenin kaydı çalışır. `spin-sort-v1`, sürüm 4 korunur; eklenen `onboarding` alanı güvenli varsayılanlarla yüklenir. Eski coin, yıldız, tamamlanma, Collection, palet, tema ve test satın alma alanları korunur. Tutorial Skip yalnız öğreticiyi bitirir; bölüm zaferi, yıldız veya altın vermez.

İlk deneyim 60 saniyelik kısa öğrenme akışı hedeflenerek tasarlandı. Gerçek ilk kez oynayan insanlarla süre/öğrenme araştırması yapılmadı; “herkes 60 saniyede öğrenir” sonucu iddia edilmez.

## Yerel oyuncu testi ölçümleri

`src/local-playtest.ts`, en fazla 300 kayıt tutar: start / complete / failure / restart / undo / hint / tutorial-complete / tutorial-skip / exit. Yalnız event, level, mode, moves, seconds alanları saklanır. Süre menü/Pause/replay hariç mevcut aktif oyun sayacından alınır; sunucu saati değildir.

Kişisel veri, tanımlayıcı, cihaz bilgisi, URL veya zaman damgası kaydedilmez; hiçbir uzak gönderim yoktur. Geliştirme veya sandbox modunda Ayarlar içindeki “Yerel oyun testleri” bölümü son olayları gösterir, JSON indirir ve yalnız ölçümleri temizler. Asıl oyuncu ilerlemesini temizlemez. Modül, gelecekteki bir analitik adaptöründen bağımsızdır.

## Gerçek tarayıcı QA

`?sandbox=1` ile asıl oyuncunun parası ve ilerlemesi kullanılmadı. `browser-results.json` ve ilgili gerçek ekran görüntüleri kaydedildi.

- K1: gerçek dokunma/seçim ve sürükleme; dokunmada 0, sürüklemede 1 hamle; Play, renk eşleme, gerçek zafer, üç yıldız.
- K5 / K10 / K20 / K30 / U50: gerçek UI'daki doğrulanmış tek halka ipuçlarıyla sırasıyla 3 / 3 / 5 / 2 / 7 hamlede tamamlandı. K10 iki dalga, K20 iki ikili dalga, U50 dört ayrı teslim dalgasıyla oynandı. Bu testler bağımsız bir insanın ipucusuz çözüm keşfi olarak sunulmaz.
- K10'un ilk kontrolünde sonuç açılmadan sayfadan çıkılmıştı; ikinci deneme gerçek son teslim ve zafer görülene kadar sürdürüldü. Tamamlanmamış ilk deneme başarı sayılmadı.
- Replay başlatıldı/durduruldu; altın değişmedi. Skip ve Replay Tutorial çalıştı. Son öğreticide Play'in yol açılana kadar gerçekten devre dışı olduğu kontrol edildi.
- Gerçek sürükleme → Undo → Restart; Undo son konumu aldı ve harcanmış hamleyi korudu. Pause sırasında farklı anlarda alınan tuval ekranlarının byte içeriği aynıydı. Resume ve hız geçişi kontrol edildi.
- 320×568, 390×844, 430×932, 768×1024, 1024×768: yatay taşma yok, kovalar kontrol alanına girmiyor. Sandbox alt bilgi çubuğunun düğme altlarını örtmesi ek boşlukla düzeltildi. `responsive.json` içinde ölçümler var.
- 320×480: Home menüsü kesilmek yerine kaydırılabilir; alttaki Ayarlar'a erişildi.
- 320 px genişlikte Store, Collection, Daily, Achievements, Level Map, Statistics, Settings, Challenges, top koleksiyonu, Themes ve paletler incelendi: 11 panelde yatay taşma yok; geri/kapat 44×44, başlık ve düğmeler hizalı. Yeni yerel test details öğesi klavye odak döngüsüne dahil edildi.
- 140 bölüm ve 14 karşılaştırma sayfası gerçek review.html Phaser sahnesinden yeniden üretildi. Tam boy PNG indirme bağlantıları üzerinden dışa aktarıldı; kaynak verisi ve CRC doğrulandı. Eski PNG'nin yalnız etiketi değiştirilmedi.

## Test / Build / Mobil hazırlık

- **764 otomatik test, 0 başarısız.** Önceki testler yeni öğreticinin gerçek kurallarına göre güncellendi; eski Challenge/Lab davranışları korundu. 35 yeni test; öğretici, veri uyumu, yerel ölçüm sınırları, doğru/yanlış kova, yaklaşma güvenliği, gerçek geçiş, puzzle bağımlılıkları, ses şiddeti ve hayalet vurgu regresyonunu kapsar.
- TypeScript + Vite production build geçti. Büyük Phaser chunk uyarısı devam eder.
- 140 normal + 15 özel fizik çözümü; 9.730 geometri karşılaştırmasında 0 aynı / 0 eşik altı profil. Geometrik farklılık 140 farklı strateji kanıtı değildir.
- Tarayıcı performans örneği: 39 görünür kare, 126.1 FPS, p95 20.8 ms, 55 doku, yaklaşık 11.4 MB ham RGBA, 41.7 MB JS heap. Bu çok kısa masaüstü örneği telefon 60 FPS veya uzun süreli bellek garantisi değildir.
- Gerçek Android/iOS cihazında parmak kontrolü, çentik/safe-area, uygulama yaşam döngüsü, ses dinleme/dengesi, uzun süreli ısı/FPS/bellek ve mağaza SDK testleri yapılmadı. Reklam ve satın almalar TEST simülatörü olarak kalır. APK/IPA veya yayınlanmış mağaza sürümü üretilmedi.

Bu sürüm mevcut Phaser kod tabanıyla sonraki mobil paketleme/cihaz testi için **web release candidate** olarak sunulur; test edilmemiş native davranışlar tamamlanmış sayılmaz.

## Başlıca dosyalar

`src/onboarding-levels.ts`, `tutorial.ts`, `intro-state.ts`, `local-playtest.ts`, `puzzle-analysis.ts`, `cup-approach.ts`, `failure-feedback.ts`; `main.ts`, `scene.ts`, `guidance.ts`, `engine.ts`, `physics.ts`, `audio.ts`, `palettes.ts`, `progress.ts`, `modes.ts`, `levels.ts`, `visual-system.css`; `tests/release-candidate.test.ts`, güncellenen guidance/prototype testleri; `scripts/audit-release.mjs`, `scripts/bind-review-exports.mjs`, güncel galeri/manifest/ZIP ve raporlar.
