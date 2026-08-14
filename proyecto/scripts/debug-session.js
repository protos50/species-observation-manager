#!/usr/bin/env node

/**
 * Script de diagnóstico para detectar múltiples llamadas a useSession()
 * Busca todos los archivos que usan useSession y cuenta las instancias
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
  
  const useSessionCalls = [];
  const useRoleAuthCalls = [];
  
  lines.forEach((line, index) => {
    if (line.includes('useSession()')) {
      useSessionCalls.push({ line: index + 1, content: line.trim() });
    }
    if (line.includes('useRoleAuth()')) {
      useRoleAuthCalls.push({ line: index + 1, content: line.trim() });
    }
  });
  
  return { useSessionCalls, useRoleAuthCalls };
}

console.log('🔍 Analizando archivos que usan useSession()...\n');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, /\.(tsx?|jsx?)$/);

let totalUseSession = 0;
let totalUseRoleAuth = 0;
const problematicFiles = [];

files.forEach(file => {
  const { useSessionCalls, useRoleAuthCalls } = analyzeFile(file);
  
  if (useSessionCalls.length > 0 || useRoleAuthCalls.length > 0) {
    const relativePath = path.relative(process.cwd(), file);
    
    problematicFiles.push({
      path: relativePath,
      useSession: useSessionCalls.length,
      useRoleAuth: useRoleAuthCalls.length,
      calls: { useSessionCalls, useRoleAuthCalls }
    });
    
    totalUseSession += useSessionCalls.length;
    totalUseRoleAuth += useRoleAuthCalls.length;
  }
});

console.log('📊 RESUMEN:\n');
console.log(`Total de archivos con useSession(): ${problematicFiles.filter(f => f.useSession > 0).length}`);
console.log(`Total de llamadas a useSession(): ${totalUseSession}`);
console.log(`Total de archivos con useRoleAuth(): ${problematicFiles.filter(f => f.useRoleAuth > 0).length}`);
console.log(`Total de llamadas a useRoleAuth(): ${totalUseRoleAuth}\n`);

console.log('📁 ARCHIVOS DETALLADOS:\n');

problematicFiles.forEach(file => {
  console.log(`\n${file.path}`);
  if (file.useSession > 0) {
    console.log(`  ⚠️  useSession(): ${file.useSession} llamada(s)`);
    file.calls.useSessionCalls.forEach(call => {
      console.log(`     Línea ${call.line}: ${call.content}`);
    });
  }
  if (file.useRoleAuth > 0) {
    console.log(`  ℹ️  useRoleAuth(): ${file.useRoleAuth} llamada(s)`);
    file.calls.useRoleAuthCalls.forEach(call => {
      console.log(`     Línea ${call.line}: ${call.content}`);
    });
  }
});

console.log('\n\n🎯 ANÁLISIS:');
console.log(`\nCada componente que usa useRoleAuth() internamente llama a useSession().`);
console.log(`Si tienes ${totalUseRoleAuth} componentes usando useRoleAuth(), eso significa`);
console.log(`${totalUseRoleAuth} llamadas adicionales a useSession() en cada render.\n`);

if (totalUseSession + totalUseRoleAuth > 5) {
  console.log('⚠️  ADVERTENCIA: Demasiadas llamadas a useSession()!');
  console.log('   Esto puede causar múltiples requests a /api/auth/session\n');
}

console.log('✅ Análisis completado.\n');
