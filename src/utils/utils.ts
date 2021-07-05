import { AkkaServerlessService } from '../models/serverless';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
export function getFromObject(object: any, key: string, defaultValue?: any): any {
    if (key in object) {
        return object[key];
    }
    return defaultValue;
}

export function getService(name: string, services: AkkaServerlessService[]): AkkaServerlessService | undefined {    
    return services.find(service => {
        return service.name === name;
    });
}