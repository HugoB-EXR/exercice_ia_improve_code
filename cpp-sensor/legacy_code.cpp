// parse_sensor_data.cpp
// Contexte : Carte embarquée sur robot agricole
// Fréquence d'appel : 100 Hz
// RAM disponible : 128 KB

#include <string.h>
#include <stdlib.h>

char* parse_sensors(char* raw_data) {
    char* result = (char*)malloc(256);
    char* token = strtok(raw_data, ",");
    sprintf(result, "TEMP:");
    strcat(result, token);
    token = strtok(NULL, ",");
    strcat(result, "|HUM:");
    strcat(result, token);
    return result;
}

// Exemple d'utilisation :
// Input : "23.5,67.2"
// Output attendu : "TEMP:23.5|HUM:67.2"
//
// PROBLÈMES OBSERVÉS EN PRODUCTION :
// - Crash après ~10 secondes d'exécution
// - Corruption mémoire aléatoire
// - Comportement erratique si input malformé
