const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipJobs = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\84be5f83-2b60-400a-8536-ed8995f67ec7\\.user_uploaded\\media_1794562649654_afeacae5.zip';
const zipRoot = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\84be5f83-2b60-400a-8536-ed8995f67ec7\\.user_uploaded\\media_1794562649680_17e2c811.zip';

const destJobs = path.resolve('scratch/gsc_jobs');
const destRoot = path.resolve('scratch/gsc_root');

fs.mkdirSync(destJobs, { recursive: true });
fs.mkdirSync(destRoot, { recursive: true });

execSync(`tar -xf "${zipJobs}" -C "${destJobs}"`);
execSync(`tar -xf "${zipRoot}" -C "${destRoot}"`);

console.log('Jobs extracted:', fs.readdirSync(destJobs));
console.log('Root extracted:', fs.readdirSync(destRoot));
