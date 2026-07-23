var ABSTRACT_MAP = {
  '美女':'young woman, symmetrical facial features, clear skin, elegant appearance',
  '帅哥':'handsome young man, sharp jawline, well-groomed, masculine features',
  '小孩':'child, youthful face, innocent expression, soft features',
  '可爱':'cute, round face, big bright eyes, soft features, cheerful',
  '漂亮':'beautiful, delicate features, glowing skin, photogenic',
  '森林':'dense forest, tall trees, dappled sunlight through canopy, mossy ground, wild ferns',
  '海滩':'sandy beach, gentle waves, crystal clear water, palm trees, seashells scattered',
  '城市':'cityscape, modern architecture, bustling streets, glass buildings, urban city',
  '山脉':'mountain range, snow-capped peaks, alpine meadows, dramatic clouds, misty valleys',
  '花园':'flower garden, blooming roses, lavender bushes, manicured hedges, cobblestone path',
  '日落':'golden hour, warm sunset light, long shadows, orange and pink hues',
  '夜晚':'night scene, moonlight, city lights, starlit sky, twilight ambiance',
  '阳光':'sunlight, natural lighting, bright day, sunbeams, warm glow',
  '柔和':'soft lighting, diffused light, gentle illumination, smooth shadows',
  '写实':'photorealistic, highly detailed, lifelike textures, sharp focus, 8K UHD',
  '卡漫':'anime style, cel shaded, vibrant colors, manga aesthetic, clean lines',
  '油画':'oil painting style, thick brushstrokes, impasto, canvas texture, artistic',
  '水墨':'ink wash painting, traditional Chinese art, flowing ink, minimalist',
  '赛博':'cyberpunk style, neon lights, futuristic city, high tech, dark atmosphere',
  '特写':'close-up shot, tight framing, detailed view, shallow depth of field',
  '全景':'wide angle shot, panoramic view, expansive scene, grand scale',
  '微笑':'gentle smile, slightly upturned lips, warm expression',
  '大笑':'laughing, wide smile, joyful expression, crinkled eyes',
  '悲伤':'sad expression, teary eyes, downturned mouth, melancholy',
  '开心':'happy, beaming smile, bright eyes, radiant expression',
  '奔跑':'running, sprinting, fast motion, dynamic pose, legs in motion',
  '坐着':'sitting down, seated pose, relaxed sitting, chair pose, resting',
  '连衣裙':'flowing dress, elegant gown, feminine silhouette, graceful dress',
  '西装':'tailored suit, formal wear, sharp blazer, professional attire, business suit',
  '汉服':'hanfu, traditional Chinese clothing, flowing robes, ancient Chinese attire'
};

function optimizePrompt(input, options) {
  if (!input) return { original:'', optimized:'试输入一些文字描述', wordCount:0 };
  var text = input.toLowerCase();
  var replacements = [];
  for (var key in ABSTRACT_MAP) {
    if (text.indexOf(key) >= 0) replacements.push(ABSTRACT_MAP[key]);
  }
  var style = options && options.style ? options.style : 'photorealistic';
  var quality = ', highly detailed, sharp focus, 8K';
  var optimized = input;
  if (replacements.length > 0) optimized = input + ': ' + replacements.join(', ');
  optimized += ', ' + style + quality;
  return {
    original: input,
    optimized: optimized,
    wordCount: optimized.split(/[\s,]+/).length,
    replacements: replacements.length
  };
}

function fillPrompt(text) {
  var ta = document.querySelector('.prompt-input textarea');
  if (ta) { ta.value = text; ta.dispatchEvent(new Event('input')); }
}
