/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TimeOfDayPreset = 'realtime' | 'day' | 'sunset' | 'night' | 'dawn';

export interface EnvironmentLightingState {
  timeHours: number; // 0 - 24
  sunPosition: { x: number; y: number; z: number };
  sunColor: number;
  sunIntensity: number;
  skyColor: number;
  fogColor: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  areStreetlightsOn: boolean;
  areWindowLightsOn: boolean;
  ambientIntensity: number;
  displayTimeLabel: string;
}

/**
 * Calculate environment lighting and sun/sky parameters based on time (0 - 24)
 */
export function getLightingForHour(hour: number): EnvironmentLightingState {
  const normalizedHour = ((hour % 24) + 24) % 24;

  // Determine time label (e.g. 14:30)
  const h = Math.floor(normalizedHour);
  const m = Math.floor((normalizedHour - h) * 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const displayTimeLabel = `${pad(h)}:${pad(m)}`;

  // Sun trajectory: rises in East (+X), peaks at noon (+Y), sets in West (-X)
  // Angle: 6h = 0 (horizon East), 12h = PI/2 (zenith), 18h = PI (horizon West)
  const sunAngle = ((normalizedHour - 6) / 12) * Math.PI;
  const isDay = normalizedHour >= 5.8 && normalizedHour <= 18.5;
  const isSunset = (normalizedHour >= 17.2 && normalizedHour <= 19.2) || (normalizedHour >= 5.2 && normalizedHour <= 6.8);
  const isNight = normalizedHour < 5.2 || normalizedHour > 19.2;

  let sunColor = 0xffedd5;
  let sunIntensity = 1.8;
  let skyColor = 0x93c5fd; // Sky blue
  let fogColor = 0x93c5fd;
  let hemiSkyColor = 0xdbeafe;
  let hemiGroundColor = 0x14532d;
  let ambientIntensity = 0.5;

  let sunX = Math.cos(sunAngle) * 350;
  let sunY = Math.sin(sunAngle) * 280;
  let sunZ = 120;

  if (isNight) {
    // Night sky: deep navy blue with cool moon
    skyColor = 0x090d16;
    fogColor = 0x090d16;
    hemiSkyColor = 0x1e293b;
    hemiGroundColor = 0x051308;
    sunColor = 0xa5b4fc; // Soft moonlight
    sunIntensity = 0.25;
    ambientIntensity = 0.3;
    // Moon position
    const moonAngle = sunAngle + Math.PI;
    sunX = Math.cos(moonAngle) * 350;
    sunY = Math.max(80, Math.sin(moonAngle) * 250);
  } else if (isSunset) {
    // Golden hour / Sunset: warm amber and orange tones
    skyColor = 0xfdba74;
    fogColor = 0xfb923c;
    hemiSkyColor = 0xfed7aa;
    hemiGroundColor = 0x1c1917;
    sunColor = 0xf97316; // Deep golden amber
    sunIntensity = 1.3;
    ambientIntensity = 0.45;
  } else {
    // Bright daylight
    skyColor = 0x93c5fd;
    fogColor = 0x93c5fd;
    hemiSkyColor = 0xdbeafe;
    hemiGroundColor = 0x14532d;
    sunColor = 0xffedd5;
    sunIntensity = 1.8;
    ambientIntensity = 0.55;
  }

  return {
    timeHours: normalizedHour,
    sunPosition: { x: sunX, y: Math.max(10, sunY), z: sunZ },
    sunColor,
    sunIntensity,
    skyColor,
    fogColor,
    hemiSkyColor,
    hemiGroundColor,
    areStreetlightsOn: isNight || isSunset,
    areWindowLightsOn: isNight || isSunset,
    ambientIntensity,
    displayTimeLabel,
  };
}

/**
 * Get current local time as decimal hour (e.g. 14.5 for 2:30 PM)
 */
export function getLocalTimeHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}
