"""Package the tested build and source without credentials, caches, or student data."""
from pathlib import Path
import zipfile,hashlib
root=Path(__file__).resolve().parent.parent
out=root.parent/'entregas';out.mkdir(exist_ok=True)
with zipfile.ZipFile(out/'La_Manta_Aprende_Cuarto_Periodo.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in (root/'apps/web/dist').rglob('*'):
  if p.is_file():z.write(p,'La_Manta_Aprende/apps/web/dist/'+p.relative_to(root/'apps/web/dist').as_posix())
 for n in ['scripts/serve-dist.mjs','scripts/iniciar-windows.cmd','docs/INSTALACION_WINDOWS.md','docs/MANUAL_DOCENTE.md','docs/MATRIZ_TRAZABILIDAD.md','docs/ALCANCE_CUARTO_PERIODO.md','docs/ENTREGA_2.md']:
  z.write(root/n,'La_Manta_Aprende/'+n)
 z.writestr('La_Manta_Aprende/LEEME.txt','LA MANTA APRENDE - CUARTO PERIODO\n19 rutas de transicion a quinto en Matematicas, Lenguaje y Sociales.\nDescomprime todo. Necesitas Node.js 24 LTS instalado.\nWindows: abre scripts/iniciar-windows.cmd.\nLinux: node scripts/serve-dist.mjs\nAbre http://localhost:4173. Espera la preparacion sin internet.\nNo requiere npm ni internet de aula. No abras index.html por file://.\nLee docs/INSTALACION_WINDOWS.md y docs/ENTREGA_2.md.\nFUENTE_CONSULTADA; aprobacion pedagogica pendiente.\n')
 for name in ['react','react-dom','idb','zod','workbox-core','workbox-precaching','workbox-routing','workbox-strategies','workbox-window']:
  path=root/'node_modules'/name
  for f in path.iterdir():
   if f.is_file() and f.name.upper().startswith('LICENSE'):z.write(f,'La_Manta_Aprende/licencias/'+name+'-'+f.name)
with zipfile.ZipFile(out/'La_Manta_Aprende_Codigo_Cuarto_Periodo.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in root.rglob('*'):
  rel=p.relative_to(root)
  if any(v in ['node_modules','.git','dist','test-results','playwright-report','__pycache__'] for v in rel.parts):continue
  if p.is_file():z.write(p,'la-manta-aprende/'+rel.as_posix())
for name in ['La_Manta_Aprende_Cuarto_Periodo.zip','La_Manta_Aprende_Codigo_Cuarto_Periodo.zip']:
 p=out/name
 with zipfile.ZipFile(p) as z:assert z.testzip() is None
 print(name,p.stat().st_size,'bytes',hashlib.sha256(p.read_bytes()).hexdigest())
