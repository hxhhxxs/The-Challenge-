import { extendedAyahBank } from "./extended-ayah-bank";

export type LearningItem = {
  id: string;
  type: "verse" | "hadith" | "sahaba_story" | "prophet_story" | "daily_task" | "weekly_task" | "joy_task";
  title: string;
  shortText: string;
  arabicText?: string;
  fullText?: string;
  reference?: string;
  themes: string[];
  readingTimeSeconds: number;
};

export const verseBank: LearningItem[] = extendedAyahBank;

export const hadithBank: LearningItem[] = [
  { id: "hadith-001", type: "hadith", title: "Actions by intentions", arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", shortText: "Actions are judged by intentions, and every person will have what they intended.", reference: "Bukhari and Muslim — Umar", themes: ["Niyyah", "Sincerity"], readingTimeSeconds: 40 },
  { id: "hadith-002", type: "hadith", title: "Speak good or remain silent", arabicText: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", shortText: "Whoever believes in Allah and the Last Day should speak good or remain silent.", reference: "Bukhari and Muslim — Abu Hurairah", themes: ["Speech", "Character"], readingTimeSeconds: 40 },
  { id: "hadith-003", type: "hadith", title: "Best to family", arabicText: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", shortText: "The best of you are those who are best to their families.", reference: "Tirmidhi — Aisha", themes: ["Family", "Character"], readingTimeSeconds: 40 },
  { id: "hadith-004", type: "hadith", title: "Smiling is charity", arabicText: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", shortText: "Smiling at your brother is charity.", reference: "Tirmidhi — Abu Dharr", themes: ["Character", "Charity"], readingTimeSeconds: 30 },
  { id: "hadith-005", type: "hadith", title: "Real strength", arabicText: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", shortText: "The strong person is the one who controls themselves in anger.", reference: "Bukhari — Abu Hurairah", themes: ["Self-control", "Sabr"], readingTimeSeconds: 40 },
  { id: "hadith-006", type: "hadith", title: "Small consistent deeds", arabicText: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", shortText: "The most beloved deeds to Allah are those done consistently, even if small.", reference: "Bukhari and Muslim — Aisha", themes: ["Consistency", "Discipline"], readingTimeSeconds: 40 },
  { id: "hadith-007", type: "hadith", title: "Good word", arabicText: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", shortText: "A good word is charity.", reference: "Bukhari and Muslim — Abu Hurairah", themes: ["Speech", "Charity"], readingTimeSeconds: 30 },
  { id: "hadith-008", type: "hadith", title: "Knowledge path", arabicText: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", shortText: "Whoever travels a path seeking knowledge, Allah makes easy for them a path to Paradise.", reference: "Muslim — Abu Hurairah", themes: ["Knowledge"], readingTimeSeconds: 45 },
];

export const sahabaStories: LearningItem[] = [
  { id: "sahaba-001", type: "sahaba_story", title: "Abu Bakr — The First to Believe", shortText: "Abu Bakr accepted Islam without hesitation and spent his wealth supporting the early Muslims.", fullText: "When the Prophet ﷺ told Abu Bakr of revelation, Abu Bakr accepted without hesitation. He spent his wealth freeing slaves and supporting the early Muslim community. After the Prophet ﷺ passed, he helped hold the ummah together at its most fragile moment. Lesson: True faith means trust when the path is heavy.", reference: "Sahaba story", themes: ["Trust", "Faith"], readingTimeSeconds: 90 },
  { id: "sahaba-002", type: "sahaba_story", title: "Umar — From Enemy to Pillar", shortText: "Umar set out against Islam, heard Qur'an, and returned changed.", fullText: "Umar ibn al-Khattab once set out against the Prophet ﷺ. On the way, he heard his sister reciting Surah Taha. His heart softened, he read, wept, and went to accept Islam. Lesson: One sincere encounter with truth can change a life.", reference: "Sahaba story", themes: ["Change", "Courage"], readingTimeSeconds: 90 },
  { id: "sahaba-003", type: "sahaba_story", title: "Bilal — Ahad, Ahad", shortText: "Bilal endured torture while repeating: One, One.", fullText: "Bilal ibn Rabah was tortured under the desert sun for refusing to renounce Islam. Under pressure, he answered only: Ahad, Ahad — One, One. He later became the first muezzin of Islam. Lesson: They can harm the body, but not a heart anchored in Allah.", reference: "Sahaba story", themes: ["Faith", "Strength"], readingTimeSeconds: 90 },
  { id: "sahaba-004", type: "sahaba_story", title: "Uthman — The Well of Ruma", shortText: "Uthman bought a well and donated it to the Muslims.", fullText: "When water was difficult for the Muslims in Madinah, Uthman ibn Affan bought the Well of Ruma and made it free for the community. Lesson: True wealth is what continues to benefit others.", reference: "Sahaba story", themes: ["Charity", "Service"], readingTimeSeconds: 80 },
];

export const prophetStories: LearningItem[] = [
  { id: "prophet-001", type: "prophet_story", title: "The First Revelation", shortText: "In Hira, the first command came: Iqra — Read.", fullText: "In the cave of Hira, Jibril came to Muhammad ﷺ and said: Iqra. The Prophet ﷺ returned home trembling, and Khadija comforted and believed him. Lesson: The most important moment of your life may begin with fear, then become your purpose.", reference: "Seerah", themes: ["Purpose", "Revelation"], readingTimeSeconds: 90 },
  { id: "prophet-002", type: "prophet_story", title: "Ta'if — Rejected", shortText: "The Prophet ﷺ was rejected and harmed, yet he hoped for their descendants.", fullText: "At Ta'if, the Prophet ﷺ was mocked and stoned until his feet bled. When offered the chance for the city to be destroyed, he refused and hoped their descendants would worship Allah. Lesson: True greatness responds to cruelty with hope.", reference: "Seerah", themes: ["Mercy", "Hope"], readingTimeSeconds: 90 },
  { id: "prophet-003", type: "prophet_story", title: "The Cave of Thawr", shortText: "When danger came close, the Prophet ﷺ reminded Abu Bakr that Allah was with them.", fullText: "During the hijrah, the Prophet ﷺ and Abu Bakr hid in the cave. Their pursuers came so close Abu Bakr could see their feet. The Prophet ﷺ said: What do you think of two when Allah is the third? Lesson: Allah's protection is enough, even when danger is close.", reference: "Seerah", themes: ["Trust", "Tawakkul"], readingTimeSeconds: 90 },
  { id: "prophet-004", type: "prophet_story", title: "The Conquest of Makkah", shortText: "The Prophet ﷺ returned with power and chose forgiveness.", fullText: "The Prophet ﷺ returned to Makkah after years of persecution with 10,000 companions. He entered humbly and forgave those who had harmed him. Lesson: Power is tested by whether you forgive when you no longer have to.", reference: "Seerah", themes: ["Forgiveness", "Humility"], readingTimeSeconds: 90 },
];

export const dailyTaskBank: LearningItem[] = [
  "Drink a glass of water before every meal", "No sugary drinks today", "Walk 10 minutes after each meal", "Stretch for 10 minutes", "Make your bed first thing", "Clean your desk for 10 minutes", "Call your mother or father", "Do one good deed and tell no one", "Read 5 pages", "Track every single expense today", "Give sadaqah, even a small amount", "Make du'a for someone by name", "Say Astaghfirullah 100 times", "Send salawat on the Prophet ﷺ 100 times", "Pray Fajr on time"
].map((task, index) => ({ id: `daily-task-${String(index + 1).padStart(3, "0")}`, type: "daily_task" as const, title: task, shortText: task, themes: ["Daily Task"], readingTimeSeconds: 15 }));

export const weeklyTaskBank: LearningItem[] = [
  "Walk 50,000+ total steps this week", "Memorize one new short surah or one full page", "Pray every fard prayer on time for 7 days", "No restaurant or fast food for 7 days", "Cook 5 meals at home this week", "Save the cost of one meal out", "Read 50 pages of any book", "Visit the masjid at least 3 times this week", "Make du'a daily for 7 different people", "Fast 3 days this week if able"
].map((task, index) => ({ id: `weekly-task-${String(index + 1).padStart(3, "0")}`, type: "weekly_task" as const, title: task, shortText: task, themes: ["Weekly Task"], readingTimeSeconds: 20 }));

export const joyTaskBank: LearningItem[] = [
  "Draw or doodle for 20 minutes", "Take 5 creative photos", "Cook one full meal from scratch", "Watch the sunset without your phone", "Make tea or coffee for someone", "Write a letter to future you", "Practice Arabic calligraphy for 15 minutes", "Visit a park you've never been to", "Make a playlist for a friend", "Spend an evening reading by a single lamp"
].map((task, index) => ({ id: `joy-task-${String(index + 1).padStart(3, "0")}`, type: "joy_task" as const, title: task, shortText: task, themes: ["Joy"], readingTimeSeconds: 20 }));

export const learningItems: LearningItem[] = [
  ...verseBank,
  ...hadithBank,
  ...sahabaStories,
  ...prophetStories,
  ...dailyTaskBank,
  ...weeklyTaskBank,
  ...joyTaskBank,
];

export function getDailyLearningItem(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return verseBank[dayOfYear % verseBank.length];
}

export function getRecommendedLearningItem(mood?: string) {
  const moodTheme = mood === "sad" ? "Hope" : mood === "tired" ? "Patience" : mood === "grateful" ? "Gratitude" : "Discipline";
  return learningItems.find((item) => item.themes.includes(moodTheme)) || learningItems[0];
}
