# “Reward earned!” kaynağı ve ücretsiz ödül denetimi

30 Ekim 2026.

## Kaynak araştırması

**Tam olarak “Reward earned!” yazan pencerenin kaynağı doğrulanamadı.** Bu metin güncel `src`, çeviriler ve yeni `dist` çıktısında bulunmuyor. Mevcut HEAD kaynaklarında da aynı sabit ifade yok. Açık `http://localhost:5173/` sekmesi incelendi: görünür dialog yok, sayfa bu metni içermiyor ve Vite güncel `src/main.ts` modülünü kullanıyor. Görünmeyen sonuç alanında başlık “Renkler yerinde!”, ödül satırı “Bölüm ödülü toplandı”.

Bu nedenle yalnızca ifadeye bakıp kullanıcının gördüğü pencereye “eski reklamdır” veya “başarım ödülüdür” demek için yeterli kanıt yok. Eski sürüm/başka dağıtım ihtimali doğrulanmadı. Pencere yeniden görünürse ekran görüntüsü, adres ve hemen önce yapılan işlem ile o örneğin ayrıca eşleştirilmesi gerekir.

## Güncel, doğrulanmış olay zincirleri

| Arayüz | Tetikleyici | Kod ve işlem |
|---|---|---|
| Bölüm sonucu | Fizik dünyası biter | `src/scene.ts:294–295`: `world.finished` → gecikmeli `callbacks.finish()` |
| Bölüm sonucu ve altın | Scene'in finish callback'i | `src/main.ts:292`: `session.finish()` ardından başarı durumunda normal bölüm için `awardCompletion` + `awardPerfect`; Challenge için `awardChallenge`, günlük için `awardDaily` |
| Başarım altını | Başarımların değerlendirilmesi | `src/main.ts:89` `settleAchievements()` → `src/meta.ts:25` `claimAchievements()`. Ayrı 3 saniyelik toast gösterir; bağımsız “Reward earned!” dialog'u oluşturmaz |
| Sonuç penceresini açma | finish callback'inin sonu | `src/main.ts:309–315`: başlık/yıldızlar doldurulur, `result.hidden=false`, başarıda `animateReward(earned)` çalışır |
| Başarılı denemeyi tekrar izleme sonrası | Kayıtlı oynatımın bitmesi | `stopReplay()` aynı sonuç ekranını gösterir; tekrar altın vermez |

Bölüm sonucu başarısızlıkta da açılır ama ödül alanı gizlenir. Başarım değerlendirmesi ayrıca sahne hazır olduğunda, Başarımlar menüsünde ve kozmetik/tema açıldığında yapılabilir. Her başarımın ödülü kayıt içindeki `claimedAchievements` ile bir kez verilir. Ücretsiz sandık çizimi `rewardArt()` günlük bulmaca görünümünde kullanılır; reklam servisi değildir.

## Eski reklam akışı

Git HEAD içindeki tarihsel, çalışma ağacında **silinmiş** `src/store-controller.ts` ayrı bir sistemdi:

`showAds()` → `[data-ad-reward]` → `showAd()` → `#ad-start` → `#ad-complete.onclick` → `TestAdService.complete()` → `claimAdReward()` → kaydet.

Oradaki ekran `TEST AD`, “Test reklamı başladı”, “Reklam tamamlandı” ve “Ödül verildi ve kaydedildi” gibi metinler kullanıyordu; tam “Reward earned!” ifadesi yoktu. Gerçek reklam SDK'sı değil, yerel simülasyondu. Ödeme simülasyonu `TestPurchaseService` üzerinden ayrı çalışıyordu.

`ads.ts`, `purchases.ts`, `store-controller.ts`, `store-view.ts` önceki temizlikte silinmiş ve hâlen yok. Güncel kaynak/import/CSS/bağımlılık denetimi bunlara ait çalışan giriş noktası, düğme veya SDK bulmadı. Runtime bağımlılığı yalnız Phaser. Yeni production çıktısında da eski servis/olay seçicileri bulunmadı. Git geçmişindeki dosyalar ve tarihsel raporlar aktif oyunun parçası değildir.

## Yapılan değişiklikler

Yeni kaldırılması gereken aktif reklam/ödeme kodu bulunmadı; oyun kaynaklarına gereksiz değişiklik yapılmadı. `progress.ts` içindeki eski `commerce.hintCredits` okuması ve eski test makbuzu günlüğünün temizliği korundu: bunlar servis değil, oyuncu kaydını koruyan geçiş kodudur.

Bu görevde yalnızca:

- `tests/non-monetized.test.ts`: iki regresyon testi eklendi. Bütün runtime TS/CSS/HTML kaynakları ve kilitli bağımlılık grafiği eski reklam/ödeme giriş noktaları için kontrol edilir. Ayrıca beş bölümün altını + Perfect Flow + başarım ödülüyle İnci görünümü açılır, tekrar ödül/ücret alınmadığı ve yeniden yüklemede kaydın korunduğu doğrulanır.
- `REWARD_AUDIT.md`: bu araştırma raporu eklendi.

Mevcut çalışma ağacındaki diğer değişiklikler önceki görevlerden kalmadır; bu görevde yeniden yapılmış gibi sayılmadı. Oyun mekaniği, fiyatlar ve ücretsiz ödül tutarları değiştirilmedi.

## Doğrulama

- `npm test`: **780 test geçti, 0 hata**, yaklaşık 27,3 saniye. Çıktı: `reward-audit-tests.log`.
- `npm run build`: **TypeScript ve production build başarılı**. Vite build yaklaşık 5,45 saniye. Çıktı: `reward-audit-build.log`.
- Phaser içeren büyük chunk için mevcut 500 kB uyarısı sürüyor; build hatası değil.
- Son `dist` üzerinde “Reward earned!”, eski reklam servisleri, reklam tamamlanma düğmesi ve ödeme simülasyonu seçicileri yeniden tarandı; eşleşme yok.
- Açık oyuncu sekmesi salt okunur incelendi; asıl bakiye, kayıt, dil veya bölüm değiştirilmedi.

Kesin olarak doğrulanan sonuç: **güncel bölüm ve başarım ödülleri ücretsiz oyun içi ödüllerdir; eski reklam/ödeme simülasyonu aktif değildir.** Kullanıcının sözünü ettiği tam ifadeli pencere bu çalışmada yeniden üretilemedi.
