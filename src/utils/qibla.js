import { Coordinates, Qibla } from "adhan";

export function getQiblaDirection(latitude, longitude) {
  const coords = new Coordinates(latitude, longitude);
  return Qibla(coords); // bearing in degrees from North
}
