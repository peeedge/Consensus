import type { Puzzle } from '../lib/types';

/**
 * The puzzle catalogue.
 *
 * Percentages in every puzzle sum to exactly 100 so "you got N% of the
 * responses" reads honestly. Puzzles are listed in play order and dated one per
 * day from `PUZZLE_EPOCH`; see `puzzleRepository.ts` for how a calendar date is
 * resolved to an edition.
 *
 * This file is the prototype's data source. Replacing it with a database or an
 * API means implementing the repository's fetch functions — nothing else in the
 * app reads this array directly.
 */
export const PUZZLE_EPOCH = '2026-09-09';

export const PUZZLES: Puzzle[] = [
  {
    id: 'beach-bring',
    date: '2026-09-09',
    question: 'Name something people bring to the beach.',
    difficulty: 'easy',
    category: 'Everyday life',
    answers: [
      {
        answer: 'towel',
        aliases: ['beach towel', 'towels', 'beach towels'],
        percentage: 28,
      },
      {
        answer: 'sunscreen',
        aliases: ['sun screen', 'sunblock', 'sun block', 'spf', 'sun cream', 'suntan lotion', 'sun lotion'],
        percentage: 24,
      },
      {
        answer: 'umbrella',
        aliases: ['beach umbrella', 'parasol', 'canopy'],
        percentage: 13,
      },
      {
        answer: 'cooler',
        aliases: ['ice chest', 'esky', 'cool box', 'cooler box', 'icebox'],
        percentage: 11,
      },
      {
        answer: 'beach chair',
        aliases: ['chair', 'folding chair', 'lawn chair', 'deck chair'],
        percentage: 9,
      },
      {
        answer: 'sunglasses',
        aliases: ['sun glasses', 'shades', 'dark glasses'],
        percentage: 8,
      },
      {
        answer: 'a book',
        aliases: ['book', 'novel', 'magazine', 'beach read', 'something to read'],
        percentage: 7,
      },
    ],
  },
  {
    id: 'junk-drawer',
    date: '2026-09-10',
    question: 'Name something you might find in a junk drawer.',
    difficulty: 'medium',
    category: 'Household objects',
    answers: [
      {
        answer: 'batteries',
        aliases: ['battery', 'dead batteries', 'aa batteries', 'old batteries'],
        percentage: 22,
      },
      {
        answer: 'old keys',
        aliases: ['keys', 'key', 'mystery keys', 'random keys', 'spare keys'],
        percentage: 16,
      },
      {
        answer: 'rubber bands',
        aliases: ['rubber band', 'elastic bands', 'elastic band', 'hair ties', 'hair tie'],
        percentage: 15,
      },
      {
        answer: 'tape',
        aliases: ['scotch tape', 'sellotape', 'duct tape', 'masking tape', 'sticky tape'],
        percentage: 13,
      },
      {
        answer: 'pens',
        aliases: ['pen', 'pencils', 'pencil', 'dried up pens', 'dead pens', 'markers'],
        percentage: 12,
      },
      {
        answer: 'scissors',
        aliases: ['a pair of scissors', 'pair of scissors', 'shears'],
        percentage: 10,
      },
      {
        answer: 'loose change',
        aliases: ['change', 'coins', 'coin', 'spare change', 'pennies', 'money'],
        percentage: 7,
      },
      {
        answer: 'takeout menus',
        aliases: ['menus', 'menu', 'takeaway menus', 'takeout menu', 'delivery menus'],
        percentage: 5,
      },
    ],
  },
  {
    id: 'late-to-work',
    date: '2026-09-11',
    question: 'Name a reason someone might be late to work.',
    difficulty: 'easy',
    category: 'Work',
    answers: [
      {
        answer: 'traffic',
        aliases: ['traffic jam', 'stuck in traffic', 'roadworks', 'road works', 'congestion', 'an accident'],
        percentage: 30,
      },
      {
        answer: 'overslept',
        aliases: ['slept in', 'oversleeping', 'woke up late', 'alarm did not go off', 'alarm', 'alarm clock', 'sleeping in'],
        percentage: 26,
      },
      {
        answer: 'car trouble',
        aliases: ['car broke down', 'flat tire', 'flat tyre', 'car would not start', 'car problems', 'dead car battery'],
        percentage: 12,
      },
      {
        answer: 'bad weather',
        aliases: ['weather', 'snow', 'rain', 'storm', 'ice', 'flooding'],
        percentage: 10,
      },
      {
        answer: 'the kids',
        aliases: ['kids', 'children', 'school run', 'dropping off kids', 'childcare', 'daycare'],
        percentage: 8,
      },
      {
        answer: 'train delay',
        aliases: ['train', 'the bus', 'bus', 'missed the bus', 'missed the train', 'subway', 'public transport', 'delayed train'],
        percentage: 8,
      },
      {
        answer: 'doctor appointment',
        aliases: ['appointment', 'doctor', 'dentist', 'dentist appointment', 'doctors appointment'],
        percentage: 6,
      },
    ],
  },
  {
    id: 'pretend-understand',
    date: '2026-09-12',
    question: 'Name something people pretend to understand.',
    difficulty: 'hard',
    category: 'Social situations',
    answers: [
      {
        answer: 'taxes',
        aliases: ['tax', 'doing taxes', 'tax forms', 'income tax', 'the tax code'],
        percentage: 21,
      },
      {
        answer: 'cryptocurrency',
        aliases: ['crypto', 'bitcoin', 'nft', 'nfts', 'blockchain'],
        percentage: 18,
      },
      {
        answer: 'wine',
        aliases: ['wine tasting', 'wine descriptions', 'fine wine'],
        percentage: 14,
      },
      {
        answer: 'modern art',
        aliases: ['art', 'abstract art', 'fine art', 'paintings', 'museums'],
        percentage: 13,
      },
      {
        answer: 'insurance',
        aliases: ['health insurance', 'insurance policies', 'insurance policy', 'deductibles', 'their policy'],
        percentage: 12,
      },
      {
        answer: 'politics',
        aliases: ['the news', 'political news', 'government', 'the economy', 'economics'],
        percentage: 11,
      },
      {
        answer: 'how cars work',
        aliases: ['cars', 'car engines', 'engines', 'what the mechanic says', 'the mechanic'],
        percentage: 11,
      },
    ],
  },
  {
    id: 'before-bed',
    date: '2026-09-13',
    question: 'Name something people do right before going to bed.',
    difficulty: 'easy',
    category: 'Habits',
    answers: [
      {
        answer: 'brush their teeth',
        aliases: ['brush teeth', 'brushing teeth', 'teeth', 'toothbrush', 'brush my teeth'],
        percentage: 29,
      },
      {
        answer: 'scroll their phone',
        aliases: ['phone', 'scroll', 'scrolling', 'check their phone', 'social media', 'tiktok', 'doom scrolling', 'look at their phone'],
        percentage: 22,
      },
      {
        answer: 'read',
        aliases: ['read a book', 'reading', 'book'],
        percentage: 14,
      },
      {
        answer: 'watch tv',
        aliases: ['tv', 'watch television', 'netflix', 'watch a show', 'watch something'],
        percentage: 12,
      },
      {
        answer: 'shower',
        aliases: ['take a shower', 'bath', 'take a bath', 'wash up'],
        percentage: 9,
      },
      {
        answer: 'set an alarm',
        aliases: ['alarm', 'set alarm', 'set their alarm', 'alarm clock'],
        percentage: 8,
      },
      {
        answer: 'wash their face',
        aliases: ['wash face', 'skincare', 'skin care', 'face wash', 'moisturize'],
        percentage: 6,
      },
    ],
  },
  {
    id: 'everyone-seen-movie',
    date: '2026-09-14',
    question: 'Name a movie almost everyone has seen.',
    difficulty: 'medium',
    category: 'Entertainment',
    answers: [
      { answer: 'titanic', aliases: ['the titanic'], percentage: 22 },
      { answer: 'the lion king', aliases: ['lion king'], percentage: 17 },
      { answer: 'jurassic park', aliases: ['jurassic world'], percentage: 14 },
      { answer: 'home alone', aliases: [], percentage: 13 },
      { answer: 'the wizard of oz', aliases: ['wizard of oz'], percentage: 12 },
      { answer: 'star wars', aliases: ['starwars', 'a new hope'], percentage: 8 },
      { answer: 'forrest gump', aliases: ['forest gump'], percentage: 8 },
      { answer: 'finding nemo', aliases: ['nemo'], percentage: 6 },
    ],
  },
  {
    id: 'buy-rarely-use',
    date: '2026-09-15',
    question: 'Name something people commonly buy but rarely use.',
    difficulty: 'hard',
    category: 'Habits',
    answers: [
      {
        answer: 'gym membership',
        aliases: ['gym', 'membership', 'treadmill', 'exercise bike', 'exercise equipment', 'home gym', 'peloton'],
        percentage: 20,
      },
      {
        answer: 'kitchen gadgets',
        aliases: ['blender', 'air fryer', 'juicer', 'waffle iron', 'bread maker', 'slow cooker', 'food processor', 'kitchen appliances'],
        percentage: 17,
      },
      {
        answer: 'books',
        aliases: ['book', 'unread books', 'cookbooks', 'cookbook', 'self help books'],
        percentage: 15,
      },
      {
        answer: 'fancy clothes',
        aliases: ['clothes', 'clothing', 'a suit', 'a dress', 'shoes', 'formal wear', 'heels'],
        percentage: 14,
      },
      {
        answer: 'board games',
        aliases: ['games', 'game', 'puzzles', 'jigsaw puzzle', 'a jigsaw'],
        percentage: 12,
      },
      {
        answer: 'craft supplies',
        aliases: ['crafts', 'art supplies', 'yarn', 'sewing machine', 'knitting supplies', 'paint'],
        percentage: 11,
      },
      {
        answer: 'camping gear',
        aliases: ['tent', 'camping equipment', 'sleeping bag', 'kayak', 'canoe', 'sports equipment'],
        percentage: 11,
      },
    ],
  },
  {
    id: 'fridge-always',
    date: '2026-09-16',
    question: 'Name something that is always in the refrigerator.',
    difficulty: 'easy',
    category: 'Food',
    answers: [
      { answer: 'milk', aliases: ['whole milk', 'oat milk', 'almond milk', 'a carton of milk'], percentage: 24 },
      { answer: 'eggs', aliases: ['egg', 'a dozen eggs'], percentage: 19 },
      { answer: 'butter', aliases: ['margarine', 'a stick of butter'], percentage: 13 },
      {
        answer: 'condiments',
        aliases: ['ketchup', 'mustard', 'mayo', 'mayonnaise', 'hot sauce', 'sauce', 'salad dressing', 'dressing'],
        percentage: 12,
      },
      { answer: 'cheese', aliases: ['sliced cheese', 'shredded cheese', 'block of cheese'], percentage: 11 },
      {
        answer: 'leftovers',
        aliases: ['left overs', 'old leftovers', 'takeout containers', 'leftover food'],
        percentage: 10,
      },
      { answer: 'juice', aliases: ['orange juice', 'oj', 'apple juice'], percentage: 6 },
      { answer: 'water', aliases: ['bottled water', 'water bottles', 'cold water'], percentage: 5 },
    ],
  },
  {
    id: 'first-date-topic',
    date: '2026-09-17',
    question: 'Name something people talk about on a first date.',
    difficulty: 'medium',
    category: 'Relationships',
    answers: [
      {
        answer: 'work',
        aliases: ['job', 'jobs', 'career', 'their job', 'what they do', 'occupation'],
        percentage: 24,
      },
      {
        answer: 'family',
        aliases: ['siblings', 'parents', 'their family', 'brothers and sisters'],
        percentage: 17,
      },
      {
        answer: 'hobbies',
        aliases: ['interests', 'hobby', 'free time', 'what they like to do'],
        percentage: 15,
      },
      {
        answer: 'travel',
        aliases: ['vacations', 'trips', 'places they have been', 'where they have traveled'],
        percentage: 14,
      },
      {
        answer: 'movies',
        aliases: ['tv shows', 'shows', 'films', 'film', 'netflix', 'tv', 'entertainment'],
        percentage: 12,
      },
      {
        answer: 'food',
        aliases: ['restaurants', 'cooking', 'favorite food', 'the menu'],
        percentage: 10,
      },
      {
        answer: 'pets',
        aliases: ['dogs', 'dog', 'cats', 'cat', 'their pet'],
        percentage: 8,
      },
    ],
  },
  {
    id: 'hard-to-throw-away',
    date: '2026-09-18',
    question: 'Name something people keep even though they will never use it.',
    difficulty: 'hard',
    category: 'Household objects',
    answers: [
      {
        answer: 'old cables',
        aliases: ['cables', 'cords', 'wires', 'old chargers', 'random cables', 'usb cables', 'charger'],
        percentage: 20,
      },
      {
        answer: 'old clothes',
        aliases: ['clothes', 'clothing', 'shirts', 'jeans that do not fit', 'old shoes', 'shoes'],
        percentage: 18,
      },
      {
        answer: 'takeout containers',
        aliases: ['plastic containers', 'tupperware', 'containers', 'plastic bags', 'jars', 'yogurt pots'],
        percentage: 14,
      },
      {
        answer: 'instruction manuals',
        aliases: ['manuals', 'user manuals', 'instructions', 'paperwork', 'old receipts', 'receipts'],
        percentage: 13,
      },
      {
        answer: 'old phones',
        aliases: ['old phone', 'broken phone', 'old electronics', 'old laptop', 'electronics'],
        percentage: 12,
      },
      {
        answer: 'gift bags',
        aliases: ['wrapping paper', 'bows', 'ribbon', 'gift wrap', 'gift bag'],
        percentage: 12,
      },
      {
        answer: 'spare buttons',
        aliases: ['buttons', 'extra buttons', 'loose screws', 'spare parts', 'extra screws'],
        percentage: 11,
      },
    ],
  },
  {
    id: 'kids-want-birthday',
    date: '2026-09-19',
    question: 'Name something a child asks for on their birthday.',
    difficulty: 'easy',
    category: 'Childhood',
    answers: [
      { answer: 'a toy', aliases: ['toy', 'toys', 'a new toy', 'lego'], percentage: 22 },
      {
        answer: 'a video game',
        aliases: ['video games', 'game', 'games', 'console', 'playstation', 'xbox', 'nintendo', 'a switch'],
        percentage: 20,
      },
      {
        answer: 'a phone',
        aliases: ['phone', 'smartphone', 'iphone', 'a new phone'],
        percentage: 15,
      },
      {
        answer: 'a puppy',
        aliases: ['puppy', 'a dog', 'dog', 'a pet', 'pet', 'kitten', 'a cat'],
        percentage: 13,
      },
      { answer: 'a bike', aliases: ['bike', 'bicycle', 'a new bike', 'scooter'], percentage: 11 },
      {
        answer: 'a party',
        aliases: ['birthday party', 'sleepover', 'pool party', 'a sleepover'],
        percentage: 10,
      },
      { answer: 'money', aliases: ['cash', 'gift card', 'gift cards'], percentage: 9 },
    ],
  },
  {
    id: 'phone-battery-drain',
    date: '2026-09-20',
    question: 'Name something that drains a phone battery.',
    difficulty: 'medium',
    category: 'Technology',
    answers: [
      {
        answer: 'streaming video',
        aliases: ['youtube', 'netflix', 'watching videos', 'streaming', 'videos', 'video'],
        percentage: 22,
      },
      {
        answer: 'social media',
        aliases: ['instagram', 'tiktok', 'facebook', 'twitter', 'scrolling', 'apps', 'snapchat'],
        percentage: 20,
      },
      {
        answer: 'gps',
        aliases: ['maps', 'navigation', 'google maps', 'waze', 'using maps', 'sat nav'],
        percentage: 15,
      },
      {
        answer: 'games',
        aliases: ['gaming', 'mobile games', 'playing games', 'game'],
        percentage: 14,
      },
      {
        answer: 'screen brightness',
        aliases: ['brightness', 'bright screen', 'the screen', 'screen'],
        percentage: 12,
      },
      {
        answer: 'the camera',
        aliases: ['camera', 'taking photos', 'taking pictures', 'photos', 'recording video'],
        percentage: 9,
      },
      {
        answer: 'an old battery',
        aliases: ['old battery', 'bad battery', 'battery health', 'an old phone', 'age'],
        percentage: 8,
      },
    ],
  },
  {
    id: 'procrastinate-instead',
    date: '2026-09-21',
    question: 'Name something people do instead of the task they are avoiding.',
    difficulty: 'hard',
    category: 'Habits',
    answers: [
      {
        answer: 'scroll their phone',
        aliases: ['phone', 'social media', 'scrolling', 'tiktok', 'instagram', 'doom scrolling', 'scroll'],
        percentage: 24,
      },
      {
        answer: 'clean',
        aliases: ['cleaning', 'tidy up', 'tidying', 'laundry', 'dishes', 'organize', 'organizing', 'vacuum'],
        percentage: 19,
      },
      {
        answer: 'snack',
        aliases: ['eat', 'eating', 'make a snack', 'get food', 'snacking'],
        percentage: 14,
      },
      {
        answer: 'make coffee',
        aliases: ['coffee', 'tea', 'make tea', 'get a coffee', 'another coffee'],
        percentage: 12,
      },
      {
        answer: 'watch tv',
        aliases: ['tv', 'netflix', 'youtube', 'watch a show', 'binge watch'],
        percentage: 12,
      },
      {
        answer: 'nap',
        aliases: ['sleep', 'take a nap', 'lie down', 'napping'],
        percentage: 10,
      },
      {
        answer: 'make a list',
        aliases: ['list', 'to do list', 'lists', 'plan', 'planning'],
        percentage: 9,
      },
    ],
  },
  {
    id: 'holiday-dinner-table',
    date: '2026-09-22',
    question: 'Name a dish you expect on a holiday dinner table.',
    difficulty: 'easy',
    category: 'Holidays',
    answers: [
      { answer: 'turkey', aliases: ['roast turkey', 'ham', 'the roast', 'roast'], percentage: 23 },
      {
        answer: 'mashed potatoes',
        aliases: ['potatoes', 'mash', 'mashed potato', 'roast potatoes'],
        percentage: 20,
      },
      { answer: 'stuffing', aliases: ['dressing', 'bread stuffing'], percentage: 14 },
      {
        answer: 'green beans',
        aliases: ['green bean casserole', 'beans', 'vegetables', 'veggies', 'sprouts'],
        percentage: 10,
      },
      { answer: 'cranberry sauce', aliases: ['cranberries', 'cranberry'], percentage: 10 },
      { answer: 'gravy', aliases: ['the gravy'], percentage: 9 },
      { answer: 'pie', aliases: ['pumpkin pie', 'apple pie', 'dessert'], percentage: 8 },
      { answer: 'rolls', aliases: ['bread', 'dinner rolls', 'biscuits', 'roll'], percentage: 6 },
    ],
  },
  {
    id: 'office-small-talk',
    date: '2026-09-23',
    question: 'Name something coworkers make small talk about.',
    difficulty: 'medium',
    category: 'Work',
    answers: [
      {
        answer: 'the weather',
        aliases: ['weather', 'rain', 'how hot it is', 'snow', 'how cold it is'],
        percentage: 25,
      },
      {
        answer: 'weekend plans',
        aliases: ['the weekend', 'weekend', 'plans', 'what you did this weekend'],
        percentage: 22,
      },
      {
        answer: 'tv shows',
        aliases: ['television', 'shows', 'netflix', 'a show', 'what they are watching'],
        percentage: 15,
      },
      {
        answer: 'sports',
        aliases: ['the game', 'football', 'the big game', 'soccer', 'basketball'],
        percentage: 13,
      },
      {
        answer: 'traffic',
        aliases: ['the commute', 'commute', 'parking', 'the drive in'],
        percentage: 10,
      },
      {
        answer: 'coffee',
        aliases: ['the coffee', 'lunch', 'food', 'the break room'],
        percentage: 8,
      },
      {
        answer: 'vacation',
        aliases: ['holidays', 'time off', 'pto', 'an upcoming trip'],
        percentage: 7,
      },
    ],
  },
  {
    id: 'gift-regift',
    date: '2026-09-24',
    question: 'Name a gift people quietly pass along to someone else.',
    difficulty: 'hard',
    category: 'Holidays',
    answers: [
      { answer: 'candles', aliases: ['candle', 'scented candles', 'scented candle'], percentage: 22 },
      {
        answer: 'bath sets',
        aliases: ['bath bombs', 'soap', 'lotion', 'body wash', 'bath products', 'bubble bath', 'bath set'],
        percentage: 18,
      },
      { answer: 'mugs', aliases: ['mug', 'coffee mug', 'novelty mug'], percentage: 15 },
      {
        answer: 'fruitcake',
        aliases: ['fruit cake', 'gift baskets', 'gift basket', 'food basket', 'chocolates'],
        percentage: 13,
      },
      { answer: 'socks', aliases: ['sock', 'novelty socks'], percentage: 12 },
      {
        answer: 'picture frames',
        aliases: ['picture frame', 'photo frame', 'photo frames', 'frames', 'frame'],
        percentage: 11,
      },
      {
        answer: 'wine',
        aliases: ['a bottle of wine', 'bottle of wine', 'alcohol', 'liquor'],
        percentage: 9,
      },
    ],
  },
  {
    id: 'airport-see',
    date: '2026-09-25',
    question: 'Name something you always see at an airport.',
    difficulty: 'easy',
    category: 'Travel',
    answers: [
      {
        answer: 'long lines',
        aliases: ['lines', 'line', 'queues', 'queue', 'security line', 'waiting in line'],
        percentage: 22,
      },
      {
        answer: 'luggage',
        aliases: ['suitcases', 'suitcase', 'bags', 'baggage', 'carry on', 'rolling bags'],
        percentage: 20,
      },
      {
        answer: 'security',
        aliases: ['tsa', 'security checkpoint', 'metal detector', 'scanners', 'guards'],
        percentage: 15,
      },
      {
        answer: 'delayed flights',
        aliases: ['delays', 'delay', 'cancelled flights', 'the departure board', 'departure board'],
        percentage: 13,
      },
      {
        answer: 'a coffee shop',
        aliases: ['coffee shop', 'starbucks', 'coffee', 'cafe', 'restaurants', 'food court'],
        percentage: 12,
      },
      {
        answer: 'duty free',
        aliases: ['shops', 'stores', 'gift shop', 'shopping'],
        percentage: 10,
      },
      {
        answer: 'tired travellers',
        aliases: ['tired travelers', 'tired people', 'people sleeping', 'crying babies', 'crowds'],
        percentage: 8,
      },
    ],
  },
  {
    id: 'restaurant-annoy',
    date: '2026-09-26',
    question: 'Name something that annoys people at a restaurant.',
    difficulty: 'medium',
    category: 'Social situations',
    answers: [
      {
        answer: 'slow service',
        aliases: ['bad service', 'waiting', 'long wait', 'slow waiter', 'service'],
        percentage: 24,
      },
      {
        answer: 'loud people',
        aliases: ['noise', 'noisy', 'loud music', 'loud customers', 'screaming kids', 'a crying baby'],
        percentage: 19,
      },
      {
        answer: 'the wrong order',
        aliases: ['wrong order', 'wrong food', 'mixed up order', 'getting the wrong food'],
        percentage: 16,
      },
      {
        answer: 'cold food',
        aliases: ['food is cold', 'lukewarm food', 'food arrives cold'],
        percentage: 14,
      },
      {
        answer: 'high prices',
        aliases: ['prices', 'the bill', 'too expensive', 'overpriced', 'the cost', 'expensive'],
        percentage: 14,
      },
      {
        answer: 'a dirty table',
        aliases: ['dirty table', 'sticky table', 'dirty dishes', 'dirty silverware', 'dirty cutlery'],
        percentage: 7,
      },
      {
        answer: 'splitting the bill',
        aliases: ['the check', 'splitting the check', 'dividing the bill', 'paying'],
        percentage: 6,
      },
    ],
  },
  {
    id: 'say-never-do',
    date: '2026-09-27',
    question: 'Name something people say they will do but never actually do.',
    difficulty: 'hard',
    category: 'Social situations',
    answers: [
      {
        answer: 'get together soon',
        aliases: ['lets get coffee', 'we should hang out', 'lets grab lunch', 'catch up soon', 'meet up', 'hang out', 'lets do lunch'],
        percentage: 23,
      },
      {
        answer: 'start exercising',
        aliases: ['go to the gym', 'exercise', 'work out', 'workout', 'start running', 'get in shape'],
        percentage: 20,
      },
      {
        answer: 'read that book',
        aliases: ['read more', 'finish the book', 'read', 'start reading'],
        percentage: 15,
      },
      {
        answer: 'clean the garage',
        aliases: ['clean out the garage', 'organize the garage', 'declutter', 'organize the closet', 'clean the attic'],
        percentage: 14,
      },
      {
        answer: 'learn a language',
        aliases: ['duolingo', 'learn spanish', 'learn french', 'study a language'],
        percentage: 12,
      },
      {
        answer: 'eat healthier',
        aliases: ['diet', 'start a diet', 'eat better', 'cook more', 'meal prep'],
        percentage: 9,
      },
      {
        answer: 'read the terms',
        aliases: ['terms and conditions', 'read the terms and conditions', 'privacy policy', 'terms of service'],
        percentage: 7,
      },
    ],
  },
  {
    id: 'morning-first',
    date: '2026-09-28',
    question: 'Name the first thing people do when they wake up.',
    difficulty: 'easy',
    category: 'Habits',
    answers: [
      {
        answer: 'check their phone',
        aliases: ['phone', 'check phone', 'look at their phone', 'grab their phone', 'scroll', 'social media', 'check messages'],
        percentage: 28,
      },
      {
        answer: 'go to the bathroom',
        aliases: ['bathroom', 'toilet', 'pee', 'use the bathroom', 'restroom', 'loo'],
        percentage: 22,
      },
      {
        answer: 'make coffee',
        aliases: ['coffee', 'drink coffee', 'get coffee', 'caffeine', 'put the kettle on'],
        percentage: 18,
      },
      {
        answer: 'hit snooze',
        aliases: ['snooze', 'snooze button', 'go back to sleep', 'turn off the alarm', 'alarm'],
        percentage: 11,
      },
      {
        answer: 'stretch',
        aliases: ['stretching', 'yawn', 'yawning'],
        percentage: 10,
      },
      {
        answer: 'brush their teeth',
        aliases: ['brush teeth', 'teeth', 'brush my teeth'],
        percentage: 6,
      },
      {
        answer: 'shower',
        aliases: ['take a shower', 'wash up'],
        percentage: 5,
      },
    ],
  },
  {
    id: 'hotel-take',
    date: '2026-09-29',
    question: 'Name something people take home from a hotel room.',
    difficulty: 'medium',
    category: 'Travel',
    answers: [
      {
        answer: 'toiletries',
        aliases: ['shampoo', 'soap', 'conditioner', 'body wash', 'lotion', 'mini shampoo', 'little soaps', 'shower gel'],
        percentage: 30,
      },
      {
        answer: 'towels',
        aliases: ['towel', 'bath towel', 'hand towel'],
        percentage: 17,
      },
      {
        answer: 'pens',
        aliases: ['pen', 'notepad', 'notepads', 'stationery', 'paper'],
        percentage: 14,
      },
      {
        answer: 'slippers',
        aliases: ['slipper', 'robe', 'bathrobe', 'the robe'],
        percentage: 11,
      },
      {
        answer: 'coffee pods',
        aliases: ['coffee', 'tea bags', 'coffee packets', 'tea', 'sugar packets', 'creamer'],
        percentage: 11,
      },
      {
        answer: 'hangers',
        aliases: ['hanger', 'coat hangers'],
        percentage: 9,
      },
      {
        answer: 'the shower cap',
        aliases: ['shower cap', 'shower caps', 'sewing kit', 'shoe shine kit'],
        percentage: 8,
      },
    ],
  },
  {
    id: 'homework-excuse',
    date: '2026-09-30',
    question: 'Name an excuse a child gives for not doing their homework.',
    difficulty: 'medium',
    category: 'Childhood',
    answers: [
      {
        answer: 'the dog ate it',
        aliases: ['dog ate it', 'the dog ate my homework', 'my dog ate it', 'dog ate my homework', 'the dog'],
        percentage: 24,
      },
      {
        answer: 'i forgot it',
        aliases: ['forgot it', 'i forgot', 'left it at home', 'forgot at home', 'forgot my homework'],
        percentage: 22,
      },
      {
        answer: 'i did not know about it',
        aliases: ['i did not know', 'nobody told me', 'no one told me', 'i did not hear you', 'did not know'],
        percentage: 16,
      },
      {
        answer: 'it was too hard',
        aliases: ['too hard', 'too difficult', 'i did not understand', 'did not understand', 'too much homework'],
        percentage: 14,
      },
      {
        answer: 'i was sick',
        aliases: ['was sick', 'sick', 'not feeling well', 'stomach ache', 'headache'],
        percentage: 10,
      },
      {
        answer: 'i was busy',
        aliases: ['too busy', 'practice', 'i had practice', 'sports', 'a game', 'busy with sports'],
        percentage: 8,
      },
      {
        answer: 'i lost it',
        aliases: ['lost it', 'cannot find it', 'it got lost', 'missing'],
        percentage: 6,
      },
    ],
  },
  {
    id: 'vacation-forget',
    date: '2026-10-01',
    question: 'Name something people forget when going on vacation.',
    difficulty: 'medium',
    category: 'Travel',
    answers: [
      {
        answer: 'phone charger',
        aliases: ['charger', 'chargers', 'phone chargers', 'charging cable', 'charger cable', 'charging cord', 'phone cord'],
        percentage: 31,
      },
      {
        answer: 'toothbrush',
        aliases: ['tooth brush', 'toothbrushes', 'toothpaste'],
        percentage: 21,
      },
      {
        answer: 'passport',
        aliases: ['passports', 'their passport', 'travel documents', 'id'],
        percentage: 15,
      },
      {
        answer: 'sunscreen',
        aliases: ['sun screen', 'sunblock', 'sun block', 'spf', 'sun cream', 'suncream'],
        percentage: 11,
      },
      {
        answer: 'medication',
        aliases: ['medicine', 'meds', 'pills', 'prescription', 'prescriptions', 'medications'],
        percentage: 8,
      },
      {
        answer: 'camera',
        aliases: ['cameras', 'their camera'],
        percentage: 6,
      },
      {
        answer: 'sunglasses',
        aliases: ['sun glasses', 'shades'],
        percentage: 5,
      },
      {
        answer: 'wallet',
        aliases: ['purse', 'wallets'],
        percentage: 3,
      },
    ],
  },
  {
    id: 'lose-at-home',
    date: '2026-10-02',
    question: 'Name something people are always losing at home.',
    difficulty: 'medium',
    category: 'Household objects',
    answers: [
      {
        answer: 'keys',
        aliases: ['key', 'car keys', 'house keys', 'my keys', 'the keys'],
        percentage: 27,
      },
      {
        answer: 'phone',
        aliases: ['cell phone', 'mobile phone', 'my phone', 'smartphone'],
        percentage: 21,
      },
      {
        answer: 'the remote',
        aliases: ['remote', 'tv remote', 'remote control', 'the clicker', 'clicker'],
        percentage: 18,
      },
      {
        answer: 'glasses',
        aliases: ['eye glasses', 'reading glasses', 'spectacles', 'specs', 'my glasses'],
        percentage: 12,
      },
      {
        answer: 'socks',
        aliases: ['sock', 'one sock', 'matching socks', 'odd socks'],
        percentage: 9,
      },
      {
        answer: 'chapstick',
        aliases: ['chap stick', 'lip balm', 'lipstick', 'lip gloss'],
        percentage: 7,
      },
      {
        answer: 'phone charger',
        aliases: ['charger', 'charging cable', 'the cable', 'cord'],
        percentage: 6,
      },
    ],
  },
];
