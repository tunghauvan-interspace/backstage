const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = parseInt(semver[0], 10);

if (major < 20) {
  console.error(
    '\x1b[31mERROR: You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Backstage requires Node 20 or 22. \n' +
      'Please update your version of Node.\x1b[0m'
  );
  process.exit(1);
}

if (major > 22) {
  console.warn(
    '\x1b[33mWARNING: You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Backstage is designed to work with Node 20 or 22. \n' +
      'You may encounter issues with higher versions.\x1b[0m'
  );
}
