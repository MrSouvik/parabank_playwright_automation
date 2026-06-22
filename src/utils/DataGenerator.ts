import { faker } from '@faker-js/faker';
import { UserCredentials } from '../context/ScenarioContext';
import { logger } from './logger';

export class DataGenerator {
  static generateUserCredentials(): UserCredentials {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName.toLowerCase()}.${faker.number.int({ min: 1000, max: 9999 })}`;
    const password = faker.internet.password({ length: 10, memorable: false }) + 'A1!';

    const credentials: UserCredentials = {
      firstName,
      lastName,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode('#####'),
      phone: "9" + faker.string.numeric(9),
      ssn: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
      username,
      password
    };

    logger.info(`Generated test user credentials:`);
    logger.info(`  Name: ${credentials.firstName} ${credentials.lastName}`);
    logger.info(`  Username: ${credentials.username}`);
    logger.info(`  Address: ${credentials.address}, ${credentials.city}, ${credentials.state} ${credentials.zipCode}`);
    logger.debug(`  Password: ${credentials.password} (debug only)`);

    return credentials;
  }
}
