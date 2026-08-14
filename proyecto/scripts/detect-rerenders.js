#!/usr/bin/env node

/**
 * Script para detectar potenciales causas de re-renders y re-compilaciones
 * Busca:
 * 1. Componentes con estado que cambia constantemente
 * 2. useEffect sin dependencias correctas
 * 3. Funciones que se crean en cada render
 * 4. Objetos/arrays que se crean en cada render
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findFiles(filePath, pattern, results);
      }
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const issues = [];
  
  lines.forEach((line, index) => {
    // Detectar useState con Date.now() o Math.random()
    if ((line.includes('Date.now()') || line.includes('Math.random()')) && line.includes('useState')) {
      issues.push({
        type: 'DYNAMIC_STATE_INITIALIZATION',
        line: index + 1,
        content: line.trim(),
        severity: 'HIGH'
      });
    }
    
    // Detectar useEffect sin array de dependencias
    if (line.includes('useEffect(') && !line.includes('}, [') && !line.includes('}, []')) {
      issues.push({
        type: 'USE_EFFECT_WITHOUT_DEPS',
        line: index + 1,
        content: line.trim(),
        severity: 'HIGH'
      });
    }
    
    // Detectar funciones inline en JSX
    if ((line.includes('onClick={') || line.includes('onChange={')) && line.includes('() =>')) {
      issues.push({
        type: 'INLINE_FUNCTION_IN_JSX',
        line: index + 1,
        content: line.trim(),
        severity: 'MEDIUM'
      });
    }
    
    // Detectar objetos/arrays inline en JSX
    if ((line.includes('style={') || line.includes('className={')) && line.includes('{')) {
      // Esto es normal para Tailwind, pero buscar objetos complejos
      if (line.includes('{') && line.includes('}') && line.split('{').length > 3) {
        issues.push({
          type: 'COMPLEX_OBJECT_IN_JSX',
          line: index + 1,
          content: line.trim(),
          severity: 'LOW'
        });
      }
    }
    
    // Detectar setInterval/setTimeout con tiempo corto (< 1000ms)
    if ((line.includes('setInterval') || line.includes('setTimeout')) && line.match(/\d+/)) {
      const timeMatch = line.match(/(\d+)/);
      if (timeMatch && parseInt(timeMatch[1]) < 1000) {
        issues.push({
          type: 'FAST_INTERVAL',
          line: index + 1,
          content: line.trim(),
          severity: 'HIGH'
        });
      }
    }
  });
  
  return issues;
}

console.log('🔍 Buscando causas de re-renders y re-compilaciones...\n');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, /\.(tsx?|jsx?)$/);

const allIssues = [];

files.forEach(file => {
  const issues = analyzeFile(file);
  if (issues.length > 0) {
    allIssues.push({
      file: path.relative(process.cwd(), file),
      issues
    });
  }
});

console.log(`📊 RESULTADOS:\n`);
console.log(`Total de archivos analizados: ${files.length}`);
console.log(`Archivos con potenciales problemas: ${allIssues.length}\n`);

if (allIssues.length === 0) {
  console.log('✅ No se encontraron causas obvias de re-renders.\n');
} else {
  console.log('⚠️  ARCHIVOS CON POTENCIALES PROBLEMAS:\n');
  
  allIssues.forEach(item => {
    console.log(`\n${item.file}`);
    item.issues.forEach(issue => {
      const icon = issue.severity === 'HIGH' ? '🔴' : 
                   issue.severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`  ${icon} [${issue.type}] Línea ${issue.line}`);
      console.log(`     ${issue.content}`);
    });
  });
}

console.log('\n\n🎯 CHECKLIST DE RE-RENDERS:\n');
console.log('1. ✅ useState con valores estáticos (no Date.now, Math.random)');
console.log('2. ✅ useEffect siempre con array de dependencias');
console.log('3. ✅ Funciones en JSX con useCallback');
console.log('4. ✅ Objetos/arrays en JSX con useMemo');
console.log('5. ✅ Intervalos con tiempo adecuado (> 1000ms)');
console.log('6. ✅ Props estables (no crear nuevos objetos en cada render)\n');

console.log('✅ Análisis completado.\n');
