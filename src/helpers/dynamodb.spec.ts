import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { expect, use } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
use(sinonChai);
import { queryUsers } from './dynamodb';

describe('dynamodb helper', () => {
  describe('queryUsers', () => {
    let queryStub: sinon.SinonStub;
    const sandbox = sinon.createSandbox();

    before(() => (process.env.USER_TABLE = 'users'));

    beforeEach(() => {
      process.env.USER_TABLE = 'users';
      queryStub = sandbox.stub(DynamoDBDocumentClient.prototype, 'send');
    });

    afterEach(() => sandbox.restore());

    it('should query ddb and get list of users', async () => {
      queryStub.resolves({ Items: [{ pk: 'mj', name: 'mswain', city: 'perth', country: 'australia' }] });
      const response = await queryUsers('test user');
      expect(response).to.deep.equal([{ name: 'mswain', city: 'perth', country: 'australia', email: 'mj' }]);
    });

    it('should query ddb with the required params', async () => {
      queryStub.resolves({ Items: [] });
      await queryUsers('test user');
      expect(queryStub).to.have.been.calledOnce;
      expect(queryStub).to.have.been.calledWithMatch({
        input: {
          TableName: 'users',
          IndexName: 'sk-name',
          KeyConditionExpression: 'sk = :pk AND begins_with(#user, :name)',
          ExpressionAttributeNames: { '#user': 'name' },
          ExpressionAttributeValues: { ':pk': 'profile', ':name': 'test user' },
        },
      });
    });
  });
});
