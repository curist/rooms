import _ from 'underscore';
import B from 'splendor/broker';

import { validateAction } from 'splendor/validates';
import { getActors } from 'splendor/AI/actors';
import { composeGameState } from './helpers';

// THIS FILE IS TO PROVIDER AN INTERFACE TO INTERACT WITH AI

const debug = require('debug')('app/actions/gameevent');

B.on('gameevent/turn', (db, action) => {
  const resources = db.get(['game', 'resources']);
  const playerIndex = db.get(['game', 'current-player']);
  const player = db.get(['game', 'players', playerIndex]);

  const actor = getActors()[playerIndex];
  if(!actor.isAI) {
    return;
  }
  const gameState = composeGameState(db);

  const turnAction = actor.turn(gameState);
  // turnAction can be [buy, hold, resource]
  // debug(turnAction);
  let gameAction;
  switch(turnAction.action) {
  case 'buy':
    gameAction = {
      action: 'gameaction/acquire-card',
      card: turnAction.card,
    };
    break;
  case 'hold':
    gameAction = {
      action: 'gameaction/reserve-card',
      card: turnAction.card,
    };
    break;
  case 'resource':
    gameAction = {
      action: 'gameaction/take-resources',
      resources: turnAction.resources,
    };
    break;
  default:
    debug(`unknown turn action: ${turnAction.action}`);
    throw new Error(`Unknown turn action by ${player.actor}: ${turnAction.action}`);
  }

  validateAction(gameState, player, resources, gameAction);

  B.exec(db, gameAction);
});

B.on('gameevent/drop-resource', (db, action) => {
  const resources = db.get(['game', 'resources']);
  const playerIndex = db.get(['game', 'current-player']);
  const player = db.get(['game', 'players', playerIndex]);
  if(player.actor == 'human') {
    return;
  }
  const actor = getActors()[playerIndex];
  const gameState = composeGameState(db);

  const droppingResources = actor.dropResources(gameState, player.resources);
  let gameAction = {
    action: 'gameaction/drop-resources',
    resources: droppingResources ,
  };
  validateAction(gameState, player, resources, gameAction);

  B.exec(db, gameAction);
});

B.on('gameevent/pick-noble', (db, action) => {
  const resources = db.get(['game', 'resources']);
  const { nobles } = action;
  const playerIndex = db.get(['game', 'current-player']);
  const player = db.get(['game', 'players', playerIndex]);
  if(player.actor == 'human') {
    return;
  }
  const actor = getActors()[playerIndex];
  const gameState = composeGameState(db);

  const noble = actor.pickNoble(gameState, nobles);
  let gameAction = {
    action: 'gameaction/pick-noble',
    noble: noble,
  };
  validateAction(gameState, player, resources, gameAction);

  B.exec(db, gameAction);
});

