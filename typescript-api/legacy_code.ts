// fetchParcelData.ts
// Contexte : Dashboard agricole, 500+ parcelles
// Connexion : 4G rural instable
// Appelé à chaque sélection dropdown

const _parcelCache: Record<string, any> = {};

async function getParcelInfo(parcelId: any): Promise<any> {
    // Fix: première option vide
    if (!parcelId) return null;

    // Fix: cache
    if (_parcelCache[parcelId]) {
        const cached = _parcelCache[parcelId];
        document.getElementById('parcel-name')!.textContent = cached.name;
        document.getElementById('area')!.textContent = cached.area + ' ha';
        document.getElementById('crop')!.textContent = cached.crop;
        return cached;
    }

    // Fix: retry réseau instable + gestion d'erreur
    let data: any = null;
    let attempts = 0;
    while (attempts < 3) {
        try {
            const response = await fetch('https://api.agri.com/parcels/' + parcelId);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            data = await response.json();
            break;
        } catch (e) {
            attempts++;
            if (attempts >= 3) {
                console.error('Erreur réseau après 3 tentatives:', e);
                return null;
            }
        }
    }

    // Fix: validation structure API
    if (!data || typeof data.name !== 'string' || data.area === undefined || typeof data.crop !== 'string') {
        console.error('Structure API invalide:', data);
        return null;
    }

    _parcelCache[parcelId] = data;
    localStorage.setItem('lastParcel', JSON.stringify(data));

    // Fix: injection HTML → textContent
    document.getElementById('parcel-name')!.textContent = data.name;
    document.getElementById('area')!.textContent = data.area + ' ha';
    document.getElementById('crop')!.textContent = data.crop;

    return data;
}

// Fix: accessible depuis le HTML (window scope)
(window as any).getParcelInfo = getParcelInfo;

// Exemple d'appel :
// getParcelInfo('PARC-2024-001')
