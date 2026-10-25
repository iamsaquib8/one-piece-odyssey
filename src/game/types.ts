// The voyage's state. Everything here is plain data, so a save is just JSON.

export type Mode = 'story' | 'standard';
export type NodeKind = 'island' | 'battle' | 'boss' | 'sea' | 'port' | 'recruit';

export interface ChartNode {
  id: string;
  kind: NodeKind;
  arcId: string;
  /** The column on the chart; the player takes exactly one node per column. */
  column: number;
  /** 0 when the column has one node, 0 or 1 when the route forks. */
  lane: number;
  title: string;
  locationId?: string;
  beatId?: string;
  battleId?: string;
  seaEventId?: string;
  recruitId?: string;
  /** Rough-water nodes pay more and hurt more. */
  rough?: boolean;
}

export interface Chart { sagaId: string; nodes: ChartNode[]; columns: number }

export interface CrewMember { id: string; hp: number; maxHp: number }

export interface Ship { kind: 'dinghy' | 'merry'; hull: number; maxHull: number }

export interface Fighter {
  id: string;
  name: string;
  side: 'crew' | 'foe';
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  stamina: number;
  maxStamina: number;
  guard: number;
  weakened: number;
}

export type IntentKind = 'attack' | 'heavy' | 'guard';
export interface Intent { foeId: string; kind: IntentKind; targetId: string }
export type ActionKind = 'attack' | 'special' | 'guard';
export interface PlannedAction { actorId: string; kind: ActionKind; targetId?: string }

export interface Blow {
  actorId: string;
  targetId?: string;
  side: 'a' | 'b';
  amount: number;
  kind: 'hit' | 'crit' | 'guard' | 'special' | 'heavy' | 'miss' | 'steal';
  label: string;
  impact?: string;
}

export interface BattleState {
  nodeId: string;
  battleId: string;
  arcId: string;
  boss: boolean;
  round: number;
  crew: Fighter[];
  foes: Fighter[];
  intents: Intent[];
  planned: PlannedAction[];
  /** The most recent blow, for the battle art: which side swung and the sound word. */
  lastHit?: { side: 'a' | 'b'; impact: string; key: number };
  /** The last round's blows, in order, for the battle screen to play back. */
  blows?: Blow[];
  result?: 'win' | 'lose';
}

export interface EventChoice { id: string; label: string; hint?: string }
export interface Outcome { text: string; effects: Effects }
export interface Effects { berries?: number; food?: number; morale?: number; hull?: number; heal?: number; bounty?: number }

export type Phase =
  | { type: 'map' }
  | { type: 'event'; nodeId: string; outcome?: Outcome }
  | { type: 'battle'; battle: BattleState }
  | { type: 'port'; nodeId: string; bought: string[] }
  | { type: 'recruit'; nodeId: string }
  | { type: 'saga-end' };

export interface GameState {
  version: 1;
  seed: number;
  rng: number;
  mode: Mode;
  /** The reader's progress when the voyage began; the chart never reaches past it. */
  through: number | null;
  sagaId: string;
  chart: Chart;
  /** The node the ship is at; null before the first column. */
  at: string | null;
  cleared: string[];
  crew: CrewMember[];
  ship: Ship;
  berries: number;
  food: number;
  morale: number;
  bounty: number;
  phase: Phase;
  log: string[];
  turns: number;
}

export type GameAction =
  | { type: 'sail'; nodeId: string }
  | { type: 'choose'; choiceId: string }
  | { type: 'continue' }
  | { type: 'plan'; action: PlannedAction }
  | { type: 'unplan'; actorId: string }
  | { type: 'fight' }
  | { type: 'buy'; itemId: string }
  | { type: 'leave' };
