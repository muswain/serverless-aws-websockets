import { expect, use } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as dynamodb from '../helpers/dynamodb';
import { getUsers, GetUsersEvent } from './user-handler';
use(sinonChai);

describe('getUsers()', () => {
  let queryUsersStub: sinon.SinonStub;
  const sandbox = sinon.createSandbox();

  const event: GetUsersEvent = {
    queryStringParameters: {
      name: 'test-user',
    },
  };

  beforeEach(() => {
    queryUsersStub = sandbox.stub(dynamodb, 'queryUsers');
  });

  afterEach(() => sandbox.restore());

  it('should call queryUsers() helper with the required param', async () => {
    queryUsersStub.resolves([{ email: 'test@example.com', name: 'test', city: 'perth', country: 'australia' }]);
    const response = await getUsers(event);

    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response.body)).to.deep.equal([
      { email: 'test@example.com', name: 'test', city: 'perth', country: 'australia' },
    ]);
  });

  it('should throw error when the name query params is not provided', async () => {
    const eventWithoutQueryParams = cloneDeep(event);
    eventWithoutQueryParams.queryStringParameters = null;
    const response = await getUsers(eventWithoutQueryParams);
    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response.body)).to.deep.equal({ message: 'name is required' });
  });
});
