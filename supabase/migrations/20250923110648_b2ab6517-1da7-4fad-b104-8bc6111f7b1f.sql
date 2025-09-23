-- Add YouTube video content to courses that are missing it
UPDATE courses 
SET youtube_video_id = CASE 
    WHEN title = 'Advanced React Patterns' THEN 'Ke90Tje7VS0'
    WHEN title = 'Node.js Backend Development' THEN 'TlB_eWDSMt4'
    WHEN title = 'Python for Data Science' THEN 'rfscVS0vtbw'
    WHEN title = 'Machine Learning Fundamentals' THEN '7eh4d6sabA0'
    WHEN title = 'AWS Cloud Architecture' THEN 'NmM9HA2MQGI'
    WHEN title = 'Docker & Kubernetes' THEN 'X48VuDVv0do'
    WHEN title = 'GraphQL Complete Guide' THEN 'ed8SzALpx1Q'
    WHEN title = 'Vue.js 3 Masterclass' THEN 'YrxBCBibVo0'
    WHEN title = 'SQL Database Design' THEN 'ztHopE5Wnpc'
    WHEN title = 'Cybersecurity Essentials' THEN '4J0xFAEs5_0'
    WHEN title = 'Digital Marketing Strategy' THEN 'nU-IIXBWlS4'
    WHEN title = 'Leadership Development' THEN 'xlE-2rfHUHM'
END
WHERE youtube_video_id IS NULL OR youtube_video_id = '';