#!/usr/bin/env node

/**
 * Script para detectar potenciales memory leaks en el código
 * Busca:
 * 1. setInterval/setTimeout sin cleanup
 * 2. addEventListener sin removeEventListener
 * 3. useEffect sin cleanup
 * 4. fetch/API calls en loops
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
  
  // Detectar setInterval/setTimeout sin cleanup
  lines.forEach((line, index) => {
    if ((line.includes('setInterval') || line.includes('setTimeout')) && !line.includes('clearInterval') && !line.includes('clearTimeout')) {
      // Verificar si hay cleanup en los próximos 20 líneas
      let hasCleanup = false;
      for (let i = index; i < Math.min(index + 20, lines.length); i++) {
        if (lines[i].includes('clearInterval') || lines[i].includes('clearTimeout')) {
          hasCleanup = true;
          break;
        }
      }
      if (!hasCleanup && !line.trim().startsWith('//')) {
        issues.push({
          type: 'INTERVAL_WITHOUT_CLEANUP',
          line: index + 1,
          content: line.trim(),
          severity: 'HIGH'
        });
      }
    }
  });
  
  // Detectar addEventListener sin removeEventListener
  lines.forEach((line, index) => {
    if (line.includes('addEventListener') && !line.includes('removeEventListener')) {
      let hasRemove = false;
      for (let i = index; i < Math.min(index + 20, lines.length); i++) {
        if (lines[i].includes('removeEventListener')) {
          hasRemove = true;
          break;
        }
      }
      if (!hasRemove && !line.trim().startsWith('//')) {
        issues.push({
          type: 'EVENT_LISTENER_WITHOUT_CLEANUP',
          line: index + 1,
          content: line.trim(),
          severity: 'HIGH'
        });
      }
    }
  });
  
  // Detectar useEffect sin return (cleanup)
  let inUseEffect = false;
  let useEffectStart = 0;
  lines.forEach((line, index) => {
    if (line.includes('useEffect(') && line.includes('=>')) {
      inUseEffect = true;
      useEffectStart = index;
    }
    if (inUseEffect && line.includes('}, [')) {
      // Verificar si hay return antes del cierre
      let hasReturn = false;
      for (let i = useEffectStart; i <= index; i++) {
        if (lines[i].includes('return')) {
          hasReturn = true;
          break;
        }
      }
      
      // Si no hay return y hay setInterval/addEventListener, es sospechoso
      let hasPotentialLeak = false;
      for (let i = useEffectStart; i <= index; i++) {
        if (lines[i].includes('setInterval') || lines[i].includes('addEventListener') || lines[i].includes('fetch')) {
          hasPotentialLeak = true;
          break;
        }
      }
      
      if (!hasReturn && hasPotentialLeak) {
        issues.push({
          type: 'USE_EFFECT_WITHOUT_CLEANUP',
          line: useEffectStart + 1,
          content: lines[useEffectStart].trim(),
          severity: 'MEDIUM'
        });
      }
      
      inUseEffect = false;
    }
  });
  
  return issues;
}

console.log('🔍 Buscando potenciales memory leaks...\n');

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
console.log(`Archivos con potenciales leaks: ${allIssues.length}\n`);

if (allIssues.length === 0) {
  console.log('✅ No se encontraron potenciales memory leaks obvios.\n');
} else {
  console.log('⚠️  ARCHIVOS CON POTENCIALES LEAKS:\n');
  
  allIssues.forEach(item => {
    console.log(`\n${item.file}`);
    item.issues.forEach(issue => {
      const icon = issue.severity === 'HIGH' ? '🔴' : '🟡';
      console.log(`  ${icon} [${issue.type}] Línea ${issue.line}`);
      console.log(`     ${issue.content}`);
    });
  });
}

console.log('\n\n🎯 CHECKLIST DE MEMORY LEAKS:\n');
console.log('1. ✅ setInterval/setTimeout → siempre usar clearInterval/clearTimeout');
console.log('2. ✅ addEventListener → siempre usar removeEventListener');
console.log('3. ✅ useEffect con side effects → siempre retornar cleanup function');
console.log('4. ✅ Observables/Subscriptions → siempre unsubscribe');
console.log('5. ✅ Timers en useEffect → guardar ID y limpiar en return\n');

console.log('✅ Análisis completado.\n');
