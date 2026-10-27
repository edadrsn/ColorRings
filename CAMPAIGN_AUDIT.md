# 140 bölümün tek tek labirent denetimi

**140 bölüm · 9730 ikili karşılaştırma · 140/140 fizik çözümü · 111 düzen yenilendi.**

Renkler, isimler, ödüller, başlangıç açıları ve küçük duvar/yarıçap farkları ayrı bölüm sayılmaz. Halka duvarları 10° sektörlere örneklenir; açıklık, iç/dış cep duvarı ve uzunluk sınıfı karşılaştırılır. Her halkanın bağımsız döndürülmüş ve aynalanmış eşleri aranır. Sabit yönlendirme duvarları da hesaba katılır. Klasik–Klasik 780, Ustalık–Ustalık 4950 ve Klasik–Ustalık 4000 karşılaştırmanın tamamı yapılır.

Sonuç: **0 aynı profil**, **0 eşik altı benzer çift**. En yakın uzaklık 14.06 / 100, eşik 14.00 / 100. Bu değer ağırlıklı geometri örnek farkıdır; oyuncuların algıladığı benzerlik yüzdesi değildir.

Her satırdaki çözüm aynı gerçek fizik motoruyla çalıştırıldı. Kanonik çözüm sırasında topların temas ettiği bölgeler korunup diğer bölgelerde yeni cep duvarları, geçitler ve bazı alt koridorlar tasarlandı. Yeni pencereler tam top çapından geniştir. Bu koruma ana çözümün güvenilirliğini sağlar; oyuncu başka bir dönüş seçtiğinde ek geçitler ve duvarlar gerçek çarpışmalara katılır. Üretim oyunu rastgele bölüm veya çalışma anında çözüm araması yapmaz; doğrulanan düzenler statik veridir.

Bu denetim aynı veya çok yakın labirent şablonlarını bulur; 140 farklı oyun mekaniği, 140 farklı en iyi strateji veya eğlence garantisi değildir. Ortak mekanikler ve temel çözüm fikirleri tekrar kullanılabilir. Bütün bölümlerin elle oynandığı iddia edilmez.

| Kod | Halka | Pencere / cep duvarı | Fizik | Teslim / anahtar aşaması | En yakın | Uzaklık | Düzen |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K01 | 2 | 4 / 13 | Geçti | 1 | U001 | 25.69 | Korunan özgün düzen |
| K02 | 2 | 4 / 14 | Geçti | 1 | K01 | 29.03 | Korunan özgün düzen |
| K03 | 3 | 4 / 9 | Geçti | 1 | U048 | 22.04 | Korunan özgün düzen |
| K04 | 3 | 3 / 10 | Geçti | 1 | U005 | 16.44 | Korunan özgün düzen |
| K05 | 3 | 3 / 9 | Geçti | 1 | K34 | 17.50 | Korunan özgün düzen |
| K06 | 4 | 4 / 14 | Geçti | 1 | K12 | 15.66 | Korunan özgün düzen |
| K07 | 4 | 4 / 11 | Geçti | 1 | U018 | 19.24 | Korunan özgün düzen |
| K08 | 4 | 8 / 13 | Geçti | 1 | K06 | 25.07 | Geniş yan oda |
| K09 | 4 | 4 / 8 | Geçti | 2 | K36 | 16.28 | Korunan özgün düzen |
| K10 | 2 | 2 / 11 | Geçti | 2 | U013 | 21.32 | Korunan özgün düzen |
| K11 | 3 | 9 / 11 | Geçti | 2 | K13 | 25.69 | Çatal yollar |
| K12 | 4 | 4 / 18 | Geçti | 1 | K06 | 15.66 | Korunan özgün düzen |
| K13 | 3 | 6 / 12 | Geçti | 2 | U048 | 21.20 | İç dişli odalar |
| K14 | 3 | 3 / 11 | Geçti | 2 | K04 | 18.43 | Korunan özgün düzen |
| K15 | 4 | 10 / 20 | Geçti | 1 | K17 | 24.37 | Sarmal cepler |
| K16 | 4 | 8 / 16 | Geçti | 1 | K17 | 22.88 | Köprülü odalar |
| K17 | 4 | 7 / 12 | Geçti | 1 | K36 | 19.48 | Geniş yan oda |
| K18 | 4 | 12 / 12 | Geçti | 2 | K20 | 24.20 | Çift oda |
| K19 | 4 | 7 / 20 | Geçti | 1 | U075 | 18.26 | Basamaklı cepler |
| K20 | 4 | 10 / 17 | Geçti | 2 | K18 | 24.20 | Çatal yollar |
| K21 | 4 | 16 / 7 | Geçti | 1 | U062 | 27.08 | Üç pencere |
| K22 | 2 | 2 / 2 | Geçti | 1 | K29 | 20.90 | Korunan özgün düzen |
| K23 | 3 | 10 / 13 | Geçti | 1 | U059 | 26.02 | Çift geçit |
| K24 | 2 | 8 / 9 | Geçti | 1 | U001 | 24.10 | Sarmal cepler |
| K25 | 2 | 6 / 10 | Geçti | 2 | U011 | 27.71 | Köprülü odalar |
| K26 | 3 | 3 / 4 | Geçti | 1 | K40 | 21.62 | Korunan özgün düzen |
| K27 | 3 | 9 / 10 | Geçti | 1 | U059 | 23.80 | Çift oda |
| K28 | 3 | 6 / 17 | Geçti | 1 | U023 | 22.41 | Basamaklı cepler |
| K29 | 2 | 2 / 7 | Geçti | 1 | K22 | 20.90 | Korunan özgün düzen |
| K30 | 2 | 9 / 6 | Geçti | 1 | K25 | 28.33 | Üç pencere |
| K31 | 3 | 3 / 4 | Geçti | 1 | U032 | 17.27 | Korunan özgün düzen |
| K32 | 4 | 4 / 4 | Geçti | 1 | U050 | 14.34 | Korunan özgün düzen |
| K33 | 3 | 8 / 13 | Geçti | 1 | U060 | 23.47 | Sarmal cepler |
| K34 | 3 | 4 / 12 | Geçti | 1 | K05 | 17.50 | Korunan özgün düzen |
| K35 | 3 | 6 / 10 | Geçti | 1 | K04 | 21.99 | Geniş yan oda |
| K36 | 4 | 6 / 8 | Geçti | 1 | K09 | 16.28 | Korunan özgün düzen |
| K37 | 3 | 6 / 18 | Geçti | 2 | U039 | 24.49 | Basamaklı cepler |
| K38 | 4 | 11 / 10 | Geçti | 1 | U064 | 18.65 | Çatal yollar |
| K39 | 4 | 4 / 9 | Geçti | 1 | U031 | 17.88 | Korunan özgün düzen |
| K40 | 3 | 4 / 6 | Geçti | 5 | K26 | 21.62 | Korunan özgün düzen |
| U001 | 2 | 8 / 9 | Geçti | 1 | U041 | 17.01 | Çift geçit |
| U002 | 3 | 5 / 16 | Geçti | 1 | U010 | 19.35 | Korunan özgün düzen |
| U003 | 4 | 7 / 13 | Geçti | 1 | U085 | 17.71 | Köprülü odalar |
| U004 | 2 | 3 / 9 | Geçti | 2 | K10 | 22.15 | Korunan özgün düzen |
| U005 | 3 | 3 / 11 | Geçti | 2 | U006 | 16.16 | Korunan özgün düzen |
| U006 | 3 | 3 / 13 | Geçti | 2 | U005 | 16.16 | Korunan özgün düzen |
| U007 | 3 | 7 / 11 | Geçti | 1 | U023 | 15.28 | Çatal yollar |
| U008 | 4 | 14 / 10 | Geçti | 1 | U034 | 26.42 | Üç pencere |
| U009 | 4 | 7 / 19 | Geçti | 1 | U018 | 20.45 | İç dişli odalar |
| U010 | 3 | 5 / 15 | Geçti | 1 | U002 | 19.35 | Korunan özgün düzen |
| U011 | 2 | 8 / 9 | Geçti | 2 | U001 | 25.35 | Sarmal cepler |
| U012 | 3 | 8 / 13 | Geçti | 1 | U040 | 24.81 | Köprülü odalar |
| U013 | 2 | 2 / 8 | Geçti | 1 | K10 | 21.32 | Korunan özgün düzen |
| U014 | 3 | 8 / 8 | Geçti | 1 | U020 | 19.44 | Çift oda |
| U015 | 3 | 6 / 19 | Geçti | 1 | U016 | 25.97 | Basamaklı cepler |
| U016 | 3 | 10 / 13 | Geçti | 1 | U015 | 25.97 | Çatal yollar |
| U017 | 3 | 13 / 6 | Geçti | 1 | U029 | 29.44 | Üç pencere |
| U018 | 4 | 7 / 19 | Geçti | 1 | K07 | 19.24 | İç dişli odalar |
| U019 | 3 | 9 / 13 | Geçti | 1 | K35 | 27.50 | Çift geçit |
| U020 | 3 | 8 / 13 | Geçti | 1 | U014 | 19.44 | Sarmal cepler |
| U021 | 4 | 7 / 13 | Geçti | 1 | U066 | 18.30 | Köprülü odalar |
| U022 | 3 | 8 / 11 | Geçti | 1 | U040 | 20.28 | Geniş yan oda |
| U023 | 3 | 7 / 8 | Geçti | 1 | U007 | 15.28 | Çift oda |
| U024 | 3 | 7 / 19 | Geçti | 2 | U022 | 24.40 | Basamaklı cepler |
| U025 | 3 | 9 / 13 | Geçti | 1 | K27 | 24.40 | Çatal yollar |
| U026 | 3 | 11 / 5 | Geçti | 1 | U071 | 19.07 | Üç pencere |
| U027 | 2 | 4 / 10 | Geçti | 1 | U013 | 23.68 | İç dişli odalar |
| U028 | 3 | 9 / 14 | Geçti | 1 | U022 | 25.32 | Çift geçit |
| U029 | 3 | 9 / 14 | Geçti | 1 | U016 | 27.92 | Sarmal cepler |
| U030 | 3 | 5 / 9 | Geçti | 2 | U087 | 15.65 | Köprülü odalar |
| U031 | 4 | 4 / 5 | Geçti | 3 | K39 | 17.88 | Korunan özgün düzen |
| U032 | 3 | 3 / 3 | Geçti | 3 | K31 | 17.27 | Korunan özgün düzen |
| U033 | 3 | 6 / 17 | Geçti | 3 | U084 | 18.38 | Basamaklı cepler |
| U034 | 4 | 10 / 16 | Geçti | 2 | U061 | 21.94 | Çatal yollar |
| U035 | 4 | 11 / 8 | Geçti | 4 | U037 | 14.93 | Üç pencere |
| U036 | 4 | 7 / 16 | Geçti | 4 | U050 | 14.17 | İç dişli odalar |
| U037 | 4 | 11 / 13 | Geçti | 4 | U068 | 14.83 | Çift geçit |
| U038 | 3 | 10 / 14 | Geçti | 1 | U025 | 24.58 | Sarmal cepler |
| U039 | 3 | 7 / 12 | Geçti | 1 | K37 | 24.49 | Köprülü odalar |
| U040 | 3 | 8 / 11 | Geçti | 2 | U022 | 20.28 | Geniş yan oda |
| U041 | 2 | 8 / 7 | Geçti | 1 | U001 | 17.01 | Çift oda |
| U042 | 3 | 5 / 15 | Geçti | 2 | U048 | 19.21 | Basamaklı cepler |
| U043 | 4 | 12 / 16 | Geçti | 1 | U082 | 30.59 | Çatal yollar |
| U044 | 3 | 11 / 5 | Geçti | 1 | U026 | 19.21 | Üç pencere |
| U045 | 2 | 4 / 7 | Geçti | 1 | K22 | 21.04 | İç dişli odalar |
| U046 | 4 | 9 / 14 | Geçti | 1 | U085 | 14.48 | Çift geçit |
| U047 | 4 | 10 / 18 | Geçti | 2 | U075 | 19.51 | Sarmal cepler |
| U048 | 3 | 5 / 10 | Geçti | 2 | U030 | 17.27 | Köprülü odalar |
| U049 | 4 | 8 / 12 | Geçti | 4 | U053 | 14.37 | Geniş yan oda |
| U050 | 4 | 5 / 4 | Geçti | 4 | U036 | 14.17 | Korunan özgün düzen |
| U051 | 4 | 8 / 17 | Geçti | 4 | U050 | 15.69 | Basamaklı cepler |
| U052 | 4 | 8 / 10 | Geçti | 5 | U100 | 14.34 | Basamaklı cepler |
| U053 | 4 | 10 / 7 | Geçti | 5 | U049 | 14.37 | Üç pencere |
| U054 | 4 | 10 / 5 | Geçti | 5 | U076 | 14.06 | Çift geçit |
| U055 | 4 | 11 / 12 | Geçti | 4 | U068 | 15.17 | Çift geçit |
| U056 | 4 | 11 / 14 | Geçti | 4 | U051 | 15.97 | Sarmal cepler |
| U057 | 4 | 8 / 13 | Geçti | 4 | U076 | 15.21 | Köprülü odalar |
| U058 | 3 | 6 / 9 | Geçti | 1 | U044 | 20.60 | Geniş yan oda |
| U059 | 3 | 9 / 10 | Geçti | 1 | U022 | 23.61 | Çift oda |
| U060 | 3 | 6 / 15 | Geçti | 1 | U058 | 22.27 | Basamaklı cepler |
| U061 | 4 | 10 / 16 | Geçti | 2 | U034 | 21.94 | Çatal yollar |
| U062 | 4 | 16 / 9 | Geçti | 2 | K21 | 27.08 | Üç pencere |
| U063 | 4 | 7 / 20 | Geçti | 2 | U086 | 20.90 | İç dişli odalar |
| U064 | 4 | 12 / 9 | Geçti | 4 | U037 | 15.24 | Çift geçit |
| U065 | 4 | 11 / 11 | Geçti | 4 | U066 | 14.97 | Sarmal cepler |
| U066 | 4 | 8 / 10 | Geçti | 4 | U065 | 14.97 | Geniş yan oda |
| U067 | 4 | 10 / 8 | Geçti | 5 | U053 | 15.24 | Üç pencere |
| U068 | 4 | 10 / 7 | Geçti | 5 | U076 | 14.41 | Çatal yollar |
| U069 | 4 | 8 / 8 | Geçti | 5 | U098 | 27.64 | İç dişli odalar · Boğaz koridoru |
| U070 | 4 | 12 / 16 | Geçti | 3 | U082 | 23.51 | Çatal yollar |
| U071 | 3 | 11 / 5 | Geçti | 3 | U026 | 19.07 | Üç pencere |
| U072 | 3 | 6 / 15 | Geçti | 3 | U084 | 18.70 | İç dişli odalar |
| U073 | 3 | 7 / 12 | Geçti | 1 | U023 | 22.82 | Çift geçit |
| U074 | 4 | 12 / 19 | Geçti | 1 | U034 | 28.47 | Sarmal cepler |
| U075 | 4 | 7 / 15 | Geçti | 1 | U085 | 17.43 | Köprülü odalar |
| U076 | 4 | 10 / 9 | Geçti | 5 | U054 | 14.06 | Çatal yollar |
| U077 | 4 | 8 / 11 | Geçti | 5 | U050 | 14.27 | Köprülü odalar |
| U078 | 4 | 8 / 8 | Geçti | 5 | U099 | 14.34 | Köprülü odalar · Kademeli kapılar |
| U079 | 4 | 12 / 16 | Geçti | 3 | U082 | 24.93 | Çatal yollar |
| U080 | 3 | 11 / 6 | Geçti | 3 | U033 | 27.87 | Üç pencere |
| U081 | 3 | 6 / 16 | Geçti | 3 | U032 | 21.39 | İç dişli odalar |
| U082 | 4 | 12 / 17 | Geçti | 3 | U070 | 23.51 | Çift geçit |
| U083 | 3 | 9 / 11 | Geçti | 3 | U071 | 23.33 | Sarmal cepler |
| U084 | 3 | 6 / 10 | Geçti | 3 | U033 | 18.38 | Köprülü odalar |
| U085 | 4 | 7 / 12 | Geçti | 1 | U046 | 14.48 | Geniş yan oda |
| U086 | 4 | 10 / 11 | Geçti | 2 | K36 | 20.45 | Çift oda |
| U087 | 3 | 5 / 15 | Geçti | 2 | U030 | 15.65 | Basamaklı cepler |
| U088 | 4 | 8 / 15 | Geçti | 4 | U066 | 15.24 | İç dişli odalar |
| U089 | 4 | 12 / 8 | Geçti | 4 | U067 | 16.28 | Üç pencere |
| U090 | 4 | 10 / 13 | Geçti | 4 | U049 | 14.72 | Çift geçit |
| U091 | 4 | 11 / 10 | Geçti | 4 | U065 | 17.01 | Çift geçit |
| U092 | 3 | 9 / 11 | Geçti | 3 | U032 | 22.22 | Sarmal cepler |
| U093 | 4 | 7 / 13 | Geçti | 4 | U066 | 15.10 | Köprülü odalar |
| U094 | 4 | 10 / 8 | Geçti | 5 | U095 | 14.34 | Çift geçit · Kademeli kapılar |
| U095 | 4 | 10 / 11 | Geçti | 5 | U094 | 14.34 | Sarmal cepler · Kademeli kapılar |
| U096 | 4 | 8 / 9 | Geçti | 5 | U078 | 15.03 | Köprülü odalar · Kademeli kapılar |
| U097 | 4 | 10 / 5 | Geçti | 5 | U098 | 14.44 | Üç pencere · Eğik koridor |
| U098 | 4 | 8 / 9 | Geçti | 5 | U097 | 14.44 | İç dişli odalar · Eğik koridor |
| U099 | 4 | 8 / 10 | Geçti | 5 | U078 | 14.34 | Basamaklı cepler · Kademeli kapılar |
| U100 | 4 | 11 / 7 | Geçti | 5 | U052 | 14.34 | Üç pencere |

Komutlar: `npm run audit:campaign`, `npm run validate:levels -- --report`, `npm test`, `npm run build`. Görsel inceleme: `review-captures/index.html`.
