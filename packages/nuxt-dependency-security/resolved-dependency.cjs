/** Resolve a dependency through the installed application graph, ignoring unused store entries. */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

function projectManifests(root, projects = [root]) {
  root = fs.realpathSync(root);
  if (!Array.isArray(projects) || projects.length === 0 || projects.length > 256) throw new Error('Invalid selected project inventory');
  const manifests = projects.map(project => {
    if (typeof project !== 'string') throw new Error('Invalid selected project');
    const selected = fs.realpathSync(path.resolve(root, project));
    const relative = path.relative(root, selected);
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)
      || relative.split(path.sep).includes('node_modules')) throw new Error('Selected project escapes workspace boundary');
    const manifest = path.join(selected, 'package.json');
    if (fs.realpathSync(manifest) !== manifest) throw new Error('Linked project manifest refused');
    return manifest;
  });
  if (new Set(manifests).size !== manifests.length || !manifests.includes(path.join(root, 'package.json'))) {
    throw new Error('Project inventory must include the workspace root exactly once');
  }
  return manifests;
}
function installedDependencies(root, target, version, options = {}) {
  root = fs.realpathSync(root);
  const entries = new Set(projectManifests(root, options.projects));
  const pending = [...entries];
  const seen = new Set();
  const found = new Set();
  while (pending.length) {
    if (seen.size > 5000) throw new Error('Installed dependency graph exceeds verification budget');
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!fs.statSync(file).isFile() || fs.statSync(file).size > 1024 * 1024) throw new Error('Dependency manifest exceeds verification budget');
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { throw new Error('Malformed dependency manifest'); }
    if (data.name === target) {
      if (version !== undefined && data.version !== version) throw new Error('Dependency version changed; review its security patch');
      found.add(file);
    }
    const request = createRequire(file);
    const names = Object.keys({ ...data.dependencies, ...data.optionalDependencies, ...data.peerDependencies,
      ...(entries.has(file) ? data.devDependencies : {}) });
    for (const name of names) {
      let resolved = false;
      for (const location of request.resolve.paths(name + '/package.json') ?? []) {
        const candidate = path.join(location, name, 'package.json');
        if (!fs.existsSync(candidate)) continue;
        const real = fs.realpathSync(candidate);
        if (!real.startsWith(root + path.sep)) {
          throw new Error('Dependency resolves outside the selected project; select the workspace root');
        }
        pending.push(real);
        resolved = true;
        break;
      }
      if (!resolved && Object.hasOwn({ ...data.dependencies, ...(entries.has(file) ? data.devDependencies : {}) }, name)
        && !Object.hasOwn(data.optionalDependencies ?? {}, name)) {
        throw new Error('Incomplete required dependency graph');
      }
    }
  }
  if (found.size === 0 && options.allowMissing !== true) throw new Error('Dependency not present in the installed application graph');
  return [...found].sort();
}
module.exports = { installedDependencies, projectManifests };
