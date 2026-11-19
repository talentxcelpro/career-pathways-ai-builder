const fs = require('fs');
const path = require('path');

// 1. InteractiveJobMatchWidget.tsx
const widgetPath = path.resolve('src/components/jobs/InteractiveJobMatchWidget.tsx');
let widgetContent = fs.readFileSync(widgetPath, 'utf-8');

widgetContent = widgetContent.replace(
  '<Card className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-6 text-slate-100">',
  '<Card className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-6 text-slate-900">'
);

widgetContent = widgetContent.replace(
  '<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">',
  '<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2 shadow-2xs">'
);

widgetContent = widgetContent.replace(
  '<h2 className="text-xl md:text-2xl font-black text-white tracking-tight">',
  '<h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">'
);

widgetContent = widgetContent.replace(
  '<p className="text-slate-300 text-xs md:text-sm mt-1">',
  '<p className="text-slate-600 text-xs md:text-sm mt-1">'
);

widgetContent = widgetContent.replace(
  '<Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs shrink-0 py-1">',
  '<Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs shrink-0 py-1 font-semibold">'
);

// Dropzone
widgetContent = widgetContent.replace(
  'className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-xl p-5 text-center cursor-pointer bg-slate-950/40 hover:bg-blue-950/20 transition-all group"',
  'className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/70 hover:bg-blue-50/40 transition-all group"'
);

widgetContent = widgetContent.replace(
  '<p className="text-sm font-bold text-white mb-0.5">',
  '<p className="text-sm font-bold text-slate-900 mb-0.5">'
);

widgetContent = widgetContent.replace(
  '<p className="text-xs text-slate-400">',
  '<p className="text-xs text-slate-500">'
);

widgetContent = widgetContent.replace(
  '<div className="flex-grow border-t border-slate-800"></div>\n            <span className="flex-shrink mx-4 text-[11px] font-mono text-slate-500 uppercase">Or select verified skills</span>\n            <div className="flex-grow border-t border-slate-800"></div>',
  `<div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[11px] font-mono text-slate-500 uppercase">Or select verified skills</span>
            <div className="flex-grow border-t border-slate-200"></div>`
);

widgetContent = widgetContent.replace(
  '<label className="text-xs font-semibold text-slate-300 block mb-2">',
  '<label className="text-xs font-semibold text-slate-700 block mb-2">'
);

widgetContent = widgetContent.replace(
  ": 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-600 hover:bg-slate-800'",
  ": 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'"
);

widgetContent = widgetContent.replace(
  ": 'bg-slate-800/60 text-slate-300 border border-slate-700/80 hover:bg-slate-800'",
  ": 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'"
);

// Score reveal box
widgetContent = widgetContent.replace(
  '<div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">',
  '<div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">'
);

widgetContent = widgetContent.replace(
  '<h3 className="text-lg font-bold text-white">',
  '<h3 className="text-lg font-bold text-slate-900">'
);

widgetContent = widgetContent.replace(
  '<p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">',
  '<p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">'
);

widgetContent = widgetContent.replace(
  '<div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">',
  '<div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">'
);

widgetContent = widgetContent.replace(
  '<div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">',
  '<div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">'
);

widgetContent = widgetContent.replace(
  'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
  'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'
);

widgetContent = widgetContent.replace(
  'bg-amber-950/80 text-amber-300 border border-amber-800/60',
  'bg-amber-50 text-amber-800 border border-amber-200 font-medium'
);

// Unregistered auth callout
widgetContent = widgetContent.replace(
  '<div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/40 rounded-2xl p-5 space-y-4">',
  '<div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 border-2 border-blue-200/80 rounded-2xl p-5 space-y-4">'
);

widgetContent = widgetContent.replace(
  '<div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">',
  '<div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">'
);

widgetContent = widgetContent.replace(
  '<h4 className="text-sm font-bold text-white">',
  '<h4 className="text-sm font-bold text-slate-900">'
);

widgetContent = widgetContent.replace(
  '<p className="text-xs text-slate-300">',
  '<p className="text-xs text-slate-600">'
);

widgetContent = widgetContent.replace(
  'className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all"',
  'className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition-all"'
);

fs.writeFileSync(widgetPath, widgetContent, 'utf-8');
console.log('Successfully updated InteractiveJobMatchWidget.tsx');

// 2. ViralResultShareCard.tsx
const viralPath = path.resolve('src/components/growth/ViralResultShareCard.tsx');
let viralContent = fs.readFileSync(viralPath, 'utf-8');

viralContent = viralContent.replace(
  '<Card className={`overflow-hidden border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 shadow-xl ${className}`}>',
  '<Card className={`overflow-hidden border-2 border-indigo-200/80 bg-white shadow-sm rounded-2xl ${className}`}>'
);

viralContent = viralContent.replace(
  '<Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs px-2.5 py-0.5 flex items-center gap-1 font-semibold">',
  '<Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-0.5 flex items-center gap-1 font-semibold">'
);

viralContent = viralContent.replace(
  '<span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">',
  '<span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">'
);

viralContent = viralContent.replace(
  '<CardTitle className="text-base sm:text-lg font-black text-white mt-1">',
  '<CardTitle className="text-base sm:text-lg font-black text-slate-900 mt-1">'
);

viralContent = viralContent.replace(
  '<CardDescription className="text-xs text-slate-300">',
  '<CardDescription className="text-xs text-slate-600">'
);

viralContent = viralContent.replace(
  '<div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">',
  '<div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">'
);

viralContent = viralContent.replace(
  '<div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">',
  '<div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">'
);

viralContent = viralContent.replace(
  '<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">',
  '<span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">'
);

viralContent = viralContent.replace(
  'className="bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/40 text-emerald-300 text-xs font-semibold h-8"',
  'className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 text-xs font-semibold h-8"'
);

viralContent = viralContent.replace(
  'className="bg-blue-950/30 hover:bg-blue-900/50 border-blue-800/40 text-blue-300 text-xs font-semibold h-8"',
  'className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 text-xs font-semibold h-8"'
);

viralContent = viralContent.replace(
  'className="bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 text-xs font-semibold h-8"',
  'className="bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 text-xs font-semibold h-8"'
);

fs.writeFileSync(viralPath, viralContent, 'utf-8');
console.log('Successfully updated ViralResultShareCard.tsx');
