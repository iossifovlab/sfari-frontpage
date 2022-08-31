export const environment = {
  production: true,
  instances: {
    hg19: {
      apiPath: 'http://gpf:8000/gpf_prefix/api/v3',
      frontendPath: 'http://gpf:8000/gpf_prefix',
    },
  },
  authPath: 'http://gpf:8000/gpf_prefix',
  oauthClientId: 'gpfjs-frontpage'
};
