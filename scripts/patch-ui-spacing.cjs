const fs = require('fs');

// 1. Patch DailyQuestsCard.tsx
let dq = fs.readFileSync('src/components/careerverse/DailyQuestsCard.tsx', 'utf8');

// Replace truncate with multi-line wrapping and flex-1
dq = dq.replace(
  '<div className="flex items-center gap-2.5 min-w-0 pr-2">',
  '<div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">'
);

dq = dq.replace(
  '<span className={`text-xs sm:text-sm font-semibold truncate ${isCompleted ? \'line-through text-slate-400\' : \'text-white\'}`}>\n                    {quest.title}\n                  </span>',
  '<span className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 break-words ${isCompleted ? \'line-through text-slate-400\' : \'text-white\'}`}>\n                    {quest.title}\n                  </span>'
);

fs.writeFileSync('src/components/careerverse/DailyQuestsCard.tsx', dq, 'utf8');
console.log('✅ DailyQuestsCard.tsx text-wrapping patched');

// 2. Patch PlayerCharacterHUD.tsx
let hud = fs.readFileSync('src/components/careerverse/character/PlayerCharacterHUD.tsx', 'utf8');

// Ensure level progression and XP stay on single line
hud = hud.replace(
  '<div className="flex items-center justify-between text-xs sm:text-sm">',
  '<div className="flex items-center justify-between gap-2 text-xs sm:text-sm">'
);

hud = hud.replace(
  '<span className="text-slate-200 font-semibold">Level Progression</span>',
  '<span className="text-slate-200 font-semibold whitespace-nowrap">Level Progression</span>'
);

hud = hud.replace(
  '<span className="font-bold text-white font-mono text-xs sm:text-sm">\n            {currentXP.toLocaleString()} / {levelCeilXP.toLocaleString()} XP\n          </span>',
  '<span className="font-bold text-white font-mono text-xs sm:text-sm whitespace-nowrap">\n            {currentXP.toLocaleString()} / {levelCeilXP.toLocaleString()} XP\n          </span>'
);

// Allow headline and name to break words naturally without premature clipping
hud = hud.replace(
  '<p className="text-xs sm:text-sm font-semibold text-[#36D9F5] line-clamp-2 leading-snug mt-1">',
  '<p className="text-xs sm:text-sm font-semibold text-[#36D9F5] line-clamp-2 leading-snug mt-1 break-words">'
);

fs.writeFileSync('src/components/careerverse/character/PlayerCharacterHUD.tsx', hud, 'utf8');
console.log('✅ PlayerCharacterHUD.tsx typography patched');

// 3. Patch CareerVersePage.tsx grid to xl:grid-cols-3 so cards get 350-400px of breathing room
let cv = fs.readFileSync('src/pages/CareerVersePage.tsx', 'utf8');
cv = cv.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">',
  '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">'
);
fs.writeFileSync('src/pages/CareerVersePage.tsx', cv, 'utf8');
console.log('✅ CareerVersePage.tsx responsive grid patched');
