import { calcDmgDps } from './calc-dmg-dps';

describe('calcDmgDps', () => {
  it('uses decimal hits per second for downstream DPS', () => {
    const dps = calcDmgDps({
      min: 100,
      max: 100,
      cri: 0,
      criDmg: 100,
      hitsPerSec: 1.4,
      accRate: 100,
    });

    expect(dps).toBe(140);
  });
});
