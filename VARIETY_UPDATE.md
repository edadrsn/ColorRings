# Bölüm akışı — üçlü fikir grupları

Önceki Ustalık 1–10 aynı iki halkalı temelin küçük değişiklikleriydi. Bu akış kaldırıldı. Mevcut doğrulanmış dairesel düzenler, farklı başlangıç katları ve yeni mekanik birleşimleri 100 bölüm boyunca 34 kısa gruba ayrıldı; bir fikir en fazla üç ardışık bölüm sürer. Klasik 40 ve oyuncu kayıtları korunur. Kaynak: `campaign-variety.ts`.

| Bölümler | Oyuncunun karşılaştığı değişiklik |
| --- | --- |
| 1–3 | Geniş/dar ve farklı açılardaki geçitleri hizalama |
| 4–6 | Tek çıkış, iki ayrı fiziksel teslim aşaması; son örnekte önce mavi |
| 7–9 | Üç halka; farklı başlangıç katı; dört toplu akış |
| 10–12 | Anahtarlı kapı, anahtara kadar dönmeyen halka, iki ayrı anahtar |
| 13–15 | Topun geçitte renk değiştirmesi ve doğru yeni hedef |
| 16–18 | Yan çıkışlar ve tek yön |
| 19–21 | İki/üç/dört renkli düzenlerde hareketli engeller |
| 22–24 | Ters, yarım ve ters yarım oranlı halkalar |
| 25–27 | Farklı renk ve kat düzenlerinde top bölme |
| 28–30 | Hamle ve halka bütçeleri |
| 31–100 | Sıralı üç/dört renk, anahtarlı dalgalar, bağlı katlar, çoklu başlangıç topları, zikzak teslim, iki aşamalı renk, dönen anahtar, iki bölücü ve ritim birleşimleri; son bölüm birleşik final |

Harita üçlü fikir başlıklarını gösterir; son tek bölümlük grup dahil 100 kart ve 34 başlık var. Bir aşamalı serbest akışta gereksiz “sıradaki geçidi aç” mesajı kaldırıldı; teslim sırası gerçekten gereken bölümlerde gösterilir. Ustalık 5'in yeni planı üç hamle/iki teslimdir; 50 ve 100 sertifikalı planları korunur.

Testler isimleri, başlangıç açılarını ve küçük duvar kalınlığı farklarını yok sayan görev profillerini karşılaştırır. İlk 12'nin dört ayrı fiziksel görev tanıtması, ilk 10'da en az sekiz farklı görev profili, sonraki grubun önceki görev profillerini aynen tekrarlamaması, üçlü grup sınırı, son bölümün haritada görünmesi ve kayıt korunması kontrol edilir. Bu kontroller eğlenceyi matematiksel olarak kanıtlamaz; oyuncu denemesi hâlâ önemlidir.

Gerçek sonuçlar: `npm test` **645 geçti / 0 başarısız**; `npm run validate:levels -- --report` **155/155** gerçek fizik çözümü; `npm run build` TypeScript ve production build başarılı. Aynı sabit fizik anlarındaki komutların 1×/2× sonuç testleri tüm 100 Ustalık için tekrar geçti. Büyük Phaser paket uyarısı devam eder.

Tarayıcıda 390 px harita, 34 başlık, 100 kart ve temel kontrol girişleri kontrol edildi. Otomatik tarayıcı denemelerinde etkileşim/çizim zamanlaması kesintileri nedeniyle ilk 12'nin tamamının elle sona kadar oynandığı iddia edilmez. Gerçek cihaz FPS/dokunma ve oyuncuyla tempo değerlendirmesi ayrı kalan kontrollerdir. Ayrıntılı çözüm sayıları `DIFFICULTY.md` içindedir.
