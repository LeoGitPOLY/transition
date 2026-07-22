/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import { EventEmitter } from 'events';

import * as Status from 'chaire-lib-common/lib/utils/Status';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';
import traclusDLRunner from '../services/traclusDL/TraclusDLRunner';

export default function (socket: EventEmitter) {
    socket.on(
        TraclusDLConstants.RUN_TEST,
        async (parameters: { input: string }, callback: (status: Status.Status<string>) => void) => {
            try {
                const result = await traclusDLRunner.runTest(parameters.input);
                callback(Status.createOk(result));
            } catch (error) {
                callback(Status.createError(error instanceof Error ? error.message : 'Error running TraClus-DL'));
            }
        }
    );
}
