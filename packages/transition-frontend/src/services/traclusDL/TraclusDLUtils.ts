/*
 * Copyright 2026, Polytechnique Montreal and contributors
 *
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */
import serviceLocator from 'chaire-lib-common/lib/utils/ServiceLocator';
import * as Status from 'chaire-lib-common/lib/utils/Status';
import { TraclusDLConstants } from 'transition-common/lib/api/traclusDL';

export const runTraclusDLTest = async (input: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        serviceLocator.socketEventManager.emit(
            TraclusDLConstants.RUN_TEST,
            { input },
            (result: Status.Status<string>) => {
                if (Status.isStatusOk(result)) {
                    resolve(Status.unwrap(result));
                } else {
                    reject(result.error);
                }
            }
        );
    });
};
