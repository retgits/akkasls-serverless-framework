/**
 * An interface for command line parameters of `akkasls`
 *
 * @export
 * @interface AkkaServerlessCommandParameter
 */
export interface AkkaServerlessCommandParameter {
    // The name of the parameter (should match the name of the parameter in `akkasls`)
    name: string;
    // The value of the parameter
    value: string;
    // Whether the name of the parameter should be added to the command (like `--project` should have this set to true)
    addNameToCommand: boolean;
}

/**
 * The interface ShellResult encapsulates the result returned by the external command.
 * Both the standard output and standard error as well as the result code are returned.
 *
 * @export
 * @interface ShellResult
 */
export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

/**
 * Docker Credentials
 *
 * @export
 * @interface Credential
 */
export interface Credential {
    name:     string;
    server:   string;
    username: string;
}