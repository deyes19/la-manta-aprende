"""Build a signed, fully bundled Android APK using the official SDK; no Gradle downloads.
Set MANTA_ANDROID_SDK to an SDK directory. Signing material stays OUTSIDE this checkout.
"""
from pathlib import Path
import hashlib,json,os,secrets,shutil,subprocess,zipfile

ROOT=Path(__file__).resolve().parent.parent
SDK=Path(os.environ.get('MANTA_ANDROID_SDK', '/workspace/manta-portable-tools/android-sdk'))
APP=ROOT/'apps/android';BUILD=APP/'build';DIST=ROOT/'apps/web/dist-android'
OUT=ROOT.parent/'entregas';OUT.mkdir(exist_ok=True)
KEYS=Path(os.environ.get('MANTA_ANDROID_SIGNING_DIR', str(ROOT.parent/'.manta-android-signing'))).resolve()
if KEYS.is_relative_to(ROOT):raise RuntimeError('La clave de firma debe estar fuera del repositorio.')
KEYS.mkdir(mode=0o700,parents=True,exist_ok=True)
KEY=KEYS/'la-manta-aprende.jks';PASSWORD=KEYS/'password'

def run(*args):subprocess.run([str(a) for a in args],cwd=ROOT,check=True)

android=next(SDK.rglob('android.jar'))
tools=next(SDK.rglob('aapt2')).parent
if not (DIST/'index.html').exists():raise RuntimeError('Falta compilar con VITE_MANTA_DISTRIBUTION=android y salida dist-android.')
BUILD.mkdir(parents=True,exist_ok=True)
for folder in ['compiled','generated','classes','dex']:
 if (BUILD/folder).exists():shutil.rmtree(BUILD/folder)
 (BUILD/folder).mkdir(exist_ok=True)
run(tools/'aapt2','compile','--dir',APP/'res','-o',BUILD/'compiled')
run(tools/'aapt2','link','--manifest',APP/'AndroidManifest.xml','-I',android,'--java',BUILD/'generated','-o',BUILD/'resources.apk',*[str(p) for p in sorted((BUILD/'compiled').glob('*.flat'))])
sources=sorted((APP/'src').rglob('*.java'))+sorted((BUILD/'generated').rglob('*.java'))
run('java','-m','jdk.compiler/com.sun.tools.javac.Main','-source','8','-target','8','-bootclasspath',android,'-encoding','UTF-8','-d',BUILD/'classes',*sources)
run('java','-cp',tools/'lib/d8.jar','com.android.tools.r8.D8','--release','--min-api','26','--lib',android,'--output',BUILD/'dex',*[str(p) for p in sorted((BUILD/'classes').rglob('*.class'))])
unsigned=BUILD/'unsigned.apk';shutil.copyfile(BUILD/'resources.apk',unsigned)
# Only prepared application assets: no sources, student data, keys, or curriculum originals.
with zipfile.ZipFile(unsigned,'a',zipfile.ZIP_DEFLATED,compresslevel=6) as apk:
 for p in sorted((BUILD/'dex').glob('*.dex')):apk.write(p,p.name)
 for p in sorted(DIST.rglob('*')):
  if p.is_file() and p.name!='sw.js' and not p.name.startswith('workbox-'):
   apk.write(p,'assets/www/'+p.relative_to(DIST).as_posix())
 licenses=[]
 for name in ['react','react-dom','scheduler','idb','zod']:
  for p in (ROOT/'node_modules'/name).glob('LICENSE*'):licenses.append(name+'\n'+p.read_text())
 apk.writestr('assets/LICENCIAS.txt','\n\n'.join(licenses))
run(tools/'zipalign','-f','4',unsigned,BUILD/'aligned.apk')
if KEY.exists() != PASSWORD.exists():raise RuntimeError('Falta una parte de la firma existente; no se generará una identidad diferente.')
if not KEY.exists():
 PASSWORD.write_text(secrets.token_urlsafe(40)+'\n');PASSWORD.chmod(0o600)
 run('keytool','-genkeypair','-keystore',KEY,'-storetype','PKCS12','-storepass:file',PASSWORD,'-keypass:file',PASSWORD,'-alias','manta','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=La Manta Aprende, OU=Distribucion educativa, O=Proyecto La Manta Aprende, C=CO')
 KEY.chmod(0o600)
output=OUT/'La_Manta_Aprende_Android_Sin_Internet.apk'
run(tools/'apksigner','sign','--ks',KEY,'--ks-pass','file:'+str(PASSWORD),'--ks-key-alias','manta','--v4-signing-enabled','false','--out',output,BUILD/'aligned.apk')
run(tools/'apksigner','verify','--verbose','--print-certs',output)
run(tools/'zipalign','-c','4',output)
with zipfile.ZipFile(output) as apk:
 if apk.testzip() is not None:raise RuntimeError('APK corrupto')
 for filename in ['index.html','audio/inicio.mp3','audio/transcripts.json']:
  if 'assets/www/'+filename not in apk.namelist():raise RuntimeError('Falta recurso offline: '+filename)
 verified=BUILD/'verified-assets'
 if verified.exists():shutil.rmtree(verified)
 for name in apk.namelist():
  if name.startswith('assets/www/') and not name.endswith('/'):
   target=verified/name[len('assets/www/'):];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(apk.read(name))
 metadata=dict(filename=output.name,bytes=output.stat().st_size,sha256=hashlib.sha256(output.read_bytes()).hexdigest(),version='0.3.0',androidMinimum='8.0',internetPermission=False,files=len(apk.namelist()))
(OUT/'La_Manta_Aprende_Android_SHA256.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(metadata,ensure_ascii=False,indent=2))
