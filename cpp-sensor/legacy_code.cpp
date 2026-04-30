// parse_sensor_data.cpp
// Contexte : Carte embarquée sur robot agricole
// Fréquence d'appel : 100 Hz
// RAM disponible : 128 KB

#include <string.h>
#include <stdlib.h>
#include <errno.h>

// Structure pour stocker les données de température et humidité
struct temp_humd {
    float temperature;
    float humidity;
};

// Codes d'erreur
#define PARSE_SUCCESS           0
#define PARSE_ERROR_NULL_INPUT  1
#define PARSE_ERROR_INVALID_FORMAT 2
#define PARSE_ERROR_CONVERSION  3
#define PARSE_ERROR_OUT_OF_RANGE 4

/**
 * Parse les données de capteur au format "température,humidité"
 * 
 * Gestion des erreurs :
 * - Vérifie que raw_data n'est pas NULL
 * - Vérifie le format d'entrée (doit contenir exactement une virgule)
 * - Valide la conversion des valeurs numériques
 * - Vérifie les plages de valeurs (temp: -40 à 85°C, hum: 0 à 100%)
 * 
 * @param raw_data Chaîne d'entrée au format "temp,hum" (modifiée par strtok)
 * @param output Structure pour stocker les résultats parsés
 * @return Code d'erreur (0 = succès, >0 = erreur)
 */
int parse_sensors(char* raw_data, struct temp_humd* output) {
    // Vérification des paramètres d'entrée
    if (raw_data == NULL || output == NULL) {
        return PARSE_ERROR_NULL_INPUT;
    }
    
    // Initialisation des valeurs de sortie
    output->temperature = 0.0f;
    output->humidity = 0.0f;
    
    // Copie locale pour préserver l'original
    char local_data[64];
    strncpy(local_data, raw_data, sizeof(local_data) - 1);
    local_data[sizeof(local_data) - 1] = '\0';
    
    // Parse température
    char* temp_token = strtok(local_data, ",");
    if (temp_token == NULL) {
        return PARSE_ERROR_INVALID_FORMAT;
    }
    
    // Parse humidité
    char* hum_token = strtok(NULL, ",");
    if (hum_token == NULL) {
        return PARSE_ERROR_INVALID_FORMAT;
    }
    
    // Vérification qu'il n'y a pas de token supplémentaire
    if (strtok(NULL, ",") != NULL) {
        return PARSE_ERROR_INVALID_FORMAT;
    }
    
    // Conversion température
    char* temp_endptr;
    errno = 0;
    float temp = strtof(temp_token, &temp_endptr);
    if (errno != 0 || temp_endptr == temp_token || *temp_endptr != '\0') {
        return PARSE_ERROR_CONVERSION;
    }
    
    // Conversion humidité
    char* hum_endptr;
    errno = 0;
    float hum = strtof(hum_token, &hum_endptr);
    if (errno != 0 || hum_endptr == hum_token || *hum_endptr != '\0') {
        return PARSE_ERROR_CONVERSION;
    }
    
    // Validation des plages
    if (temp < -40.0f || temp > 85.0f) {
        return PARSE_ERROR_OUT_OF_RANGE;
    }
    
    if (hum < 0.0f || hum > 100.0f) {
        return PARSE_ERROR_OUT_OF_RANGE;
    }
    
    // Affectation des résultats
    output->temperature = temp;
    output->humidity = hum;
    
    return PARSE_SUCCESS;
}

// Exemple d'utilisation :
// Input : "23.5,67.2"
// Output : temperature=23.5, humidity=67.2, return=0
//
// PROBLÈMES RÉSOLUS :
// - Plus de memory leak (suppression de malloc)
// - Validation complète des entrées
// - Gestion robuste des erreurs
// - Pas de corruption mémoire (buffer local fixe)



// ---------- LE PROMPT --------------------


Améliore ce code PROBLÈMES OBSERVÉS EN PRODUCTION :
- Crash après ~10 secondes d'exécution
- Corruption mémoire aléatoire
- Comportement erratique si input malformé

Je veux que les fonctions soient commentées avec :
-> gestion des erreurs de raw_data 
-> le retour c'est le code d'erreur avec plusieurs type d'erreur
-> le output c'est une structure avec l'humidité et la température
-> la déclaration c'est 
int parse_sensors(char* raw_data, struct temp_humd * output) {


