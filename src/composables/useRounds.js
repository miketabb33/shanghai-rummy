export const ROUNDS = [
  { label: '2 sets of 3',               groups: [{ type: 'set', size: 3 }, { type: 'set', size: 3 }] },
  { label: '1 set of 3 + 1 run of 4',   groups: [{ type: 'set', size: 3 }, { type: 'run', size: 4 }] },
  { label: '2 runs of 4',               groups: [{ type: 'run', size: 4 }, { type: 'run', size: 4 }] },
  { label: '3 sets of 3',               groups: [{ type: 'set', size: 3 }, { type: 'set', size: 3 }, { type: 'set', size: 3 }] },
  { label: '2 sets of 3 + 1 run of 4',  groups: [{ type: 'set', size: 3 }, { type: 'set', size: 3 }, { type: 'run', size: 4 }] },
  { label: '1 set of 3 + 2 runs of 4',  groups: [{ type: 'set', size: 3 }, { type: 'run', size: 4 }, { type: 'run', size: 4 }] },
  { label: '3 runs of 4',               groups: [{ type: 'run', size: 4 }, { type: 'run', size: 4 }, { type: 'run', size: 4 }] },
  { label: '2 sets of 4 + 1 run of 4',  groups: [{ type: 'set', size: 4 }, { type: 'set', size: 4 }, { type: 'run', size: 4 }] },
  { label: '1 set of 4 + 2 runs of 4',  groups: [{ type: 'set', size: 4 }, { type: 'run', size: 4 }, { type: 'run', size: 4 }] },
  { label: '3 sets of 4',               groups: [{ type: 'set', size: 4 }, { type: 'set', size: 4 }, { type: 'set', size: 4 }] },
  { label: '3 runs of 5',               groups: [{ type: 'run', size: 5 }, { type: 'run', size: 5 }, { type: 'run', size: 5 }] },
]

export const getRound = (index) => ROUNDS[index]
