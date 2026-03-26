export const TILE_TYPES = {
  GO: 'go',
  PROPERTY: 'property',
  TAX: 'tax',
  REWARD: 'reward',
  CHANCE: 'chance',
  JAIL: 'jail',
  FREE_PARKING: 'free_parking',
  GOTO_JAIL: 'goto_jail'
};

export const COLORS = {
  BROWN: '#8B4513',
  LIGHT_BLUE: '#87CEEB',
  PINK: '#FF69B4',
  ORANGE: '#FFA500',
  RED: '#FF0000',
  YELLOW: '#FFFF00',
  GREEN: '#008000',
  DARK_BLUE: '#00008B'
};

export const BOARD_TILES = [
  { id: 0, type: TILE_TYPES.GO, name: 'START', price: 200 },
  { id: 1, type: TILE_TYPES.PROPERTY, name: 'BROWN ST', price: 60, rent: 10, color: COLORS.BROWN },
  { id: 2, type: TILE_TYPES.CHANCE, name: 'CHANCE' },
  { id: 3, type: TILE_TYPES.PROPERTY, name: 'MUD LANE', price: 80, rent: 15, color: COLORS.BROWN },
  { id: 4, type: TILE_TYPES.TAX, name: 'ROAD TAX', price: 100 },
  { id: 5, type: TILE_TYPES.JAIL, name: 'JAIL' },
  { id: 6, type: TILE_TYPES.PROPERTY, name: 'SKY BLVD', price: 100, rent: 20, color: COLORS.LIGHT_BLUE },
  { id: 7, type: TILE_TYPES.PROPERTY, name: 'OCEAN AVE', price: 120, rent: 25, color: COLORS.LIGHT_BLUE },
  { id: 8, type: TILE_TYPES.REWARD, name: 'GIFT BOX', price: 50 },
  { id: 9, type: TILE_TYPES.PROPERTY, name: 'ROSE GARDEN', price: 140, rent: 30, color: COLORS.PINK },
  { id: 10, type: TILE_TYPES.FREE_PARKING, name: 'FREE PARKING' },
  { id: 11, type: TILE_TYPES.PROPERTY, name: 'ORANGE SQ', price: 180, rent: 40, color: COLORS.ORANGE },
  { id: 12, type: TILE_TYPES.CHANCE, name: 'SURPRISE' },
  { id: 13, type: TILE_TYPES.PROPERTY, name: 'SUNSET PK', price: 200, rent: 45, color: COLORS.ORANGE },
  { id: 14, type: TILE_TYPES.TAX, name: 'LUXURY TAX', price: 150 },
  { id: 15, type: TILE_TYPES.GOTO_JAIL, name: 'GO TO JAIL' },
  { id: 16, type: TILE_TYPES.PROPERTY, name: 'RED LIGHT', price: 220, rent: 55, color: COLORS.RED },
  { id: 17, type: TILE_TYPES.REWARD, name: 'CASH REWARD', price: 75 },
  { id: 18, type: TILE_TYPES.PROPERTY, name: 'FIRE ST', price: 240, rent: 60, color: COLORS.RED },
  { id: 19, type: TILE_TYPES.PROPERTY, name: 'EMERALD RD', price: 280, rent: 75, color: COLORS.GREEN }
];
// Total 20 tiles. Corners: 0, 5, 10, 15.
