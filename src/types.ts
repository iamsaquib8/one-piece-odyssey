export type RegionId = 'east-blue' | 'paradise' | 'sky' | 'red-line' | 'calm-belt' | 'new-world' | 'other';
export interface Source { label: string; url: string; chapters?: string }
export interface StoryBeat { id: string; title: string; chapters: string; paragraphs: string[]; kind?: 'flashback' | 'story' | 'interlude' }
export interface Battle { id: string; title: string; stakes: string; development: string; outcome: string; chapters: string; frames: string[] }
export interface Arc { id: string; name: string; sagaId: string; chapters: [number, number]; premise: string; overview: string[]; locationIds: string[]; characterIds: string[]; beats: StoryBeat[]; battles: Battle[]; legacy: string[]; sources: Source[]; status?: 'ongoing' | 'complete'; editorialStatus?: 'reviewed' | 'draft' }
export interface Saga { id: string; name: string; subtitle: string; region: RegionId; color: string }
export interface ArtBrief { silhouette: string; arrival: string; landmarks: string[]; environment: string; palette: string[]; atmosphere: string; closeups: string[]; animation: string; staticAlternative: string; desktop: string; mobile: string; canon: string; interpretation: string }
export interface Location { id: string; name: string; region: RegionId; kind: 'island' | 'ship' | 'sea' | 'boundary' | 'settlement' | 'flashback' | 'referenced'; arcIds: string[]; chapters: string; description: string; landmarks: string[]; map: { x: number; y: number }; art: ArtBrief; sources: Source[] }
export interface Character { id: string; name: string; epithet: string; role: string; dream: string; recruitment: string; arcId: string; description: string; milestones: string[]; bounties: { amount: string; after: string }[]; color: string }
export interface Connection { from: string; to: string; kind: 'geographic' | 'voyage' | 'narrative'; label: string }
export interface Coverage { verifiedDate: string; latestOfficialChapter: number; coveredThrough: number; source: string; note: string }
export type View = 'journey' | 'world' | 'search' | 'saved' | 'crew' | 'legal' | 'trails' | 'mysteries';
export interface LegalSection { id: string; title: string; summary: string; paragraphs: string[] }
export interface Route { view: View; kind?: 'arc' | 'location' | 'character' | 'crew'; id?: string; beat?: string; q?: string }
export interface ReaderState { version: 1; saved: string[]; explored: string[]; motion: boolean; spoilerThrough: number | null; resume: { y: number; arcId?: string; beat?: string }; }
