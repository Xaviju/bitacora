import axios from 'axios';
import config from './config.json' with { type: 'json' };

let authToken = null;

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

const getProjectID = async (projectSlug) => {
  if (!authToken) {
    await authenticate();
  }

  try {
    const response = await axios.get(
      `${config.taiga.apiUrl}/api/v1/projects/by_slug`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          slug: projectSlug,
        },
      },
    );

    if (response.data && response.data.id) {
      return response.data.id;
    } else {
      throw new Error('Project not found');
    }
  } catch (error) {
    throw new Error(`Failed to get project ID: ${error.message}`);
  }
};

const getCurrentSprints = async (projectId) => {
  if (!authToken) {
    await authenticate();
  }

  try {
    const response = await axios.get(
      `${config.taiga.apiUrl}/api/v1/milestones`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          project: projectId,
          closed: false,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to get sprints: ${error.message}`);
  }
};

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

    console.log('Getting project ID');
    const projectId = await getProjectID(config.taiga.project.slug);

    console.log('Getting current sprints...');
    const sprints = await getCurrentSprints(projectId);

    if (sprints.length === 0) {
      console.log('No active sprints found.');
      return;
    }

    console.log('Getting current stories...');
    const userStories = await getUserStoriesInSprint(
      config.taiga.project.milestoneId,
    );

    if (userStories.length === 0) {
      console.log('No user stories in this sprint.');
      return;
    }

    console.log('\nHere is your entry for today\'s bitacora: \n');
    const iopStories = userStories.filter((story) =>
      story.subject.startsWith(config.taiga.iop.prefix),
    );
    console.log(
      `[${config.taiga.iop.hashtag}](https://chat.kaleidos.net/kaleidos/channels/${config.taiga.iop.channel})`,
    );
    console.log(
      ` ${new Date().toLocaleDateString("es-ES")} (dailies: ${config.taiga.iop.dailies}) `,
    );
    console.log(` **attendees**: ${config.taiga.iop.members.join(', ')}`);
    console.log('\n**In progress**');
    iopStories.forEach((story, index) => {
      console.log(
        `${index + 1}. ${story.subject.replace(config.taiga.iop.prefix, '').trim()} - [story #${story.ref}](https://tree.taiga.io/project/penpot/us/${story.ref})`,
      );
    });
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
