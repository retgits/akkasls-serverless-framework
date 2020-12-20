/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Serverless from 'serverless';
import { getFromObject } from '../utils/utils';
import { Config, HookMap, CommandMap } from '../datatypes';
import { Logger } from '../utils/logger';
import { LogLevel } from '../utils/logger';

/**
 * BasePlugin provides the base functionality for all plugins
 */
export abstract class BasePlugin<TOptions=Serverless.Options> {

  public hooks: HookMap;
  protected config: Config;
  protected logger: Logger;
  protected commands: CommandMap;

  public constructor(protected serverless: Serverless, protected options: TOptions) {
    this.hooks = {};
    this.commands = {};
    this.config = serverless.service as any;
    this.logger = new Logger(serverless, options as any);
  }

  protected log(message: string, logLevel?: LogLevel): void {
    this.logger.log(message, logLevel);
  }

  protected error(message: string): void {
    this.logger.error(message);
  }

  protected warn(message: string): void {
    this.logger.warn(message);
  }

  protected info(message: string): void {
    this.logger.info(message);
  }

  protected debug(message: string): void {
    this.logger.debug(message);
  }

  protected prettyPrint(object: any): void {
    this.log(this.stringify(object));
  }

  protected stringify(object: any): string {
    return JSON.stringify(object, null, 2);
  }

  protected getOption(key: string, defaultValue?: any): string {
    return getFromObject(this.options, key, defaultValue);
  }
}