# Katman çeşitliliği ve 140 bölüm görseli

Klasik yolun 14, Ustalık yolunun 38 düzeni önceki sürümden farklı katman yapısına geçirildi. Ustalık 3 artık dört halkalı bir başlangıç düzeni kullanır; diğer seçili düzenlere gerçek çarpışan bir halka eklenir. Dört halkalı düzenler sıkıştırılıp beşe çıkarılmaz. Yeni halkanın geçidi, başlangıç açısı ve cep duvarları vardır; çözümde gerçekten hizalanması gerekir.

- Klasik ek katmanlar: 4, 6, 7, 8, 12, 21, 23, 26, 27, 29, 33, 35, 36, 39.
- Ustalık ek katmanlar: 2, 5, 8, 9, 10, 12, 14, 15, 16, 18, 19, 20, 22, 24, 25, 26, 28, 31, 34, 38, 40, 43, 44, 58, 59, 60, 61, 62, 70, 71, 72, 74, 79, 82, 83, 84, 92. Ayrıca 3. bölüm dört halkalı düzene değiştirildi.
- İlk 10 Klasik halka sayısı: **2, 2, 2, 3, 3, 4, 4, 4, 2, 2**.
- İlk 10 Ustalık halka sayısı: **2, 3, 4, 2, 3, 2, 3, 4, 4, 3**.

`layout-depth.ts`, eklenen halkanın ardından anahtar, kilit, renk kapısı, tek yön, bağlantı, çözüm vektörü, canlı eylem planı ve halka bütçelerinin indekslerini birlikte kaydırır. Hamle hedefi, yıldız ve ilgili bütçeler ek hareketi hesaba katar. Kayıt anahtarı ve bölüm kimlikleri korunur; eski altın, yıldız ve satın almalar silinmez.

## Görseller

- `review.html`: aynı `RingsScene` ve Phaser Canvas renderer'ından yeni başlangıç görüntülerini üretir. Oyun fiziği başlatılmaz; kayıt modülü yüklenmez. Anahtar, kilit, bağlantı ve bölücü işaretleri normal oyun çizimidir.
- `review-captures/index.html`: hazır, çevrim dışı da açılabilen galeri; 140 ayrı PNG, 14 karşılaştırma sayfası, kodla arama, büyütme ve indirme.
- `review-captures/bolumler/K01.png`–`K40.png`, `U001.png`–`U100.png`: **540×960** başlangıç görüntüleri. Başlıklar inceleme için aynı oyun Canvas görüntüsünün üstüne yazılır; bunlar tarayıcı penceresinin tüm arayüzünün ekran kaydı değildir.
- `review-captures/sayfalar/`: onar bölümlük **1500×1120**, toplam 14 PNG.
- `Color-Rings-140-Bolum.zip`: bütün 154 PNG, çevrim dışı `index.html`, `bolum-listesi.csv`; yaklaşık 51 MB.

İnceleme kodları: **K04 = Klasik 4**, **U037 = Ustalık 37**. Galerinin araması K4 / U37 yazımını da kabul eder. Oyuncu belirttiği kodlarla görselde hangi yolu/katmanı değiştirmek istediğini söyleyebilir.

Görselleri yenilemek için yerel `review.html` sayfasında üret ve ZIP indir; PNG klasörlerini `review-captures` içine çıkar. Ardından `npm run review:verify`, bütün 140/14 PNG'nin sayısını ve boyutunu kontrol edip statik galeri/CSV'yi yeniler. Düzenleri daha sonra değiştirirsen eski görselleri de yeniden yakala; galeri kendiliğinden güncellenen canlı oyun değildir.

## Gerçek kontroller

- `npm test`: **649 geçti, 0 başarısız, 0 atlandı**. Yeni testler gerçek ek halkanın yanlış konumda çözümü engellemesini, mekanik indekslerini, kaynak verinin değişmemesini ve ZIP CRC/yapısını kontrol eder.
- `npm run validate:levels -- --report`: **155/155** fizik çözümü; 140 normal, 5 Challenge, 5 Live ve 5 laboratuvar/prova. Yeni katmanlar tüm bu sertifikalarda yer alır.
- `npm run build`: TypeScript ve iki sayfanın production build'i geçti. Phaser dahil büyük paylaşılan paket uyarısı devam eder.
- **140/140** tam boy PNG ve **14/14** sayfa diskte doğrulandı; örnek K04, U001–U010 sayfası ve U100 görsel olarak incelendi. Tarayıcıda 140 kart/14 sayfa, U3 → 4 halka, K4 → 3 halka ve tam görsel büyütme kontrol edildi.
- Bütün 140 düzenin elle oynandığı veya gerçek telefonda FPS ölçüldüğü iddia edilmez. Otomatik fizik sertifikası tek bir geçerli çözümü doğrular, bütün olası oyuncu hamlelerini kanıtlamaz.
