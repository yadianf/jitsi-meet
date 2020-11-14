import { ReducerRegistry, set } from '../base/redux';

import {
    REMOTE_CONTROL_ACTIVE,
    SET_CONTROLLED_PARTICIPANT,
    SET_CONTROLLER,
    SET_RECEIVER_ENABLED,
    SET_RECEIVER_TRANSPORT,
    SET_REQUESTED_PARTICIPANT
} from './actionTypes';

const DEFAULT_STATE = {
    active: false,
    controller: {},
    receiver: {
        enabled: false
    }
};

/**
 * Listen for actions that mutate the prejoin state
 */
ReducerRegistry.register(
    'features/remote-control', (state = DEFAULT_STATE, action) => {
        switch (action.type) {
        case REMOTE_CONTROL_ACTIVE:
            set(state, 'active', action.active);

            break;
        case SET_RECEIVER_TRANSPORT:
            set(state.receiver, 'transport', action.transport);

            break;
        case SET_RECEIVER_ENABLED:
            set(state.receiver, 'enabled', action.transport);

            break;
        case SET_REQUESTED_PARTICIPANT:
            set(state.controller, 'requestedParticipant', action.requestedParticipant);

            break;
        case SET_CONTROLLED_PARTICIPANT:
            set(state.controller, 'controlled', action.controlled);

            break;
        case SET_CONTROLLER:
            set(state.receiver, 'controller', action.controller);

            break;
        }

        return state;
    },
);
