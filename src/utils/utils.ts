/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { config } from "../config";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function getFromObject(object: any, key: string, defaultValue?: any): any {
    if (key in object) {
        return object[key];
    }
    return defaultValue;
}

export function removeStageFromName(name: string, stage: string): string {
    return name.replace(`${stage}-`,'');
}

export function getDockerTag(tag = config.defaults.tag) {
    return tag;
}