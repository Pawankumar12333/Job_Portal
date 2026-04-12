const fs = require('fs');
const path = 'c:\\Users\\dell\\Downloads\\Job_portal\\frontend\\src\\pages\\Acount.jsx';
let code = fs.readFileSync(path, 'utf8');

const startStr = '  // ── STYLES ────────────────────────────────────────────';
const endStr = '  // ── SKILLS COMPONENT ──────────────────────────────────';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  let block = code.substring(startIndex, endIndex);
  code = code.substring(0, startIndex) + code.substring(endIndex);

  const suggStart = code.indexOf('  const suggestedSkills = [');
  const suggEnd = code.indexOf('  ];\\n', suggStart);
  let suggBlock = '';
  if (suggStart !== -1 && suggEnd !== -1) {
      suggBlock = code.substring(suggStart, suggEnd + 5);
      code = code.substring(0, suggStart) + code.substring(suggEnd + 5);
  }

  // Unindent
  block = block.split('\\n').map(l => l.startsWith('  ') ? l.substring(2) : l).join('\\n');
  suggBlock = suggBlock.split('\\n').map(l => l.startsWith('  ') ? l.substring(2) : l).join('\\n');

  const insertIndex = code.indexOf('function Account() {');
  code = code.substring(0, insertIndex) + suggBlock + '\\n' + block + '\\n' + code.substring(insertIndex);
}

code = code.replace(/const SkillsInput = \\(\\) => \\(/g, 'const renderSkillsInput = () => (');
code = code.replace(/<SkillsInput \\/>/g, '{renderSkillsInput()}');

code = code.replace(/const ProjectsSection = \\(\\) => \\(/g, 'const renderProjectsSection = () => (');
code = code.replace(/<ProjectsSection \\/>/g, '{renderProjectsSection()}');

code = code.replace(/const JobForm = \\(\\) => \\(/g, 'const renderJobForm = () => (');
code = code.replace(/<JobForm \\/>/g, '{renderJobForm()}');

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed Acount.jsx');