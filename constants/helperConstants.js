export const CONFIRMED = {
  READ: "READ",
  SENT: "NOT VIEWED",
  CONFIRMED: "CONFIRMED",
  SCOUTING: "SCOUTING",
  OUT: "OUT",
  UNSURE: "UNSURE",
};

export const PRIVACY = {
  OPEN: "OPEN",

  PRIVATE: "PRIVATE",
};

export const GAME_STATES = {
  PRIVATE_REGISTRATION: "PRIVATE_REGISTRATION",
  OPEN_REGISTRATION: "OPEN_REGISTRATION",

  GAME_RUNNING_OPEN: "GAME_RUNNING_OPEN",
  GAME_RUNNING_HIDDEN: "GAME_RUNNING_HIDDEN",
  CLOSED: "CLOSED",
};

export const OVERLAYS = {
  EDIT_PROFILE: "EDIT_PROFILE",
  CHANGE_DISPLAY_NAME: "CHANGE_DISPLAY_NAME",
  CLEAR: "CLEAR",
  RECORD: "RECORD",
};

export const CHANNEL_TYPE = {
  GAME: "GAME",
  GROUP: "GROUP",
  DM: "DM",
};

export const MEDIA_TYPE = {
  MESSAGE: "MESSAGE",
  SNAP: "SNAP",
  VOTE: "VOTE",
  GAME_REQUEST: "GAME_REQUEST",
};

export const SCREEN_TYPE = {
  WIDE: "WIDE",
  MEDIUM: "MEDIUM",
  MOBILE: "MOBILE",
};

export const CHIP_TRANSATIONS = {
  PAY_OUT: "PAY_OUT",
  RECLAIM: "RECLAIM",
  BACKPAY: "BACKPAY",
  BORROW: "BORROW",
  BUY: "BUY",
  CARRY: "CARRY",
};

export const SCREEN_WIDTH_MIN = {
  WIDE: 1100,
  MEDIUM: 650,
  MOBILE: 0,
};

export function pow2abs(a, b) {
  return Math.pow(Math.abs(a - b), 2);
}

export function getDistance(touches) {
  console.log("get distancews");
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }
  return Math.sqrt(
    pow2abs(a.locationX, b.locationX) + pow2abs(a.locationY, b.locationY)
  );
}

const SCALE_MULTIPLIER = 1.2;
export default function getScale(currentDistance, initialDistance) {
  return (currentDistance / initialDistance) * SCALE_MULTIPLIER;
}

export const tenPlayerPositions = [
  { seatName: 1, top: 140, left: 85 },
  { seatName: 2, top: 120, left: -5 },
  { seatName: 3, top: 40, left: -30 },
  { seatName: 4, top: -40, left: 10 },
  { seatName: 5, top: -40, left: 90 },
  { seatName: 6, top: -40, left: 175 },
  { seatName: 7, top: -40, left: 265 },
  { seatName: 8, top: 40, left: 310 },
  { seatName: 9, top: 120, left: 275 },
  { seatName: 10, top: 140, left: 175 },
];
