# Prompt — TypeScript API Parcelles

> Coller ce prompt dans **GitHub Copilot Chat** (VSCode).
> Les références `#file:` injectent automatiquement le contenu des fichiers comme contexte.

---

```text
[CONTEXT]
Projet : Application web de tableau de bord agricole
Stack : TypeScript 5.3+ (mode strict), Vanilla HTML/CSS
Environnement : Rural 4G (instable, latence variable)
Usage : 500+ parcelles, sélection déroulante en temps réel
Mainteneurs : 3 développeurs juniors

Fichiers de référence (attachés) :
- legacy_code.ts : implémentation actuelle (fetch non sécurisé)
- legacy_code.html : interface utilisateur actuelle
- analyse_typescript_api.md : 6 problèmes critiques identifiés
- best_practices_typescript.md : patterns à respecter obligatoirement

[OBJECTIF]
Réécrire complètement le module de fetch parcelles en résolvant tous les problèmes identifiés ET en appliquant les bonnes pratiques définies

[SPÉCIFICATIONS TECHNIQUES]

Types & Interfaces :
```typescript
interface ParcelData {
  id: string;
  name: string;
  area: number;      // hectares
  crop: string;      // type de culture
}

class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

Signature fonction principale :

```typescript
async function fetchParcelData(parcelId: string): Promise<ParcelData>
```

Contraintes d'implémentation :

1. **Typage strict**
   - Mode strict TypeScript (pas de any, pas d'any implicite)
   - Garde de type runtime : `function isParcelData(obj: unknown): obj is ParcelData`
   - Validation structure JSON avant utilisation

2. **Sécurité**
   - Remplacer TOUS les innerHTML par textContent
   - Encoder parcelId avec encodeURIComponent
   - Assainir toutes les entrées utilisateur
   - Pas d'exécution de code dynamique

3. **Gestion réseau (4G instable)**
   - AbortController pour annulation
   - Timeout de 10 secondes
   - Gestion erreurs HTTP (404, 500, timeout, panne réseau)
   - Nouvelle tentative automatique sur timeout (1 tentative max)

4. **Performance & Cache**
   - Cache en mémoire : Map<string, CacheEntry>
   - CacheEntry : `{ data: ParcelData; timestamp: number }`
   - Expiration : 5 minutes (300000 ms)
   - Invalidation automatique sur cache expiré

5. **UX**
   - Indicateur de chargement pendant la requête
   - Affichage des erreurs convivial (sans stack trace)
   - Désactiver la liste déroulante pendant le chargement
   - Effacer les données précédentes avant une nouvelle requête

6. **Architecture**
   - Séparation des responsabilités : requête / cache / affichage / gestion d'erreurs
   - Fonctions pures où possible (testables unitairement)
   - Pas d'état global mutable (sauf cache Map const)

[EXEMPLES DE COMPORTEMENT]

Cas nominal :

```typescript

// Premier appel (cache miss)
await fetchParcelData("PARC-2024-001")
// → HTTP GET, mise en cache, return ParcelData

// Second appel < 5min (cache hit)
await fetchParcelData("PARC-2024-001")
// → Retour immédiat depuis cache, pas de HTTP
```

Gestion erreurs :

```typescript

// Cas 1 : ID invalide
fetchParcelData("")
// → throw new Error("Invalid parcelId: must be non-empty string")

// Cas 2 : HTTP 404
fetchParcelData("PARC-UNKNOWN")
// → throw new ApiError(404, "Parcel not found", "/api/parcels/PARC-UNKNOWN")

// Cas 3 : Timeout réseau
fetchParcelData("PARC-2024-001") // réseau lent
// → throw new ApiError(408, "Request timeout after 10s")

// Cas 4 : JSON invalide
// API retourne { "wrong": "structure" }
// → throw new Error("Invalid API response: missing required fields")
```

Conditions de compétition :

```typescript
// L'utilisateur clique rapidement sur la liste déroulante : A → B → A
// Comportement attendu :
// 1. Fetch A commence
// 2. Fetch B commence → abort fetch A (AbortController)
// 3. Fetch A recommence → abort fetch B
// Résultat : seulement dernier fetch A aboutit
```

[LIVRABLES]

- Fichier 1 : parcel-api.ts (module complet et autonome)
- Fichier 2 : index.html (nouvelle version optimisée)


[CRITÈRES DE VALIDATION]

Le code livré doit :

- Compiler sans erreur avec `tsc --strict`
- Passer ESLint avec règles TypeScript recommandées
- Ne contenir AUCUN innerHTML
- Gérer tous les cas d'erreur listés dans [EXEMPLES]
- Supporter les conditions de compétition (sélections rapides de la liste déroulante)
- Fonctionner hors ligne (cache) puis réessayer en ligne
- Afficher les états de chargement/erreur appropriés
- Être testable unitairement (fonctions pures séparées)

[CONTRAINTES ADDITIONNELLES]

- Pas de dépendances externes (ni axios, ni lodash, ni framework)
- Code doit fonctionner dans Chrome 120+, Firefox 120+, Safari 17+
- Total < 300 lignes (TypeScript + HTML)
- Commentaires JSDoc sur fonctions publiques uniquement
- Noms de variables/fonctions en anglais (cohérence avec codebase)
- Documente fonction jsdoc

```
