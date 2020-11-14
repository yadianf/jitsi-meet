// @flow

import { openDialog } from '../base/dialog';
import { JitsiConferenceEvents } from '../base/lib-jitsi-meet';
import { getParticipantDisplayName, getPinnedParticipant, pinParticipant } from '../base/participants';
import { getLocalVideoTrack } from '../base/tracks';
import { showNotification } from '../notifications';

import {
    REMOTE_CONTROL_ACTIVE,
    SET_REQUESTED_PARTICIPANT,
    SET_CONTROLLER,
    SET_RECEIVER_ENABLED,
    SET_RECEIVER_TRANSPORT,
    SET_CONTROLLED_PARTICIPANT
} from './actionTypes';
import { RemoteControlAuthorizationDialog } from './components';
import {
    DISCO_REMOTE_CONTROL_FEATURE,
    EVENTS,
    REMOTE_CONTROL_MESSAGE_NAME,
    PERMISSIONS_ACTIONS,
    REQUESTS
} from './constants';
import {
    getKey,
    getModifiers,
    getRemoteConrolEventCaptureArea,
    isRemoteControlEnabled,
    sendRemoteControlEndpointMessage
} from './functions';
import logger from './logger';

let permissionsReplyListener, receiverEndpointMessageListener, stopListener;

declare var APP: Object;
declare var $: Function;

/**
 * Signals that the remote control authorization dialog should be displayed.
 *
 * @param {string} participantId - The id of the participant who is requesting
 * the authorization.
 * @returns {{
 *     type: OPEN_DIALOG,
 *     component: {RemoteControlAuthorizationDialog},
 *     componentProps: {
 *         participantId: {string}
 *      }
 * }}
 * @public
 */
export function openRemoteControlAuthorizationDialog(participantId: string) {
    return openDialog(RemoteControlAuthorizationDialog, { participantId });
}

/**
 *
 */
export function setRemoteControlActive(active: boolean) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { active: oldActive } = state['features/remote-control'];
        const { conference } = state['fatures/base/conference'];

        if (active !== oldActive) {
            dispatch({
                type: REMOTE_CONTROL_ACTIVE,
                active
            });
            conference.setLocalParticipantProperty('remoteControlSessionStatus', active);
        }
    };
}

/**
 * Requests permissions from the remote control receiver side.
 *
 * @param {string} userId - The user id of the participant that will be
 * requested.
 * @returns {Promise<boolean>} Resolve values - true(accept), false(deny),
 * null(the participant has left).
 */
export function requestRemoteControl(userId: string) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const enabled = isRemoteControlEnabled(state);

        if (!enabled) {
            return Promise.reject(new Error('Remote control is disabled!'));
        }

        dispatch(setRemoteControlActive(true));

        // this._area = eventCaptureArea;// $("#largeVideoWrapper") ??

        logger.log(`Requsting remote control permissions from: ${userId}`);

        const { conference } = state['features/base/conference'];


        permissionsReplyListener = (participant, event) => {
            dispatch(processPermissionRequestReply(participant.getId(), event));
        };

        conference.on(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, permissionsReplyListener);

        dispatch({
            type: SET_REQUESTED_PARTICIPANT,
            requestedParticipant: userId
        });

        if (!sendRemoteControlEndpointMessage(
            conference,
            userId,
            {
                type: EVENTS.permissions,
                action: PERMISSIONS_ACTIONS.request
            })) {
            dispatch(clearRequest());
        }
    };
}

/**
 *
 */
export function processPermissionRequestReply(participantId: string, event: Object) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { action, name, type } = event;
        const { requestedParticipant } = state['features/remote-control'].controller;

        if (isRemoteControlEnabled(state) && name === REMOTE_CONTROL_MESSAGE_NAME && type === EVENTS.permissions
                && participantId === requestedParticipant) {
            if (action !== PERMISSIONS_ACTIONS.grant) {
                // this._area = undefined; ???
            }

            let descriptionKey, permissionGranted = false;

            switch (action) {
            case PERMISSIONS_ACTIONS.grant: {
                dispatch({
                    type: SET_CONTROLLED_PARTICIPANT,
                    controlled: participantId
                });

                logger.log('Remote control permissions granted!', participantId);
                logger.log('Starting remote control controller.');

                const { conference } = state['features/base/conference'];

                stopListener = (participant, stopEvent) => {
                    dispatch(handleRemoteControlStoppedEvent(participant.getId(), stopEvent));
                };

                conference.on(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, stopListener);

                dispatch(resume());

                permissionGranted = true;
                descriptionKey = 'dialog.remoteControlAllowedMessage';
                break;
            }
            case PERMISSIONS_ACTIONS.deny:
                logger.log('Remote control permissions denied!', participantId);
                descriptionKey = 'dialog.remoteControlDeniedMessage';
                break;
            case PERMISSIONS_ACTIONS.error:
                logger.error('Error occurred on receiver side');
                descriptionKey = 'dialog.remoteControlErrorMessage';
                break;
            default:
                logger.error('Unknown reply received!');
                descriptionKey = 'dialog.remoteControlErrorMessage';
            }

            dispatch(clearRequest());

            if (!permissionGranted) {
                dispatch(setRemoteControlActive(false));
            }

            dispatch(showNotification({
                descriptionArguments: { user: getParticipantDisplayName(state, participantId) },
                descriptionKey,
                titleKey: 'dialog.remoteControlTitle'
            }));

            if (permissionGranted) {
                // the remote control permissions has been granted
                // pin the controlled participant
                const pinnedParticipant = getPinnedParticipant(state);
                const pinnedId = pinnedParticipant?.id;

                if (pinnedId !== participantId) {
                    dispatch(pinParticipant(participantId));
                }
            }
        } else {
            // different message type or another user -> ignoring the message
        }
    };
}

/**
 * Handles remote control stopped.
 *
 * @param {string} participantId - The ID of the participant that has sent the event.
 * @param {Object} event - EndpointMessage event from the data channels.
 * @property {string} type - The function process only events with
 * name REMOTE_CONTROL_MESSAGE_NAME.
 * @returns {void}
 */
export function handleRemoteControlStoppedEvent(participantId: Object, event: Object) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { name, type } = event;
        const { controlled } = state['features/remote-control'].controller;

        if (isRemoteControlEnabled(state) && name === REMOTE_CONTROL_MESSAGE_NAME && type === EVENTS.STOP
                && participantId === controlled) {
            dispatch(stopController());
        }
    };
}

/**
 * Stops processing the mouse and keyboard events. Removes added listeners.
 * Enables the keyboard shortcuts. Displays dialog to notify the user that
 * remote control session has ended.
 *
 * @param {boolean} notifyRemoteParty - If true a endpoint message to the controlled participant will be sent.
 * @returns {void}
 */
export function stopController(notifyRemoteParty: boolean = false) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { controlled } = state['features/remote-control'].controller;

        if (!controlled) {
            return;
        }

        const { conference } = state['features/base/conference'];

        if (notifyRemoteParty) {
            sendRemoteControlEndpointMessage(conference, controlled, {
                type: EVENTS.stop
            });
        }

        logger.log('Stopping remote control controller.');

        conference.off(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, stopListener);
        stopListener = undefined;

        dispatch(pause());

        dispatch({
            type: SET_CONTROLLED_PARTICIPANT,
            controlled: undefined
        });

        // this._area = undefined;???

        dispatch(setRemoteControlActive(false));
        dispatch(showNotification({
            descriptionKey: 'dialog.remoteControlStopMessage',
            titleKey: 'dialog.remoteControlTitle'
        }));
    };
}

/**
 *
 */
export function clearRequest() {
    return (dispatch: Function, getState: Function) => {
        const { conference } = getState()['features/base/conference'];

        dispatch({
            type: SET_REQUESTED_PARTICIPANT,
            requestedParticipant: undefined
        });

        conference.off(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, permissionsReplyListener);
        permissionsReplyListener = undefined;
    };
}


/**
 *
 */
export function setReceiverTransport(transport: Object) {
    return {
        type: SET_RECEIVER_TRANSPORT,
        transport
    };
}

/**
 *
 */
export function enableReceiver() {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { enabled } = state['features/remote-control'].receiver;

        if (enabled) {
            return;
        }

        const { connection } = state['features/base/connection'];
        const { conference } = state['features/base/conference'];

        if (!connection || !conference) {
            logger.error('Couldn\'t enable the remote receiver! The connection or conference instance is undefined!');

            return;
        }

        dispatch({
            type: SET_RECEIVER_ENABLED,
            enabled: true
        });

        connection.addFeature(DISCO_REMOTE_CONTROL_FEATURE, true);
        receiverEndpointMessageListener = (participant, message) => {
            dispatch(endpointMessageReceived(participant.getId(), message));
        };
        conference.on(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, receiverEndpointMessageListener);
    };
}

/**
 *
 */
export function disableReceiver() {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { enabled } = state['features/remote-control'].receiver;

        if (!enabled) {
            return;
        }

        const { connection } = state['features/base/connection'];
        const { conference } = state['features/base/conference'];

        if (!connection || !conference) {
            logger.error('Couldn\'t enable the remote receiver! The connection or conference instance is undefined!');

            return;
        }

        logger.log('Remote control receiver disabled.');

        dispatch({
            type: SET_RECEIVER_ENABLED,
            enabled: false
        });

        dispatch(stopReceiver(true));

        connection.removeFeature(DISCO_REMOTE_CONTROL_FEATURE);
        conference.off(JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED, receiverEndpointMessageListener);
    };
}

/**
 * Removes the listener for JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED
 * events. Sends stop message to the wrapper application. Optionally
 * displays dialog for informing the user that remote control session
 * ended.
 *
 * @param {boolean} [dontNotify] - If true - a notification about stopping
 * the remote control won't be displayed.
 * @returns {void}
 */
export function stopReceiver(dontNotify: boolean = false) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { receiver } = state['features/remote-control'];
        const { controller, transport } = receiver;

        if (!controller) {
            return;
        }

        dispatch({
            type: SET_CONTROLLER,
            controller: undefined
        });

        transport.sendEvent({
            name: REMOTE_CONTROL_MESSAGE_NAME,
            type: EVENTS.stop
        });

        dispatch({
            type: REMOTE_CONTROL_ACTIVE,
            active: false
        });

        if (!dontNotify) {
            dispatch(showNotification({
                descriptionKey: 'dialog.remoteControlStopMessage',
                titleKey: 'dialog.remoteControlTitle'
            }));
        }
    };
}


/**
 * Listens for data channel EndpointMessage. Handles only remote control
 * messages. Sends the remote control messages to the external app that
 * will execute them.
 *
 * @param {string} participantId - The controller participant ID.
 * @param {Object} message - EndpointMessage from the data channels.
 * @param {string} message.name - The function processes only messages with
 * name REMOTE_CONTROL_MESSAGE_NAME.
 * @returns {void}
 */
export function endpointMessageReceived(participantId: string, message: Object) {
    return (dispatch: Function, getState: Function) => {
        const { action, name, type } = message;

        if (name !== REMOTE_CONTROL_MESSAGE_NAME) {
            return;
        }

        const state = getState();
        const { receiver } = state['features/remote-control'];
        const { enabled, transport } = receiver;

        if (enabled) {
            const { controller } = receiver;

            if (!controller && type === EVENTS.permissions && action === PERMISSIONS_ACTIONS.request) {
                dispatch(setRemoteControlActive(true));
                dispatch(openRemoteControlAuthorizationDialog(participantId));
            } else if (controller === participantId) {
                if (type === EVENTS.stop) {
                    dispatch(stopReceiver());
                } else { // forward the message
                    transport.sendEvent(message);
                }
            } // else ignore
        } else {
            logger.log('Remote control message is ignored because remote '
                + 'control is disabled', message);
        }
    };
}

/**
 * Denies remote control access for user associated with the passed user id.
 *
 * @param {string} participantId - The id associated with the user who sent the
 * request for remote control authorization.
 * @returns {void}
 */
export function deny(participantId: string) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { conference } = state['features/base/conference'];

        dispatch(setRemoteControlActive(false));
        sendRemoteControlEndpointMessage(conference, participantId, {
            type: EVENTS.permissions,
            action: PERMISSIONS_ACTIONS.deny
        });
    };
}

/**
 * Grants remote control access to user associated with the passed user id.
 *
 * @param {string} participantId - The id associated with the user who sent the
 * request for remote control authorization.
 * @returns {void}
 */
export function grant(participantId: string) {
    return (dispatch: Function, getState: Function) => {
        dispatch({
            type: SET_CONTROLLER,
            controller: participantId
        });
        logger.log(`Remote control permissions granted to: ${participantId}`);

        let promise;
        const state = getState();
        const tracks = state['features/base/tracks'];
        const track = getLocalVideoTrack(tracks);
        const isScreenSharing = track?.videoType === 'desktop';
        const { sourceId, sourceType } = track?.jitsiTrack || {};
        const transport = state['features/remote-control'];

        if (isScreenSharing && sourceType === 'screen') {
            promise = transport.sendRequest({
                name: REMOTE_CONTROL_MESSAGE_NAME,
                type: REQUESTS.start,
                sourceId
            });
        } else {
            // FIXME: Use action here once toggleScreenSharing is moved to redux.
            promise = APP.conference.toggleScreenSharing(
                true,
                {
                    desktopSharingSources: [ 'screen' ]
                })
                .then(() => transport.sendRequest({
                    name: REMOTE_CONTROL_MESSAGE_NAME,
                    type: REQUESTS.start,
                    sourceId
                }));
        }

        const { conference } = state['features/base/conference'];

        promise
            .then(() => sendRemoteControlEndpointMessage(conference, participantId, {
                type: EVENTS.permissions,
                action: PERMISSIONS_ACTIONS.grant
            }))
            .catch(error => {
                logger.error(error);

                sendRemoteControlEndpointMessage(conference, participantId, {
                    type: EVENTS.permissions,
                    action: PERMISSIONS_ACTIONS.error
                });

                dispatch(showNotification({
                    descriptionKey: 'dialog.startRemoteControlErrorMessage',
                    titleKey: 'dialog.remoteControlTitle'
                }));

                dispatch(stopReceiver(true));
            });
    };
}

/**
 * Handler for mouse click events.
 *
 * @param {string} type - The type of event ("mousedown"/"mouseup").
 * @param {Event} event - The mouse event.
 * @returns {void}
 */
export function mouseClicked(type: string, event: Object) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { conference } = state['features/base/conference'];
        const { controller } = state['features/remote-control'];

        sendRemoteControlEndpointMessage(conference, controller.controlled, {
            type,
            button: event.which
        });
    };
}

/**
 *
 * @param {*} event
 */
export function mouseMoved(event: Object) {
    return (dispatch: Function, getState: Function) => {
        const area = getRemoteConrolEventCaptureArea();

        if (!area) {
            return;
        }

        const position = area.position();
        const state = getState();
        const { conference } = state['features/base/conference'];
        const { controller } = state['features/remote-control'];

        sendRemoteControlEndpointMessage(conference, controller.controlled, {
            type: EVENTS.mousemove,
            x: (event.pageX - position.left) / area.width(),
            y: (event.pageY - position.top) / area.height()
        });
    };
}

/**
 *
 */
export function mouseScrolled(event: Object) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { conference } = state['features/base/conference'];
        const { controller } = state['features/remote-control'];

        sendRemoteControlEndpointMessage(conference, controller.controlled, {
            type: EVENTS.mousescroll,
            x: event.deltaX,
            y: event.deltaY
        });
    };
}

/**
 * Handler for key press events.
 *
 * @param {string} type - The type of event ("keydown"/"keyup").
 * @param {Event} event - The key event.
 * @returns {void}
 */
export function keyPressed(type: string, event: Object) {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { conference } = state['features/base/conference'];
        const { controller } = state['features/remote-control'];

        sendRemoteControlEndpointMessage(conference, controller.controlled, {
            type,
            key: getKey(event),
            modifiers: getModifiers(event)
        });
    };
}

/**
* Disables the keyboatd shortcuts. Starts collecting remote control
* events. It can be used to resume an active remote control session wchich
* was paused with this.pause().
*
* @returns {void}
*/
export function resume() {
    return (dispatch: Function, getState: Function) => {
        const area = getRemoteConrolEventCaptureArea();
        const state = getState();
        const { controller } = state['features/remote-control'];

        if (!isRemoteControlEnabled(state) || !area || !controller.controlled) {
            return;
        }

        logger.log('Resuming remote control controller.');

        // FIXME: Once the keyboard shortcuts are using react/redux.
        APP.keyboardshortcut.enable(false);

        area.mousemove(event => {
            dispatch(mouseMoved(event));
        });
        area.mousedown(event => dispatch(mouseClicked(EVENTS.mousedown, event)));
        area.mouseup(event => dispatch(mouseClicked(EVENTS.mouseup, event)));
        area.dblclick(event => dispatch(mouseClicked(EVENTS.mousedblclick, event)));
        area.contextmenu(() => false);
        area[0].onmousewheel = event => {
            event.preventDefault();
            event.stopPropagation();
            dispatch(mouseScrolled(event));

            return false;
        };
        $(window).keydown(event => dispatch(keyPressed(EVENTS.keydown, event)));
        $(window).keyup(event => dispatch(keyPressed(EVENTS.keyup, event)));
    };
}


/**
 * Pauses the collecting of events and enables the keyboard shortcus. But
 * it doesn't removes any other listeners. Basically the remote control
 * session will be still active after this.pause(), but no events from the
 * controller side will be captured and sent. You can resume the collecting
 * of the events with this.resume().
 *
 * @returns {void}
 */
export function pause() {
    return (dispatch: Function, getState: Function) => {
        const state = getState();
        const { controller } = state['features/remote-control'];

        if (!isRemoteControlEnabled(state) || !controller.controlled) {
            return;
        }

        logger.log('Pausing remote control controller.');

        // FIXME: Once the keyboard shortcuts are using react/redux.
        APP.keyboardshortcut.enable(true);

        const area = getRemoteConrolEventCaptureArea();

        if (area) {
            area.off('contextmenu');
            area.off('dblclick');
            area.off('mousedown');
            area.off('mousemove');
            area.off('mouseup');
            area[0].onmousewheel = undefined;
        }

        $(window).off('keydown');
        $(window).off('keyup');
    };
}
