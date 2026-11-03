SELECT u.id, u.email 
FROM auth.users u
WHERE u.id != 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'
AND NOT EXISTS (
  SELECT 1 FROM public.connections c
  WHERE (c.requester_id = u.id AND c.recipient_id = 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf')
     OR (c.recipient_id = u.id AND c.requester_id = 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf')
)
LIMIT 5;
