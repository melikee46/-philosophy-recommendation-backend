import { PrismaClient, Role, ItemType, DifficultyLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.userInteraction.deleteMany();
  await prisma.philosophyQuizOptionScore.deleteMany();
  await prisma.philosophyQuizOption.deleteMany();
  await prisma.philosophyQuizQuestion.deleteMany();
  await prisma.recommendationItem.deleteMany();
  await prisma.philosophy.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin123!@#', salt);
  const userPasswordHash = await bcrypt.hash('User123!@#', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@philosophy.local',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@philosophy.local',
      username: 'demouser',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  console.log(`👤 Users seeded: ${admin.username} (ADMIN), ${demoUser.username} (USER)`);

  // 3. Seed Philosophies
  const stoicism = await prisma.philosophy.create({
    data: {
      slug: 'stoicism',
      name: 'Stoacılık (Stoicism)',
      era: 'Antik Çağ (MÖ 3. Yüzyıl - MS 2. Yüzyıl)',
      description:
        'Stoacılık, insanın kontrol edebileceği ve edemeyeceği şeyleri ayırt etmesini öğütleyen, erdemi en yüksek iyi kabul eden ve rasyonel dinginliği (ataraxia) hedefleyen pratik bir yaşam felsefesidir.',
      coreTenets: [
        'Kontrol İkilemi (Dichotomy of Control): Yalnızca kendi düşünce ve tepkilerini kontrol edebilirsin.',
        'Amor Fati: Başına gelen her şeyi kabullen ve sev.',
        'Memento Mori: Ölümlü olduğunu hatırla ve anı erdemle yaşa.',
        'Dört Erdem: Bilgelik, Cesaret, Adalet ve Ölçülülük.',
      ],
    },
  });

  const existentialism = await prisma.philosophy.create({
    data: {
      slug: 'existentialism',
      name: 'Varoluşçuluk (Existentialism)',
      era: 'Modern Çağ (19. ve 20. Yüzyıl)',
      description:
        'Varoluşçuluk, insanın önce var olduğunu, ardından kendi seçimleri, eylemleri ve özgür iradesiyle kendi özünü yarattığını savunan felsefi akımdır. Özgürlük ile birlikte gelen radikal sorumluluk ve kaygı (angst) merkezdedir.',
      coreTenets: [
        'Varoluş Özden Önce Gelir: İnsan önceden tanımlanmış bir amaç olmaksızın dünyaya gelir ve kendi anlamını kendi kurar.',
        'Radikal Özgürlük ve Sorumluluk: Eylemlerimizin tüm sorumluluğu bize aittir.',
        'Kötü Niyet (Mauvaise Foi): Sorumluluktan kaçmak için toplumsal rollere sığınmayı reddetmek.',
        'Varoluşsal Kaygı (Angst): Sonsuz seçim imkanı ve kesinlik yokluğunun getirdiği kaçınılmaz farkındalık.',
      ],
    },
  });

  const absurdism = await prisma.philosophy.create({
    data: {
      slug: 'absurdism',
      name: 'Absürdizm (Absurdism)',
      era: '20. Yüzyıl',
      description:
        'Absürdizm, insanın doğuştan gelen evrende nesnel bir anlam bulma arzusu ile evrenin bu arzuya karşı gösterdiği soğuk, kayıtsız sessizlik arasındaki çatışmayı (Uyumsuzluk/Absürt) inceler. Camus’ye göre intihar veya yanılsamalara sığınmak yerine uyumsuzluğu bilinçle kucaklamak gerekir.',
      coreTenets: [
        'Absürt Çatışması: Anlam arayan insan bilinci ile anlamsız evrenin karşılaşması.',
        'Felsefi İntihar Reddi: Dini ya da dogmatik inançlara körü körüne sığınmayı reddetmek.',
        'Başkaldırı (Revolt): Anlamsızlığa rağmen yaşamı tüm coşkusuyla ve bilinçle sürdürmek.',
        'Sisifos’un Tebessümü: Kayayı tepeye sonsuza dek yuvarlarken bile mutlu olduğunu hayal etmek.',
      ],
    },
  });

  const nihilism = await prisma.philosophy.create({
    data: {
      slug: 'nihilism',
      name: 'Nihilizm (Nihilism)',
      era: '19. ve 20. Yüzyıl',
      description:
        'Nihilizm, evrende nesnel ve nihai hiçbir ahlaki kuralın, hakikatin, amacın veya değerin bulunmadığını öne süren radikal şüphecilik ve reddediş felsefesidir. Aktif nihilizm, bu boşluğu yeni değerlerin inşası için bir zemin olarak görür.',
      coreTenets: [
        'Nesnel Anlamın Yokluğu: Evrenin ne insan ne de başka bir varlık için önceden tasarlanmış bir gayesi yoktur.',
        'Ahlaki Görelilik/Boşluk: Evrensel bir iyi ve kötü skalası bulunmaz.',
        'Değerlerin Yeniden Değerlendirilmesi: Yerleşik dogmaların yıkılması.',
        'Aktif vs Pasif Nihilizm: Çöküş karşısında pes etmek yerine anlamsızlığı özgürleştirici bir güç olarak benimsemek.',
      ],
    },
  });

  console.log('🏛️ Philosophies seeded: Stoicism, Existentialism, Absurdism, Nihilism');

  // 4. Seed Recommendation Items (Books, Movies, Series across difficulty levels)
  const items = [
    // --- STOICISM ---
    {
      philosophyId: stoicism.id,
      title: 'Kendime Düşünceler (Meditations)',
      type: ItemType.BOOK,
      creator: 'Marcus Aurelius',
      releaseYear: 180,
      summary:
        'Roma İmparatoru Marcus Aurelius’un seferler sırasında kendi kendine yazdığı, içsel huzur, metanet ve kontrol ikilemini işleyen antik bilgelik günlüğü.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: stoicism.id,
      title: 'Ahlak Mektupları (Epistulae Morales)',
      type: ItemType.BOOK,
      creator: 'Seneca',
      releaseYear: 65,
      summary:
        'Seneca’nın dostu Lucilius’a yazdığı; zaman yönetimi, ölüm korkusu, dostluk ve zihinsel direnç üzerine pratik hayat rehberi.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: stoicism.id,
      title: 'Söylevler ve Kılavuz Kitapçık (Enchiridion)',
      type: ItemType.BOOK,
      creator: 'Epiktetos',
      releaseYear: 108,
      summary:
        'Eski bir köle olan Epiktetos’un, zihinsel bağımsızlığın ve kontrol edilemeyen dış koşullara teslim olmamanın felsefi temellerini anlattığı başyapıt.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: stoicism.id,
      title: 'The Martian',
      type: ItemType.MOVIE,
      creator: 'Ridley Scott',
      releaseYear: 2015,
      summary:
        'Mars’ta tek başına kalan bir astronotun paniklemek yerine sadece çözebileceği fiziksel ve zihinsel adımlara odaklanmasını konu alan modern bir Stoacı hayatta kalma anlatısı.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: stoicism.id,
      title: 'Gladiator',
      type: ItemType.MOVIE,
      creator: 'Ridley Scott',
      releaseYear: 2000,
      summary:
        'Marcus Aurelius’un öğrencisi olan General Maximus’un onurunu, metanetini ve kadere boyun eğmeyen erdemini Marcus Aurelius öğretileri eşliğinde yansıtan epik film.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: stoicism.id,
      title: 'A Hidden Life',
      type: ItemType.MOVIE,
      creator: 'Terrence Malick',
      releaseYear: 2019,
      summary:
        'Nazi ordusuna sadakat yemini etmeyi reddeden Avusturyalı Franz Jägerstätter’in, tüm dünyevi baskılara karşı içsel erdemini ve vicdanını koruma mücadelesi.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: stoicism.id,
      title: 'Star Trek: The Next Generation (Captain Picard Arcs)',
      type: ItemType.SERIES,
      creator: 'Gene Roddenberry',
      releaseYear: 1987,
      summary:
        'Kaptan Jean-Luc Picard’ın kriz anlarındaki soğukkanlılığı, adalet anlayışı, ahlaki pusulası ve akılcı liderliği ile Stoacı bir figürün ideal portresi.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: stoicism.id,
      title: 'Chernobyl',
      type: ItemType.SERIES,
      creator: 'Craig Mazin',
      releaseYear: 2019,
      summary:
        'Felaketin ortasında yalanlar ve politik baskılara rağmen gerçeğin ve sorumluluğun peşinden giden Valery Legasov’un göreve adanmışlığı.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: stoicism.id,
      title: 'Rome',
      type: ItemType.SERIES,
      creator: 'John Milius & Bruno Heller',
      releaseYear: 2005,
      summary:
        'Antik Roma Cumhuriyeti’nin çöküşünde kader, iktidar ve Stoacı Roma erdemlerinin tarihsel çarpışması.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },

    // --- EXISTENTIALISM ---
    {
      philosophyId: existentialism.id,
      title: 'Varoluşçuluk Bir İnsancıllıktır',
      type: ItemType.BOOK,
      creator: 'Jean-Paul Sartre',
      releaseYear: 1946,
      summary:
        'Sartre’ın varoluşçuluğu anlaşılır bir dille savunduğu, varoluşun özden önce geldiğini ve insanın kendi kaderinin tek mimarı olduğunu özetlediği temel metin.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: existentialism.id,
      title: 'Yabancı (L’Étranger)',
      type: ItemType.BOOK,
      creator: 'Albert Camus',
      releaseYear: 1942,
      summary:
        'Meursault karakteri üzerinden toplumun sahte ahlak kurallarına uyum sağlamayı reddeden bir bireyin yabancılaşmasını ve varoluşsal dürüstlüğünü anlatan roman.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: existentialism.id,
      title: 'Varlık ve Hiçlik (L’Être et le Néant)',
      type: ItemType.BOOK,
      creator: 'Jean-Paul Sartre',
      releaseYear: 1943,
      summary:
        'Bilinç, hiçleme, başkalarının bakışı ve kaçınılmaz radikal özgürlüğün ontolojik temellerini kuran varoluşçu felsefenin anıtsal eseri.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: existentialism.id,
      title: 'The Truman Show',
      type: ItemType.MOVIE,
      creator: 'Peter Weir',
      releaseYear: 1998,
      summary:
        'Kurgulanmış bir sahte dünyada yaşayan Truman’ın, konforlu yanılsamayı terk edip bilinmez ama otantik olan gerçek varoluşu seçiş hikayesi.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: existentialism.id,
      title: 'Blade Runner 2049',
      type: ItemType.MOVIE,
      creator: 'Denis Villeneuve',
      releaseYear: 2017,
      summary:
        'Yapay bir replikant olan Memur K’nın, ruhu veya geçmişi olup olmadığını sorgulayarak kendi seçimleriyle insani bir anlam yaratma arayışı.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: existentialism.id,
      title: 'The Seventh Seal (Yedinci Mühür)',
      type: ItemType.MOVIE,
      creator: 'Ingmar Bergman',
      releaseYear: 1957,
      summary:
        'Ölümle satranç oynayan bir şövalyenin Tanrı’nın sessizliği, inanç şüphesi ve yaşamın anlamı üzerine girdiği varoluşsal hesaplaşma.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: existentialism.id,
      title: 'BoJack Horseman',
      type: ItemType.SERIES,
      creator: 'Raphael Bob-Waksberg',
      releaseYear: 2014,
      summary:
        'Şöhret, bağımlılık, boşluk ve kötü niyet (mauvaise foi) labirentinde debelenen bir karakter üzerinden modern varoluşsal krizlerin en keskin hicvi.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: existentialism.id,
      title: 'Severance',
      type: ItemType.SERIES,
      creator: 'Dan Erickson',
      releaseYear: 2022,
      summary:
        'İş ve özel hayat benliklerinin cerrahi olarak ayrıldığı bir dünyada, bilincin bölünmesi, özgür irade ve kurumsal kölelik üzerine varoluşsal distopya.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: existentialism.id,
      title: 'Dark',
      type: ItemType.SERIES,
      creator: 'Baran bo Odar & Jantje Friese',
      releaseYear: 2017,
      summary:
        'Determinizm, zaman döngüleri ve kader karşısında insanın kendi iradesiyle düğümleri çözme çabasının metafizik dramı.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },

    // --- ABSURDISM ---
    {
      philosophyId: absurdism.id,
      title: 'Sisifos Söyleni (Le Mythe de Sisyphe)',
      type: ItemType.BOOK,
      creator: 'Albert Camus',
      releaseYear: 1942,
      summary:
        'Gerçekten önemli tek bir felsefi sorun vardır: İntihar. Camus, evrenin kayıtsızlığına karşı pes etmek yerine bilinçli başkaldırıyı savunur.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: absurdism.id,
      title: 'Dönüşüm (Die Verwandlung)',
      type: ItemType.BOOK,
      creator: 'Franz Kafka',
      releaseYear: 1915,
      summary:
        'Bir sabah dev bir böceğe uyanan Gregor Samsa üzerinden bürokrasinin, yabancılaşmanın ve modern hayatın absürt mekanizmalarının çıplak anlatımı.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: absurdism.id,
      title: 'Absürd (The Absurd)',
      type: ItemType.BOOK,
      creator: 'Thomas Nagel',
      releaseYear: 1971,
      summary:
        'İnsanın ciddiyeti ile evrenin perspektifinden hayatımızın önemsizliği arasındaki ironik mesafeyi analitik felsefe ışığında inceleyen makale.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: absurdism.id,
      title: 'Everything Everywhere All at Once',
      type: ItemType.MOVIE,
      creator: 'Daniel Kwan & Daniel Scheinert',
      releaseYear: 2022,
      summary:
        'Sonsuz çoklu evrenlerde hiçbir şeyin önemi olmadığı gerçeğiyle yüzleşen kahramanın, nihilizmi sevgi ve absürt neşeyle yenme yolculuğu.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: absurdism.id,
      title: 'Birdman (or The Unexpected Virtue of Ignorance)',
      type: ItemType.MOVIE,
      creator: 'Alejandro G. Iñárritu',
      releaseYear: 2014,
      summary:
        'Sanatçının egosu, anlam arayışı ve New York Broadway sahnesinde absürt kaosun ortasında gerçeklikle bağını koparması.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: absurdism.id,
      title: 'Synecdoche, New York',
      type: ItemType.MOVIE,
      creator: 'Charlie Kaufman',
      releaseYear: 2008,
      summary:
        'Tiyatro yönetmeni Caden Cotard’ın hayatının provasını devasa bir depoda canlandırırken sanat ile hayat arasındaki sınırların bütünüyle silindiği absürt meditasyon.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: absurdism.id,
      title: 'The Good Place',
      type: ItemType.SERIES,
      creator: 'Michael Schur',
      releaseYear: 2016,
      summary:
        'Ölümden sonraki hayatın saçma bürokrasisinde ahlak felsefesini eğlenceli ve derin bir absürt komediyle sorgulayan benzersiz dizi.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: absurdism.id,
      title: 'Rick and Morty',
      type: ItemType.SERIES,
      creator: 'Dan Harmon & Justin Roiland',
      releaseYear: 2013,
      summary:
        'Kozmik anlamsızlığın farkında olan dahi bilim insanı Rick’in, evrenin saçmalığını ve absürtlüğünü nihilist bir alayla maceralara dönüştürmesi.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: absurdism.id,
      title: 'Fargo',
      type: ItemType.SERIES,
      creator: 'Noah Hawley',
      releaseYear: 2014,
      summary:
        'Küçük rastlantıların, absürt yanlış anlamaların ve hayatın saçma sürprizlerinin kanlı suç zincirlerine dönüştüğü kara mizah antolojisi.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },

    // --- NIHILISM ---
    {
      philosophyId: nihilism.id,
      title: 'Babalar ve Oğullar',
      type: ItemType.BOOK,
      creator: 'Ivan Turgenev',
      releaseYear: 1862,
      summary:
        'Edebiyat tarihinin ilk büyük nihilist karakteri Bazarov üzerinden geleneksel otoriteye, aşka ve kurumlara karşı radikal inkarın romanı.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: nihilism.id,
      title: 'Putların Alacakaranlığı (Götzen-Dämmerung)',
      type: ItemType.BOOK,
      creator: 'Friedrich Nietzsche',
      releaseYear: 1889,
      summary:
        'Nietzsche’nin yerleşik Hristiyan ve Platoncu ahlak putlarını çekiçle kırdığı, nihilizmin aşılması için değerlerin yıkımını anlatan vurucu eser.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: nihilism.id,
      title: 'Nihil Unbound: Enlightenment and Extinction',
      type: ItemType.BOOK,
      creator: 'Ray Brassier',
      releaseYear: 2007,
      summary:
        'Kozmolojik yok oluş, bilimin insan merkezli yanılsamaları parçalayışı ve çağdaş spekülatif nihilizmin en zorlu felsefi metinlerinden biri.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: nihilism.id,
      title: 'Fight Club',
      type: ItemType.MOVIE,
      creator: 'David Fincher',
      releaseYear: 1999,
      summary:
        'Modern tüketim toplumunun anlamsızlığına karşı her şeyi yakıp sıfırdan başlama arzusunu taşıyan anarşik ve nihilist uyanış.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: nihilism.id,
      title: 'No Country for Old Men',
      type: ItemType.MOVIE,
      creator: 'Joel & Ethan Coen',
      releaseYear: 2007,
      summary:
        'Anton Chigurh figürüyle cisimleşen acımasız ve tesadüfi kader karşısında ahlakın veya adaletin evrende hiçbir karşılığı olmadığını gösteren neo-western.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: nihilism.id,
      title: 'The Turin Horse (A Torinói Ló)',
      type: ItemType.MOVIE,
      creator: 'Béla Tarr',
      releaseYear: 2011,
      summary:
        'Nietzsche’nin zihinsel çöküşüne ilham olan at üzerinden evrenin yavaş yavaş kararmasını ve varoluşun entropik yok oluşunu anlatan karanlık sinema şiiri.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
    {
      philosophyId: nihilism.id,
      title: 'True Detective (Season 1)',
      type: ItemType.SERIES,
      creator: 'Nic Pizzolatto',
      releaseYear: 2014,
      summary:
        'Dedektif Rust Cohle’un antinatalist, pesimist ve nihilist monologlarıyla modern televizyon tarihinin en derin felsefi polisiye başyapıtı.',
      difficultyLevel: DifficultyLevel.BEGINNER,
    },
    {
      philosophyId: nihilism.id,
      title: 'Mr. Robot',
      type: ItemType.SERIES,
      creator: 'Sam Esmail',
      releaseYear: 2015,
      summary:
        'Toplumsal sistemlerin, borçların ve kurumların sahteliğini yok etmek isteyen sosyal anksiyeteli bir hackerın radikal başkaldırısı.',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
    },
    {
      philosophyId: nihilism.id,
      title: 'Mindhunter',
      type: ItemType.SERIES,
      creator: 'Joe Penhall & David Fincher',
      releaseYear: 2017,
      summary:
        'İnsan ruhunun karanlık, rasyonellikten uzak ve hiçbir ahlaki kural tanımayan dehşet verici boşluğuyla yüzleşen FBI ajanlarının hikayesi.',
      difficultyLevel: DifficultyLevel.ADVANCED,
    },
  ];

  for (const item of items) {
    await prisma.recommendationItem.create({ data: item });
  }

  console.log(`📚 Recommendations seeded: ${items.length} items across all philosophies and levels.`);

  // 5. Seed Philosophy Quiz (5 Multi-faceted Questions)
  const q1 = await prisma.philosophyQuizQuestion.create({
    data: {
      orderNumber: 1,
      question: 'Hayatta başınıza gelen ani ve beklenmedik bir kriz karşısında ilk içsel tepkiniz genellikle hangisi olur?',
      description: 'Zorluklar karşısındaki zihinsel refleksi ölçer.',
    },
  });

  const q1Opt1 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q1.id,
      orderNumber: 1,
      optionText: 'Durumu sakince analiz eder, kontrolümde olan ve olmayan şeyleri ayırıp sadece kontrol edebildiklerime odaklanırım.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q1Opt1.id, philosophyId: stoicism.id, weight: 5 },
      { optionId: q1Opt1.id, philosophyId: existentialism.id, weight: 1 },
    ],
  });

  const q1Opt2 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q1.id,
      orderNumber: 2,
      optionText: 'Bu krizin bana yüklediği sorumluluğun farkına varır, eylemlerimin sonucunu bütünüyle üstlenerek yolumu çizerim.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q1Opt2.id, philosophyId: existentialism.id, weight: 5 },
      { optionId: q1Opt2.id, philosophyId: stoicism.id, weight: 2 },
    ],
  });

  const q1Opt3 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q1.id,
      orderNumber: 3,
      optionText: 'Olayın saçmalığına ve hayatın trajikomik ironisine hafifçe gülümser, anlamsızlığa rağmen yaşamaya inatla devam ederim.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q1Opt3.id, philosophyId: absurdism.id, weight: 5 },
      { optionId: q1Opt3.id, philosophyId: nihilism.id, weight: 2 },
    ],
  });

  const q1Opt4 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q1.id,
      orderNumber: 4,
      optionText: 'Evrenin kayıtsız ve kaotik olduğunu, zaten hiçbir şeyin nihai bir adaleti veya amacı olmadığını hatırlarım.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q1Opt4.id, philosophyId: nihilism.id, weight: 5 },
      { optionId: q1Opt4.id, philosophyId: absurdism.id, weight: 2 },
    ],
  });

  // Question 2
  const q2 = await prisma.philosophyQuizQuestion.create({
    data: {
      orderNumber: 2,
      question: 'Sizce hayatın anlamı nedir veya nereden kaynaklanır?',
      description: 'Varoluşsal gaye ve kozmik düzen inancını sorgular.',
    },
  });

  const q2Opt1 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q2.id,
      orderNumber: 1,
      optionText: 'Evrenin doğasına uygun, erdemli, adil ve ölçülü yaşamakta yatar. Anlam içsel karakterimizdir.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q2Opt1.id, philosophyId: stoicism.id, weight: 5 },
    ],
  });

  const q2Opt2 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q2.id,
      orderNumber: 2,
      optionText: 'Doğuştan gelen hazır bir anlam yoktur; insan kendi eylemleri ve cesur tercihleriyle kendi özünü sıfırdan kurar.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q2Opt2.id, philosophyId: existentialism.id, weight: 5 },
      { optionId: q2Opt2.id, philosophyId: absurdism.id, weight: 2 },
    ],
  });

  const q2Opt3 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q2.id,
      orderNumber: 3,
      optionText: 'Evren anlamsızdır ama insan anlam arar. Bu absürt çatışmayı kabul edip tutkuyla başkaldırarak anı kucaklamak gerekir.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q2Opt3.id, philosophyId: absurdism.id, weight: 5 },
      { optionId: q2Opt3.id, philosophyId: existentialism.id, weight: 2 },
    ],
  });

  const q2Opt4 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q2.id,
      orderNumber: 4,
      optionText: 'Hiçbir nesnel anlam, ilahi gaye veya mutlak değer yoktur. Anlam aramaya çalışmak bile bir illüzyondur.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q2Opt4.id, philosophyId: nihilism.id, weight: 5 },
    ],
  });

  // Question 3
  const q3 = await prisma.philosophyQuizQuestion.create({
    data: {
      orderNumber: 3,
      question: 'Ölüm düşüncesi zihninizde nasıl bir duygu uyandırır?',
      description: 'Sonluluk ve Memento Mori algısını belirler.',
    },
  });

  const q3Opt1 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q3.id,
      orderNumber: 1,
      optionText: 'Ölüm doğanın kaçınılmaz bir parçasıdır (Memento Mori). Bugünü erdemli ve kıymetli kılmak için en büyük hatırlatıcıdır.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q3Opt1.id, philosophyId: stoicism.id, weight: 5 },
    ],
  });

  const q3Opt2 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q3.id,
      orderNumber: 2,
      optionText: 'Zamanımızın kısıtlı olduğunu ve hayatımızın projesini ertelemeden, sahici (otantik) bir şekilde tamamlamamız gerektiğini fısıldar.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q3Opt2.id, philosophyId: existentialism.id, weight: 5 },
      { optionId: q3Opt2.id, philosophyId: stoicism.id, weight: 2 },
    ],
  });

  const q3Opt3 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q3.id,
      orderNumber: 3,
      optionText: 'Yaşamın absürtlüğünün nihai mührüdür. Madem sonumuz kaçınılmaz, o halde kalan sürede oyunu tüm tutkumuzla oynamalıyız.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q3Opt3.id, philosophyId: absurdism.id, weight: 5 },
    ],
  });

  const q3Opt4 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q3.id,
      orderNumber: 4,
      optionText: 'Kaçınılmaz bir yok oluş ve mutlak hiçliktir; evrenin bizi hiç umursamadığının en somut kanıtıdır.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q3Opt4.id, philosophyId: nihilism.id, weight: 5 },
      { optionId: q3Opt4.id, philosophyId: absurdism.id, weight: 1 },
    ],
  });

  // Question 4
  const q4 = await prisma.philosophyQuizQuestion.create({
    data: {
      orderNumber: 4,
      question: 'Toplumun yerleşik kuralları, gelenekleri ve ahlaki yargıları hakkında ne düşünüyorsunuz?',
      description: 'Otorite, ahlak ve normlara yaklaşımı ölçer.',
    },
  });

  const q4Opt1 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q4.id,
      orderNumber: 1,
      optionText: 'Toplumla uyum önemlidir ancak birey kendi ahlaki ilkelerini korumalı ve kozmopolit bir dünya vatandaşı gibi davranmalıdır.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q4Opt1.id, philosophyId: stoicism.id, weight: 5 },
    ],
  });

  const q4Opt2 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q4.id,
      orderNumber: 2,
      optionText: 'Toplumsal roller çoğu zaman insanın kendi özgürlüğünden kaçtığı bir maskedir. Birey kendi otantik ahlakını kendisi yaratmalıdır.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q4Opt2.id, philosophyId: existentialism.id, weight: 5 },
    ],
  });

  const q4Opt3 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q4.id,
      orderNumber: 3,
      optionText: 'Tüm bu kurallar insanoğlunun saçma bir kaosa düzen giydirme çabasından ibaret tuhaf bir tiyatrodur.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q4Opt3.id, philosophyId: absurdism.id, weight: 5 },
    ],
  });

  const q4Opt4 = await prisma.philosophyQuizOption.create({
    data: {
      questionId: q4.id,
      orderNumber: 4,
      optionText: 'Ahlaki kurallar kurgusaldır ve güç dengeleri tarafından üretilmiştir; hiçbirinin mutlak bir geçerliliği yoktur.',
    },
  });
  await prisma.philosophyQuizOptionScore.createMany({
    data: [
      { optionId: q4Opt4.id, philosophyId: nihilism.id, weight: 5 },
    ],
  });

  // 6. Seed an interaction for demo user
  const firstItem = await prisma.recommendationItem.findFirst({
    where: { philosophyId: stoicism.id, difficultyLevel: DifficultyLevel.BEGINNER, type: ItemType.BOOK },
  });

  if (firstItem) {
    await prisma.userInteraction.create({
      data: {
        userId: demoUser.id,
        recommendationItemId: firstItem.id,
        status: 'COMPLETED',
        rating: 10,
        notes: 'Marcus Aurelius’un kontrol ikilemi üzerine notları zihnimi tamamen berraklaştırdı.',
      },
    });
  }

  console.log('🎯 Philosophy Quiz questions & weights seeded.');
  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
