/* =========================================================
   Default Curriculum Data for English P.6 Hub (Grade 6)
   Aligned with Thailand's Core Curriculum (หลักสูตรแกนกลางฯ ป.6)
   Complete 4-in-1 coverage across all 6 Units (24 Materials)
   ========================================================= */

window.DEFAULT_ENGLISH_P6_DATA = {
  units: [
    {
      id: "unit-1",
      code: "Unit 1",
      titleEn: "All About Me & Daily Routines",
      titleTh: "แนะนำตัวและกิจวัตรประจำวัน",
      emoji: "⏰",
      image: "assets/unit-1.jpg",
      accent: "#38BDF8",
      bg: "#E0F4FF"
    },
    {
      id: "unit-2",
      code: "Unit 2",
      titleEn: "Healthy Food & Shopping",
      titleTh: "อาหารเพื่อสุขภาพและการซื้อของ",
      emoji: "🥗",
      image: "assets/unit-2.jpg",
      accent: "#34D399",
      bg: "#DCFCE7"
    },
    {
      id: "unit-3",
      code: "Unit 3",
      titleEn: "Around Town & Directions",
      titleTh: "สถานที่และบอกเส้นทาง",
      emoji: "🗺️",
      image: "assets/unit-3.jpg",
      accent: "#FFAD33",
      bg: "#FEF3C7"
    },
    {
      id: "unit-4",
      code: "Unit 4",
      titleEn: "Travel & Past Holidays",
      titleTh: "ท่องเที่ยวและวันหยุดในอดีต",
      emoji: "✈️",
      image: "assets/unit-4.jpg",
      accent: "#FF785A",
      bg: "#FFE8E0"
    },
    {
      id: "unit-5",
      code: "Unit 5",
      titleEn: "Future Plans & Dream Jobs",
      titleTh: "แผนในอนาคตและอาชีพในฝัน",
      emoji: "🚀",
      image: "assets/unit-5.jpg",
      accent: "#A855F7",
      bg: "#F3E8FF"
    },
    {
      id: "unit-6",
      code: "Unit 6",
      titleEn: "Save Our Earth & O-NET Prep",
      titleTh: "รักษ์โลกและติวเข้ม O-NET ป.6",
      emoji: "🌍",
      image: "assets/unit-6.jpg",
      accent: "#06B6D4",
      bg: "#CFFAFE"
    }
  ],

  materials: [
    // ==================== UNIT 1 (4/4) ====================
    {
      id: "m-u1-slides",
      unitId: "unit-1",
      type: "media",
      title: "สไลด์สอน: Present Simple Tense & Adverbs of Frequency",
      description: "สรุปหลักการใช้ Present Simple Tense การเติม s/es และคำบอกความถี่ (always, usually, sometimes, never) พร้อมตัวอย่างประโยคและเสียงอ่าน",
      duration: "5 สไลด์ • 15 นาที",
      tags: ["grammar", "present simple", "daily routine", "สไลด์"],
      createdAt: "2026-05-01",
      mediaUrl: "",
      slides: [
        {
          heading: "Present Simple Tense ใช้ตอนไหน?",
          content: "ใช้พูดถึงเรื่องที่เป็น 'กิจวัตรประจำวัน' นิสัย หรือความจริงทั่วไป\n\n• โครงสร้างประโยคบอกเล่า: Subject + Verb 1 (s/es)\n• ประธานเอกพจน์ (He, She, It, Pim) ➔ กริยาเติม s / es\n• ประธานพหูพจน์ (I, You, We, They) ➔ กริยาช่อง 1 ไม่ต้องเติม s",
          exampleEn: "She walks to school every morning."
        },
        {
          heading: "หลักการเติม s / es ท้ายคำกริยา",
          content: "1. กริยาทั่วไป เติม -s ได้เลย เช่น play ➔ plays, eat ➔ eats\n2. กริยาลงท้ายด้วย s, ss, sh, ch, x, o ให้เติม -es เช่น go ➔ goes, watch ➔ watches, brush ➔ brushes\n3. ลงท้ายด้วย พยัญชนะ + y ให้เปลี่ยน y เป็น i แล้วเติม -es เช่น study ➔ studies",
          exampleEn: "He brushes his teeth and goes to bed at 9 p.m."
        },
        {
          heading: "ประโยคปฏิเสธและคำถาม (Do / Does)",
          content: "• ประธาน I, You, We, They ใช้ do / don't\n• ประธาน He, She, It ใช้ does / doesn't\n• ข้อควรจำสำคัญ! เมื่อมี does / doesn't แล้ว คำกริยาแท้ต้องกลับเป็นรูปเดิม (ไม่ต้องเติม s)",
          exampleEn: "Does she like English? — Yes, she does."
        },
        {
          heading: "Adverbs of Frequency (คำบอกความถี่)",
          content: "วางไว้ 'หน้าคำกริยาแท้' หรือ 'หลัง Verb to be (is, am, are)'\n\n• always (100%) = สม่ำเสมอ / เสมอ\n• usually (80%) = โดยปกติ\n• often (60%) = บ่อยๆ\n• sometimes (40%) = บางครั้ง\n• never (0%) = ไม่เคย",
          exampleEn: "I always do my homework after dinner."
        },
        {
          heading: "ชวนฝึกพูดในห้องเรียน (Pair Work)",
          content: "ลองจับคู่ถาม-ตอบกับเพื่อนข้างๆ ด้วยประโยคต่อไปนี้:\n\nA: What time do you usually wake up?\nB: I usually wake up at 6:30 a.m.\n\nA: How often do you play sports?\nB: I often play football with my friends.",
          exampleEn: "What time do you usually wake up?"
        }
      ]
    },
    {
      id: "m-u1-flashcards",
      unitId: "unit-1",
      type: "flashcard",
      title: "บัตรคำศัพท์: กิจวัตรประจำวันและความถี่ (Daily Routines)",
      description: "ฝึกอ่านออกเสียงและจำคำศัพท์กิจวัตรประจำวัน 8 คำสำคัญ พร้อมโหมดเกมจับคู่คำศัพท์สนุกๆ",
      duration: "8 คำศัพท์ + เกมจับคู่",
      tags: ["vocabulary", "daily routines", "flashcards", "เสียงอ่าน"],
      createdAt: "2026-05-02",
      cards: [
        { word: "wake up", phonetic: "(v.) เวค-อัพ", meaning: "ตื่นนอน", example: "I wake up at six o'clock.", emoji: "🌅" },
        { word: "brush my teeth", phonetic: "(v.) บรัช มาย ทีธ", meaning: "แปรงฟัน", example: "She brushes her teeth twice a day.", emoji: "🪥" },
        { word: "take a shower", phonetic: "(v.) เทค อะ เชา-เออะ", meaning: "อาบน้ำฝักบัว", example: "He takes a shower every morning.", emoji: "🚿" },
        { word: "have breakfast", phonetic: "(v.) แฮฟ เบรค-ฟัสท์", meaning: "รับประทานอาหารเช้า", example: "We have breakfast at 7 a.m.", emoji: "🍳" },
        { word: "do homework", phonetic: "(v.) ดู โฮม-เวิร์ค", meaning: "ทำการบ้าน", example: "Ploy always does her homework.", emoji: "📚" },
        { word: "always", phonetic: "(adv.) ออล-เวย์ส", meaning: "สม่ำเสมอ (100%)", example: "I always help my mom at home.", emoji: "💯" },
        { word: "sometimes", phonetic: "(adv.) ซัม-ไทม์ส", meaning: "บางครั้ง (40%)", example: "They sometimes ride bikes to school.", emoji: "🚲" },
        { word: "never", phonetic: "(adv.) เนฟ-เวอะ", meaning: "ไม่เคย (0%)", example: "He is never late for class.", emoji: "🚫" }
      ]
    },
    {
      id: "m-u1-worksheet",
      unitId: "unit-1",
      type: "worksheet",
      title: "ใบงานที่ 1: Present Simple Tense & Daily Routines",
      description: "แบบฝึกหัดเติมคำกริยาให้ถูกต้องตามประธานและอ่านเรื่องสั้นตอบคำถาม พร้อมปุ่มเปิดดูเฉลยและสั่งพิมพ์ A4",
      duration: "8 ข้อ • พิมพ์ A4 ได้",
      tags: ["worksheet", "present simple", "reading", "พิมพ์ได้"],
      createdAt: "2026-05-03",
      instructions: "Part A: Fill in the blanks with the correct Present Simple form of the verbs in brackets. (เติมคำกริยาในวงเล็บให้ถูกต้อง)",
      passage: "📖 Short Reading: Pim is a Prathom 6 student. She usually gets up at 6:00 a.m. She takes a shower and has rice soup for breakfast. Her father drives her to school at 7:30 a.m. After school, she always does her homework and sometimes plays badminton with her brother.",
      items: [
        { q: "1. My sister __________ (brush) her teeth every morning.", a: "brushes" },
        { q: "2. They __________ (play) football after school.", a: "play" },
        { q: "3. Ton __________ (go) to school by bus every day.", a: "goes" },
        { q: "4. I __________ (not / watch) TV late at night.", a: "do not watch / don't watch" },
        { q: "5. __________ (Do / Does) she study English on Mondays?", a: "Does" },
        { q: "6. (จากเรื่องสั้น) What time does Pim usually get up?", a: "She usually gets up at 6:00 a.m." },
        { q: "7. (จากเรื่องสั้น) How does Pim go to school?", a: "Her father drives her to school. (by car)" },
        { q: "8. (จากเรื่องสั้น) What does Pim always do after school?", a: "She always does her homework." }
      ]
    },
    {
      id: "m-u1-quiz",
      unitId: "unit-1",
      type: "quiz",
      title: "แบบทดสอบ: Daily Routines & Present Simple",
      description: "ทดสอบการใช้ Present Simple Tense, Do/Does และคำบอกความถี่ 5 ข้อพร้อมเฉลยอธิบายเข้าใจง่าย",
      duration: "5 ข้อ • 5 นาที",
      tags: ["quiz", "present simple", "daily routines"],
      createdAt: "2026-05-04",
      questions: [
        {
          question: "Suda ________ to school by bicycle every morning.",
          options: ["go", "goes", "going", "went"],
          answer: 1,
          explanation: "ประธาน Suda เป็นเอกพจน์ และมีคำว่า every morning (กิจวัตรประจำวัน) กริยา go ลงท้ายด้วย o จึงเติม -es เป็น goes"
        },
        {
          question: "________ your brother like playing football?",
          options: ["Do", "Does", "Is", "Are"],
          answer: 1,
          explanation: "your brother เป็นประธานเอกพจน์ (He) ในประโยคคำถาม Present Simple ใช้ Does นำหน้า"
        },
        {
          question: "I ________ brush my teeth before going to bed. (100%)",
          options: ["never", "sometimes", "always", "seldom"],
          answer: 2,
          explanation: "ความถี่ 100% (ทำเป็นประจำทุกวัน) ใช้คำว่า always"
        },
        {
          question: "He doesn't ________ coffee in the morning.",
          options: ["drink", "drinks", "drinking", "drank"],
          answer: 0,
          explanation: "หลัง doesn't กริยาแท้ต้องกลับเป็นรูปเดิม (V.1 ไม่เติม s) จึงตอบ drink"
        },
        {
          question: "A: What time do you usually get up?\nB: ________________",
          options: ["I get up at 6:30 a.m.", "I go by bus.", "Yes, I do.", "At the library."],
          answer: 0,
          explanation: "คำถาม What time...? ถามเวลา คำตอบจึงระบุเวลา (at 6:30 a.m.)"
        }
      ]
    },

    // ==================== UNIT 2 (4/4) ====================
    {
      id: "m-u2-slides",
      unitId: "unit-2",
      type: "media",
      title: "สไลด์สอน: Countable vs. Uncountable Nouns & Shopping",
      description: "แยกคำนามนับได้-นับไม่ได้ การใช้ some/any, How much/How many และบทสนทนาซื้อของในซูเปอร์มาร์เก็ต",
      duration: "4 สไลด์ • 12 นาที",
      tags: ["food", "grammar", "shopping", "สไลด์"],
      createdAt: "2026-05-05",
      mediaUrl: "",
      slides: [
        {
          heading: "Countable vs. Uncountable Nouns",
          content: "🍎 คำนามนับได้ (Countable): นับเป็นชิ้น/อันได้ เติม s/es ได้\n  เช่น an apple ➔ two apples, an egg ➔ six eggs, a banana ➔ bananas\n\n🥛 คำนามนับไม่ได้ (Uncountable): ของเหลว ผง เม็ดเล็กๆ นับทีละชิ้นไม่ได้ (ห้ามเติม a/an หรือ s)\n  เช่น milk, water, rice, sugar, bread, orange juice",
          exampleEn: "I eat an apple and drink some milk every morning."
        },
        {
          heading: "การใช้ Some และ Any จำง่ายใน 10 วินาที",
          content: "• SOME = บ้าง / จำนวนหนึ่ง\n  ➔ ใช้ในประโยคบอกเล่า: There is some milk in the fridge.\n  ➔ ใช้ในประโยคเสนอ/ขอร้อง: Would you like some water?\n\n• ANY = บ้างเลย / เลย\n  ➔ ใช้ในประโยคปฏิเสธ: There isn't any sugar.\n  ➔ ใช้ในประโยคคำถาม: Are there any eggs?",
          exampleEn: "Are there any bananas in the basket?"
        },
        {
          heading: "How much กับ How many ต่างกันยังไง?",
          content: "• How many + คำนามนับได้พหูพจน์ (ถามจำนวน)\n  ➔ How many apples do you want?\n\n• How much + คำนามนับไม่ได้ (ถามปริมาณ)\n  ➔ How much water do you drink?\n\n• How much is/are...? (ถามราคา!)\n  ➔ How much is this mango? — It's 35 baht.",
          exampleEn: "How much are these oranges? — They are 60 baht."
        },
        {
          heading: "บทสนทนาซื้อของ (At the Supermarket)",
          content: "Shopkeeper: Good morning! Can I help you?\nStudent: Yes, please. I'd like a carton of milk and two loaves of bread.\nShopkeeper: Here you are. Anything else?\nStudent: No, thank you. How much are they?\nShopkeeper: They are 95 baht altogether.",
          exampleEn: "I would like a carton of milk, please."
        }
      ]
    },
    {
      id: "m-u2-flashcards",
      unitId: "unit-2",
      type: "flashcard",
      title: "บัตรคำศัพท์: อาหารและภาชนะบรรจุ (Food & Containers)",
      description: "คำศัพท์อาหารและลักษณะนาม/ภาชนะ (a carton of, a loaf of, a bottle of) ที่ออกสอบ ป.6 บ่อยมาก",
      duration: "8 คำศัพท์ + เกมจับคู่",
      tags: ["food", "containers", "shopping", "vocabulary"],
      createdAt: "2026-05-05",
      cards: [
        { word: "a carton of milk", phonetic: "อะ คาร์-ทัน ออฟ มิลค์", meaning: "นม 1 กล่อง", example: "Please buy a carton of milk.", emoji: "🥛" },
        { word: "a loaf of bread", phonetic: "อะ โลฟ ออฟ เบรด", meaning: "ขนมปัง 1 แถว/ก้อน", example: "My mom bought a loaf of bread.", emoji: "🍞" },
        { word: "a bunch of bananas", phonetic: "อะ บันช์ ออฟ บะ-นา-นัส", meaning: "กล้วย 1 หวี", example: "There is a bunch of bananas on the table.", emoji: "🍌" },
        { word: "a bowl of noodles", phonetic: "อะ โบล์ ออฟ นู-เดิลส์", meaning: "ก๋วยเตี๋ยว 1 ชาม", example: "I would like a bowl of noodles.", emoji: "🍜" },
        { word: "a bottle of water", phonetic: "อะ บอท-เทิล ออฟ วอ-เทอะ", meaning: "น้ำดื่ม 1 ขวด", example: "Drink a bottle of water after exercise.", emoji: "💧" },
        { word: "vegetables", phonetic: "(n.) เวจ-ทะ-เบิลส์", meaning: "ผักต่างๆ", example: "Eating vegetables keeps you healthy.", emoji: "🥦" },
        { word: "delicious", phonetic: "(adj.) ดิ-ลิ-เชิส", meaning: "อร่อย", example: "This mango sticky rice is delicious!", emoji: "😋" },
        { word: "How much is it?", phonetic: "ฮาว มัช อิส อิท", meaning: "ราคาเท่าไร?", example: "Excuse me, how much is this apple?", emoji: "🏷️" }
      ]
    },
    {
      id: "m-u2-worksheet",
      unitId: "unit-2",
      type: "worksheet",
      title: "ใบงานที่ 2: Some / Any & How much / How many",
      description: "ฝึกแยกคำนามนับได้และนับไม่ได้ พร้อมการใช้ some, any, How much และ How many ในสถานการณ์ซื้อของ",
      duration: "7 ข้อ • พิมพ์ A4 ได้",
      tags: ["some", "any", "how much", "how many", "worksheet"],
      createdAt: "2026-05-06",
      instructions: "Fill in the blanks with 'some', 'any', 'How much', or 'How many'. (เติมคำให้ถูกต้อง)",
      items: [
        { q: "1. There is __________ orange juice in the fridge.", a: "some (ประโยคบอกเล่า)" },
        { q: "2. Are there __________ eggs in the basket?", a: "any (ประโยคคำถาม)" },
        { q: "3. I don't have __________ sugar left.", a: "any (ประโยคปฏิเสธ)" },
        { q: "4. __________ apples do you want to buy?", a: "How many (apples นับได้พหูพจน์)" },
        { q: "5. __________ milk do you drink every day?", a: "How much (milk นับไม่ได้)" },
        { q: "6. __________ is this T-shirt? — It's 150 baht.", a: "How much (ถามราคา)" },
        { q: "7. Would you like __________ water?", a: "some (ประโยคเสนอ/ขอร้องอย่างสุภาพ)" }
      ]
    },
    {
      id: "m-u2-quiz",
      unitId: "unit-2",
      type: "quiz",
      title: "แบบทดสอบ: Healthy Food & At the Supermarket",
      description: "ทดสอบความเข้าใจเรื่องคำนามนับได้-นับไม่ได้ การถามราคา และบทสนทนาในร้านอาหาร 5 ข้อพร้อมเฉลยละเอียด",
      duration: "5 ข้อ • 5 นาที",
      tags: ["quiz", "food", "quantifiers", "shopping"],
      createdAt: "2026-05-07",
      questions: [
        {
          question: "Shopkeeper: Can I help you?\nNida: Yes, I'd like two ________ of bread, please.",
          options: ["bottles", "loaves", "bowls", "glasses"],
          answer: 1,
          explanation: "ขนมปังเป็นแถวใช้คำว่า loaf เมื่อเป็น 2 แถวเปลี่ยน f เป็น ves ➔ loaves of bread"
        },
        {
          question: "________ sugar do you put in your tea?",
          options: ["How many", "How old", "How much", "How tall"],
          answer: 2,
          explanation: "sugar (น้ำตาล) เป็นคำนามนับไม่ได้ (Uncountable noun) จึงใช้ How much"
        },
        {
          question: "There aren't ________ mangoes on the tree.",
          options: ["some", "any", "a", "an"],
          answer: 1,
          explanation: "ประโยคปฏิเสธ (aren't) ใช้ any กับคำนามพหูพจน์หรือคำนามนับไม่ได้"
        },
        {
          question: "Customer: How much are these bananas?\nSeller: ________________",
          options: ["They are yellow.", "They are 40 baht.", "It is delicious.", "Yes, I like bananas."],
          answer: 1,
          explanation: "How much are these...? เป็นการถามราคา คำตอบจึงบอกราคา (They are 40 baht.)"
        },
        {
          question: "Which food group is the healthiest for breakfast?",
          options: ["Candy and soda", "Potato chips and cola", "Eggs, whole wheat bread, and milk", "Ice cream and cake"],
          answer: 2,
          explanation: "ไข่ ขนมปังโฮลวีต และนม มีโปรตีน คาร์โบไฮเดรตเชิงซ้อน และแคลเซียมที่ดีต่อสุขภาพ"
        }
      ]
    },

    // ==================== UNIT 3 (4/4) ====================
    {
      id: "m-u3-slides",
      unitId: "unit-3",
      type: "media",
      title: "สไลด์สอน: Giving Directions (การถามและบอกเส้นทาง)",
      description: "เรียนรู้คำบุพบทบอกตำแหน่ง (next to, opposite, between) และสำนวนบอกทางสำหรับขึ้นจอสอนในห้องเรียน",
      duration: "4 สไลด์ • 12 นาที",
      tags: ["directions", "places", "prepositions", "สไลด์"],
      createdAt: "2026-05-09",
      mediaUrl: "",
      slides: [
        {
          heading: "Asking for Directions (การถามทางอย่างสุภาพ)",
          content: "เริ่มต้นด้วยคำว่า 'Excuse me' เสมอ เพื่อความสุภาพ:\n\n• Excuse me, where is the post office?\n• Excuse me, how can I get to the hospital?\n• Is there a bank near here?",
          exampleEn: "Excuse me, how can I get to the museum?"
        },
        {
          heading: "Giving Directions (สำนวนบอกเส้นทางหลัก)",
          content: "⬆️ Go straight ahead. = เดินตรงไปข้างหน้า\n⬅️ Turn left at the corner. = เลี้ยวซ้ายที่หัวมุม\n➡️ Turn right at the traffic lights. = เลี้ยวขวาที่ไฟแดง\n🚶 Cross the street. = ข้ามถนน\n📍 It's on your left / right. = อยู่ทางซ้าย / ขวาของคุณ",
          exampleEn: "Go straight and turn left at the traffic lights."
        },
        {
          heading: "Prepositions of Place (คำบุพบทบอกตำแหน่ง)",
          content: "• next to = ถัดจาก / ติดกับ\n• opposite / across from = ตรงข้ามกับ\n• between A and B = อยู่ระหว่าง A และ B\n• behind = ข้างหลัง\n• in front of = ข้างหน้า\n• on the corner of = ตรงหัวมุมถนน",
          exampleEn: "The library is between the school and the park."
        },
        {
          heading: "กิจกรรมฝึกบอกทาง (Mini Role-play)",
          content: "Tourist: Excuse me, where is the police station?\nStudent: Go straight along Main Street. Turn right at the bakery. The police station is opposite the hospital.\nTourist: Thank you very much!\nStudent: You're welcome!",
          exampleEn: "The police station is opposite the hospital."
        }
      ]
    },
    {
      id: "m-u3-flashcards",
      unitId: "unit-3",
      type: "flashcard",
      title: "บัตรคำศัพท์: สถานที่รอบเมืองและทิศทาง (Around Town)",
      description: "คำศัพท์สถานที่สำคัญรอบเมืองและคำบอกทิศทางที่ออกสอบบ่อย พร้อมเสียงอ่านและเกมจับคู่",
      duration: "8 คำศัพท์ + เกมจับคู่",
      tags: ["places", "directions", "town", "flashcards"],
      createdAt: "2026-05-10",
      cards: [
        { word: "post office", phonetic: "(n.) โพสท์ ออฟ-ฟิส", meaning: "ที่ทำการไปรษณีย์", example: "I send a letter at the post office.", emoji: "📮" },
        { word: "hospital", phonetic: "(n.) ฮอส-พิ-เทิล", meaning: "โรงพยาบาล", example: "Doctors and nurses work in a hospital.", emoji: "🏥" },
        { word: "library", phonetic: "(n.) ไล-บระ-รี", meaning: "ห้องสมุด", example: "We read books quietly in the library.", emoji: "🏛️" },
        { word: "museum", phonetic: "(n.) มิว-เซียม", meaning: "พิพิธภัณฑ์", example: "We saw dinosaur bones at the museum.", emoji: "🦕" },
        { word: "turn left", phonetic: "(v.) เทิร์น เลฟท์", meaning: "เลี้ยวซ้าย", example: "Turn left at the corner.", emoji: "⬅️" },
        { word: "go straight", phonetic: "(v.) โก สเตรท", meaning: "ตรงไป", example: "Go straight for two blocks.", emoji: "⬆️" },
        { word: "opposite", phonetic: "(prep.) ออพ-พะ-ซิท", meaning: "ตรงข้าม", example: "The park is opposite the school.", emoji: "↔️" },
        { word: "between", phonetic: "(prep.) บิ-ทวีน", meaning: "ระหว่าง (2 สิ่ง)", example: "The bank is between the cafe and the hotel.", emoji: "📍" }
      ]
    },
    {
      id: "m-u3-worksheet",
      unitId: "unit-3",
      type: "worksheet",
      title: "ใบงานที่ 3: Places in Town & Giving Directions",
      description: "แบบฝึกหัดจับคู่สถานที่กับกิจกรรมและเติมคำบอกตำแหน่ง (next to, between, opposite) พร้อมพิมพ์ A4",
      duration: "7 ข้อ • พิมพ์ A4 ได้",
      tags: ["worksheet", "places", "directions", "prepositions"],
      createdAt: "2026-05-11",
      instructions: "Complete the sentences with the correct place or direction word. (เติมชื่อสถานที่หรือคำบอกตำแหน่งให้ถูกต้อง)",
      passage: "🗺️ Map Clues: On Sunny Road, the Library is between the School and the Park. The Hospital is opposite the Park. Next to the Hospital is a Bakery.",
      items: [
        { q: "1. You can borrow books and study quietly at the __________.", a: "library" },
        { q: "2. If you want to mail a postcard, go to the __________.", a: "post office" },
        { q: "3. (ดูข้อมูลแผนที่) The Library is __________ the School and the Park.", a: "between" },
        { q: "4. (ดูข้อมูลแผนที่) The Hospital is __________ the Park.", a: "opposite / across from" },
        { q: "5. (ดูข้อมูลแผนที่) The Bakery is __________ the Hospital.", a: "next to" },
        { q: "6. Walk ahead without turning = Go __________.", a: "straight" },
        { q: "7. Excuse me, __________ can I get to the museum?", a: "how" }
      ]
    },
    {
      id: "m-u3-quiz",
      unitId: "unit-3",
      type: "quiz",
      title: "แบบทดสอบ: Around Town & Giving Directions",
      description: "ทดสอบการถาม-บอกเส้นทาง คำบุพบทบอกตำแหน่ง และสถานที่รอบเมือง 5 ข้อพร้อมเฉลยละเอียด",
      duration: "5 ข้อ • 5 นาที",
      tags: ["quiz", "directions", "places", "prepositions"],
      createdAt: "2026-05-11",
      questions: [
        {
          question: "Where do you go when you want to see ancient statues and dinosaur fossils?",
          options: ["A bakery", "A museum", "A post office", "A bank"],
          answer: 1,
          explanation: "museum (พิพิธภัณฑ์) เป็นสถานที่จัดแสดงวัตถุโบราณและฟอสซิลไดโนเสาร์"
        },
        {
          question: "The bank is ________ the cafe and the bookshop.",
          options: ["between", "under", "on", "into"],
          answer: 0,
          explanation: "มีสถานที่ 2 แห่งเชื่อมด้วย and (the cafe and the bookshop) ใช้ between = อยู่ระหว่าง"
        },
        {
          question: "Tourist: Excuse me, how can I get to the train station?\nStudent: ________________",
          options: ["I like trains.", "Go straight and turn right at the corner.", "It's 9 o'clock.", "You're welcome."],
          answer: 1,
          explanation: "คำถาม how can I get to...? เป็นการถามทาง คำตอบจึงเป็นการบอกเส้นทาง"
        },
        {
          question: "Wait for the green light and use the zebra crossing to ________ the street safely.",
          options: ["fly", "cross", "sleep", "drink"],
          answer: 1,
          explanation: "cross the street แปลว่า ข้ามถนน โดยใช้ทางม้าลาย (zebra crossing)"
        },
        {
          question: "Tourist: Thank you very much for your help!\nStudent: ________________",
          options: ["Goodbye!", "I'm sorry.", "You're welcome.", "Turn left."],
          answer: 2,
          explanation: "เมื่อมีคนกล่าวขอบคุณ (Thank you) เราตอบรับอย่างสุภาพว่า You're welcome. (ด้วยความยินดี)"
        }
      ]
    },

    // ==================== UNIT 4 (4/4) ====================
    {
      id: "m-u4-slides",
      unitId: "unit-4",
      type: "media",
      title: "สไลด์สอน: Past Simple Tense & Holiday Stories",
      description: "สรุปการใช้ Past Simple Tense กริยาเติม -ed และกริยาเปลี่ยนรูป (V2) พร้อมตัวอย่างเล่าเรื่องทริปวันหยุด",
      duration: "4 สไลด์ • 12 นาที",
      tags: ["past simple", "holidays", "grammar", "สไลด์"],
      createdAt: "2026-05-12",
      mediaUrl: "",
      slides: [
        {
          heading: "Past Simple Tense คืออะไร?",
          content: "ใช้เล่าเหตุการณ์ที่เกิดขึ้นและ 'จบลงไปแล้วในอดีต'\n\n🕒 คำบอกเวลาที่เจอบ่อย (Time Expressions):\n• yesterday (เมื่อวานนี้)\n• last weekend / last summer / last year (...ที่แล้ว)\n• two days ago (2 วันที่แล้ว)",
          exampleEn: "Last summer, my family went to Phuket."
        },
        {
          heading: "กริยาช่อง 2 มี 2 แบบ (Regular & Irregular)",
          content: "1. กริยาปกติ (Regular Verbs) เติม -ed ท้ายคำ\n   • visit ➔ visited  |  play ➔ played  |  watch ➔ watched\n\n2. กริยาอปกติ (Irregular Verbs) เปลี่ยนรูปคำ!\n   • go ➔ went  |  eat ➔ ate  |  swim ➔ swam  |  take ➔ took\n   • see ➔ saw  |  buy ➔ bought  |  is/am ➔ was  |  are ➔ were",
          exampleEn: "We swam in the sea and ate seafood."
        },
        {
          heading: "ประโยคปฏิเสธและคำถามในอดีต (Did / Didn't)",
          content: "• ปฏิเสธ: Subject + didn't + Verb 1 (รูปเดิม!)\n  ➔ She didn't go to the beach yesterday.\n\n• คำถาม: Did + Subject + Verb 1 (รูปเดิม!)?\n  ➔ Did you have fun? — Yes, I did. / No, I didn't.",
          exampleEn: "Did you take many photos on your holiday?"
        },
        {
          heading: "ฝึกเล่าเรื่องวันหยุด (My Holiday Postcard)",
          content: "Dear Mint,\nLast weekend, I went to Hua Hin with my family. The weather was sunny and warm. I swam in the blue sea and built a big sandcastle. I bought a cute keychain for you too!\nSee you at school,\nPloy",
          exampleEn: "The weather was sunny and warm."
        }
      ]
    },
    {
      id: "m-u4-worksheet",
      unitId: "unit-4",
      type: "worksheet",
      title: "ใบงานที่ 4: Past Simple Tense (วันหยุดที่ผ่านมา)",
      description: "แบบฝึกหัดเปลี่ยนคำกริยาเป็นช่อง 2 (Regular & Irregular Verbs) และแต่งประโยคเล่าเรื่องวันหยุดที่ผ่านมา",
      duration: "8 ข้อ • พิมพ์ A4 ได้",
      tags: ["past simple", "verb 2", "holidays", "worksheet"],
      createdAt: "2026-05-12",
      instructions: "Change the verbs in brackets into Past Simple Tense (Verb 2). (เปลี่ยนคำกริยาในวงเล็บเป็นอดีตกาล ช่องที่ 2)",
      passage: "💡 Remember: คำบอกเวลาในอดีต เช่น yesterday (เมื่อวาน), last week (สัปดาห์ที่แล้ว), last summer (ฤดูร้อนที่แล้ว), two days ago (2 วันที่แล้ว)",
      items: [
        { q: "1. Last weekend, my family __________ (go) to Hua Hin.", a: "went" },
        { q: "2. We __________ (swim) in the sea and built sandcastles.", a: "swam" },
        { q: "3. I __________ (eat) delicious grilled shrimp at the beach.", a: "ate" },
        { q: "4. My dad __________ (take) many photos of the sunset.", a: "took" },
        { q: "5. They __________ (visit) Chiang Mai last winter.", a: "visited" },
        { q: "6. She __________ (not / buy) any souvenirs yesterday.", a: "did not buy / didn't buy" },
        { q: "7. __________ (Do / Did) you enjoy your holiday?", a: "Did" },
        { q: "8. We __________ (be) very happy on our trip!", a: "were" }
      ]
    },
    {
      id: "m-u4-flashcards",
      unitId: "unit-4",
      type: "flashcard",
      title: "บัตรคำศัพท์: Irregular Verbs ที่ ป.6 ต้องจำ! (V1 ➔ V2)",
      description: "รวมกริยาอปกติ (Irregular Verbs) เปลี่ยนรูปช่อง 1 เป็นช่อง 2 ที่ออกสอบ ป.6 และ O-NET บ่อยที่สุด",
      duration: "8 คู่คำกริยา + เกมจับคู่",
      tags: ["irregular verbs", "past simple", "grammar", "flashcards"],
      createdAt: "2026-05-13",
      cards: [
        { word: "go ➔ went", phonetic: "โก ➔ เวนท์", meaning: "ไป", example: "We went to the zoo yesterday.", emoji: "🚌" },
        { word: "eat ➔ ate", phonetic: "อีท ➔ เอท", meaning: "กิน / รับประทาน", example: "He ate fried rice for lunch.", emoji: "🍽️" },
        { word: "see ➔ saw", phonetic: "ซี ➔ ซอว์", meaning: "เห็น / ดู", example: "I saw a rainbow after the rain.", emoji: "🌈" },
        { word: "buy ➔ bought", phonetic: "บาย ➔ บอท", meaning: "ซื้อ", example: "She bought a souvenir for her friend.", emoji: "🛍️" },
        { word: "take ➔ took", phonetic: "เทค ➔ ทุค", meaning: "ถ่าย(รูป) / พาไป", example: "They took a lot of photos.", emoji: "📷" },
        { word: "swim ➔ swam", phonetic: "สวิม ➔ สแวม", meaning: "ว่ายน้ำ", example: "The children swam in the pool.", emoji: "🏊" },
        { word: "write ➔ wrote", phonetic: "ไรท์ ➔ โรท", meaning: "เขียน", example: "Tom wrote a postcard to his grandma.", emoji: "✉️" },
        { word: "drink ➔ drank", phonetic: "ดริงค์ ➔ แดรงค์", meaning: "ดื่ม", example: "We drank coconut water on the beach.", emoji: "🥥" }
      ]
    },
    {
      id: "m-u4-quiz",
      unitId: "unit-4",
      type: "quiz",
      title: "แบบทดสอบ: Travel & Past Simple Tense",
      description: "ทดสอบการใช้กริยาช่อง 2 (Regular/Irregular Verbs), Did/Didn't และคำศัพท์การท่องเที่ยว 5 ข้อ",
      duration: "5 ข้อ • 5 นาที",
      tags: ["quiz", "past simple", "travel", "irregular verbs"],
      createdAt: "2026-05-14",
      questions: [
        {
          question: "Last Sunday, we ________ to the beach and played volleyball.",
          options: ["go", "goes", "went", "going"],
          answer: 2,
          explanation: "มีคำว่า Last Sunday (อดีต) กริยาช่อง 2 ของ go คือ went"
        },
        {
          question: "Did Pim ________ any souvenirs from Chiang Mai?",
          options: ["buy", "bought", "buys", "buying"],
          answer: 0,
          explanation: "เมื่อมี Did ในประโยคคำถาม กริยาแท้ต้องกลับเป็นช่อง 1 รูปเดิม (buy)"
        },
        {
          question: "The weather ________ very sunny and hot yesterday.",
          options: ["is", "are", "was", "were"],
          answer: 2,
          explanation: "The weather เป็นเอกพจน์ และมีคำว่า yesterday (อดีต) จึงใช้ was"
        },
        {
          question: "I ________ a funny dolphin show at the aquarium two days ago.",
          options: ["see", "saw", "seen", "seeing"],
          answer: 1,
          explanation: "two days ago เป็นอดีต กริยาช่อง 2 ของ see คือ saw"
        },
        {
          question: "A: How was your trip to Krabi?\nB: ________________",
          options: ["It was wonderful!", "I go by plane.", "Tomorrow morning.", "Yes, I am."],
          answer: 0,
          explanation: "How was your trip? ถามความรู้สึกว่าทริปเป็นอย่างไร คำตอบคือ It was wonderful! (ยอดเยี่ยมมาก)"
        }
      ]
    },

    // ==================== UNIT 5 (4/4) ====================
    {
      id: "m-u5-slides",
      unitId: "unit-5",
      type: "media",
      title: "สไลด์สอน: Dream Jobs & Future Plans (be going to)",
      description: "การพูดถึงอาชีพในฝันและแผนการในอนาคตด้วยโครงสร้าง 'I want to be a/an...' และ 'be going to'",
      duration: "4 สไลด์ • 12 นาที",
      tags: ["occupations", "future", "be going to", "สไลด์"],
      createdAt: "2026-05-15",
      mediaUrl: "",
      slides: [
        {
          heading: "Talking About Dream Jobs (ถาม-ตอบอาชีพในฝัน)",
          content: "❓ คำถาม: What do you want to be when you grow up?\n(โตขึ้นเธออยากเป็นอะไร?)\n\n💬 คำตอบ: I want to be a/an [อาชีพ] because I want to [เหตุผล].\n• ใช้ 'a' หน้าเสียงพยัญชนะ เช่น a doctor, a pilot, a chef\n• ใช้ 'an' หน้าเสียงสระ (a, e, i, o, u) เช่น an engineer, an artist, an astronaut",
          exampleEn: "I want to be a vet because I love animals."
        },
        {
          heading: "Jobs & Workplaces (อาชีพและสถานที่ทำงาน)",
          content: "• Chef (เชฟ) ➔ cooks food in a restaurant\n• Vet (สัตวแพทย์) ➔ takes care of sick animals at an animal clinic\n• Pilot (นักบิน) ➔ flies an airplane at the airport\n• Engineer (วิศวกร) ➔ designs buildings or machines\n• Programmer (โปรแกรมเมอร์) ➔ writes computer code and apps",
          exampleEn: "A pilot flies an airplane."
        },
        {
          heading: "Future Plans ด้วย 'be going to'",
          content: "ใช้พูดถึงแผนการที่ตั้งใจไว้แล้วว่าจะทำในอนาคต:\n\nโครงสร้าง: Subject + is / am / are + going to + Verb 1\n• I am going to study hard.\n• She is going to visit Japan next year.\n• They are going to play football tomorrow.",
          exampleEn: "I am going to practice English every day."
        },
        {
          heading: "เปรียบเทียบ will กับ be going to",
          content: "• be going to = วางแผน/ตั้งใจไว้ล่วงหน้าแล้ว\n  (I'm going to bake a cake this Sunday.)\n• will = ตัดสินใจทันทีตอนนั้น หรือคาดเดา\n  (It's hot here. I will open the window.)\n\nจำง่ายๆ: ทั้ง will และ going to ตามด้วยกริยาช่อง 1 ไม่ผันเสมอ!",
          exampleEn: "I think it will rain this afternoon."
        }
      ]
    },
    {
      id: "m-u5-flashcards",
      unitId: "unit-5",
      type: "flashcard",
      title: "บัตรคำศัพท์: อาชีพในฝัน (Dream Occupations)",
      description: "คำศัพท์อาชีพยอดนิยมพร้อมคำอ่าน ความหมาย และประโยคอธิบายหน้าที่ของแต่ละอาชีพ",
      duration: "8 คำศัพท์ + เกมจับคู่",
      tags: ["jobs", "occupations", "future", "flashcards"],
      createdAt: "2026-05-16",
      cards: [
        { word: "engineer", phonetic: "(n.) เอน-จิ-เนียร์", meaning: "วิศวกร", example: "An engineer builds bridges and robots.", emoji: "👷" },
        { word: "astronaut", phonetic: "(n.) แอส-ทระ-นอท", meaning: "นักบินอวกาศ", example: "An astronaut travels into space.", emoji: "👩‍🚀" },
        { word: "veterinarian (vet)", phonetic: "(n.) เวท", meaning: "สัตวแพทย์", example: "A vet helps sick dogs and cats.", emoji: "🐾" },
        { word: "pilot", phonetic: "(n.) ไพ-เลิท", meaning: "นักบิน", example: "My uncle is a pilot.", emoji: "✈️" },
        { word: "chef", phonetic: "(n.) เชฟ", meaning: "พ่อครัว / แม่ครัว", example: "The chef makes tasty Thai food.", emoji: "👨‍🍳" },
        { word: "artist", phonetic: "(n.) อาร์-ทิสท์", meaning: "ศิลปิน / นักวาดรูป", example: "She wants to be an artist.", emoji: "🎨" },
        { word: "scientist", phonetic: "(n.) ไซ-เอิน-ทิสท์", meaning: "นักวิทยาศาสตร์", example: "A scientist does experiments in a lab.", emoji: "🔬" },
        { word: "firefighter", phonetic: "(n.) ไฟ-เออะ-ไฟ-เทอะ", meaning: "นักดับเพลิง", example: "Firefighters put out fires bravely.", emoji: "🚒" }
      ]
    },
    {
      id: "m-u5-worksheet",
      unitId: "unit-5",
      type: "worksheet",
      title: "ใบงานที่ 5: My Dream Job & Future Plans (be going to)",
      description: "แบบฝึกหัดจับคู่อาชีพกับหน้าที่และเติมประโยคแผนในอนาคตด้วย is/am/are going to พร้อมพิมพ์ A4",
      duration: "7 ข้อ • พิมพ์ A4 ได้",
      tags: ["worksheet", "jobs", "be going to", "future"],
      createdAt: "2026-05-17",
      instructions: "Fill in the blanks with the correct job or 'is/am/are going to'. (เติมชื่ออาชีพหรือโครงสร้างอนาคตให้ถูกต้อง)",
      items: [
        { q: "1. A person who cooks delicious food in a restaurant is a __________.", a: "chef" },
        { q: "2. A doctor who takes care of sick animals is a __________.", a: "vet / veterinarian" },
        { q: "3. An __________ travels into outer space in a rocket.", a: "astronaut" },
        { q: "4. I __________ (be going to) study hard for the English test tomorrow.", a: "am going to" },
        { q: "5. She __________ (be going to) visit her grandparents next weekend.", a: "is going to" },
        { q: "6. They __________ (be going to) play badminton this evening.", a: "are going to" },
        { q: "7. (เขียนคำตอบของตนเอง) When I grow up, I want to be a/an __________ because __________.", a: "ตัวอย่าง: I want to be a vet because I love animals." }
      ]
    },
    {
      id: "m-u5-quiz",
      unitId: "unit-5",
      type: "quiz",
      title: "แบบทดสอบ: Dream Jobs & Future Plans",
      description: "ทดสอบคำศัพท์อาชีพ การใช้ a/an และโครงสร้างประโยคอนาคต be going to / will จำนวน 5 ข้อ",
      duration: "5 ข้อ • 5 นาที",
      tags: ["quiz", "jobs", "occupations", "future"],
      createdAt: "2026-05-17",
      questions: [
        {
          question: "Who puts out fires and rescues people from burning buildings?",
          options: ["A chef", "A firefighter", "A singer", "A farmer"],
          answer: 1,
          explanation: "firefighter คือ นักดับเพลิง มีหน้าที่ดับไฟ (put out fires) และช่วยเหลือผู้คน"
        },
        {
          question: "My brother wants to be ________ engineer.",
          options: ["a", "an", "the", "some"],
          answer: 1,
          explanation: "engineer ขึ้นต้นด้วยเสียงสระ (e) จึงใช้ article 'an'"
        },
        {
          question: "We ________ going to have a school picnic next Friday.",
          options: ["is", "am", "are", "was"],
          answer: 2,
          explanation: "ประธาน We เป็นพหูพจน์ ใช้คู่กับ are ➔ We are going to..."
        },
        {
          question: "A: What do you want to be in the future?\nB: ________________",
          options: ["I want to be a pilot.", "I went to the airport.", "I am twelve years old.", "It's sunny today."],
          answer: 0,
          explanation: "What do you want to be...? ถามอาชีพที่อยากเป็นในอนาคต ตอบว่า I want to be a pilot."
        },
        {
          question: "Tomorrow, Mint will ________ a birthday cake for her mother.",
          options: ["bakes", "baked", "bake", "baking"],
          answer: 2,
          explanation: "หลัง will ต้องตามด้วยกริยาช่อง 1 รูปเดิมไม่ผัน (bake)"
        }
      ]
    },

    // ==================== UNIT 6 & O-NET (4/4) ====================
    {
      id: "m-u6-slides",
      unitId: "unit-6",
      type: "media",
      title: "สไลด์สอน: Save Our Earth (3Rs) & เทคนิคพิชิต O-NET ป.6",
      description: "สรุปหลักรักษ์โลก 3Rs (Reduce, Reuse, Recycle), การใช้ Should/Shouldn't และเคล็ดลับทำข้อสอบ O-NET ป.6",
      duration: "4 สไลด์ • 15 นาที",
      tags: ["o-net", "environment", "3Rs", "สไลด์"],
      createdAt: "2026-05-18",
      mediaUrl: "",
      slides: [
        {
          heading: "หลักการรักษ์โลก 3Rs (Save Our Earth)",
          content: "🌿 REDUCE (ลดการใช้): ปิดไฟ ปิดน้ำเมื่อไม่ใช้ ลดถุงพลาสติก\n🛍️ REUSE (นำกลับมาใช้ซ้ำ): ใช้ถุงผ้า กระบอกน้ำส่วนตัว ใช้กระดาษทั้งสองหน้า\n♻️ RECYCLE (แปรรูปนำกลับมาใช้ใหม่): แยกขยะขวดพลาสติก แก้ว กระดาษ",
          exampleEn: "We should reduce, reuse, and recycle every day."
        },
        {
          heading: "การใช้ Should / Shouldn't เพื่อให้คำแนะนำ",
          content: "• Should + Verb 1 = ควรทำ\n  ➔ We should plant more trees.\n  ➔ You should turn off the lights.\n\n• Shouldn't + Verb 1 = ไม่ควรทำ\n  ➔ We shouldn't throw trash into the river.\n  ➔ You shouldn't waste water.",
          exampleEn: "We shouldn't throw plastic trash into the river."
        },
        {
          heading: "เทคนิคทำข้อสอบ O-NET ป.6 (ป้ายและบทสนทนา)",
          content: "1. อ่านคำสำคัญในป้าย (Signs): NO / DO NOT = ห้าม, KEEP QUIET = เงียบ, PULL/PUSH = ดึง/ผลัก\n2. บทสนทนา (Conversation): ดูความสุภาพและบริบท\n   • ขอบคุณ (Thank you) ➔ You're welcome.\n   • ขอโทษ (I'm sorry) ➔ Never mind. / That's okay.\n   • อวยพร (Happy Birthday / Good luck) ➔ Thank you!",
          exampleEn: "Do not feed the animals at the zoo."
        },
        {
          heading: "เช็กลิสต์ก่อนเข้าห้องสอบ O-NET ภาษาอังกฤษ ป.6",
          content: "✅ ดูคำบอกเวลา (Time Clues) ทุกครั้ง: every day (V1), now (is/am/are + V-ing), yesterday/last (V2), tomorrow (will/going to)\n✅ ดูเครื่องหมายวรรคตอน (Capital letter ตัวใหญ่ขึ้นต้นประโยคและชื่อเฉพาะ, ? ท้ายคำถาม, . ท้ายบอกเล่า)\n✅ อ่านคำถาม (Wh-Questions: Who, What, Where, When, Why, How) ก่อนอ่านบทความ!",
          exampleEn: "Good luck on your O-NET exam!"
        }
      ]
    },
    {
      id: "m-u6-flashcards",
      unitId: "unit-6",
      type: "flashcard",
      title: "บัตรคำศัพท์: รักษ์โลก & คำศัพท์ O-NET ป.6 ออกสอบบ่อย",
      description: "คำศัพท์สิ่งแวดล้อม ป้ายประกาศ และคำศัพท์สำคัญที่เจอบ่อยในข้อสอบ O-NET ป.6 พร้อมเสียงอ่านและเกมจับคู่",
      duration: "8 คำศัพท์ + เกมจับคู่",
      tags: ["o-net", "environment", "vocabulary", "flashcards"],
      createdAt: "2026-05-18",
      cards: [
        { word: "recycle", phonetic: "(v.) รี-ไซ-เคิล", meaning: "นำกลับมาแปรรูปใช้ใหม่", example: "We recycle plastic bottles at school.", emoji: "♻️" },
        { word: "reduce", phonetic: "(v.) รี-ดิวซ์", meaning: "ลดการใช้", example: "Reduce electricity by turning off fans.", emoji: "💡" },
        { word: "cloth bag", phonetic: "(n.) คลอธ แบ็ก", meaning: "ถุงผ้า", example: "Bring a cloth bag when you go shopping.", emoji: "🛍️" },
        { word: "plant trees", phonetic: "(v.) แพลนท์ ทรีส", meaning: "ปลูกต้นไม้", example: "Students plant trees on Environment Day.", emoji: "🌳" },
        { word: "save water", phonetic: "(v.) เซฟ วอ-เทอะ", meaning: "ประหยัดน้ำ", example: "Turn off the tap to save water.", emoji: "💧" },
        { word: "keep quiet", phonetic: "(v.) คีพ ไคว-เอท", meaning: "กรุณางดใช้เสียง / เงียบ", example: "Please keep quiet in the library.", emoji: "🤫" },
        { word: "dangerous", phonetic: "(adj.) เดน-เจอ-รัส", meaning: "อันตราย", example: "Do not touch! It is dangerous.", emoji: "⚠️" },
        { word: "congratulations", phonetic: "(n.) คอน-แกรท-ชู-เล-ชันส์", meaning: "ขอแสดงความยินดี", example: "Congratulations! You won the first prize.", emoji: "🏆" }
      ]
    },
    {
      id: "m-u6-onet-quiz",
      unitId: "unit-6",
      type: "quiz",
      title: "ติวเข้ม O-NET ภาษาอังกฤษ ป.6 (ชุดที่ 1: ครบทุกทักษะ)",
      description: "แนวข้อสอบ O-NET ป.6 ครอบคลุมบทสนทนา ป้ายสัญลักษณ์ ไวยากรณ์ และการอ่านจับใจความ พร้อมคำอธิบายเฉลยทุกข้อ",
      duration: "8 ข้อ • 10 นาที",
      tags: ["o-net", "ป.6", "quiz", "conversation", "grammar"],
      createdAt: "2026-05-18",
      questions: [
        {
          question: "At school, Mali accidentally steps on Dan's foot.\nMali: Oh, I'm so sorry!\nDan: ________________",
          options: ["You're welcome.", "Never mind. It's okay.", "Nice to meet you.", "Congratulations!"],
          answer: 1,
          explanation: "เมื่อมีคนกล่าวขอโทษ (I'm so sorry) การตอบกลับว่าไม่เป็นไรคือ Never mind. / That's okay."
        },
        {
          question: "You see a sign at the zoo: 'DO NOT FEED THE ANIMALS'.\nWhat does this sign mean?",
          options: [
            "You should touch the animals.",
            "You must not give food to the animals.",
            "You can take photos with the animals.",
            "You must buy food for the animals."
          ],
          answer: 1,
          explanation: "feed แปลว่า ให้อาหาร ดังนั้น Do not feed the animals หมายถึง ห้ามให้อาหารสัตว์"
        },
        {
          question: "To help save our Earth, we should ________ plastic bottles and paper.",
          options: ["throw away", "burn", "recycle", "waste"],
          answer: 2,
          explanation: "การช่วยรักษ์โลกตามหลัก 3R (Reduce, Reuse, Recycle) ควรนำขวดพลาสติกและกระดาษกลับมา recycle"
        },
        {
          question: "Yesterday, Mali ________ her grandmother in Nakhon Pathom.",
          options: ["visit", "visits", "visited", "is visiting"],
          answer: 2,
          explanation: "มีคำบอกเวลาในอดีต 'Yesterday' (เมื่อวาน) ต้องใช้ Past Simple Tense (Verb 2) คือ visited"
        },
        {
          question: "Teacher: Why are you late today, Somchai?\nSomchai: ________________",
          options: [
            "I like playing games.",
            "Because there was a heavy traffic jam.",
            "I go to school at 7 o'clock.",
            "Yes, I am a student."
          ],
          answer: 1,
          explanation: "คำถามขึ้นต้นด้วย Why (ทำไม) มักตอบด้วยเหตุผลที่ขึ้นต้นด้วย Because..."
        },
        {
          question: "Look at the dark clouds in the sky! It ________ rain soon.",
          options: ["is going to", "was", "did", "went"],
          answer: 0,
          explanation: "ใช้ be going to เมื่อมีหลักฐานชัดเจนในปัจจุบัน (เมฆดำเต็มท้องฟ้า) ว่าจะเกิดอะไรขึ้นในไม่ช้า"
        },
        {
          question: "Which sentence has the CORRECT punctuation and capitalization?",
          options: [
            "my friend lives in bangkok.",
            "My friend lives in Bangkok?",
            "My friend lives in Bangkok.",
            "my Friend lives in Bangkok."
          ],
          answer: 2,
          explanation: "ขึ้นต้นประโยคด้วยตัวพิมพ์ใหญ่ (My) ชื่อเมืองเฉพาะใช้ตัวพิมพ์ใหญ่ (Bangkok) และประโยคบอกเล่าจบด้วยจุด (.)"
        },
        {
          question: "Read the notice:\n'English Camp for P.6 Students • Saturday, 15 August • 9:00 a.m. - 3:00 p.m. • School Hall'\nWhere will the English Camp take place?",
          options: ["At the library", "On Sunday", "At the School Hall", "In the morning only"],
          answer: 2,
          explanation: "คำถามถามว่า Where (ที่ไหน) จากประกาศระบุสถานที่ไว้ว่า School Hall (หอประชุมโรงเรียน)"
        }
      ]
    },
    {
      id: "m-u6-worksheet",
      unitId: "unit-6",
      type: "worksheet",
      title: "ใบงานที่ 6: Save Our Earth (3Rs: Reduce, Reuse, Recycle)",
      description: "ใบงานรักษ์โลก ป.6 ฝึกอ่านบทความสั้นและแยกประเภทการช่วยลดโลกร้อนด้วย Should / Shouldn't พร้อมพิมพ์แจกได้ทันที",
      duration: "6 ข้อ • พิมพ์ A4 ได้",
      tags: ["environment", "3Rs", "should", "worksheet"],
      createdAt: "2026-05-19",
      instructions: "Complete the sentences with 'should' or 'shouldn't' to protect our planet. (เติม should = ควร หรือ shouldn't = ไม่ควร)",
      passage: "🌱 The 3Rs Rule: REDUCE means using less water and electricity. REUSE means using cloth bags and water bottles again. RECYCLE means turning old paper, glass, and plastic into new things!",
      items: [
        { q: "1. We __________ turn off the lights when we leave the classroom.", a: "should" },
        { q: "2. We __________ throw plastic trash into the river.", a: "shouldn't" },
        { q: "3. Students __________ bring a reusable cloth bag when shopping.", a: "should" },
        { q: "4. You __________ leave the water tap running while brushing your teeth.", a: "shouldn't" },
        { q: "5. We __________ plant more trees around our school.", a: "should" },
        { q: "6. (ตอบคำถามสั้น) Write ONE thing you can do at school to save the Earth:", a: "ตัวอย่างคำตอบ: I can separate trash / turn off fans / reuse paper." }
      ]
    }
  ]
};
