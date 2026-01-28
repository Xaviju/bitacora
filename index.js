import axios from 'axios';
import config from './config.json' with { type: 'json' };

/**
 * @type {string | null}
 */
let authToken = null;

/**
 * Authenticates with the Taiga API and retrieves an auth token
 * @returns {string | null} - The auth token or null if authentication failed.
 */
const authenticate = async () => {
  try {
    const response = await axios.post(`${config.taiga.apiUrl}/api/v1/auth`, {
      username: config.auth.username,
      password: config.auth.password,
      type: 'normal',
    });

    console.log('Authentication successful');

    authToken = response.data.auth_token;
    return authToken;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

/**
 * Gets the user stories in a given sprint
 * @param {number} milestoneId - The ID of the milestone (sprint).
 * @returns {Array} - An array of user stories.
 */
const getUserStoriesInSprint = async (milestoneId) => {
  if (!authToken) {
    await authenticate();
  }

  try {
    const response = await axios.get(
      `${config.taiga.apiUrl}/api/v1/userstories`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          milestone: milestoneId,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to get user stories: ${error.message}`);
  }
};

async function main() {
  try {
    console.log('Authenticating with Taiga...');
    await authenticate();


    console.log(`Fetching user stories for milestone ID: ${config.taiga.project.milestoneId}...`);
    console.log('This may take a moment. Please wait...');
    console.log('Filtering stories with prefix:', config.taiga.iop.prefix);

    /** @type {Array} */
    const userStories = await getUserStoriesInSprint(
      config.taiga.project.milestoneId,
    );

    if (userStories.length === 0) {
      console.log('No user stories in this sprint.');
      return;
    }

    console.log('\nHere is your entry for today\'s bitacora: \n');
    /** @type {Array} */
    const activeStories = userStories.filter((story) =>
      story.subject.startsWith(config.taiga.iop.prefix) &&
      (story.status_extra_info.name === config.taiga.activeStatus),
    );
    const finishedStories = userStories.filter((story) =>
      story.subject.startsWith(config.taiga.iop.prefix) &&
      (story.status_extra_info.name === config.taiga.finishedStatus),
    );
    console.log(
      `[${config.taiga.iop.hashtag}](https://chat.kaleidos.net/kaleidos/channels/${config.taiga.iop.channel})`,
    );
    console.log(
      ` ${new Date().toLocaleDateString("es-ES")} (dailies: ${config.taiga.iop.dailies}) `,
    );
    console.log(` **attendees**: ${config.taiga.iop.members.join(', ')}`);
    console.log('\n**In progress**');
    activeStories.forEach((story, index) => {
      console.log(
        `${index + 1}. ${story.subject.replace(config.taiga.iop.prefix, '').trim()} - [story #${story.ref}](https://tree.taiga.io/project/penpot/us/${story.ref})`,
      );
    });
    if (finishedStories.length > 0) {
      console.log('\n**Finished**');
      finishedStories.forEach((story, index) => {
        console.log(
          `${index + 1}. ${story.subject.replace(config.taiga.iop.prefix, '').trim()} - [story #${story.ref}](https://tree.taiga.io/project/penpot/us/${story.ref})`,
        );
      });
    }
    console.log('\n**Blocking Alerts**: No ');
    console.log('**Dependency Alerts**: No ');
    console.log('\nHave a nice day! 🚀');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
