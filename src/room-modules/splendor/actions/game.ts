import B from 'splendor/broker';
import _ from 'underscore';
import { shuffle } from 'splendor/utils'

import seedrandom from 'seedrandom';

// import { initActors } from 'splendor/AI/actors';

import setting from 'splendor/data/game-setting';
import { Noble, Card, CardStatus, colors } from 'splendor/types'
import cards from 'splendor/data/cards';
import nobleData from 'splendor/data/nobles';

const nobles: Noble[] = nobleData.map((noble, i) => {
  return {
    key: i,
    ...noble
  }
});

// card statuses:
//   - deck
//   - board
//   - hold
//   - bought
interface GroupedCards {
  [rank: number]: Card[];
}
const groupedCards: GroupedCards = _(cards.map((card, i) => {
  return {
    key: i,
    status: CardStatus.deck,
    ...card,
  }
})).groupBy(card => card.rank);


function changeCardStatus(status: CardStatus) {
  return function(card: Card): Card {
    return {
      ...card,
      status,
    }
  };
}

B.on('game/init', (db, action) => {
  db.set('game-states', []);

  const {
    players: playerActors,
    winGameScore, mode, rounds,
    seed, fast, observer
  } = action;

  const playerCount = playerActors.length;

  db.set('game-settings', {
    'player-actors': playerActors,
    'win-game-score': winGameScore,
    'tournament-rounds': rounds,
    'random-seed': seed,
    'fast-mode': fast,
    'observer-mode': observer,
  });

  let randomSeed = seed
  if(mode == 'tournament') {
    if(!db.get(['tournament', 'currentRound'])) {
      db.set('tournament', {
        rounds,
        currentRound: 0,
        wins: playerActors.map(player => {
          return 0;
        }),
        turns: [],
        winners: [],
      });
    }
    const currentRound = db.get(['tournament', 'currentRound']);
    db.set(['tournament', 'currentRound'], currentRound + 1);
    // init random seed, only when tournament just begin
    randomSeed = (`${seed}-${currentRound + 1}`);
  }

  const rng = seedrandom(randomSeed)

  const {
    1: rank1cards,
    2: rank2cards,
    3: rank3cards,
  } = groupedCards;

  const rank1deck = shuffle(rank1cards, rng);
  const rank2deck = shuffle(rank2cards, rng);
  const rank3deck = shuffle(rank3cards, rng);

  const resources =  Object.assign({
    gold: 5,
  }, colors.reduce((res, color) => {
    res[color] = setting[playerCount].resource;
    return res;
  }, {}));

  const players = playerActors.map((actor, i) => {
    return {
      key: i,
      actor: actor,
      bonus: {
        white: 0,
        blue: 0,
        green: 0,
        red: 0,
        black: 0,
      },
      resources: {
        white: 0,
        blue: 0,
        green: 0,
        red: 0,
        black: 0,
        gold: 0,
      },
      score: 0,
      reservedCards: [],
    };
  });

  db.set('game', {
    mode: mode,
    turn: 1,
    'current-player': 0,
    'win-game-score': winGameScore,
    cards1: _(rank1deck).take(4).map(changeCardStatus(CardStatus.board)),
    cards2: _(rank2deck).take(4).map(changeCardStatus(CardStatus.board)),
    cards3: _(rank3deck).take(4).map(changeCardStatus(CardStatus.board)),
    deck1: _(rank1deck).drop(4),
    deck2: _(rank2deck).drop(4),
    deck3: _(rank3deck).drop(4),
    nobles: shuffle(nobles, rng).slice(0, setting[playerCount].nobles),
    resources,
    players,
  });

  db.set(['actor-stores'], [{}, {}, {}, {}]);
  // initActors(playerActors);

  B.transit(db, 'gameevent/turn')
});

B.on('game/undo', db => {
  const states = db.get('game-states');
  if(states.length > 0) {
    db.set('game', states[states.length - 1]);
    db.pop('game-states');
  }
});

B.on('game/exit', db => {
  db.unset(['game']);
  db.unset(['tournament']);
});

