import { Attribute, RollResult } from './types';

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function performTest(
  characterName: string,
  attribute: Attribute,
  attributeValue: number,
  modifier: number = 0,
  description?: string
): RollResult {
  const roll = rollD20();
  const target = attributeValue + modifier;
  
  const isCriticalSuccess = roll === 1;
  const isCriticalFailure = roll === 20;
  
  // In Symbaroum, 1 is always a success, 20 is always a failure.
  // Otherwise, success if roll <= target.
  let isSuccess = false;
  
  if (isCriticalSuccess) {
    isSuccess = true;
  } else if (isCriticalFailure) {
    isSuccess = false;
  } else {
    isSuccess = roll <= target;
  }

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    characterName,
    attribute,
    attributeValue,
    modifier,
    target,
    roll,
    isSuccess,
    isCriticalSuccess,
    isCriticalFailure,
    description,
  };
}
