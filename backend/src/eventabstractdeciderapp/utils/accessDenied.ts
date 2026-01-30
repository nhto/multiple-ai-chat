import fs from 'fs';
import path from 'path';

const accessDeniedHtml = fs.readFileSync(path.join(__dirname, 'accessDenied.html'), 'utf8');

export { accessDeniedHtml };
