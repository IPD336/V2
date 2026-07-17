import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const htmlPath = path.join(distPath, 'index.html');

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Flexible regex to match the entry stylesheet link tag
  const cssRegex = /<link\s+[^>]*?href="\/assets\/(index-[a-zA-Z0-9_\-]+\.css)"[^>]*?>/;
  const match = html.match(cssRegex);

  if (match) {
    const cssFilename = match[1];
    const cssLinkTag = match[0];
    const cssFilePath = path.join(distPath, 'assets', cssFilename);

    if (fs.existsSync(cssFilePath)) {
      const cssContent = fs.readFileSync(cssFilePath, 'utf8');
      const styleTag = `<style>${cssContent}</style>`;
      
      html = html.replace(cssLinkTag, styleTag);
      fs.writeFileSync(htmlPath, html, 'utf8');
      console.log(`Successfully inlined CSS: ${cssFilename}`);

      fs.unlinkSync(cssFilePath);
      console.log(`Deleted original CSS file: ${cssFilename}`);
    } else {
      console.error(`CSS file not found at: ${cssFilePath}`);
    }
  } else {
    console.warn('No main index stylesheet link found in index.html for inlining.');
  }
} else {
  console.error(`built index.html not found at: ${htmlPath}`);
}
