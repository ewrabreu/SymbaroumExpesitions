export type Attribute =
  | 'Accurate'
  | 'Cunning'
  | 'Discreet'
  | 'Persuasive'
  | 'Quick'
  | 'Resolute'
  | 'Strong'
  | 'Vigilant';

export interface Character {
  name: string;
  attributes: Record<Attribute, number>;
  toughness: {
    current: number;
    max: number;
    painThreshold: number;
  };
  corruption: {
    current: number;
    threshold: number;
  };
}

export interface RollResult {
  id: string;
  timestamp: number;
  characterName: string;
  attribute: Attribute;
  attributeValue: number;
  modifier: number;
  target: number;
  roll: number;
  isSuccess: boolean;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  description?: string;
}
