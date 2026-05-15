export type DuaItem = {
  id: string;
  title: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  reference: string;
  note?: string;
  themes: string[];
};

export const duaBank: DuaItem[] = [
  {
    id: "dua-001",
    title: "Du'a for protection",
    arabicText: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillāhilladhī lā yaḍurru maʿa ismihi shay'un fil-arḍi wa lā fis-samā'i wa huwa as-Samīʿul-ʿAlīm.",
    translation: "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.",
    reference: "Abu Dawud, Tirmidhi",
    note: "Said three times in the morning and evening.",
    themes: ["Protection", "Morning", "Evening"],
  },
  {
    id: "dua-002",
    title: "Du'a for beneficial knowledge",
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    transliteration: "Allāhumma innī as'aluka ʿilman nāfiʿan, wa rizqan ṭayyiban, wa ʿamalan mutaqabbalan.",
    translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
    reference: "Ibn Majah",
    note: "A strong morning du'a for students and people building a better life.",
    themes: ["Knowledge", "Provision", "Action"],
  },
  {
    id: "dua-003",
    title: "Du'a for ease",
    arabicText: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    transliteration: "Allāhumma lā sahla illā mā jaʿaltahu sahlā, wa anta tajʿalul-ḥazna idhā shi'ta sahlā.",
    translation: "O Allah, nothing is easy except what You make easy, and You make difficulty easy if You will.",
    reference: "Ibn Hibban",
    note: "Use when a task feels heavy.",
    themes: ["Ease", "Hardship", "Study"],
  },
  {
    id: "dua-004",
    title: "Du'a for steadfastness",
    arabicText: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    transliteration: "Yā Muqallibal-qulūb, thabbit qalbī ʿalā dīnik.",
    translation: "O Turner of hearts, keep my heart firm upon Your religion.",
    reference: "Tirmidhi",
    note: "A powerful du'a for consistency and faith.",
    themes: ["Steadfastness", "Imaan", "Consistency"],
  },
  {
    id: "dua-005",
    title: "Du'a for good in both worlds",
    arabicText: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār.",
    translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    reference: "Qur'an 2:201",
    note: "A comprehensive du'a for balance.",
    themes: ["Balance", "Akhirah", "Protection"],
  },
  {
    id: "dua-006",
    title: "Du'a against anxiety and sadness",
    arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ",
    transliteration: "Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal.",
    translation: "O Allah, I seek refuge in You from anxiety and sadness, weakness and laziness.",
    reference: "Bukhari",
    note: "A du'a for emotional heaviness and low motivation.",
    themes: ["Anxiety", "Sadness", "Discipline"],
  },
  {
    id: "dua-007",
    title: "Du'a for gratitude and worship",
    arabicText: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik.",
    translation: "O Allah, help me remember You, thank You, and worship You beautifully.",
    reference: "Abu Dawud, Nasa'i",
    note: "The Prophet ﷺ taught Mu'adh this du'a after prayer.",
    themes: ["Dhikr", "Gratitude", "Worship"],
  },
];

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export function getDailyDua(date = new Date()) {
  return duaBank[dayOfYear(date) % duaBank.length];
}
