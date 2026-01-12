import { LibraryAuthenticateResponse, LibraryGetSigningCertificateResponse, LibrarySignResponse, LibraryStatusResponse } from "./models/message/LibraryResponse";
import Action from "./models/Action";
import ActionOptions from "./models/ActionOptions";
import ErrorCode from "./errors/ErrorCode";
import config from "./config";
export declare function status(): Promise<LibraryStatusResponse>;
export declare function authenticate(challengeNonce: string, options?: ActionOptions): Promise<LibraryAuthenticateResponse>;
export declare function getSigningCertificate(options?: ActionOptions): Promise<LibraryGetSigningCertificateResponse>;
export declare function sign(certificate: string, hash: string, hashFunction: string, options?: ActionOptions): Promise<LibrarySignResponse>;
export { Action, ErrorCode };
export { config };
//# sourceMappingURL=web-eid.d.ts.map