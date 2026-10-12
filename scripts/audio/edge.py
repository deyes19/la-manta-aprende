"""Prepare local Colombian narration with Edge's unofficial reader service."""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys
import edge_tts

ROOT = Path(__file__).resolve().parents[2]
VOICE = 'es-CO-SalomeNeural'
RATE = '-8%'

async def main():
    all_clips = '--all' in sys.argv
    script = "import {jobs,sampleText,normalizeText} from './scripts/audio/neural.mjs'; const list=" + ('jobs()' if all_clips else "[{id:'muestra-salome-colombiana',text:sampleText}]") + "; console.log(JSON.stringify(list.map(j=>({...j,spoken:normalizeText(j.text)}))));"
    clips = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], cwd=ROOT, text=True))
    if '--plan' in sys.argv:
        print(json.dumps({'voice': VOICE, 'clips': len(clips), 'provider': 'edge', 'credentials': False}))
        return
    output = ROOT.parent / 'entregas' / ('audio-neural-preparado' if all_clips else 'voz-muestras')
    output.mkdir(parents=True, exist_ok=True)
    completed = []
    for index, clip in enumerate(clips):
        audio = output / (clip['id'] + '.mp3')
        meta = audio.with_suffix('.json')
        config = {'provider': 'edge', 'voice': VOICE, 'rate': RATE, 'text': clip['text']}
        if not (audio.exists() and audio.stat().st_size > 128 and meta.exists() and json.loads(meta.read_text()) == config):
            temporary = audio.with_suffix('.part')
            try:
                await asyncio.wait_for(edge_tts.Communicate(clip['spoken'], VOICE, rate=RATE, proxy=os.environ.get('HTTPS_PROXY')).save(str(temporary)), 60)
                data = temporary.read_bytes()
                if len(data) < 129 or not (data[:3] == b'ID3' or (data[0] == 255 and data[1] & 224 == 224)):
                    raise ValueError('Invalid MP3')
                temporary.replace(audio)
                meta.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
            finally:
                temporary.unlink(missing_ok=True)
        completed.append({'id': clip['id'], 'file': str(audio)})
        print(f'Preparado {index + 1}/{len(clips)}: {clip["id"]}', flush=True)
    (output / 'manifest.json').write_text(json.dumps({'provider': 'edge', 'voice': VOICE, 'rate': RATE, 'files': completed}, indent=2) + '\n')

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as error:
        # Avoid exposing signed service URLs or proxy credentials in exceptions.
        print(f'Generación bloqueada: {type(error).__name__}; HTTP {getattr(error, "status", "no disponible")}. No se sustituyó audio.', file=sys.stderr)
        sys.exit(1)
