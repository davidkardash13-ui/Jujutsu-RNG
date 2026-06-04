/** Редкости по системе рангов JJK */
const RARITIES = {
  below4: {
    id: 'below4',
    name: 'Ниже 4-го ранга',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.5)',
    weight: 48,
    order: 0,
  },
  grade4: {
    id: 'grade4',
    name: '4-й ранг',
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.55)',
    weight: 28,
    order: 1,
  },
  grade3: {
    id: 'grade3',
    name: '3-й ранг',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.55)',
    weight: 14,
    order: 2,
  },
  grade2: {
    id: 'grade2',
    name: '2-й ранг',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.6)',
    weight: 7,
    order: 3,
  },
  grade1: {
    id: 'grade1',
    name: '1-й ранг',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.65)',
    weight: 2.4,
    order: 4,
  },
  special: {
    id: 'special',
    name: 'Особый ранг',
    color: '#f87171',
    glow: 'rgba(248, 113, 113, 0.75)',
    weight: 0.6,
    order: 5,
  },
  secret: {
    id: 'secret',
    name: 'Секретный',
    color: '#e879f9',
    glow: 'rgba(232, 121, 249, 0.85)',
    weight: 0.08,
    order: 6,
  },
  event: {
    id: 'event',
    name: 'Эвентовый',
    color: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.75)',
    weight: 0,
    order: 7,
  },
};

const CHARACTERS = [
  // ——— Эвентовый (только в эвент-кейсе) ———
  {
    id: 'toji',
    name: 'Тодзи Фушигуро',
    desc: 'Убийца · Нулевая проклятая энергия',
    rarity: 'event',
    emoji: '🔪',
    technique: 'Небесное ограничение',
    event: 'toji_hunt',
  },

  // ——— Секретный ———
  { id: 'tsukuna', name: 'Тукуна', desc: '??? · За завесой', rarity: 'secret', emoji: '🌀', technique: 'Неизвестно' },
  { id: 'gege', name: 'Гэгэ Акутами', desc: 'Создатель · За кадром', rarity: 'secret', emoji: '✍️', technique: 'Сюжетный поворот' },

  { id: 'gojo', name: 'Сатору Годжо', desc: 'Шесть глаз · Безграничный', rarity: 'special', emoji: '👁️', technique: 'Безграничный' },
  { id: 'sukuna', name: 'Рёмен Сукуна', desc: 'Король проклятий', rarity: 'special', emoji: '👹', technique: 'Распад' },
  { id: 'yuta', name: 'Юта Оккоцу', desc: 'Особый класс · Рика', rarity: 'special', emoji: '💍', technique: 'Копирование' },
  { id: 'kenjaku', name: 'Кэндзяку', desc: 'Древний проклятый мозг', rarity: 'special', emoji: '🧠', technique: 'Переселение' },
  { id: 'mahito', name: 'Махито', desc: 'Особый · Идентичность', rarity: 'special', emoji: '🫀', technique: 'Праздная трансформация' },
  { id: 'jogo', name: 'Дзёго', desc: 'Особый · Вулкан', rarity: 'special', emoji: '🌋', technique: 'Максимум: Метеор' },
  { id: 'hanami', name: 'Ханами', desc: 'Особый · Природа', rarity: 'special', emoji: '🌸', technique: 'Цветение' },
  { id: 'dagon', name: 'Дагон', desc: 'Особый · Океан', rarity: 'special', emoji: '🐙', technique: 'Горизонт' },

  { id: 'nanami', name: 'Кэнто Нанами', desc: '1-й ранг · Соотношение 7:3', rarity: 'grade1', emoji: '👔', technique: 'Соотношение' },
  { id: 'todo', name: 'Аои Тодо', desc: '1-й ранг · Братство', rarity: 'grade1', emoji: '✊', technique: 'Буги-Вуги' },
  { id: 'naoya', name: 'Наоя Дзэнин', desc: '1-й ранг · Проекция', rarity: 'grade1', emoji: '🐍', technique: 'Проекция души' },
  { id: 'mei', name: 'Мэй Мэй', desc: '1-й ранг · Птицы', rarity: 'grade1', emoji: '🦅', technique: 'Чёрный ворон' },
  { id: 'geto_past', name: 'Сугуру Гэто', desc: '1-й ранг · Манипуляция', rarity: 'grade1', emoji: '☯️', technique: 'Манипуляция проклятиями' },
  { id: 'utahime', name: 'Утахимэ Иори', desc: '1-й ранг · Певица', rarity: 'grade1', emoji: '🎵', technique: 'Барьер пения' },
  { id: 'yuki', name: 'Юки Цукумо', desc: '1-й ранг · Звезда', rarity: 'grade1', emoji: '⭐', technique: 'Гарара' },
  { id: 'choso', name: 'Тёсо', desc: 'Полукровка · Кровь', rarity: 'grade1', emoji: '🩸', technique: 'Сверхновая' },

  { id: 'yuji', name: 'Юдзи Итадори', desc: 'Сосуд Сукуны · 2-й ранг', rarity: 'grade2', emoji: '⚡', technique: 'Чёрная вспышка' },
  { id: 'megumi', name: 'Мэгуми Фусигуро', desc: 'Десять теневых · 2-й ранг', rarity: 'grade2', emoji: '🐺', technique: 'Син Сэнгэн Мэйдзи Тэнсё' },
  { id: 'nobara', name: 'Нобара Кугисаки', desc: 'Столб · 2-й ранг', rarity: 'grade2', emoji: '🔨', technique: 'Столб' },
  { id: 'panda', name: 'Панда', desc: 'Цукумо · 2-й ранг', rarity: 'grade2', emoji: '🐼', technique: 'Полная сила' },
  { id: 'maki', name: 'Маки Дзэнин', desc: 'Оружие · 2-й ранг', rarity: 'grade2', emoji: '⚔️', technique: 'Полная сила' },
  { id: 'inumaki', name: 'Тогэ Инумаки', desc: 'Проклятая речь · 2-й', rarity: 'grade2', emoji: '🍙', technique: 'Рецепты' },
  { id: 'kamijo', name: 'Кадзуки Камидзё', desc: '2-й ранг · Молния', rarity: 'grade2', emoji: '⚡', technique: 'Молния' },
  { id: 'hakari', name: 'Киндзи Хакари', desc: '2-й ранг · Джекпот', rarity: 'grade2', emoji: '🎰', technique: 'Частная чистая земля' },
  { id: 'kirara', name: 'Кирара Хоси', desc: '2-й ранг · Южный крест', rarity: 'grade2', emoji: '✨', technique: 'Южный крест' },
  { id: 'kashimo', name: 'Хадзимэ Касимо', desc: '2-й ранг · Молния Бога', rarity: 'grade2', emoji: '⛈️', technique: 'Мифический зверь Амброзия' },

  { id: 'miwa', name: 'Касуми Мива', desc: '3-й ранг · Меч', rarity: 'grade3', emoji: '🗡️', technique: 'Новый Токийский метрополитен' },
  { id: 'nitta', name: 'Акари Нитта', desc: '3-й ранг · Запись', rarity: 'grade3', emoji: '📋', technique: 'Запись' },
  { id: 'mai', name: 'Май Дзэнин', desc: '3-й ранг · Конструкция', rarity: 'grade3', emoji: '🔫', technique: 'Конструкция' },
  { id: 'momoi', name: 'Момо Нисимия', desc: '3-й ранг · Метла', rarity: 'grade3', emoji: '🧹', technique: 'Полёт' },
  { id: 'reggie', name: 'Рэджи Стар', desc: '3-й ранг · Контракт', rarity: 'grade3', emoji: '📜', technique: 'Контракт' },
  { id: 'higuruma', name: 'Хироси Хигурума', desc: '3-й ранг · Суд', rarity: 'grade3', emoji: '⚖️', technique: 'Суд' },
  { id: 'uro', name: 'Такако Уро', desc: '3-й ранг · Небо', rarity: 'grade3', emoji: '☁️', technique: 'Небо' },
  { id: 'yorozu', name: 'Ёрозу', desc: '3-й ранг · Конструкция', rarity: 'grade3', emoji: '🐛', technique: 'Конструкция' },
  { id: 'takaba', name: 'Кэнджаку Такаба', desc: '3-й ранг · Комедия', rarity: 'grade3', emoji: '🎭', technique: 'Комедия' },

  { id: 'junpei', name: 'Дзюнпэй Ёсино', desc: '4-й ранг · Муравьи', rarity: 'grade4', emoji: '🐜', technique: 'Муравьи' },
  { id: 'wasuke', name: 'Васукэ Итадори', desc: '4-й ранг · Дед Юдзи', rarity: 'grade4', emoji: '👴', technique: '—' },
  { id: 'saori', name: 'Саори', desc: '4-й ранг · Подруга Юдзи', rarity: 'grade4', emoji: '💐', technique: '—' },
  { id: 'takuma', name: 'Такума Ино', desc: '4-й ранг · Наблюдатель', rarity: 'grade4', emoji: '👁️‍🗨️', technique: '—' },
  { id: 'shoko', name: 'Сёко Иэри', desc: '4-й ранг · Лечение', rarity: 'grade4', emoji: '💉', technique: 'Обратная проклятая техника' },
  { id: 'kamo', name: 'Норитоси Камо', desc: '4-й ранг · Кровь', rarity: 'grade4', emoji: '🩸', technique: 'Красная кровь' },
  { id: 'zenin_o', name: 'Оги Дзэнин', desc: '4-й ранг · Клан', rarity: 'grade4', emoji: '🏯', technique: 'Проекция' },
  { id: 'rokkotsu', name: 'Роккотсу', desc: '4-й ранг · Клан', rarity: 'grade4', emoji: '⚰️', technique: '—' },
  { id: 'haruta', name: 'Харута Сибаяма', desc: '4-й ранг · Маленький', rarity: 'grade4', emoji: '👦', technique: '—' },
  { id: 'eso', name: 'Эсо', desc: '4-й ранг · Братья', rarity: 'grade4', emoji: '🦠', technique: 'Декомпозиция' },

  { id: 'civilian1', name: 'Гражданин', desc: 'Без проклятой энергии', rarity: 'below4', emoji: '🚶', technique: '—' },
  { id: 'civilian2', name: 'Студент обычной школы', desc: 'Не маг', rarity: 'below4', emoji: '📚', technique: '—' },
  { id: 'reporter', name: 'Репортёр', desc: 'Свидетель инцидента', rarity: 'below4', emoji: '📰', technique: '—' },
  { id: 'grade4_new', name: 'Новичок 4-го ранга', desc: 'Только выпустился', rarity: 'below4', emoji: '🎓', technique: '—' },
  { id: 'grade4_fail', name: 'Неудачник экзамена', desc: 'Провалил повышение', rarity: 'below4', emoji: '😓', technique: '—' },
  { id: 'curator', name: 'Куратор музея', desc: 'Слабая энергия', rarity: 'below4', emoji: '🏛️', technique: '—' },
  { id: 'vendor', name: 'Торговец амулетами', desc: 'Подделки', rarity: 'below4', emoji: '🏮', technique: '—' },
  { id: 'trainee', name: 'Стажёр колледжа', desc: 'Учится основам', rarity: 'below4', emoji: '✏️', technique: '—' },
  { id: 'ghost', name: 'Слабое проклятие', desc: 'Уровень ниже 4', rarity: 'below4', emoji: '👻', technique: 'Страх' },
  { id: 'fly_head', name: 'Летучая голова', desc: 'Мелкое проклятие', rarity: 'below4', emoji: '🪰', technique: '—' },
  { id: 'womb', name: 'Проклятие утробы', desc: 'Слабый класс', rarity: 'below4', emoji: '🫃', technique: '—' },
  { id: 'poltergeist', name: 'Полтергейст', desc: 'Низший класс', rarity: 'below4', emoji: '🪑', technique: '—' },
  { id: 'grade4_temp', name: 'Временный маг', desc: 'Лицензия на год', rarity: 'below4', emoji: '📄', technique: '—' },
  { id: 'assistant', name: 'Помощник мага', desc: 'Без ранга', rarity: 'below4', emoji: '🧹', technique: '—' },
];

const SPECIAL_CASE_MIN_ORDER = RARITIES.grade3.order;

/** Временные эвенты */
const EVENTS = {
  toji_hunt: {
    id: 'toji_hunt',
    name: 'Охота на Тодзи',
    subtitle: 'Эксклюзивный эвентовый персонаж',
    featuredCharacter: 'toji',
    featuredRate: 0.045,
    start: new Date('2026-06-05T00:00:00').getTime(),
    end: new Date('2026-06-12T23:59:59').getTime(),
  },
};

function isEventActive(eventId) {
  const ev = EVENTS[eventId];
  if (!ev) return false;
  const now = Date.now();
  return now >= ev.start && now < ev.end;
}

function getActiveEvents() {
  return Object.values(EVENTS).filter((e) => isEventActive(e.id));
}

function getEventCharacter(id) {
  return CHARACTERS.find((c) => c.id === id);
}

const CASES = {
  standard: {
    id: 'standard',
    name: 'Стандартный кейс',
    weightMultiplier: {},
    minOrder: 0,
  },
  elite: {
    id: 'elite',
    name: 'Элитный кейс',
    weightMultiplier: {
      below4: 0.5,
      grade4: 0.7,
      grade3: 1.2,
      grade2: 2,
      grade1: 2.5,
      special: 2,
      secret: 2.5,
    },
    minOrder: 0,
  },
  special: {
    id: 'special',
    name: 'Особый кейс',
    weightMultiplier: {
      below4: 0,
      grade4: 0.3,
      grade3: 1.5,
      grade2: 2.5,
      grade1: 3,
      special: 4,
      secret: 6,
    },
    minOrder: SPECIAL_CASE_MIN_ORDER,
  },
  event: {
    id: 'event',
    name: 'Эвентовый кейс',
    type: 'event',
    eventId: 'toji_hunt',
    weightMultiplier: {
      below4: 0.4,
      grade4: 0.6,
      grade3: 1.3,
      grade2: 2.2,
      grade1: 3,
      special: 3.5,
      secret: 4,
    },
    minOrder: 0,
  },
};

const PITY_MAX = 50;
const PITY_MIN_ORDER = RARITIES.grade1.order;
