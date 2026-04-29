// fetchParcelData.ts
// Contexte : Dashboard agricole, 500+ parcelles
// Connexion : 4G rural instable
// Appelé à chaque sélection dropdown

interface ParcelData {
    name: string;
    area: number;
    crop: string;
}

/**
 * Récupère les informations d'une parcelle depuis l'API ou le cache localStorage.
 * @param parcelId - Identifiant unique de la parcelle (ex: "PARC-2024-001")
 * @returns Les données de la parcelle
 * @throws Error si la requête échoue ou si la réponse est invalide
 */
async function getParcelInfo(parcelId: string): Promise<ParcelData> {
    const cached = localStorage.getItem(`parcel-${parcelId}`);
    if (cached) {
        const data: ParcelData = JSON.parse(cached);
        renderParcelInfo(data);
        return data;
    }

    const response = await fetch(`https://api.agri.com/parcels/${parcelId}`);
    if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    if (!isValidParcelData(data)) {
        throw new Error("Réponse API invalide : structure inattendue");
    }

    localStorage.setItem(`parcel-${parcelId}`, JSON.stringify(data));
    renderParcelInfo(data);
    return data;
}

/**
 * Valide que la donnée reçue correspond à la structure ParcelData.
 */
function isValidParcelData(data: unknown): data is ParcelData {
    return (
        typeof data === "object" &&
        data !== null &&
        "name" in data && typeof (data as ParcelData).name === "string" &&
        "area" in data && typeof (data as ParcelData).area === "number" &&
        "crop" in data && typeof (data as ParcelData).crop === "string"
    );
}

/**
 * Met à jour le DOM avec les informations de la parcelle.
 */
function renderParcelInfo(data: ParcelData): void {
    const nameEl = document.getElementById("parcel-info__name");
    const areaEl = document.getElementById("parcel-info__area");
    const cropEl = document.getElementById("parcel-info__crop");

    if (nameEl) nameEl.textContent = data.name;
    if (areaEl) areaEl.textContent = `${data.area} ha`;
    if (cropEl) cropEl.textContent = data.crop;
}
