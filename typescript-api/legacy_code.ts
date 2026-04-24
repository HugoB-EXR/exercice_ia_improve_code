// fetchParcelData.ts
// Contexte : Dashboard agricole, 500+ parcelles
// Connexion : 4G rural instable
// Appelé à chaque sélection dropdown

async function getParcelInfo(parcelId: any) {
    const response = await fetch('https://api.agri.com/parcels/' + parcelId);
    const data = await response.json();
    localStorage.setItem('lastParcel', JSON.stringify(data));
    document.getElementById('parcel-name').innerHTML = data.name;
    document.getElementById('area').innerHTML = data.area + ' ha';
    document.getElementById('crop').innerHTML = data.crop;
    return data;
}

// Exemple d'appel :
// getParcelInfo('PARC-2024-001')
//
// PROBLÈMES OBSERVÉS EN PRODUCTION :
// - Crashes fréquents en zone rurale (réseau instable)
// - Alertes sécurité (injection HTML possible)
// - Lenteur (pas de cache)
// - Bugs silencieux quand API change structure
