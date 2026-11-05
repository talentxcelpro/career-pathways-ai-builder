const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/pages/CareerVersePage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace using regex that ignores line endings
content = content.replace(
  /onSuccess=\{async \(xp\) => \{\s*await loadPlayerData\(\);\s*setActiveCodeQuest\(null\);\s*\}\}/g,
  `onSuccess={async (xp) => {
            gameAudio.playLevelUp();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
            await loadPlayerData();
            setActiveCodeQuest(null);
          }}`
);

content = content.replace(
  /onSuccess=\{async \(xp\) => \{\s*await loadPlayerData\(\);\s*setActiveLogicQuest\(null\);\s*\}\}/g,
  `onSuccess={async (xp) => {
            gameAudio.playLevelUp();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
            await loadPlayerData();
            setActiveLogicQuest(null);
          }}`
);

content = content.replace(
  /onVictory=\{async \(\) => \{\s*await loadPlayerData\(\);\s*setIsBossArenaOpen\(false\);\s*\}\}/g,
  `onVictory={async () => {
            gameAudio.playLevelUp();
            confetti({
              particleCount: 180,
              spread: 100,
              origin: { y: 0.5 },
            });
            await loadPlayerData();
            setIsBossArenaOpen(false);
          }}`
);

content = content.replace(
  /onQuestClaimed=\{async \(\) => \{\s*await loadPlayerData\(\);\s*const updatedQuests = await CareerQuestService\.getQuests\(player\.id\);\s*setQuests\(updatedQuests\);\s*\}\}/g,
  `onQuestClaimed={async () => {
          gameAudio.playXpGain();
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
          await loadPlayerData();
          const updatedQuests = await CareerQuestService.getQuests(player.id);
          setQuests(updatedQuests);
        }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully applied confetti and audio callbacks to CareerVersePage.tsx');
