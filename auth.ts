import { GRPC } from '@cerbos/grpc';
import { User, db } from './db';

// The Cerbos PDP instance
const cerbos = new GRPC('localhost:3593', {
    tls: false,
});

const SHOW_PDP_REQUEST_LOG = true;

async function authorization(
    principalId: any,
    action: any,
    resourceAtrr: any = {}
) {
    const user = db
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(principalId) as any;

    const cerbosObject = {
        resource: {
            kind: 'blogpost',
            policyVersion: 'default',
            id: resourceAtrr.id ? resourceAtrr.id + '' : 'new',
            attributes: resourceAtrr,
        },
        principal: {
            id: principalId + '' || '0',
            policyVersion: 'default',
            roles: [user?.role || 'unknown'],
            attributes: user,
        },
        actions: [action],
    };

    SHOW_PDP_REQUEST_LOG &&
        console.log('cerbosObject \n', JSON.stringify(cerbosObject, null, 4));

    const cerbosCheck = await cerbos.checkResource(cerbosObject);
    console.log(cerbosCheck);
    const isAuthorized = cerbosCheck.isAllowed(action);

    if (!isAuthorized)
        throw new Error('You are not authorized to visit this resource');
    return true;
}
export default authorization;
