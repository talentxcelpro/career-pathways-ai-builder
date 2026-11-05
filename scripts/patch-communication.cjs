const fs = require('fs');

// 1. Patch DirectMessaging.tsx
let dm = fs.readFileSync('src/components/communication/DirectMessaging.tsx', 'utf8');

// Add safe date formatting helpers if not present
if (!dm.includes('function safeFormatDate')) {
  const helperCode = `
function safeFormatDate(dateVal: any, pattern: string, fallback: string = ''): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, pattern);
  } catch {
    return fallback;
  }
}

function getLatestMessage(conv: any): any {
  if (!conv?.messages) return null;
  if (Array.isArray(conv.messages)) return conv.messages[0] || null;
  return conv.messages;
}
`;
  dm = dm.replace('const DirectMessaging = () => {', helperCode + '\nconst DirectMessaging = () => {');
}

// Replace unsafe date formatting in conversations list
dm = dm.replace(
  `{conversation.messages && (\n                        <span className="text-xs text-muted-foreground">\n                          {format(new Date(conversation.messages.created_at), 'MMM dd')}\n                        </span>\n                      )}`,
  `{(() => {\n                        const latestMsg = getLatestMessage(conversation);\n                        return latestMsg?.created_at ? (\n                          <span className="text-xs text-muted-foreground">\n                            {safeFormatDate(latestMsg.created_at, 'MMM dd')}\n                          </span>\n                        ) : null;\n                      })()}`
);

dm = dm.replace(
  `{conversation.messages?.content || 'No messages yet'}`,
  `{getLatestMessage(conversation)?.content || 'No messages yet'}`
);

// Replace unsafe date formatting in message bubble
dm = dm.replace(
  `{format(new Date(message.created_at), 'HH:mm')}`,
  `{safeFormatDate(message.created_at, 'HH:mm')}`
);

fs.writeFileSync('src/components/communication/DirectMessaging.tsx', dm, 'utf8');
console.log('✅ DirectMessaging.tsx safely formatted dates');

// 2. Patch VideoConsultations.tsx
let vc = fs.readFileSync('src/components/communication/VideoConsultations.tsx', 'utf8');

if (!vc.includes('function safeFormatDate')) {
  const vcHelper = `
function safeFormatDate(dateVal: any, pattern: string, fallback: string = ''): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, pattern);
  } catch {
    return fallback;
  }
}
`;
  vc = vc.replace('export default function VideoConsultations() {', vcHelper + '\nexport default function VideoConsultations() {');
}

vc = vc.replace(
  `Next available: {format(expert.nextAvailable, 'MMM dd, yyyy')}`,
  `Next available: {safeFormatDate(expert.nextAvailable, 'MMM dd, yyyy', 'Available soon')}`
);

vc = vc.replace(
  `{format(new Date(consultation.scheduled_at), 'PPp')}`,
  `{safeFormatDate(consultation.scheduled_at, 'PPp', 'Scheduled time')}`
);

fs.writeFileSync('src/components/communication/VideoConsultations.tsx', vc, 'utf8');
console.log('✅ VideoConsultations.tsx safely formatted dates');
