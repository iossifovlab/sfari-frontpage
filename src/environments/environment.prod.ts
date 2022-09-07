
export const environment = {
  production: true,
  oauthClientId: 'gpfjs-frontpage',
  instances: {
    // Must be filled by some script !

    // Example:
    //    hg19: {
    //      apiPath: 'http://localhost:9000/gpf_prefix/api/v3',
    //      frontendPath: 'http://localhost:9000/gpf_prefix',
    //    },
  },
  authPath: ''
  // Must be a path to a gpf instance with an oauth application
  // Example: (the first instance in the above example)
  // authPath: 'http://localhost:9000/gpf_prefix',
};
