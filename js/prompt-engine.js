/* ============================================
   CineAI 提示词优化引擎 v2
   底层逻辑：抽象→具体映射 + 意图检测 + 负面词替换
   ============================================ */

// ===== 抽象词→具体描述映射库 (125+条目) =====
var ABSTRACT_MAP = {
  // === 人物外观 (20+) ===
  '美女': 'young woman, symmetrical facial features, clear skin, elegant appearance',
  '帅哥': 'handsome young man, sharp jawline, well-groomed, masculine features',
  '小孩': 'child, youthful face, innocent expression, soft features, small stature',
  '老人': 'elderly person, wrinkled skin, silver hair, wise expression, aged hands',
  '可爱': 'cute, round face, big bright eyes, soft features, cheerful demeanor',
  '漂亮': 'beautiful, delicate features, glowing skin, photogenic, graceful',
  '帅气': 'handsome, chiseled features, confident gaze, stylish appearance',
  '酷': 'cool attitude, edgy style, confident posture, intense gaze, trendy',
  '性感': 'alluring, confident pose, elegant curves, seductive gaze, glamorous',
  '优雅': 'elegant, poised, refined posture, sophisticated look, graceful movement',
  '强壮': 'muscular build, strong physique, athletic body, powerful stance',
  '苗条': 'slim figure, slender build, graceful silhouette, lean physique',
  '长发': 'long flowing hair, silky tresses, hair cascading down shoulders',
  '短发': 'short cropped hair, neat hairstyle, clean cut, modern look',
  '卷发': 'curly hair, wavy locks, voluminous hair, bouncy curls',
  '马尾': 'ponytail hairstyle, hair tied back, sleek look, sporty style',
  '辫子': 'braided hair, plaited hairstyle, intricate braids, ethnic style',
  '胡须': 'facial beard, stubble, well-groomed beard, rugged look',
  '眼镜': 'wearing glasses, framed eyewear, intellectual look, stylish spectacles',
  '纹身': 'tattooed skin, body art, intricate tattoo designs, ink artwork',

  // === 表情 (15+) ===
  '微笑': 'gentle smile, slightly upturned lips, warm expression, friendly',
  '大笑': 'laughing, wide smile, joyful expression, crinkled eyes, delighted',
  '悲伤': 'sad expression, teary eyes, downturned mouth, melancholy, sorrowful',
  '愤怒': 'angry expression, furrowed brows, intense glare, tense jaw, furious',
  '惊讶': 'surprised expression, wide eyes, slightly open mouth, astonished',
  '沉思': 'thoughtful expression, slight frown, distant gaze, contemplative mood',
  '开心': 'happy, beaming smile, bright eyes, radiant expression, joyful',
  '严肃': 'serious expression, straight face, focused gaze, composed demeanor',
  '自信': 'confident expression, steady gaze, slight smirk, self-assured pose',
  '害羞': 'shy expression, looking away slightly, rosy cheeks, timid demeanor',
  '疲惫': 'tired expression, dark circles under eyes, weary look, exhausted',
  '放松': 'relaxed expression, calm demeanor, peaceful look, at ease',
  '专注': 'focused expression, concentrated look, intense gaze, determined',
  '温柔': 'tender expression, soft eyes, gentle smile, warm, caring look',
  '冷酷': 'cold expression, stern face, emotionless gaze, stoic, unyielding',

  // === 场景/环境 (25+) ===
  '森林': 'dense forest, tall trees, dappled sunlight through canopy, mossy ground, wild ferns, woodland',
  '海滩': 'sandy beach, gentle waves, crystal clear water, palm trees, seashells scattered, coastal',
  '城市': 'cityscape, modern architecture, bustling streets, glass buildings, urban environment',
  '乡村': 'countryside, rolling hills, quaint farmhouse, golden wheat fields, rustic charm, pastoral',
  '山脉': 'mountain range, snow-capped peaks, alpine meadows, dramatic clouds, misty valleys, majestic',
  '沙漠': 'desert landscape, golden sand dunes, arid climate, clear blue sky, heat haze, barren',
  '花园': 'flower garden, blooming roses, lavender bushes, manicured hedges, cobblestone path, botanical',
  '室内': 'interior room, cozy atmosphere, warm lighting, comfortable furniture, home decor',
  '街道': 'street scene, cobblestone road, historic buildings, street lamps, storefronts, alleyway',
  '太空': 'outer space, starry nebula, distant galaxies, cosmic dust, celestial glow, universe',
  '海洋': 'deep ocean, crystal clear water, coral reef, marine life, underwater scene, aquatic',
  '瀑布': 'waterfall, cascading water, misty spray, rocky cliff, pool below, natural wonder',
  '河流': 'river, flowing water, gentle stream, riverbank, reflections on water, winding path',
  '湖泊': 'lake, calm water surface, mountain reflection, peaceful waters, shoreline, serene',
  '雪地': 'snowy landscape, white snow cover, winter wonderland, frost, ice crystals, arctic',
  '竹林': 'bamboo forest, tall bamboo stalks, green canopy, dappled light, zen atmosphere, tranquil',
  '寺庙': 'temple, traditional architecture, ancient building, ornate details, spiritual place, shrine',
  '城堡': 'castle, medieval fortress, stone walls, towering spires, royal palace, historic',
  '樱花': 'cherry blossom, pink petals blooming, sakura trees, spring scenery, falling petals',
  '草原': 'grassland, vast prairie, wildflowers, green meadow, open plains, nature landscape',
  '洞穴': 'cave interior, stalactites, underground cavern, rocky walls, mysterious darkness',
  '夜景': 'night scene, city lights, starlit sky, illuminated buildings, twilight, dusk',
  '废墟': 'ancient ruins, crumbling walls, abandoned structure, overgrown with vines, historical',
  '太空站': 'space station, futuristic architecture, orbital habitat, sci-fi, technological',
  '赛博城市': 'cyberpunk city, neon lights, rain-slicked streets, holographic ads, futuristic metropolis',

  // === 光照 (15+) ===
  '暗': 'dim lighting, dramatic shadows, low-key illumination, moody atmosphere, chiaroscuro',
  '亮': 'bright lighting, well-illuminated, high-key, clear visibility, radiant',
  '暖': 'warm lighting, golden tones, amber glow, cozy atmosphere, inviting warmth',
  '冷': 'cool lighting, blue tones, cold atmosphere, clinical feel, icy ambiance',
  '日落': 'golden hour, warm sunset light, long shadows, orange and pink hues, magic hour',
  '日出': 'sunrise, dawn light, soft morning glow, first light, misty morning, fresh day',
  '夜晚': 'night scene, moonlight, city lights, starlit sky, twilight ambiance, nocturnal',
  '阳光': 'sunlight, natural lighting, bright day, sunbeams, warm glow, daytime',
  '柔和': 'soft lighting, diffused light, gentle illumination, smooth shadows, ambient',
  '霓虹': 'neon glow, colorful neon lights, vibrant night lighting, urban nightlife',
  '烛光': 'candlelight, warm flickering glow, intimate lighting, romantic ambiance',
  '背光': 'backlighting, rim light, silhouette effect, dramatic backlight, halo effect',
  '阴天': 'overcast lighting, soft diffused light, cloudy day, muted tones, flat lighting',
  '射灯': 'spotlight, focused beam, stage lighting, dramatic single light source',
  '蓝色时刻': 'blue hour, twilight blue, deep blue sky, city lights beginning to glow',

  // === 风格 (15+) ===
  '写实': 'photorealistic, highly detailed, lifelike textures, sharp focus, 8K UHD, Nikon Z9',
  '卡漫': 'anime style, cel shaded, vibrant colors, manga aesthetic, clean lines, Japanese animation',
  '油画': 'oil painting style, thick brushstrokes, impasto, canvas texture, artistic, Rembrandt lighting',
  '水墨': 'ink wash painting, traditional Chinese art, flowing ink, minimalist, brush strokes, sumi-e',
  '赛博': 'cyberpunk, neon lights, futuristic city, high tech, dark atmosphere, dystopian',
  '蒸汽': 'steampunk, Victorian era, brass machinery, gears and cogs, steam power, retro-futuristic',
  '抽象': 'abstract art, geometric shapes, bold colors, non-representational, modern art, expressionist',
  '素描': 'pencil sketch, monochrome, crosshatching, draftsmanship, graphite, charcoal drawing',
  '水彩': 'watercolor painting, soft washes, translucent colors, paper texture, wet on wet',
  '像素': 'pixel art, 8-bit style, retro gaming, blocky graphics, chunky pixels, nostalgic',
  '3D': '3D render, CGI, octane render, realistic textures, global illumination, ray tracing',
  '插画': 'illustration, vector art, flat design, vibrant colors, digital art, concept art',
  '浮世绘': 'ukiyo-e style, Japanese woodblock print, Hokusai influence, traditional Japanese art',
  '哥特': 'gothic style, dark aesthetic, Victorian gothic, dramatic, ornate, medieval',
  '极简': 'minimalist, clean design, simple composition, negative space, less is more',

  // === 构图 (10+) ===
  '特写': 'close-up shot, tight framing, detailed view, shallow depth of field, macro detail',
  '全景': 'wide angle shot, panoramic view, expansive scene, grand scale, landscape orientation',
  '半身': 'medium shot, waist up framing, balanced composition, classic portrait framing',
  '全身': 'full body shot, head to toe, standing pose, entire figure visible, environmental portrait',
  '俯拍': 'bird\'s eye view, top-down angle, overhead perspective, aerial shot, looking down',
  '仰拍': 'low angle shot, looking up, dramatic perspective, towering effect, heroic angle',
  '第一人称': 'first person view, POV perspective, subjective camera angle, immersive viewpoint',
  '航拍': 'drone shot, aerial photography, bird perspective, high altitude, sweeping view',
  '斜角': 'dutch angle, tilted composition, dynamic frame, unsettling perspective, dramatic tilt',
  '对称': 'symmetrical composition, balanced frame, mirror image, formal symmetry, centered subject',

  // === 服装 (15+) ===
  '连衣裙': 'flowing dress, elegant gown, feminine silhouette, graceful dress',
  '西装': 'tailored suit, formal wear, sharp blazer, professional attire, business suit',
  '旗袍': 'cheongsam dress, traditional Chinese dress, silk fabric, elegant qipao, high collar',
  '汉服': 'hanfu, traditional Chinese clothing, flowing robes, ancient Chinese attire, silk garment',
  '制服': 'uniform, military attire, professional uniform, crisp outfit, formal wear',
  '休闲装': 'casual wear, relaxed outfit, everyday clothing, comfortable style',
  '运动装': 'athletic wear, sportswear, workout gear, activewear, sports outfit',
  '泳装': 'swimsuit, beachwear, bikini, one-piece swimsuit, poolside attire',
  '晚礼服': 'evening gown, formal dress, red carpet attire, glamorous dress, haute couture',
  '皮衣': 'leather jacket, biker style, edgy outerwear, tough look, leather fashion',
  '风衣': 'trench coat, long coat, classic outerwear, elegant coat, belted coat',
  '婚纱': 'wedding dress, bridal gown, white dress, lace details, train, veil',
  '牛仔': 'denim jacket, jeans, casual denim, blue jean fabric, rugged style',
  '毛衣': 'knitted sweater, cozy pullover, wool knit, warm cardigan, cable knit',
  '斗篷': 'flowing cape, dramatic cloak, hooded cape, medieval cloak, superhero cape',

  // === 动作 (10+) ===
  '奔跑': 'running, sprinting, fast motion, dynamic pose, legs in motion, action shot',
  '跳跃': 'jumping, leaping, airborne, dynamic jump, mid-air action, joyful leap',
  '坐着': 'sitting down, seated pose, relaxed sitting, chair pose, resting',
  '站立': 'standing upright, straight posture, full height, standing confidently',
  '跳舞': 'dancing, graceful movement, dance pose, rhythmic motion, ballet, twirling',
  '游泳': 'swimming, in water, freestyle stroke, underwater movement, aquatic motion',
  '飞': 'flying, soaring through air, levitation, floating, airborne, wings spread',
  '走路': 'walking, strolling, casual walk, moving forward, street walk, stepping',
  '躺着': 'lying down, reclining, resting on back, sleeping pose, horizontal position',
  '跪着': 'kneeling, on one knee, respectful pose, kneeling down, submissive posture'
};

// ===== 负面词→替代策略 =====
var NEGATIVE_REPLACEMENTS = {
  '不要人': 'empty, deserted, solitary, no people, abandoned, uninhabited',
  '没有人': 'empty, deserted, solitary, no people, abandoned, uninhabited',
  '不要文字': 'no text, no writing, no typography, clean image without letters',
  '不要水印': 'no watermark, no logo, clean image, without branding marks',
  '不要模糊': 'sharp focus, crisp image, high clarity, well-defined, not blurry',
  '不要暗': 'bright, well-lit, illuminated, luminous, radiant, not dark',
  '简单': 'minimalist, simple composition, clean design, uncluttered, minimal detail',
  '复杂': 'intricate details, complex composition, rich in detail, elaborate design',
  '不要红色': 'without red tones, cool color palette, avoid red hues, blue-green color scheme'
};

// ===== 意图检测 =====
function detectIntent(input) {
  var text = input.toLowerCase();
  var intents = [];
  
  if (text.match(/美女|帅哥|女孩|男孩|男人|女人|人物|肖像|face|portrait|人像/i)) intents.push('portrait');
  if (text.match(/风景|场景|山水|自然|landscape|风景|环境|view/i)) intents.push('scene');
  if (text.match(/和|在|with|in|under|at|together/i)) intents.push('character_scene');
  
  if (intents.length === 0) {
    // 检测主体数量
    var peopleWords = text.match(/人|女|男|孩|者|师|生|家|model|woman|man|girl|boy/gi);
    if (peopleWords && peopleWords.length > 1) intents.push('character_scene');
    else if (peopleWords) intents.push('portrait');
    else intents.push('scene');
  }
  
  return intents[0] || 'character_scene';
}

// ===== 提示词模板系统 =====
var PROMPT_TEMPLATES = {
  'portrait': {
    label: '人物肖像',
    template: '[subject], [expression], wearing [clothing], [hairstyle], [accessories], [lighting], [style], [composition], [quality], [negative_prompt]',
    defaults: {
      clothing: 'elegant outfit', hairstyle: 'styled hair', accessories: '',
      lighting: 'soft studio lighting', style: 'portrait photography',
      composition: 'close-up shot', quality: 'highly detailed, sharp focus, 8K',
      negative_prompt: ''
    }
  },
  'scene': {
    label: '场景风景',
    template: '[environment], [time], [weather], [lighting], [palette], [style], [composition], [quality], [mood], [negative_prompt]',
    defaults: {
      time: 'daytime', weather: 'clear weather', palette: 'natural colors',
      lighting: 'natural sunlight', style: 'photorealistic',
      composition: 'wide angle', quality: 'highly detailed, 8K, cinematic',
      mood: 'serene atmosphere', negative_prompt: ''
    }
  },
  'character_scene': {
    label: '人物+场景',
    template: '[subject], [expression], [action], wearing [clothing], in [environment], [lighting], [style], [composition], [quality], [negative_prompt]',
    defaults: {
      expression: 'natural expression', action: 'standing', clothing: 'casual outfit',
      lighting: 'natural lighting', style: 'cinematic',
      composition: 'medium shot', quality: 'highly detailed, 8K, cinematic lighting',
      negative_prompt: ''
    }
  }
};

var QUALITY_SUFFIXES = [
  'highly detailed', 'sharp focus', '8K resolution',
  'professional photography', 'intricate details',
  'vivid colors', 'perfect composition',
  'award winning', 'breathtaking', 'studio quality'
];

// ===== 核心优化函数 =====
function optimizePrompt(userInput, imageType, options) {
  options = options || {};
  var type = imageType || detectIntent(userInput);
  var template = PROMPT_TEMPLATES[type] || PROMPT_TEMPLATES['character_scene'];
  
  // 1. 处理负面词替换
  var processed = handleNegatives(userInput);
  
  // 2. 提取关键词
  var keywords = extractKeywords(processed.clean);
  
  // 3. 映射抽象词到具体描述
  var concreteParts = mapToConcrete(keywords, options);
  
  // 4. 合并负面处理结果
  if (processed.negative) concreteParts.negative_prompt = processed.negative;
  
  // 5. 组装模板
  var filled = fillTemplate(template, concreteParts, options);
  
  // 6. 质量增强
  var qualityBoost = options.quality !== 'low' ? ', ' + QUALITY_SUFFIXES.slice(0, 3).join(', ') : '';
  
  // 7. 生成优化后提示词
  var optimized = filled + qualityBoost;
  var original = userInput;
  
  // 8. 参数估算
  var params = estimateParams(type, keywords, options);
  
  return {
    original: original,
    optimized: optimized,
    negativePrompt: processed.negative,
    params: params,
    keywords: keywords,
    type: type,
    wordCount: optimized.split(/[\s,]+/).length
  };
}

// ===== 负面词处理 =====
function handleNegatives(input) {
  var result = { clean: input, negative: '' };
  var negParts = [];
  
  for (var key in NEGATIVE_REPLACEMENTS) {
    if (input.indexOf(key) >= 0) {
      negParts.push(NEGATIVE_REPLACEMENTS[key]);
      // 从clean文本中移除负面词
      result.clean = result.clean.replace(key, '');
    }
  }
  
  // 检测常见否定模式
  var negMatch = input.match(/不要|没有|不能|不准|without|no |except|excluding/gi);
  if (negMatch && !negParts.length) {
    // 提取"不要X"中的X
    var parts = input.split(/不要|没有|不能|不准/);
    for (var i = 1; i < parts.length; i++) {
      var term = parts[i].split(/[，。,.\s]/)[0];
      if (term) negParts.push('no ' + term + ', without ' + term);
    }
  }
  
  if (negParts.length) result.negative = negParts.join(', ');
  return result;
}

// ===== 关键词提取 =====
function extractKeywords(input) {
  var result = {
    subjects: [], actions: [], environments: [], styles: [],
    lighting: [], emotions: [], colors: [], compositions: [],
    clothing: [], hairstyle: [], accessories: [], raw: input
  };
  if (!input) return result;
  var text = input.toLowerCase();
  
  for (var key in ABSTRACT_MAP) {
    if (text.indexOf(key) >= 0) {
      var val = ABSTRACT_MAP[key];
      if (key.match(/美女|帅哥|小孩|老人|可爱|漂亮|帅气|酷|性感|优雅|强壮|苗条|长发|短发|卷发|马尾|辫子|胡须|眼镜|纹身/)) result.subjects.push(val);
      else if (key.match(/微笑|大笑|悲伤|愤怒|惊讶|沉思|开心|严肃|自信|害羞|疲惫|放松|专注|温柔|冷酷/)) result.emotions.push(val);
      else if (key.match(/森林|海滩|城市|乡村|山脉|沙漠|花园|室内|街道|太空|海洋|瀑布|河流|湖泊|雪地|竹林|寺庙|城堡|樱花|草原|洞穴|夜景|废墟|太空站|赛博城市/)) result.environments.push(val);
      else if (key.match(/暗|亮|暖|冷|日落|日出|夜晚|阳光|柔和|霓虹|烛光|背光|阴天|射灯|蓝色时刻/)) result.lighting.push(val);
      else if (key.match(/写实|卡漫|油画|水墨|赛博|蒸汽|抽象|素描|水彩|像素|3D|插画|浮世绘|哥特|极简/)) result.styles.push(val);
      else if (key.match(/特写|全景|半身|全身|俯拍|仰拍|第一人称|航拍|斜角|对称/)) result.compositions.push(val);
      else if (key.match(/连衣裙|西装|旗袍|汉服|制服|休闲装|运动装|泳装|晚礼服|皮衣|风衣|婚纱|牛仔|毛衣|斗篷/)) result.clothing.push(val);
      else if (key.match(/奔跑|跳跃|坐着|站立|跳舞|游泳|飞|走路|躺着|跪着/)) result.actions.push(val);
    }
  }
  
  return result;
}

// ===== 抽象→具体映射 =====
function mapToConcrete(keywords, options) {
  var parts = {};
  parts.subject = keywords.subjects.length ? keywords.subjects.join(', ') : 'subject';
  parts.expression = keywords.emotions.length ? keywords.emotions[0] : 'natural expression';
  parts.environment = keywords.environments.length ? keywords.environments.join(', ') : 'neutral background';
  parts.lighting = options.lighting || (keywords.lighting.length ? keywords.lighting[0] : 'natural lighting');
  parts.style = options.style || (keywords.styles.length ? keywords.styles[0] : 'photorealistic');
  parts.composition = options.composition || (keywords.compositions.length ? keywords.compositions[0] : 'medium shot');
  parts.clothing = keywords.clothing.length ? keywords.clothing[0] : 'casual outfit';
  parts.action = keywords.actions.length ? keywords.actions[0] : 'standing';
  parts.hairstyle = keywords.hairstyle.length ? keywords.hairstyle[0] : '';
  parts.accessories = keywords.accessories.length ? keywords.accessories[0] : '';
  return parts;
}

// ===== 填充模板 =====
function fillTemplate(template, parts, options) {
  var result = template.template;
  var allValues = {};
  for (var k in template.defaults) allValues[k] = template.defaults[k];
  for (var k in options) allValues[k] = options[k];
  for (var k in parts) allValues[k] = parts[k];
  
  for (var key in allValues) {
    if (allValues[key]) result = result.replace('[' + key + ']', allValues[key]);
  }
  // 清理剩余占位符
  result = result.replace(/\[[\w]+\]/g, '').replace(/,?\s*,/g, ',').replace(/^,|,$/g, '').trim();
  result = result.replace(/,{2,}/g, ',').replace(/,\s*,/g, ',').trim();
  return result;
}

// ===== 参数估算 =====
function estimateParams(type, keywords, options) {
  var p = { cfgScale: 7, steps: 30, aspectRatio: '1:1', sampler: 'DPM++ 2M Karras' };
  var arMap = { portrait: '3:4', scene: '16:9', character_scene: '4:3' };
  p.aspectRatio = arMap[type] || '4:3';
  if (options.aspectRatio) p.aspectRatio = options.aspectRatio;
  if (keywords.styles.length) p.cfgScale = 9;
  if (keywords.lighting.length && keywords.lighting[0].match(/dramatic|霓虹/)) p.cfgScale = 11;
  if (keywords.lighting.length) p.steps = 35;
  if (keywords.subjects.length > 2) p.steps = 40;
  return p;
}

// ===== 生成多版本 =====
function generateVariations(userInput, count) {
  count = count || 3;
  var results = [];
  for (var i = 0; i < count; i++) {
    var types = ['portrait', 'scene', 'character_scene'];
    results.push(optimizePrompt(userInput, types[i % 3], { quality: i === 0 ? 'high' : 'medium' }));
  }
  return results;
}
