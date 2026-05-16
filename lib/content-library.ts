import { extendedAyahBank } from "./extended-ayah-bank";
import { dailyStoryBank, getDailyStory } from "./daily-story-bank";

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
  grade?: "Sahih" | "Hasan" | "Reference";
};

const verseThemes = [
  "Patience and Prayer", "Allah Is With the Patient", "You Can Carry This", "With Hardship Comes Ease", "Ease Will Come Again", "Hearts Find Peace", "Allah Will Make a Way", "Provision From Unexpected Places", "Allah Is Enough", "Do Not Despair", "Allah Forgives", "Call Upon Me", "Increase Me in Knowledge", "Mercy Is Near", "Your Reward Is Not Lost", "Change Begins Within", "You Earn What You Strive For", "Remember Me", "Gratitude Brings Increase", "Do Not Weaken", "Rise With Faith", "Allah Loves the Patient", "None Can Overcome Allah's Help", "Allah Is Sufficient", "Remember the Hereafter", "True Success", "Allah Does Not Love Oppression", "Allah Is Never Unjust", "Return Through Forgiveness", "Stand for Justice", "Be Just", "Cooperate in Good", "Do Not Aid Harm", "A Life for Allah", "Mercy Encompasses All", "Beautiful Patience", "Do Not Lose Strength", "Allah Is With Us", "Only What Allah Wrote", "No Fear for Allah's Friends", "Success Is From Allah", "Never Despair of Relief", "Taqwa and Patience", "Allah Is Subtle", "Knowledge Has Levels", "Work and Allah Sees", "Patience Is Better", "Good Returns to You", "Righteousness With Faith", "A Good Life", "Blessings Cannot Be Counted", "Justice and Excellence", "Mercy to Parents", "Human Dignity", "Perhaps Mercy Is Near", "Youth of Faith", "Guidance Increases", "Stay With the Righteous", "Worldly Beauty", "Lasting Deeds", "Never Disappointed in Dua", "Love From the Most Merciful", "Allah Hears and Sees", "Hurry to Please Allah", "Scales of Justice", "So We Answered", "Rush to Good", "Hope and Fear", "Successful Believers", "Humility in Prayer", "The True King", "Allah Is Light", "Walk Humbly", "Repent and Believe", "Bad Deeds Replaced", "He Heals", "Gratitude to Parents", "Establish Prayer", "Command Good", "Forbid Wrong", "Be Patient", "No Arrogance", "Walk Humbly", "Allah Dislikes Arrogance", "Trust Allah", "Allah Is Enough as Guardian", "The Best Example", "Remember Allah Often", "Morning and Evening Dhikr", "Send Salawat", "Excellence Rewards Excellence", "Remember Allah's Name", "Allah Supports You", "Firm Feet", "Believers Are Family", "Make Peace", "Honor Is Taqwa", "He Is With You", "Race to Forgiveness", "Race to Paradise",
];

export const verseBank: LearningItem[] = extendedAyahBank.map((item, index) => ({
  ...item,
  title: verseThemes[index] || item.shortText.replace(/[.!?]$/g, ""),
  reference: "Qur'an",
  themes: item.themes.filter((theme) => theme !== "Qur'an reference — verify before publishing"),
}));

export const hadithBank: LearningItem[] = [
  { id: "hadith-001", type: "hadith", title: "Actions by intentions", arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", shortText: "Actions are judged by intentions, and every person will have what they intended.", reference: "Sahih al-Bukhari and Sahih Muslim — narrated by Umar", themes: ["Niyyah", "Sincerity"], readingTimeSeconds: 40, grade: "Sahih" },
  { id: "hadith-002", type: "hadith", title: "Speak good or remain silent", arabicText: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", shortText: "Whoever believes in Allah and the Last Day should speak good or remain silent.", reference: "Sahih al-Bukhari and Sahih Muslim — narrated by Abu Hurairah", themes: ["Speech", "Character"], readingTimeSeconds: 40, grade: "Sahih" },
  { id: "hadith-003", type: "hadith", title: "Best to family", arabicText: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", shortText: "The best of you are those who are best to their families.", reference: "Jami' al-Tirmidhi — narrated by Aisha", themes: ["Family", "Character"], readingTimeSeconds: 40, grade: "Hasan" },
  { id: "hadith-004", type: "hadith", title: "Smiling is charity", arabicText: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", shortText: "Smiling at your brother is charity.", reference: "Jami' al-Tirmidhi — narrated by Abu Dharr", themes: ["Character", "Charity"], readingTimeSeconds: 30, grade: "Hasan" },
  { id: "hadith-005", type: "hadith", title: "Real strength", arabicText: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", shortText: "The strong person is the one who controls themselves in anger.", reference: "Sahih al-Bukhari — narrated by Abu Hurairah", themes: ["Self-control", "Sabr"], readingTimeSeconds: 40, grade: "Sahih" },
  { id: "hadith-006", type: "hadith", title: "Small consistent deeds", arabicText: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", shortText: "The most beloved deeds to Allah are those done consistently, even if small.", reference: "Sahih al-Bukhari and Sahih Muslim — narrated by Aisha", themes: ["Consistency", "Discipline"], readingTimeSeconds: 40, grade: "Sahih" },
  { id: "hadith-007", type: "hadith", title: "A good word", arabicText: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", shortText: "A good word is charity.", reference: "Sahih al-Bukhari and Sahih Muslim — narrated by Abu Hurairah", themes: ["Speech", "Charity"], readingTimeSeconds: 30, grade: "Sahih" },
  { id: "hadith-008", type: "hadith", title: "The path of knowledge", arabicText: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", shortText: "Whoever travels a path seeking knowledge, Allah makes easy for them a path to Paradise.", reference: "Sahih Muslim — narrated by Abu Hurairah", themes: ["Knowledge"], readingTimeSeconds: 45, grade: "Sahih" },
];

export const sahabaStories: LearningItem[] = dailyStoryBank;

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

export function getDailyStoryItem(date = new Date()) { return getDailyStory(date); }

export function getRecommendedLearningItem(mood?: string) {
  const moodTheme = mood === "sad" ? "Hope" : mood === "tired" ? "Patience" : mood === "grateful" ? "Gratitude" : "Discipline";
  const pool = learningItems.filter((item) => item.themes.includes(moodTheme));
  return pool[0] || hadithBank.find((item) => item.themes.includes("Consistency")) || learningItems[0];
}
