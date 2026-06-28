/**
 * hfid.js — Health Facility Identifier utility module
 * Implements the Damm algorithm check digit for the Cambodia HFID.
 *
 * HFID format: 6-digit numeric string (5 random digits + 1 Damm check digit).
 * Stored and exchanged as a plain 6-digit string.
 * Display format: F-XXX-XXX (prefix + hyphens applied at display time only).
 * System URI: https://camdhea.gov.kh/ns/hfid
 */

// Damm quasigroup operation table — mathematical constant, must not be modified.
const DAMM_TABLE = [
  [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
  [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
  [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
  [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
  [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
  [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
  [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
  [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
  [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
  [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
]

/**
 * Compute the Damm check digit for a numeric string.
 * @param {string} body - String of digits (the 5-digit body)
 * @returns {number} Single check digit (0–9)
 */
function computeCheckDigit(body) {
  let interim = 0
  for (const char of body) {
    interim = DAMM_TABLE[interim][parseInt(char, 10)]
  }
  return interim
}

/**
 * Verify a 6-digit HFID numeric string.
 * A valid identifier produces a final Damm interim value of 0.
 * @param {string} numericString - 6 digits, no prefix, no hyphens
 * @returns {boolean}
 */
export function verifyHfid(numericString) {
  if (!/^\d{6}$/.test(numericString)) return false
  let interim = 0
  for (const char of numericString) {
    interim = DAMM_TABLE[interim][parseInt(char, 10)]
  }
  return interim === 0
}

/**
 * Generate a new valid 6-digit HFID numeric string.
 * @returns {string} 6-digit string
 */
export function generateHfid() {
  const body = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('')
  const check = computeCheckDigit(body)
  return body + String(check)
}

/**
 * Format a 6-digit numeric HFID as F-XXX-XXX for display purposes only.
 * @param {string} numericString - 6-digit HFID
 * @returns {string} e.g. "F-342-814"
 */
export function formatHfidDisplay(numericString) {
  if (!/^\d{6}$/.test(numericString)) return numericString
  return `F-${numericString.slice(0, 3)}-${numericString.slice(3)}`
}

/**
 * Parse any common HFID input format into the clean 6-digit numeric string.
 * Accepts: with/without F prefix, with/without hyphens or spaces.
 * @param {string} rawInput
 * @returns {string|null} Clean 6-digit string, or null if unparseable
 */
export function parseHfidInput(rawInput) {
  if (!rawInput) return null
  let cleaned = rawInput.trim()
  if (cleaned.toUpperCase().startsWith('F')) {
    cleaned = cleaned.slice(1)
  }
  cleaned = cleaned.replace(/[-\s]/g, '')
  if (!/^\d{6}$/.test(cleaned)) return null
  return cleaned
}
