// parse_sensors.c - Safe embedded sensor parser
// Usage:
//   SensorData data;
//   int result = parse_sensors("23.5,67.2", &data);
//   if (result == 0) { /* use data, no free() needed */ }

#define _POSIX_C_SOURCE 200112L

#include <string.h>
#include <stdlib.h>

#define CODE_OK                0
#define ERR_NULL_INPUT        (-1)
#define ERR_TOO_LONG          (-2)
#define ERR_INVALID_FORMAT    (-3)
#define ERR_TEMP_OUT_OF_RANGE (-4)
#define ERR_HUM_OUT_OF_RANGE  (-5)

#define MAX_INPUT_LEN 64

typedef struct {
    float temperature;  /* Celsius */
    float humidity;     /* Percentage */
} SensorData;

int parse_sensors(const char *raw_data, SensorData *out)
{
    char   buf[MAX_INPUT_LEN + 1];
    char  *saveptr = NULL;
    char  *token   = NULL;
    char  *endptr  = NULL;
    float  temp    = 0.0f;
    float  hum     = 0.0f;
    size_t len     = 0;

    if (raw_data == NULL || out == NULL) {
        return ERR_NULL_INPUT;
    }

    len = strlen(raw_data);
    if (len > MAX_INPUT_LEN) {
        return ERR_TOO_LONG;
    }

    /* Work on a local copy so the caller's buffer is never mutated */
    memcpy(buf, raw_data, len + 1);

    /* --- Temperature --- */
    token = strtok_r(buf, ",", &saveptr);
    if (token == NULL) {
        return ERR_INVALID_FORMAT;
    }
    temp = strtof(token, &endptr);
    if (endptr == token || *endptr != '\0') {
        return ERR_INVALID_FORMAT;
    }

    /* --- Humidity --- */
    token = strtok_r(NULL, ",", &saveptr);
    if (token == NULL) {
        return ERR_INVALID_FORMAT;
    }
    hum = strtof(token, &endptr);
    if (endptr == token || *endptr != '\0') {
        return ERR_INVALID_FORMAT;
    }

    /* Reject extra fields */
    if (strtok_r(NULL, ",", &saveptr) != NULL) {
        return ERR_INVALID_FORMAT;
    }

    /* --- Range validation --- */
    if (temp < -40.0f || temp > 85.0f) {
        return ERR_TEMP_OUT_OF_RANGE;
    }
    if (hum < 0.0f || hum > 100.0f) {
        return ERR_HUM_OUT_OF_RANGE;
    }

    out->temperature = temp;
    out->humidity    = hum;

    return CODE_OK;
}

/*
 * strtok_r() over strtok(): parse state lives in caller-supplied saveptr, not
 * in a hidden static variable — fully reentrant under RTOS preemption or ISR.
 * snprintf() is preferred over sprintf()/strcat() whenever string output is
 * needed because it enforces a hard byte ceiling on every write; the struct
 * output here eliminates that risk entirely without sacrificing correctness.
 */
