# Spin Sort genişletmesi — 26 Ekim 2026

## Başlangıç incelemesi

| Alan | Bu genişletmeden önce |
| --- | --- |
| Altyapı | Phaser 3 / TypeScript / Vite; özel deterministik 120 Hz fizik |
| Normal içerik | 20 bölüm, 2–4 bağımsız halka; iki renk; sıralı teslimler |
| Kontroller | Canlı sürükleme, Play, Restart, Undo; menülerde duraklatma |
| Ödüller | Bölüme özel yıldızlar ve ilk tamamlama altını; Perfect Flow yok |
| Kayıt | Altın, yıldız, koleksiyon ve ayarlar; v2 kayıt |
| Yardım | Doğrulanmış çözüm ipucu; bu çalışma sırasında etkileşimli öğretici ve kısa fizik önizlemesi tamamlandı |
| Eksikler | Anahtar/kilit, renk kapısı, tek yön, hareketli engel, Challenge, Daily, tema ve başarım yoktu |

Çalışan fizik, ilk 20 bölümün geometrisi ve mevcut kayıt anahtarı korunmuştur. Bağımlılık eklenmemiştir.

## Aşamalar ve sonuçları

1. **Görseller:** FIT ölçekleme/safe area korunur. Hedef top sayısına göre kova doluluğu, sayacı, tamamlanma işareti, sıçrama, hata sarsıntısı, ışık halkası ve havuzlu parçacıklar. Sesler sekiz eşzamanlı sesle sınırlandırılır; çarpışma sesi ayrıca seyreltilir. Müzik/ses/titreşim ayrı tercihlerdir.
2. **Mekanikler:** Pembe/maviye sarı, yeşil, mor eklenir. Dönen halkaya bağlı renk kapıları ve tek yönlü fizik kapıları; atanmış anahtarla açılan geçit veya dönme kilidi; gerçek çift açıklıklar ve belirlenmiş periyotta hareket eden dairesel engeller. Mekanikler bölüm verisinde tanımlıdır.
3. **Yardım:** İlk üç bölümde gerçek etkileşimle ilerleyen, atlanabilir öğretici; kalıcı tamamlama ve ayarlardan yeniden başlatma. Mevcut açılarla ilk 0,45 saniyenin, en fazla 64 dünya biriminin fizik önizlemesi. Değişmeyen düzende tekrar hesaplanmaz. Görsel ipucu yalnız doğrulanmış bir sonraki halkanın yönünü 3,2 saniye gösterir; otomatik çözüm uygulamaz.
4. **İlerleme:** Beş Challenge, günlük bulmaca, streak, on başarım, bölüm başına bir defalık Perfect Flow bonusu. Yeni hesaplar sırayla bölüm açar. Eski v1/v2 hesapların açık olan ilk 20 bölümü korunur. Menüde kilit, yıldız, tamamlanma, Perfect Flow ve sıradaki ödül görünür.
5. **Temalar:** Classic, Neon, Candy, Space; satın alma öncesi gerçek oyun sahnesinde önizleme. Aktif bölümün fiziği/doluluğu korunur. Satın alma ve tema seçimi kalıcıdır; koleksiyon görünümleriyle birlikte çalışır.
6. **Live:** Ana ilerlemeden ayrı, otomatik başlayan beş deneysel bölüm. Pause/Resume, Restart ve canlı kontrol; normal bölüm yıldızları ve altınları değişmez. Sonuçları ayrı tutulur.
7. **İçerik ve QA:** İlk 20 bölüm silinmeden **20 yeni normal bölüm** eklendi. Toplam **40 normal + 5 Challenge + 5 Live**. Günlük düzen son 20 doğrulanmış bölümün takvim gününe göre dönen havuzudur; doğrulanmamış rastgele bir düzen üretilmez.

## Undo davranışı

- Eski bölümlerdeki Undo, halkayı geri alır; kovaya ulaşmış topu geri çıkarmaz. Eski davranış korunur.
- Anahtar/kilit, renk değiştirme veya hareketli engel içeren bölümlerde bir hareketin başlangıç fizik görüntüsü tutulur. Undo, o hareketle birlikte top, renk, anahtar, kilit ve zaman durumunu geri yükler; kova doluluğu bu dünyadan yeniden hesaplanır.
- Restart her modun o bölümündeki anahtarları, doluluğu, hareket sayısını ve geçici durumu sıfırlar. Live hemen yeniden başlar.
- Undo harcanan hamle sayısını silmez. Challenge hareket bütçesi bu nedenle Undo ile sınırsızlaştırılamaz.

## Ödül kuralları

- Normal ilk tamamlama bölüm ödülünü verir; daha iyi yıldız başına yalnız fark için +5 altın verilir.
- Perfect Flow: başarılı normal bölüm, hiç ipucu yok, bölüm verisindeki hedef aşılmamış. Bonus bölüm başına bir kezdir.
- Challenge: ilk başarı bölüm ödülü, sonraki yıldız iyileştirmesi için yıldız başına +5; eşit tekrar sıfırdır.
- Daily: yerel tarih anahtarı başına bir kez 45 altın. Aynı tarih tekrarları ödül vermez.
- Başarımlar gerçek kayıt ölçülerinden hesaplanır ve bir kez otomatik ödenir. Puzzle Master normal, Challenge ve günlük tamamlama sayısını kullanır; deneysel Live bu ödülü tetiklemez.
- Temalar ve top görünümleri yalnız oyun içi altınla alınır. Sahip olunan öğe tekrar ücretlendirilmez.

## Çalıştırılan otomatik doğrulamalar

- `npm test`: **201/201 test geçti**.
- `npm run validate:levels -- --report`: **50/50 çözüm geçti**; ayrıntılar [LEVELS.md](LEVELS.md).
- Normal çözüm ve sıralı anahtar/renk koşulları aynı gerçek fizik koduyla oynatıldı. Beş Live sertifikası karışık, hareket eden başlangıçtan canlı hedef değiştirerek tamamlandı. Günlük havuzun bütün düzenleri doğrulandı.
- Tek yönün ters hareketi engellemesi; kapının anahtarsız kapalı kalması; yalnız atanmış kilidin açılması; hareketli engelde sonlu konum ve çarpışma; renk değişimi sonrası doğru kova; mekanikli Undo kopyasının ayrılığı test edildi.
- 30/60/120 çağrı düzenleriyle deterministik fizik testleri geçti. Kayıt geçişi, geçersiz tarih, yıldız, Perfect Flow, günlük tekrar, streak, on başarım ve satın alma tekrarları test edildi.
- TypeScript `tsc --noEmit` ve Vite production build başarılıdır. Phaser içeren paket için 500 kB boyut uyarısı vardır; bu build hatası değildir.

## Tarayıcıda yapılan kontroller

Oynanan kullanıcı kaydını etkilememek için testler ayrı localhost origininde yapıldı.

- İlk normal bölüm iki manuel sürüklemeyle tamamlandı; üç yıldız, Perfect Flow +10 ve First Win +15 dahil toplam 50 altın görüldü.
- Beş Challenge manuel oynanarak tamamlandı. Son örnekte anahtar, kilitli kapı ve pembe→sarı dönüşümü birlikte doğrulandı. Challenge Winner +50 görüldü; tekrar başarı ödülü tekrar vermedi.
- Günlük bulmaca iki kez tamamlandı; ikinci tamamlamada bakiye değişmedi. Günlük kayıt ve bir günlük streak görüldü.
- Dört renkli Live duraklatıldı, tema değiştirildi ve kaldığı yerden tamamlandı. Normal altın bakiyesi değişmedi.
- Neon ve Candy alındı; Style Master ödülü bir kez verildi. Tema ve İnci görünümü sayfa yüklenince korundu; görünüm seçip geri dönmek tekrar ücret almadı. Space satın alınmadan önizlendi.
- Görsel ipucu Undo geçmişine hareket eklemedi. Öğreticide sürükleme→Play, gerçek top hareketi, iki bağımsız halka, atlama ve yeniden açma kontrol edildi.
- 390×844 ve 320×568 ekranlar kontrol edildi. Dar görünümde belge 320×568 olarak kaldı; dokuz ana menü girişi, 40 bölüm ve on başarım kaydırılabilir. Yeni test hesabında yalnız ilk iki bölüm açık, 38'i kilitli ve ilk Perfect işareti görünürdü.
- Müzik ve azaltılmış hareket tercihleri değiştirildi; konsolda JavaScript hatası görülmedi.

## Performans ve sınırlar

- Ring dokuları yalnız etkin bölüm için tutulur; başka bölüme geçince serbest bırakılır. Tema değişiminde önceki tema dokuları serbest bırakılır. İzler top başına sekiz, parçacıklar toplam 56 nesneyle havuzlanır.
- Yerel Node ölçümünde 19/29/36/40. bölümlerde 2400'er fizik adımı ortalama 0,109 / 0,023 / 0,050 / 0,170 ms/adım sürdü. **Bu ölçüm çizimi içermez, mobil FPS ölçümü değildir.**
- Gerçek Android/iOS telefonu, donanım titreşimi, işitsel ses dengesi ve gerçek cihazda 60 FPS ölçümü yapılmadı. Mobil testler tarayıcı viewport ve mouse pointer kontrolleridir.
- Günlük bulmaca sunucusuzdur; cihaz tarihinin değiştirilmesini güvenli biçimde engellemez. Çevrim içi güvenli ödül sistemi olarak sunulmaz.
- Çözüm sertifikası bir geçerli fizik yolunu kanıtlar; her olası oyuncu hamlesini, en iyi hamle sayısını veya insanlara göre zorluk dengesini kanıtlamaz. Oyuncu testleri, cihaz testleri ve mağaza paketleme/yayınlama ayrıca gereklidir.

## Commit özeti

`feat: expand Spin Sort with verified mechanics, modes, themes and progression`

Mevcut 20 bölümü ve kayıtları korur; 20 normal, 5 Challenge ve 5 Live bölüm; modüler fizik mekanikleri; doluluk; görsel yardım; günlük/Perfect/başarım ödülleri; temalar ve sürümlü kayıt geçişi ekler.
