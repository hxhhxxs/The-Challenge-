import type { LearningItem } from "./content-library";

const compactStories = [
  ["Abu Bakr رضي الله عنه Believes Immediately", "Abu Bakr رضي الله عنه knew the Prophet ﷺ as truthful and trustworthy, so when the message came, he accepted Islam without delay and supported the da'wah with his life, wealth, and reputation.", "Truthfulness makes the heart ready to accept guidance.", "سيرة ابن هشام، الطبقات الكبرى، سير أعلام النبلاء، الإصابة"],
  ["Abu Bakr رضي الله عنه Frees Bilal رضي الله عنه", "Abu Bakr رضي الله عنه used his wealth to support Bilal رضي الله عنه and help him gain freedom. Bilal later became the mu'adhdhin of the Prophet ﷺ.", "Use your blessings to support and protect others.", "سيرة ابن هشام، الطبقات الكبرى، أسد الغابة، الإصابة"],
  ["Abu Bakr رضي الله عنه in the Cave", "During the Hijrah, Abu Bakr رضي الله عنه worried when Quraysh came close to the cave. The Prophet ﷺ reminded him that Allah was with them.", "Take the means, then trust Allah completely.", "صحيح البخاري، صحيح مسلم، سيرة ابن هشام"],
  ["Abu Bakr رضي الله عنه Gives All His Wealth", "Before Tabuk, Abu Bakr رضي الله عنه gave everything he had for the sake of Allah. When asked what he left for his family, he replied with the meaning: Allah and His Messenger.", "True generosity appears when the cause of Allah needs you.", "سنن أبي داود، جامع الترمذي، سير أعلام النبلاء"],
  ["Abu Bakr رضي الله عنه After the Prophet ﷺ Passed Away", "When the companions were shaken by the passing of the Prophet ﷺ, Abu Bakr رضي الله عنه reminded them that Allah is Ever-Living and recited Qur'an to steady the ummah.", "Real leadership is firmness during grief.", "صحيح البخاري، البداية والنهاية، سير أعلام النبلاء"],
  ["Abu Bakr رضي الله عنه and Zakah", "After the Prophet ﷺ passed away, Abu Bakr رضي الله عنه stood firm when some people refused zakah. He protected a pillar of Islam at a fragile time.", "Mercy and firmness both have their place.", "صحيح البخاري، البداية والنهاية، تاريخ الطبري"],
  ["Umar رضي الله عنه Accepts Islam", "Umar رضي الله عنه heard verses from Surah Taha and Allah opened his heart. He went from opposition to becoming one of Islam's strongest supporters.", "Never assume someone is beyond Allah's guidance.", "سيرة ابن هشام، الطبقات الكبرى، أسد الغابة"],
  ["Umar رضي الله عنه and Public Courage", "Reports describe Umar رضي الله عنه as courageous in migration, ready to stand openly for faith when many had to leave quietly.", "Courage should serve truth and strengthen others.", "أسد الغابة، سير أعلام النبلاء، الإصابة"],
  ["Umar رضي الله عنه Carries Food at Night", "As khalifah, Umar رضي الله عنه checked on people at night. When he found a family in need, he carried food himself and served them.", "Leadership means carrying people's burdens.", "الطبقات الكبرى، مناقب عمر، البداية والنهاية"],
  ["Umar رضي الله عنه Accepts Correction", "Umar رضي الله عنه was strong but humble. When reminded of Allah or corrected with truth, he returned to what was right.", "The best leaders are strong enough to be corrected.", "سير أعلام النبلاء، مناقب عمر، البداية والنهاية"],
  ["Uthman رضي الله عنه Buys the Well of Rumah", "Uthman رضي الله عنه bought the Well of Rumah and made its water available for the Muslims, turning wealth into ongoing charity.", "The best investment is reward that continues after death.", "جامع الترمذي، سنن النسائي، سير أعلام النبلاء"],
  ["Uthman رضي الله عنه Prepares Tabuk", "During the difficult expedition of Tabuk, Uthman رضي الله عنه gave generously to equip the Muslims and support the mission.", "Wealth is beautiful when it serves Allah.", "جامع الترمذي، مسند أحمد، البداية والنهاية"],
  ["Uthman رضي الله عنه and Modesty", "Uthman رضي الله عنه was known for deep modesty. The Prophet ﷺ praised this noble quality, showing that modesty is strength with dignity.", "Modesty is spiritual nobility, not weakness.", "صحيح مسلم، صحيح البخاري، سير أعلام النبلاء"],
  ["Uthman رضي الله عنه and Preserving the Qur'an", "During his khilafah, Uthman رضي الله عنه helped unite the ummah around preserved copies of the Qur'an to prevent confusion and division.", "Some service benefits generations you will never meet.", "صحيح البخاري، البداية والنهاية، سير أعلام النبلاء"],
  ["Ali رضي الله عنه Sleeps in the Prophet's Bed", "On the night of the Hijrah, Ali رضي الله عنه helped protect the plan and return people's trusts. He showed courage, loyalty, and sincerity while still young.", "Young people can be heroes with courage and sincerity.", "سيرة ابن هشام، الطبقات الكبرى، البداية والنهاية"],
] as const;

export const dailyStoryBank: LearningItem[] = compactStories.map(([title, story, lesson, reference], index) => ({
  id: `daily-story-${String(index + 1).padStart(3, "0")}`,
  type: "sahaba_story",
  title,
  shortText: story,
  fullText: `${story}\n\nLesson: ${lesson}`,
  reference,
  themes: ["Sahaba", "Story", "Daily"],
  readingTimeSeconds: 75,
}));

export function getDailyStory(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyStoryBank[dayOfYear % dailyStoryBank.length];
}
