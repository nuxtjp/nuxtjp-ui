/** Closed exact-version rules; scoped fixes never coerce an unrelated major. */
const fs = require('node:fs');
const { installedDependencies } = require('./resolved-dependency.cjs');
const packageSelector = /^((?:@[a-z0-9._-]+\/)?[a-z0-9._-]+)(?:@(0|[1-9][0-9]{0,3}))?$/;
const versionPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
function selection(selector) {
  const match = packageSelector.exec(selector);
  if (!match) throw new Error('Unreviewed dependency selector');
  return { name: match[1], major: match[2] };
}
function requirements(policy) {
  if (!policy || policy.schemaVersion !== 2 || !policy.overrides || Array.isArray(policy.overrides)
    || typeof policy.overrides !== 'object') throw new Error('Invalid dependency policy');
  return Object.entries(policy.overrides).map(([selector, version]) => {
    const rule = selection(selector);
    if (typeof version !== 'string' || !versionPattern.test(version)
      || (rule.major !== undefined && rule.major !== version.split('.')[0])) throw new Error('Invalid fixed version');
    return { ...rule, selector, version };
  });
}
function validateOverrides(rules, overrides) {
  for (const [selector, target] of Object.entries(overrides)) {
    const tail = selector.split('>').at(-1);
    for (const rule of rules) {
      if (tail !== rule.name && !tail.startsWith(rule.name + '@')) continue;
      let existing;
      try { existing = selection(tail); }
      catch { throw new Error('A dependency override conflicts with the reviewed selector policy'); }
      if (rule.major !== undefined) {
        if (existing.major === undefined) throw new Error('A broad dependency override conflicts with major-scoped fixes');
        if (existing.major !== rule.major) continue;
      }
      if (target !== rule.version) throw new Error('A dependency override conflicts; review it before applying');
    }
  }
}
function checkVersions(policy, observed) {
  const rules = requirements(policy);
  for (const [name, versions] of Object.entries(observed)) {
    const selected = rules.filter(rule => rule.name === name);
    for (const version of versions) {
      if (typeof version !== 'string' || !versionPattern.test(version)) throw new Error('Invalid installed version');
      const applicable = selected.filter(rule => rule.major === undefined || rule.major === version.split('.')[0]);
      if (applicable.length !== 1 || applicable[0].version !== version) {
        throw new Error('Installed dependency version is outside the reviewed security policy');
      }
    }
  }
}
function verifyInstalledPolicy(root, policy) {
  const names = new Set(requirements(policy).map(rule => rule.name)), observed = {};
  for (const name of names) {
    observed[name] = installedDependencies(root, name, undefined, { allowMissing: true })
      .map(file => JSON.parse(fs.readFileSync(file, 'utf8')).version);
  }
  checkVersions(policy, observed);
  return observed;
}
module.exports = { requirements, validateOverrides, checkVersions, verifyInstalledPolicy };
