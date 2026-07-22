/* ============================================
   CineAI 提示词优化引擎
   底层逻辑：抽象→具体映射 + 模板化组装
   ============================================ */

// ===== 抽象词→具体描述映射库 =====
var ABSTRACT_MAP = {
  // === 外观描述 ===
  '美女': 'young woman, symmetrical facial features, clear skin, elegant appearance',
  '帅哥': 'handsome young man, sharp jawline, well-groomed, masculine features',
  '小孩': 'child, youthful face, innocent expression, soft features',
  '老人': 'elderly person, wrinkled skin, silver hair, wise expression',
  '可爱': 'cute, round face, big bright eyes, soft features, cheerful',
  '漂亮': 'beautiful, delicate features, glowing skin, photogenic',
  '帅气': 'handsome, chiseled features, confident gaze, stylish',
  '酷': 'cool attitude, edgy style, confident posture, intense gaze',
  '性感': 'alluring, confident pose, elegant curves, seductive gaze',

  // === 表情 ===
  '微笑': 'gentle smile, slightly upturned lips, warm expression',
  '大笑': 'laughing, wide smile, joyful expression, crinkled eyes',
  '悲伤': 'sad expression, teary eyes, downturned mouth, melancholy',
  '愤怒': 'angry expression, furrowed brows, intense glare, tense jaw',
  '惊讶': 'surprised expression, wide eyes, slightly open mouth',
  '沉思': 'thoughtful expression, slight frown, distant gaze, contemplative',
  '开心': 'happy, beaming smile, bright eyes, radiant expression',
  '严肃': 'serious expression, straight face, focused gaze, composed',

  // === 场景 ===
  '森林': 'dense forest, tall trees, dappled sunlight through canopy, mossy ground, wild ferns',
  '海滩': 'sandy beach, gentle waves, crystal clear water, palm trees, seashells scattered',
  '城市': 'cityscape, modern architecture, bustling streets, glass buildings, urban city',
  '乡村': 'countryside, rolling hills, quaint farmhouse, golden wheat fields, rustic charm',
  '山脉': 'mountain range, snow-capped peaks, alpine meadows, dramatic clouds, misty valleys',
  '沙漠': 'desert landscape, golden sand dunes, arid climate, clear blue sky, heat haze',
  '花园': 'flower garden, blooming roses, lavender bushes, manicured hedges, cobblestone path',
  '室内': 'interior room, cozy atmosphere, warm lighting, comfortable furniture',
  '街道': 'street scene, cobblestone road, historic buildings, street lamps, storefronts',
  '太空': 'outer space, starry nebula, distant galaxies, cosmic dust, celestial glow',

  // === 光照 ===
  '暗': 'dim lighting, dramatic shadows, low-key illumination, moody atmosphere',
  '亮': 'bright lighting, well-illuminated, high-key, clear visibility',
  '暖': 'warm lighting, golden tones, amber glow, cozy atmosphere',
  '冷': 'cool lighting, blue tones, cold atmosphere, clinical feel',
  '日落': 'golden hour, warm sunset light, long shadows, orange and pink hues',
  '夜晚': 'night scene, moonlight, city lights, starlit sky, twilight ambiance',
  '阳光': 'sunlight, natural lighting, bright day, sunbeams, warm glow',
  '柔和': 'soft lighting, diffused light, gentle illumination, smooth shadows',

  // === 风格 ===
  '写实': 'photorealistic, highly detailed, lifelike textures, sharp focus, 8K UHD',
  '卡漫': 'anime style, cel shaded, vibrant colors, manga aesthetic, clean lines',
  '油画': 'oil painting style, thick brushstrokes, impasto, canvas texture, artistic',
  '水墨': 'ink wash painting, traditional Chinese art, flowing ink, minimalist',
  '赛博': 'cyberpunk style, neon lights, futuristic city, high tech, dark atmosphere',
  '蒸汽': 'steampunk style, Victorian era, brass machinery, gears and cogs',
  '抽象': 'abstract art, geometric shapes, bold colors, non-representational',
  '素描': 'pencil sketch, monochrome, crosshatching, draftsmanship, graphite',
  '水彩': 'watercolor painting, soft washes, translucent colors, paper texture',
  '像素': 'pixel art, 8-bit style, retro gaming, blocky graphics, chunky pixels',

  // === 构图 ===
  '特写': 'close-up shot, tight framing, detailed view, shallow depth of field',
  '全景': 'wide angle shot, panoramic view, expansive scene, grand scale',
  '半身': 'medium shot, waist up framing, balanced composition, portrait',
  '全身': 'full body shot, head to toe, standing pose, entire figure visible',
  '俯拍': 'bird\'s eye view, top-down angle, overhead perspective, aerial shot',
  '仰拍': 'low angle shot, looking up, dramatic perspective, towering effect'
};

// ===== 提示词模板系统 =====
var PROMPT_TEMPLATES = {
  'portrait': {
    label: '人物肖像',
    template: '[subject], [expression], wearing [clothing], [hair], [accessories], [lighting], [style], [composition], [quality]',
    defaults: {
      clothing: 'elegant outfit',
      hair: 'styled hair',
      accessories: '',
      lighting: 'soft studio lighting',
      style: 'portrait photography',
      composition: 'close-up shot',
      quality: 'highly detailed, sharp focus, 8K'
    },
    fields: ['subject', 'expression', 'clothing', 'hair', 'accessories', 'lighting', 'style', 'composition']
  },
  'scene': {
    label: '场景风景',
    template: '[environment], [time], [weather], [lighting], [colors], [style], [composition], [quality], [mood]',
    defaults: {
      time: 'daytime',
      weather: 'clear weather',
      colors: 'natural colors',
      lighting: 'natural sunlight',
      style: 'photorealistic',
      composition: 'wide angle',
      quality: 'highly detailed, 8K, cinematic',
      mood: 'serene atmosphere'
    },
    fields: ['environment', 'time', 'weather', 'lighting', 'colors', 'style', 'composition', 'mood']
  },
  'character_scene': {
    label: '人物+场景',
    template: '[subject], [expression], [action], wearing [clothing], in [environment], [lighting], [style], [composition], [quality]',
    defaults: {
      expression: 'natural expression',
      action: 'standing',
      clothing: 'casual outfit',
      lighting: 'natural lighting',
      style: 'cinematic',
      composition: 'medium shot',
      quality: 'highly detailed, 8K, cinematic lighting'
    },
    fields: ['subject', 'expression', 'action', 'clothing', 'environment', 'lighting', 'style', 'composition']
  }
};

// ===== 质量增强后缀 =====
var QUALITY_SUFFIXES = [
  'highly detailed', 'sharp focus', '8K resolution',
  'professional photography', 'intricate details',
  'vivid colors', 'perfect composition',
  'award winning', 'breathtaking'
];

// ===== 核心优化函数 =====
function optimizePrompt(userInput, imageType, options) {
  options = options || {};
  var type = imageType || 'character_scene';
  var template = PROMPT_TEMPLATES[type];
  if (!template) template = PROMPT_TEMPLATES['character_scene'];
  
  // 1. 提取关键词
  var keywords = extractKeywords(userInput);
  
  // 2. 映射抽象词到具体描述
  var concreteParts = mapToConcrete(keywords);
  
  // 3. 组装模板
  var filled = fillTemplate(template, concreteParts, options);
  
  // 4. 添加质量增强
  var qualityBoost = options.quality !== 'low' ? ', ' + QUALITY_SUFFIXES.slice(0, 3).join(', ') : '';
  
  // 5. 生成优化后和原始版本
  var optimized = filled + qualityBoost;
  var original = userInput + ', ' + QUALITY_SUFFIXES.slice(0, 2).join(', ');
  
  // 6. 自动估算参数
  var params = estimateParams(type, keywords);
  
  return {
    original: original,
    optimized: optimized,
    params: params,
    keywords: keywords,
    type: type,
    wordCount: optimized.split(/[\s,]+/).length
  };
}

// ===== 关键词提取 =====
function extractKeywords(input) {
  var result = {
    subjects: [],
    actions: [],
    environments: [],
    styles: [],
    lighting: [],
    emotions: [],
    colors: [],
    compositions: [],
    raw: input
  };
  
  if (!input) return result;
  
  var text = input.toLowerCase();
  
  // 按分类匹配
  for (var key in ABSTRACT_MAP) {
    if (text.indexOf(key) >= 0) {
      var val = ABSTRACT_MAP[key];
      // 判断分类
      if (key.match(/美女|帅哥|小孩|老人|可爱|漂亮|帅气|酷|性感/)) result.subjects.push(val);
      else if (key.match(/微笑|大笑|悲伤|愤怒|惊讶|沉思|开心|严肃/)) result.emotions.push(val);
      else if (key.match(/森林|海滩|城市|乡村|山脉|沙漠|花园|室内|街道|太空/)) result.environments.push(val);
      else if (key.match(/暗|亮|暖|冷|日落|夜晚|阳光|柔和/)) result.lighting.push(val);
      else if (key.match(/写实|卡漫|油画|水墨|赛博|蒸汽|抽象|素描|水彩|像素/)) result.styles.push(val);
      else if (key.match(/特写|全景|半身|全身|俯拍|仰拍/)) result.compositions.push(val);
    }
  }
  
  return result;
}

// ===== 抽象→具体映射 =====
function mapToConcrete(keywords) {
  var parts = {};
  
  if (keywords.subjects.length) parts.subject = keywords.subjects.join(', ');
  else parts.subject = 'subject';
  
  if (keywords.emotions.length) parts.expression = keywords.emotions[0];
  else parts.expression = 'natural expression';
  
  if (keywords.environments.length) parts.environment = keywords.environments.join(', ');
  else parts.environment = 'neutral background';
  
  if (keywords.lighting.length) parts.lighting = keywords.lighting[0];
  else parts.lighting = 'natural lighting';
  
  if (keywords.styles.length) parts.style = keywords.styles[0];
  else parts.style = 'photorealistic';
  
  if (keywords.compositions.length) parts.composition = keywords.compositions[0];
  else parts.composition = 'medium shot';
  
  return parts;
}

// ===== 填充模板 =====
function fillTemplate(template, parts, options) {
  var result = template.template;
  
  for (var key in template.defaults) {
    var val = parts[key] || options[key] || template.defaults[key] || '';
    result = result.replace('[' + key + ']', val);
  }
  
  // 清理剩余占位符
  result = result.replace(/\[[\w]+\]/g, '');
  result = result.replace(/,?\s*,/g, ',').replace(/^,|,$/g, '').trim();
  result = result.replace(/,{2,}/g, ',').trim();
  result = result.replace(/,\s*,/g, ',');
  
  return result;
}

// ===== 参数估算 =====
function estimateParams(type, keywords) {
  var params = {
    cfgScale: 7,
    steps: 30,
    aspectRatio: '1:1'
  };
  
  // 根据类型设置比例
  if (type === 'portrait') params.aspectRatio = '3:4';
  else if (type === 'scene') params.aspectRatio = '16:9';
  else params.aspectRatio = '4:3';
  
  // 根据关键词调整
  if (keywords.styles.length) params.cfgScale = 9;
  if (keywords.lighting.length) params.steps = 35;
  
  return params;
}

// ===== 生成多版本 =====
function generateVariations(userInput, count) {
  count = count || 3;
  var results = [];
  var types = ['portrait', 'scene', 'character_scene'];
  
  for (var i = 0; i < count; i++) {
    var type = types[i % 3];
    var useQuality = i === 0 ? 'high' : (i === 1 ? 'medium' : 'low');
    results.push(optimizePrompt(userInput, type, { quality: useQuality }));
  }
  
  return results;
}
