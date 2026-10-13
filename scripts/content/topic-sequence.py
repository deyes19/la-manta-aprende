"""Reviewed topic sequence; delivery changes, not new institutional curriculum."""
from copy import deepcopy
import re

def split_exercise(exercises, index, chunks):
    old = exercises[index]
    result = []
    for part, (topic, question, solution) in enumerate(chunks):
        write, review = deepcopy(old[0]), deepcopy(old[1])
        if part:
            write['id'] += f'-parte-{part+1}'
            review['id'] += f'-parte-{part+1}'
        write['text'] = [question]
        review['text'] = [question, solution]
        result.append((topic, write, review))
    return result

def written_topics(unit, exercises):
    uid, grade = unit['id'], unit['grade']
    if 'letras-y-cuento' in uid:
        return split_exercise(exercises,0,[(0,'Copia queso y quince. Encierra que y qui en las palabras.','Queso contiene que; quince contiene qui.'),(1,'Copia guerra, guitarra, cigüeña y pingüino. Encierra gue, gui, güe y güi.','Guerra: gue. Guitarra: gui. Cigüeña: güe. Pingüino: güi.')]) + [(2,*exercises[1]),(3,*exercises[2])]
    if 'inversos-oraciones' in uid:
        return split_exercise(exercises,0,[(0,'Copia az, ez, iz, oz, uz. Escribe paz y encierra az.','En paz se encierra az.'),(1,'Copia ax, ex, ix, ox, ux. Lee las tarjetas en voz baja.','La vocal va antes de x. Son tarjetas de lectura; no todas son palabras.'),(2,'Copia ad, ed, id, od, ud. Escribe salud y encierra ud.','En salud se encierra ud.')]) + [(3,*exercises[1])] + split_exercise(exercises,2,[(4,'Copia Ana siembra semillas. Subraya el sujeto y encierra el predicado.','Sujeto: Ana. Predicado: siembra semillas.'),(5,'Escribe las cuatro acciones del relato de Ana en orden.','Ana mira las semillas, prepara la tierra, siembra y riega.')])
    if 'numeros-cuerpos-datos' in uid:
        return split_exercise(exercises,0,[(0,'Escribe 264 como centenas, decenas y unidades.','264 = 200 + 60 + 4: 2 centenas, 6 decenas y 4 unidades.'),(1,'Escribe cómo se lee 264. Compara 264 y 246: escribe cuál es mayor.','264 se lee doscientos sesenta y cuatro. 264 es mayor que 246: seis decenas es más que cuatro.')]) + [(2,*exercises[1])] + split_exercise(exercises,2,[(3,'Dibuja una lata, una pelota y una caja. Escribe cilindro, esfera o prisma debajo.','Lata: cilindro. Pelota: esfera. Caja rectangular: prisma.'),(4,'Dibuja las barras de 5 mangos, 3 naranjas y 2 guayabas. Usa un cuadro por fruta.','Las barras tienen 5, 3 y 2 cuadros, con la misma escala.')])
    if 'simbolos-y-municipio' in uid:
        extension = ' Añade dos oraciones explicando quién te la enseñó y por qué quieres conservarla.' if grade==2 else ''
        return [(0,*exercises[0]),(1,*exercises[1])] + split_exercise(exercises,2,[(2,'Dibuja una tradición que tu familia conozca y escribe o dicta su nombre.'+extension,'El docente revisa tu dibujo y tu explicación de la tradición familiar.'),(3,'Escribe el lugar de nuestra escuela: Montería, Córdoba, Colombia.','Montería es el municipio; Córdoba, el departamento; Colombia, el país.')])
    if 'area-y-datos' in uid or 'fracciones' in uid:
        return [(i,*e) for i,e in enumerate(exercises)]
    if 'decimales-y-solidos' in uid:
        return [(0,*exercises[0]),(2,*exercises[1]),(4,*exercises[2])]
    if 'economia-y-ahorro' in uid:
        return [(0,*exercises[0]),(2,*exercises[1]),(1,*exercises[2])]
    if 'economia-sostenible' in uid:
        return [(2,*exercises[0]),(2,*exercises[1]),(5,*exercises[2])]
    if 'teatro' in uid:
        return [(3,*exercises[0]),(4,*exercises[1]),(4,*exercises[2])]
    raise ValueError('Falta relación didáctica explícita: '+uid)

def apply_sequence(unit, previous):
    if unit.get('approach')=='preschool':return unit
    if unit['id']=='g2-matematicas-p4-multiplicacion':return sequence_pilot(unit,previous)
    legacy = deepcopy(unit['steps'])
    learn=[s for s in legacy if s['phase']=='Aprendo']
    copy=[s for s in legacy if s['phase']=='Mi cuaderno' and s['title'].startswith('Escribe: ')]
    practice=[s for s in legacy if s['phase']=='Practico']
    writing=[s for s in legacy if s['title'].startswith('Resuelve el ejercicio')]
    reviews=[s for s in legacy if s['title'].startswith('Revisa el ejercicio')]
    if 'teatro' in unit['id']:
        excerpt='\n'.join(learn[4]['text'][1].split('\n')[:3])
        learn[2]['text'][1]=excerpt
        copy[2]['text'][2]=excerpt
    exercises=list(zip(writing,reviews))
    assigned=written_topics(unit,exercises)
    prefix=[s for s in legacy if s['phase'] in ['Hoy aprenderé','Descubro'] or s['title']=='Fecha y título']
    ending=[s for s in legacy if s['phase'] in ['Mi misión','Demuestro lo aprendido','Terminé']]
    topics=[];ordered=[];inherit={}
    for i,(explain,note,try_it) in enumerate(zip(learn,copy,practice)):
        topic=dict(id=f'tema-{i+1}',title=explain['title'])
        topics.append(topic)
        title=deepcopy(note);title['id']+='-titulo';title['title']='Escribe el título del tema';title['text']=['Tema: '+topic['title']];title['instruction']='Deja una línea en tu cuaderno. Escribe solo el título que aparece aquí. Trabajaremos este tema antes de pasar al siguiente.'
        idea=deepcopy(note);idea['title']='Escribe la idea de este tema';idea['text']=[note['text'][1]];idea['instruction']='Debajo del título de este tema, copia únicamente esta idea. Hazlo despacio y escucha otra vez si lo necesitas.'
        example=deepcopy(note);example['id']+='-ejemplo';example['title']='Copia el ejemplo del tema';example['text']=[note['text'][2]];example['instruction']='Copia este ejemplo debajo de la idea. Observa el modelo de la pantalla: puedes usar sus formas sencillas en tu dibujo.'
        if explain.get('visual'):example['visual']=deepcopy(explain['visual'])
        else:example['drawingModel']='semillas' if unit['subject']=='Matemáticas' else 'personajes' if unit['subject']=='Lengua Castellana' else 'comunidad'
        inherit[note['id']]=[title['id'],example['id']]
        chunk=[explain,title,idea,example]
        local_number=0
        for topic_index,write,review in assigned:
            if topic_index!=i:continue
            local_number+=1
            question=re.sub(r'^\d+\.\s*','',write['text'][0])
            write['title']=f'Resuelve el ejercicio {local_number} de este tema';write['text']=[f'{local_number}. {question}'];write['instruction']='Copia este ejercicio debajo del ejemplo de este tema. Realiza lo que pide. Cuando termines, continuarás a su revisión.'
            review['title']=f'Revisa el ejercicio {local_number} de este tema';review['text'][0]=write['text'][0]
            chunk.extend([write,review])
            for original in exercises:
                if write['id'].startswith(original[0]['id']+'-parte-'):inherit.setdefault(original[0]['id'],[]).append(write['id'])
                if review['id'].startswith(original[1]['id']+'-parte-'):inherit.setdefault(original[1]['id'],[]).append(review['id'])
        chunk.append(try_it)
        for s in chunk:s['topic']=topic
        ordered.extend(chunk)
    prefix[0]['instruction']=f'Busca tu cuaderno de {unit["subject"]}, lápiz y colores. Trabajaremos un tema a la vez: aprende, escribe, resuelve, revisa y practica. Después pasarás al siguiente. Puedes descansar y reanudar.'
    unit['steps']=prefix+ordered+ending
    unit['topics']=topics
    install_migration(unit,previous,legacy,inherit)
    enrich_math(unit)
    return unit

def install_migration(unit,previous,legacy,inherit):
    unit['version']=2
    if previous and previous.get('version')==2:
        unit['migrations']=deepcopy(previous['migrations'])
    else:
        unit['migrations']=[dict(fromVersion=1,stepOrder=[s['id'] for s in legacy],completedFrom=inherit)]
    unit['metadata']['note'] += ' Secuencia de autoría por temas; revisión pedagógica pendiente.'

def sequence_pilot(unit,previous):
    by_id={s['id']:s for s in unit['steps']};legacy=deepcopy(unit['steps'])
    sets=[('La multiplicación y los grupos iguales',['iguales','suma','cuaderno-idea','cuaderno-ejemplo','practica-suma'])]
    for n in [2,3,4,5]:
        ids=[f'tabla-{n}',f'cuaderno-tabla-{n}']
        exercise={2:1,3:2,5:3}.get(n)
        if exercise:ids.extend([f'cuaderno-ejercicio-{exercise}',f'cuaderno-revision-{exercise}'])
        ids.append(f'practica-{n}');sets.append((f'La tabla del {n}',ids))
    ordered=[];topics=[]
    for i,(title,ids) in enumerate(sets,1):
        topic=dict(id=f'tema-{i}',title=title);topics.append(topic)
        for sid in ids:
            by_id[sid]['topic']=topic;ordered.append(by_id[sid])
    unit['steps']=[by_id[s] for s in ['bienvenida','descubro','cuaderno-titulo']]+ordered+[by_id[s] for s in ['mision','mision-cuaderno','evaluacion-grupos','evaluacion-suma','evaluacion-multiplicacion','evaluacion-problema','cierre']]
    unit['topics']=topics
    install_migration(unit,previous,legacy,{})
    enrich_math(unit)
    return unit

def enrich_math(unit):
    if unit['id']=='g2-matematicas-p4-multiplicacion':
        for s in unit['steps']:
            if s['id'] in ['practica-2','practica-3','practica-4','practica-5']:
                total=s['groups'][0]*s['groups'][1]
                s['activity']['kind']='groups';s['activity']['answer']=total
                s['activity']['prompt']=f'Forma {s["groups"][0]} grupos con {s["groups"][1]} objetos en cada uno. Toca cada grupo para añadir objetos. Comprueba cuando todos tengan la misma cantidad.'
                s['instruction']='Construye los grupos de esta tabla con los dibujos. Si agregas un objeto de más, usa Quitar un objeto. Después pulsa Comprobar.'
                s['drawingModel']='semillas'
    if 'g3-matematicas-p4-fracciones' in unit['id']:
        for s in unit['steps']:
            if s['phase']=='Practico' and s['title']=='Practica: Partes iguales de un entero':
                s['activity']['kind']='fraction';s['activity']['answer']=3;s['activity'].pop('choices',None)
                s['activity']['prompt']='Colorea tres de las cuatro partes iguales del entero. Puedes tocar de nuevo una parte para quitarle el color.'
            if s['phase']=='Practico' and s['title']=='Practica: Seguimos las tablas de multiplicar':
                s['activity']['kind']='groups';s['groups']=[3,7,'🌱']
                s['activity']['prompt']='Construye 3 filas con 7 plantas en cada una. Toca cada fila para colocar las plantas y comprueba tus grupos.'
                s['instruction']='Construye las filas de plantas con los dibujos. Cuenta una fila a la vez. Después pulsa Comprobar.'

            if s['phase']=='Practico' and s['title']=='Practica: Mitad, tercera y cuarta parte':
                s['activity']['kind']='groups';s['activity']['answer']=12;s['groups']=[4,3,'🌰'];s.pop('visual',None)
                s['activity']['prompt']='Reparte 12 semillas en 4 grupos iguales para encontrar la cuarta parte. Toca cada grupo para añadir semillas y comprueba.'
                s['instruction']='Reparte una semilla a cada grupo por turno. Sigue hasta colocar 12. Todos deben tener la misma cantidad.'

            if s['phase']=='Mi misión':
                s['activity']['kind']='groups';s['activity']['answer']=16;s['groups']=[4,4,'🥭']
                s['activity']['prompt']='Reparte los 16 mangos en cuatro grupos iguales. Construye los grupos y comprueba; después dibuja el reparto en tu cuaderno.'
                s['instruction']='Reparte los mangos con los dibujos de la pantalla. Cada grupo debe tener la misma cantidad. Después dibuja los cuatro grupos en tu cuaderno y escribe la cuarta parte de 16.'
            if s['phase']=='Demuestro lo aprendido' and s['title']=='Reto 3: reparto':
                s['activity']['kind']='groups';s['activity']['answer']=18;s['groups']=[2,9,'🌰']
                s['activity']['prompt']='Encuentra la mitad de 18 semillas repartiendo las 18 en dos grupos iguales. Construye y comprueba.'
            if s['phase']=='Demuestro lo aprendido' and s['title']=='Reto 4: tabla':
                s['activity']['kind']='groups';s['groups']=[8,4,'🌱']
                s['activity']['prompt']='Representa 8 × 4: construye ocho grupos de cuatro plantas y comprueba el total.'
