#!/usr/bin/env node

/**
 * Script para verificar que el código esté optimizado según nuestras mejoras
 * - SessionProvider único
 * - AuthContext centralizado
 - Sin llamadas directas a /api/auth/session
 - Sin memory leaks obvios
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

function checkOptimizations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const issues = [];
  const successes = [];
  
  // Verificar uso directo de useSession (debería solo estar en AuthContext)
  if (content.includes('useSession(') && !relativePath.includes('AuthContext')) {
    issues.push({
      type: 'DIRECT_USE_SESSION',
      message: 'Uso directo de useSession() - debería usar useAuth() del contexto'
    });
  } else if (content.includes('useSession(') && relativePath.includes('AuthContext')) {
    successes.push({
      type: 'CENTRALIZED_SESSION',
      message: '✅ useSession() centralizado en AuthContext'
    });
  }
  
  // Verificar llamadas directas a /api/auth/session
  if (content.includes('/api/auth/session')) {
    issues.push({
      type: 'DIRECT_SESSION_CALL',
      message: 'Llamada directa a /api/auth/session - debería usar token cache'
    });
  }
  
  // Verificar SessionProvider duplicados
  if (content.includes('SessionProvider') && !relativePath.includes('layout.tsx')) {
    issues.push({
      type: 'DUPLICATE_SESSION_PROVIDER',
      message: 'SessionProvider duplicado - debería solo estar en root layout'
    });
  } else if (content.includes('SessionProvider') && relativePath.includes('layout.tsx')) {
    successes.push({
      type: 'SINGLE_SESSION_PROVIDER',
      message: '✅ SessionProvider único en layout'
    });
  }
  
  // Verificar setTimeout sin cleanup
  const setTimeoutMatches = content.match(/setTimeout\s*\([^)]+\)/g);
  if (setTimeoutMatches && !content.includes('clearTimeout')) {
    issues.push({
      type: 'TIMEOUT_WITHOUT_CLEANUP',
      message: 'setTimeout sin clearTimeout cleanup'
    });
  } else if (setTimeoutMatches && content.includes('clearTimeout')) {
    successes.push({
      type: 'TIMEOUT_WITH_CLEANUP',
      message: '✅ setTimeout con cleanup'
    });
  }
  
  // Verificar fetch sin AbortController
  const fetchMatches = content.match(/fetch\s*\([^)]+\)/g);
  if (fetchMatches && !content.includes('AbortController')) {
    issues.push({
      type: 'FETCH_WITHOUT_ABORT',
      message: 'fetch sin AbortController'
    });
  }
  
  // Verificar uso de useAuth (bueno)
  if (content.includes('useAuth(')) {
    successes.push({
      type: 'USING_USE_AUTH',
      message: '✅ Usando useAuth() del contexto'
    });
  }
  
  // Verificar server components con auth()
  if (content.includes('await auth()') && !content.includes('use client')) {
    successes.push({
      type: 'SERVER_AUTH',
      message: '✅ Server component usando await auth()'
    });
  }
  
  return { issues, successes, relativePath };
}

console.log('🔍 Verificando optimizaciones de sesión y memoria...\n');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, /\.(tsx?|jsx?)$/);

let totalIssues = 0;
let totalSuccesses = 0;
const allIssues = [];
const allSuccesses = [];

files.forEach(file => {
  const result = checkOptimizations(file);
  if (result.issues.length > 0) {
    allIssues.push({
      file: result.relativePath,
      issues: result.issues
    });
    totalIssues += result.issues.length;
  }
  
  if (result.successes.length > 0) {
    allSuccesses.push({
      file: result.relativePath,
      successes: result.successes
    });
    totalSuccesses += result.successes.length;
  }
});

console.log(`📊 RESULTADOS:\n`);
console.log(`Total de archivos analizados: ${files.length}`);
console.log(`✅ Optimizaciones correctas: ${totalSuccesses}`);
console.log(`⚠️  Problemas encontrados: ${totalIssues}\n`);

if (allSuccesses.length > 0) {
  console.log('🎉 OPTIMIZACIONES IMPLEMENTADAS:\n');
  allSuccesses.forEach(item => {
    console.log(`${item.file}`);
    item.successes.forEach(success => {
      console.log(`  ${success.message}`);
    });
    console.log('');
  });
}

if (allIssues.length > 0) {
  console.log('⚠️  PROBLEMAS ENCONTRADOS:\n');
  allIssues.forEach(item => {
    console.log(`${item.file}`);
    item.issues.forEach(issue => {
      console.log(`  🔴 ${issue.type}: ${issue.message}`);
    });
    console.log('');
  });
}

if (totalIssues === 0) {
  console.log('🚀 ¡EXCELLENTE! Todo está optimizado.\n');
  console.log('✅ SessionProvider único');
  console.log('✅ AuthContext centralizado');
  console.log('✅ Sin llamadas directas a /api/auth/session');
  console.log('✅ Memory leaks prevenidos');
} else {
  console.log(`\n🔧 Se recomienda arreglar ${totalIssues} problema(s) para máxima optimización.`);
}

console.log('\n✅ Verificación completada.\n');
