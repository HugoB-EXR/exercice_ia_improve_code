# Prompt — C++ Parser de capteurs embarqué

> Coller ce prompt dans **GitHub Copilot Chat** (VSCode).
> Les références `#file:` injectent automatiquement le contenu des fichiers comme contexte.

---

```markdown
[CONTEXT]
Projet : Firmware de robot agricole (critique pour la sécurité)
Matériel : ARM Cortex-M4, 128 Ko RAM
Fréquence d'appel : 100 Hz (boucle temps réel)
Standards : C99, zéro allocation heap, entièrement réentrant
Compilateur : GCC avec -Wall -Wextra -Werror

Fichiers de référence :
- legacy_code.cpp : implémentation actuelle (défaillante)
- analyse_cpp_sensor.md : 5 problèmes critiques identifiés

[OBJECTIF]
Réécrire complètement parse_sensors() en résolvant tous les problèmes listés dans analyse_cpp_sensor.md

[SPÉCIFICATIONS]

Signature obligatoire :
```c
int parse_sensors(const char* raw_data, SensorData* out);
```

Structure de sortie :
```c
typedef struct {
    float temperature;  // Celsius
    float humidity;     // Percentage
} SensorData;
```

Codes retour :

- CODE_OK (0) : Succès
- ERR_NULL_INPUT (-1) : raw_data ou out est NULL
- ERR_TOO_LONG (-2) : raw_data > 64 caractères
- ERR_INVALID_FORMAT (-3) : Format parsing invalide
- ERR_TEMP_OUT_OF_RANGE (-4) : Température hors [-40.0, 85.0]
- ERR_HUM_OUT_OF_RANGE (-5) : Humidité hors [0.0, 100.0]

Contraintes d'implémentation :

- Buffer local sur la pile uniquement (max 64 octets, vérifier la taille à l'entrée)
- Utiliser strtok_r() sur copie locale de raw_data (pas strtok)
- Remplacer sprintf/strcat par snprintf avec suivi de la taille restante
- Zéro allocation heap (pas de malloc/calloc/realloc)
- Zéro état global mutable
- Entièrement réentrant (thread-safe)
- Valider les plages : temp dans les valeurs [-40.0, 85.0], humidity dans les valeurs [0.0, 100.0]
- Si tu définis des variables, les initialiser à des valeurs cohérentes

[EXEMPLES]

Cas valides :
Input : "23.5,67.2"
Output : SensorData{temp=23.5, hum=67.2}, return 0

Cas invalides :
Input : NULL           → return ERR_NULL_INPUT
Input : "23.5"         → return ERR_INVALID_FORMAT (manque virgule/humidité)
Input : "90.0,50.0"    → return ERR_TEMP_OUT_OF_RANGE (90 > 85)
Input : "20.0,120.0"   → return ERR_HUM_OUT_OF_RANGE (120 > 100)
Input : [65 chars]     → return ERR_TOO_LONG

[LIVRABLE]

Fichier : parse_sensors.c (complet et compilable standalone)

Structure du fichier (dans cet ordre) :

1. Commentaire d'en-tête avec exemple d'utilisation
2. Includes nécessaires (#include <string.h>, etc.)
3. Constantes d'erreur (#define ERR_...)
4. Définition du type SensorData (typedef struct)
5. Implémentation de parse_sensors()
6. Bref commentaire technique (3-4 lignes) expliquant le choix de strtok_r et snprintf

Exemple de header attendu :
```c
// parse_sensors.c - Safe embedded sensor parser
// Usage:
//   SensorData data;
//   int result = parse_sensors("23.5,67.2", &data);
//   if (result == 0) { /* use data, no free() needed */ }
```

Le code doit compiler sans warning ni erreur avec :
gcc -std=c99 -Wall -Wextra -Werror parse_sensors.c
```
