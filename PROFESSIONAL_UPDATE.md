# Color Rings · Palet, görsel kalite ve test mağazası

## Mevcut durum incelemesi

Çalışmaya başlamadan önce `main.ts`, `scene.ts`, `artwork.ts`, `progress.ts`, `meta.ts`, kataloglar ve bölüm çözüm sistemi incelendi. 20 top görünümü, 12 tema, 140 normal bölüm, ayrı Live ilerlemesi, sentez sesleri, Undo/Restart, gerçek deneme tekrarı ve 1×/2× hız zaten çalışıyordu. Bunlar yeniden oluşturulmadı. Eksikler bağımsız renk paleti, efekt kalitesi, koleksiyon filtresi ve ödeme/reklam simülatörüydü.

## Eklenen ve gerçekten çalışan sistemler

| Alan | Sonuç |
| --- | --- |
| Renk paletleri | Pastel, Neon, Candy, Ocean ve Galaxy; beş mantıksal renk için yapılandırılmış sunum renkleri. Collection ve Ayarlar üzerinden seçim, önizleme, altınla açma ve kalıcı kayıt. |
| Renk eşleşmesi | Top, kova, doluluk, iz, renk geçidi, çıkış ve kısa yol önizlemesi aynı paletten çizilir. Fizikteki `pink/blue/yellow/green/purple` kimlikleri değişmez. Renk sembolleri kalıcı ve isteğe bağlıdır. |
| Top hareketi | Mevcut parlak 3D hissi, gölge ve iz korunur. Yuvarlanma yüzeyi hafif hareket eder; hız/yön değişiminde kısa esneme, ışık ve çarpışma sesi oluşur. Yalnız çizim nesneleri değişir; çarpışma yarıçapı sabittir. |
| Efekt bütçesi | Low/Medium/High için 12/32/56 aktif parçacık ve 2/5/8 iz yuvası sınırı. 56 parçacık nesnesi önceden ayrılır ve yeniden kullanılır. Reduced Motion izleri/parçacıkları ve CSS hareketlerini kapatır. |
| Başarılı teslim | Kova dolumu, sıçrama, ışık, ses ve combo korunur; bitiş beklemesi kısaltıldı. Reduced Motion açıkken de yanlış kova sesi çalışır. |
| Collection | 20 mevcut + Prism/Orbit/Royal olmak üzere 23 görünüm. All/Owned/Locked/Premium filtreleri, kozmetik nadirlik etiketi, gerçek oyun dokusundan önizleme ve kalıcı seçim. |
| Temalar | 12 mevcut + Prism/Velvet olmak üzere 14 tema. Yeni iki tema test Premium hakkıyla açılır; oyunda özgün statik Canvas desenleri bulunur. |
| Ekonomi | Fiyatlar ve ortak ödüller `economy-config.ts` içinde. Bölüme özgü ödül/yıldız verileri mevcut merkezi bölüm verisinde korunur. Tekrar satın alma, negatif/kesirli harcama ve güvenli tamsayı taşması korunur. |
| Ek ipucu | Ücretsiz yön ipucu korunur. İsteğe bağlı olarak bir doğrulanmış halka konumu 1 kredi veya 25 altınla uygulanır. Uygulanamayan hareket için ücret alınmaz; Challenge ipucu yasağı geçerlidir. |
| Ana menü | Play/Challenges/Collection önde; Store, bölümler, istatistik ve ayarlar alt erişimde. Premium test hakkı yerel oyuncu rozeti çerçevesinde görünür. |
| Başarımlar/istatistik | Mevcut ödül ve ilerleme çubukları korunur. 7 günlük başarım Aurora temasını da açar. İstatistiğe açılan görünüm/tema/palet sayıları eklendi. |
| Live öğreticisi | Başlangıç açıklamasından sonra hareket sırasında gerçek halka sürükleme ve doğru teslimi takip eden iki adım. Atlanabilir; tamamlanması ayrı Live kaydına yazılır. |
| Ayarlar | Ses, müzik, titreşim, semboller ve mevcut önizleme korunur. Efekt kalitesi ve seçili palet eklendi. Seçimler yeniden yüklemede korunur. |

## Yalnız simülasyon olan sistemler

**Gerçek ödeme alınmaz ve gerçek reklam gösterilmez.** Store ve reklam ekranları `TEST STORE`, `TEST PURCHASE`, `TEST AD` olarak işaretlidir. Gerçek fiyat, banka/kart formu veya reklam SDK’sı bulunmaz.

- Store: Featured, Balls, Themes, Premium, Gold sekmeleri. Remove Ads, Premium, Neon Pack, Galaxy Pack ve 500 test altını ürünleri.
- Test satın alma: başarılı, iptal, başarısız, zaten sahip olunan ürün ve geri yükleme. Non-consumable hak tekrar vermez. Aynı altın makbuzu iki kez harcanmaz. Test makbuzu kaydedilip daha sonraki ilerleme yazımı başarısız olursa bekleyen makbuz geri yükleme ile kurtarılabilir.
- Satın alma servisi arayüzü ve yerel makbuz günlüğü ayrıdır. Test makbuzu ancak test sağlayıcısının günlüğünde eşleşirse uygulanır. **Bu istemci günlüğü gerçek mağaza satın almasının kanıtı değildir.** Üretim adaptörü gerçek makbuz/doğrulanmış hak akışını ayrıca uygulamalıdır.
- Rewarded: 100 altın, 1 ek ipucu kredisi veya tamamlanmış günlük bulmacanın 45 altınlık ödülünü bir kez ikiye katlama. Hazır/başladı/kapandı/yüklenemedi durumları ödül vermez. Aynı tamamlanma olayı tekrar ödül vermez.
- Interstitial: normal bölümün başarılı sonuç ekranından sonraki geçişte değerlendirilir. İlk 5 normal tamamlama, oturumda 5 farklı kazanılan bölüm ve en az 120 saniye aralık koşulları vardır. Oyun ortasında veya sürüklerken açılmaz. Remove Ads/Premium haklarında engellenir. Kapatma veya hata oyunun devamını engellemez.
- Varsayılan sağlayıcı yapılandırması kişisel veri toplamaz, kişiselleştirme yapmaz ve çocuk odaklı yapılandırma alanı sunar. Bu, henüz bağlanmamış gerçek bir reklam ağının mevzuata uygunluk sertifikası değildir.

## Korunan bölümler ve zorluk

140 normal bölümün geometrisi ve kimlikleri bu güncellemede değiştirilmedi. Önceki benzersizlik çalışması ve kanonik çözümler korunur. 140 normal + 5 Challenge + 5 Live + 5 laboratuvar bölümünün çözümü gerçek fizik motorunda yeniden doğrulandı.

`DIFFICULTY_PROFILE.md` ilk 20 Klasik bölüm dahil 140 satırda halka, başlangıç rengi, doğrulanmış hamle, teslim aşaması, anahtar, bağlantı, tek yön ve sınırları listeler. Ustalık planları 2–8 hamleye çıkar; son bölümlerde kilit, bağlantı ve birden fazla teslim aşaması birleşir. Bu sayılar kanıtlanmış küresel minimum değildir. Bu sürümde yeni bölüm veya yeni oyun mekaniği eklendiği iddia edilmez.

## Değiştirilen dosyalar ve yeni modüller

- Yeni: `src/palettes.ts`, `src/effects.ts`, `src/economy-config.ts`, `src/economy.ts`, `src/purchases.ts`, `src/ads.ts`, `src/store-view.ts`, `src/store-controller.ts`, `src/live-tutorial.ts`.
- Sunum/kontrol: `src/main.ts`, `src/scene.ts`, `src/artwork.ts`, `src/guidance.ts`, `src/mechanics-view.ts`, `src/skin-motifs.ts`, `src/theme-backdrop.ts`, `src/style.css`.
- Kayıt/katalog: `src/progress.ts`, `src/meta.ts`, `src/cosmetics.ts`, `src/themes.ts`, `src/menu-views.ts`.
- Test: yeni `tests/palettes.test.ts`, `tests/commerce.test.ts`, `tests/live-tutorial.test.ts`; genişleyen katalog için `tests/catalog.test.ts` ve `tests/overhaul.test.ts` beklentileri güncellendi. Önceki davranış testleri kaldırılmadı.
- Rapor: `scripts/difficulty-profile.mjs`, `DIFFICULTY_PROFILE.md`, `README.md`, bu dosya.

## Kayıt güvenliği ve test profili

Mevcut `spin-sort-v1` anahtarı ve sürüm 4 korunur; yeni alanlar yoksa güvenli varsayılanlar yüklenir. Mevcut altın, ilerleme, yıldız, görünüm ve tema envanteri dönüştürülmeden korunur. Test makbuzlarının ayrı anahtarı `spin-sort-test-receipts-v1` olur. Tarayıcı depolaması engellenirse başarıyla kaydedilmiş gibi mesaj verilmez.

`http://localhost:5173/?sandbox=1` ayrı `spin-sort-sandbox:` kayıt ve makbuz alanı kullanır; TEST PROFİLİ etiketi görünür. Tarayıcıdaki satın alma/ödül denemeleri bu profilde yapıldı; asıl oyuncu altını harcanmadı.

## Gerçekten çalıştırılan kontroller

- İlk palet/efekt aşaması: 4 yeni test ve TypeScript + production build geçti.
- Mağaza/ekonomi aşaması: katalogla birlikte ilgili 36 test ve build geçti; daha sonra makbuz kurtarma ve Live etkileşim testleri eklendi.
- Son test paketi: 696 test, 0 başarısız, 0 atlanan. Sonuç `professional-tests-final.log` dosyasında.
- `npm run validate:levels -- --report`: 155/155 gerçek fizik çözümü.
- TypeScript ve `npm run build`: başarılı; Vite’ın büyük Phaser paketi uyarısı sürer.
- Tarayıcı: test satın alma başarı/hata/iptal, geri yükleme, 100 altınlık reklam ödülü, tekrarlanan callback’in engellenmesi, reklam yükleme hatası, koleksiyon Premium filtresi ve etkin Orbit görünümü denendi.
- Palet satın alımı ve yeniden yükleme, Low/Reduced Motion ayarlarının yeniden yükleme sonrası korunması kontrol edildi.
- Mouse/pointer ile halka sürüklendi; Undo, Restart, Play ve 2× denendi. Doğrulanmış ek ipucuyla Klasik 1 tamamlandı; 3 yıldız/ödül ekranı ve Klasik 2’ye Next Level geçişi görüldü.
- Live modunda hareket sırasında sürükleme öğreticiyi ikinci adıma geçirdi. Ayrı Live ilerleme modeli korundu.
- 390×844 ve 320×568 tarayıcı boyutlarında yatay taşma yok; kontroller ekran içinde. 320 piksel Store sekmelerinin dokunma yüksekliği 44 piksel.
- Kontrol edilen test sekmesinde tarayıcı hata günlüğü boştu. Sesin hoparlörden duyulduğu veya gerçek telefonda FPS ölçüldüğü iddia edilmez.

## Bilinen sınırlar ve Android/iOS geçişi

Gerçek cihazda çoklu dokunma, titreşim, ses dengesi, düşük donanım FPS/ısı/bellek ve yaşam döngüsü testleri yapılmadı. Tarayıcı boyutu kontrolü fiziksel telefon testi değildir. Eski 140 bölümün kayıtlı görsel galerisi geometri incelemesi içindir; bu görsel güncellemenin bütün palet/görünüm kombinasyonları o PNG’lere yeniden basılmadı.

Tarayıcı kayıtları ve test makbuzları cihaz kullanıcısı tarafından değiştirilebilir; gerçek ekonomi veya ücretli hak güvenliği sağlamaz. Yerel kayıt silinirse sunucu yedeği yoktur. Minimum hamlenin matematiksel kanıtı ve bütün oyuncu yollarının başarısı test edilmedi.

Android/iOS için: paketleme ve yaşam döngüsü adaptörü; Google Play Billing/StoreKit sağlayıcıları; sunucuda makbuz/işlem doğrulama ve bildirimleri; tüketilebilir ürünlerin güvenli kaydı; gerçek reklam sağlayıcısı/izin ve yaşa uygun gizlilik yapılandırması; satın alma geri yükleme ve ağ kesintisi testleri; mağaza gizlilik beyanları; gerçek cihaz performans ve ses testleri gerekir. Test sağlayıcısı yalnız bir istemci bayrağı değiştirilerek üretim doğrulamasına dönüştürülmemelidir.
