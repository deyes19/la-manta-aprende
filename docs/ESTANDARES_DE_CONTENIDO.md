# Contenido ejecutable y revisable

Unidad versionada con grado, área, período, fuente/localizador/estado, competencias, aprendizajes, evidencias y temas procedentes del original. Las actividades son autoría didáctica y los identificadores de objetivos son técnicos; no se presentan como nuevos DBA institucionales.

Primaria: ocho momentos completos; literal de cuaderno, cada problema y revisión; una tarea por pantalla; escuchar/repetir/pista/atrás/continuar. Toda competencia digital declarada necesita una comprobación. Se guarda primer intento, apoyos y reintentos. Las producciones físicas requieren observación docente separada.

Transición: propósito y actividades rectoras, acompañamiento y modalidades oral/visual/manipulativa. El esquema rechaza el cuaderno de primaria. No se califican creatividad, gestos o habla a partir de un clic. Las áreas de navegación son experiencias integradas.

`validate:content` valida esquema, IDs globales, presencia de audio/transcripción y SHA-256 de fuentes originales. El mapa de audio permite reutilizar la misma locución; el navegador no usa un sintetizador remoto. El dictado incorpora la palabra en la locución local, no en el texto visible de su pregunta.

`build-fourth-period.py` contiene los guiones. Actualizarlo al editar unidades generadas; aumentar versión si cambia el recorrido y definir migración para avances existentes. Se preservan IDs/versión del piloto original al corregir solo trazabilidad. `audio:generate` es incremental. La opción de poda de duplicados elimina solo archivos generados no rastreados por Git; nunca se necesita para una sesión de aula.

FUENTE_CONSULTADA no significa APROBADO. La institución debe revisar currículo, ejemplos, audio y actividades antes de adoptar. Una lectura automatizada y una respuesta correcta de selección no prueban autonomía del estudiante ni calidad de escritura.
