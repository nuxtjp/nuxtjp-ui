"""Bounded package-content checks; not a complete secret or vulnerability audit."""
import json,pathlib,re,sys,tarfile
archive=pathlib.Path(sys.argv[1]);required={'LICENSE','NOTICE','LICENSE-PREVIOUS','THIRD_PARTY_NOTICES.md','README.md','SECURITY.md','package.json'}
patterns={
 'private-key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'token':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|npm_[A-Za-z0-9]{30,})\b',
 'AWS-access-id':r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
 'local-path':r'(?:/home/|/tmp/|[A-Za-z]:[\\/]Users[\\/])',
 'product-specific-reference':r'(?i)(?:@nuxtjp/management-layout|coela-release|ihat-store|hatter-owner|nerp-owner)',
 'credential-in-url':r'https?://[^/\s:@]+:[^/\s@]+@'
}
findings=[];entries={}
with tarfile.open(archive,'r:gz') as tar:
 for member in tar.getmembers():
  if member.isdir():continue
  assert member.isfile() and not member.issym() and not member.islnk(),'Unexpected archive link'
  path=pathlib.PurePosixPath(member.name);assert path.parts[0]=='package' and '..' not in path.parts
  name=path.relative_to('package').as_posix();assert name not in entries,'Duplicate entry'
  assert name in required or name == 'README.ja.md' or name.startswith(('dist/', 'security/')),'Unexpected package file: '+name
  assert member.size<=5_000_000,'Oversized file';data=tar.extractfile(member).read();entries[name]=data
  text=data.decode('utf-8',errors='replace')
  for label,pattern in patterns.items():
   if re.search(pattern,text):findings.append({'file':name,'pattern':label})
assert required<=entries.keys(),'Missing legal/documentation files'
manifest=json.loads(entries['package.json']);assert manifest['name']=='@nuxtjp/ui' and manifest['version']=='0.1.4' and manifest['license']=='Apache-2.0'
assert set(manifest['exports'])=={'.','./core'}
for value in manifest['exports'].values():
 for target in value.values():assert target.removeprefix('./') in entries,'Missing export: '+target
for section in ['dependencies','peerDependencies']:
 for version in manifest[section].values():assert not re.match(r'(?:file:|link:|workspace:|git|https?://)',version),'Non-registry dependency'
assert not findings,json.dumps(findings)
print(json.dumps({'archive':archive.name,'files':len(entries),'uncompressed_bytes':sum(map(len,entries.values())),'manifest_and_exports':'pass','legal_files':'present','limited_patterns':'pass','pattern_names':list(patterns),'complete_secret_audit':False,'files_scanned':sorted(entries)},indent=2))

for relative, content in entries.items():
 if relative.startswith('security/'):
  expected = pathlib.Path(__file__).resolve().parents[2] / relative
  assert expected.is_file() and expected.read_bytes() == content, 'Security input differs from reviewed source'
