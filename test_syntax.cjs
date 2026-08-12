const code = `
let a = \`
  \${true ? \`<div class="a">[b]</div>\` : ''}
\`;
`;
try {
  new Function(code);
  console.log('Valid!');
} catch (e) {
  console.log('Invalid:', e);
}
