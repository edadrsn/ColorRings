# Geliştirme öncesi mevcut durum raporu

> Bu dosya tarihsel aşama notlarını korur. 26 Ekim 2026 güncel durum: 40 klasik + 100 Ustalık, ek modlarla 155 fizik sertifikası, 624 geçen test, 20 görünüm, replay ve ölçülen istatistikler. Yeni inceleme ve test sınırları: [DIFFICULTY_UPDATE.md](DIFFICULTY_UPDATE.md).

Bu rapor mevcut kaynak kodu okunarak ve `npm test` çalıştırılarak hazırlanmıştır. Başlangıçtaki **33 test geçti**.

| Özellik | İncelemede bulunan durum |
| --- | --- |
| Bölümler | 3 bölüm: iki öğretici, bir sıralı teslim bulmacası. 20 bölüm yok. |
| Fizik | 120 Hz canlı yerçekimi, dönen duvarlar, top/top çarpışmaları ve doğrulanmış örnek çözümler mevcut. |
| Kontrol | Doğrudan pointer sürükleme, dokunma, canlı kontrol, Undo ve Restart mevcut. |
| Görseller | Özgün önbellekli görseller, ışık izleri, kova animasyonu, parçacıklar ve yıldız ekranı mevcut. |
| Yıldız | Hamle sayılıyor; 12/24 eşikleri global `presentation.ts` içinde. Bölüme özel veri değil. |
| Kayıt | Altın, tamamlanan bölümler, en iyi yıldız ve tercihler localStorage içinde. Mağaza/envanter ve kayıt işlemlerinin bağımsız testleri yok. |
| Mağaza | Yok. |
| İpucu | Yok. Bölüm 3 için çözüm adımları var; oyuncuya sunulmuyor. |
| Performans | İz/parçacık havuzları mevcut. Tüm halka dokuları açılışta hazırlanıyor; 20 bölüm için gereksiz bellek maliyeti oluşturur. |
| Arayüz | Kovaların altında iki halka/derece kısayolu var; istek doğrultusunda kaldırılacak. |
| Test sınırı | Gerçek telefon üzerinde dokunma ve FPS ölçümü yapılmadı. |

## Uygulama sırası

1. Mevcut üç bölümü koru; farklı düzenler ve kademeli tanıtımla 20 bölümü oluştur. Her çözümü gerçek fizik motoruyla otomatik doğrula.
2. Bölüm bazlı yıldız eşikleri ve ödüller; test edilebilir, eski kayıtları koruyan kalıcı ilerleme/envanter.
3. Yalnız oyun içi altınla kozmetik mağazası ve doğrulanmış çözüm adımlarından üretilen ipuçları.
4. Derece kısayollarını kaldır; mobil yerleşim, temel kontroller, TypeScript ve production build kontrollerini yap.

Tamamlanan aşamalar ve gerçek çalıştırma sonuçları README ve son kullanıcı yanıtında ayrıca raporlanacaktır.

## Aşama 1 sonucu

- 20 bölüm tanımlandı; başlangıçtaki üç bölüm korunuyor.
- 2 → 3 → 4 halka, iki/dört/altı top, farklı başlangıç katları ve tek çıkıştan sıralı dalgalar kademeli tanıtılıyor.
- `tests/levels.test.ts` çalıştırıldı: yapısal çeşitlilik kontrolü ve her bölümün gerçek fizik üzerinden tamamlanması dahil **21 test geçti**.
- Bölümler yalnızca ilk açıların değiştirilmesiyle çoğaltılmadı; halka sayısı/yarıçapı, açıklıklar, cep duvarları, başlangıç katları ve top sayısı değişiyor.
- Doku yüklemesi aktif bölüme indirildi; önceki bölümün halka dokuları geçişte serbest bırakılıyor.

## Aşama 2 sonucu

- Yıldız eşikleri ve altın ödülü artık her bölümün verisinde.
- Eski localStorage kayıtlarını koruyan sürümlü kayıt modülü eklendi.
- İlk tamamlama ödülü, daha iyi yıldız için bir defalık fark ödülü, çift satın alma/yetersiz bakiye koruması ve seçili görünüm kaydı test edildi.
- `tests/progress.test.ts` çalıştırıldı: 6 kayıt/ödül/mağaza mantığı, 20 bölüm ipucu ve canlı ipucunun dünyayı ilerletmemesi dahil **27 test geçti**.

## Aşama 3 uygulaması

- Oyun içi altınla İnci, Neon ve Yıldız tozu görünümleri; ücretsiz Klasik görünüm.
- İpucu, bölüme ait çözümü veya canlı dünyanın kopyasındaki devamını fizik üzerinden doğrular. Güvenli devam yoksa kullanıcıya açıkça başlangıç düzenine dönme seçeneği sunar.
- 20 bölümlük seçme ekranı ve bölüm bazlı yıldız/ilerleme görünümü.
- Kovaların altındaki halka/derece düğmeleri kaldırıldı. Mouse/parmakla doğrudan sürükleme devam ediyor; klavyede labirente odaklanıp halkalar seçilip döndürülebiliyor.
- Menüler açıkken canlı fizik bekletiliyor; mağazada görünüm değişimi topların konumunu sıfırlamıyor.

## Son doğrulama — 25 Ekim 2026

- `npm test`: **83/83 test geçti**. Her 20 bölümün çözümü gerçek fizik simülasyonuyla doğrulandı; çok katlı örneklerde farklı kare süreleri de kontrol edildi.
- `npm run validate:levels -- --report`: **20/20 çözüm geçti**; ayrıntılar `LEVELS.md` içinde.
- `npm run build`: TypeScript kontrolü ve production build başarılı. Vite, Phaser içeren JavaScript paketinin 500 kB sınırını aşması için boyut uyarısı verdi; build başarısız olmadı.
- Tarayıcıda ilk üç bölümün tamamlanması, Next Level, iki aşamalı canlı ipucu, satın alma/yetersiz bakiye, görünüm seçimi ve yeniden yüklemede yıldız/altın/görünüm kaydı doğrulandı. Testler ana oyuncu kaydını etkilemeyen ayrı localhost origininde yapıldı.
- Dört halkalı bölümde mouse sürükleme, Undo, Play ve Restart kontrol edildi. Tarayıcı konsolunda hata görülmedi.
- 390×844 ve 320×740 görünüm boyutları kontrol edildi. 320 pikselde yatay taşma yok; bölüm düğmeleri yaklaşık 50×58 piksel. Menüde 20 bölüm var; eski derece kontrollerinin DOM sayısı sıfır.
- Halka dokuları yalnızca etkin bölüm için tutuluyor; mevcut iz/parçacık havuzları korunuyor. Dört halkalı fizik ölçümünde 1200 adım yaklaşık 82 ms sürdü; bu ölçüm çizimi içermiyor ve telefon FPS ölçümü değildir.
- Gerçek telefon üzerinde parmak kontrolü ve donanım FPS ölçümü yapılmadı. Mobil ekran testi tarayıcı viewport kontrolüdür. Zorluk dengesi için oyuncu testleri ayrıca gerekir.
- Son ekran görüntüleri: `spin-sort-campaign.png`, `spin-sort-20-levels.png`, `spin-sort-shop.png`.

## Görsel ve oynanış iyileştirmeleri — yalnız Aşama 1

- Labirent, arena kenar boşlukları ve 1,04 kamera yakınlaştırması ile 390×844 ekranda yaklaşık %16 büyütüldü. Kontrol koordinatları kameranın ters dönüşümünü kullanır. Fizik boyutları ve 20 bölüm verisi korunur.
- Halkalar, toplarla aynı 120 Hz fizik saatinin önceki/güncel adımları arasında çizilir; 0/360 geçişinde kısa yay kullanılır. Planlama sürüklemesi kısa üstel yumuşatma kullanır.
- Top parlaması/gölgesi ve havuzlu izler belirginleştirildi. Kozmetiklerde İnci şeridi, Neon ışıklı çerçeve ve büyük yıldızlar oyun dokusuna işlendi; bölüm yükleme/Play sırasında seçili doku hazırlanır.
- Mevcut sıçrama ve ses korunup kova ışık halkası ile gecikmeli parçacık patlaması eklendi. Kısa aralıklı doğru teslimler için yeniden kullanılan tek combo yazısı eklendi.
- Yıldız giriş animasyonlarına altın sayacı ve altın parıltıları eşlik eder. Azaltılmış hareket tercihi korunur.
- `npm test`: **86/86 geçti**. Yeni testler kısa yay interpolasyonu, combo sıfırlama ve önceki halka açılarının kopyalanmasını doğrular. Mevcut 20 bölümün fizik çözümleri de geçti.
- `npm run build`: TypeScript ve production build geçti; Phaser paket boyutu için mevcut Vite uyarısı sürüyor.
- Tarayıcıda 7. bölüm dört topla tamamlandı; üç yıldız, +30 altın ve Next Level görüldü. 8. bölümde yakınlaştırılmış halkada mouse sürükleme, Undo ve Play sonrası Restart çalıştı. Konsol hata kaydı yok.
- 390×844 ve 320×568 yerleşimleri kontrol edildi; dar görünümde belge 320×568, Canvas yaklaşık 247×362 piksel olarak alana sığıyor. Gerçek telefon dokunması/FPS ve sesin işitsel ölçümü yapılmadı.
- Ekran görüntüsü: `spin-sort-stage-1.png`. **Aşama 2 mekanikleri uygulanmadı; kullanıcı onayı bekleniyor.**

## 26 Ekim 2026 — yeni master isteği

Kullanıcının sonraki master metni bütün aşamaları ara onay beklemeden tamamlamayı istedi. Önceki yalnız-Aşama-1 sınırı bu yeni istekle değişti.

- İlk 20 bölüm korunarak 20 yeni normal bölüm, 5 Challenge ve 5 Live eklendi.
- Yeni renkler, anahtar/geçit ve dönme kilidi, renk değiştirme, tek yön, çift çıkış ve hareketli engeller aynı fizik motorunda çalışır.
- Kova doluluğu, görsel yardım, öğretici, Perfect Flow, günlük ödül/streak, on başarım, dört tema ve sürümlü kayıt geçişi tamamlandı.
- **201 otomatik test** ve **50/50 çözüm sertifikası** geçti. TypeScript ve production build başarılıdır.
- Manuel tarayıcı testleri; beş Challenge, iki günlük tamamlama, dört renkli Live/Pause, anahtar+renk dönüşümü, satın alma/kayıt ve mobil menüleri içerir.
- Ayrıntılı inceleme, test ayrımı, performans ölçümü ve yapılmayan cihaz testleri [MASTER_UPDATE.md](MASTER_UPDATE.md) içindedir.
