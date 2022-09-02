export const environment = {
  production: true,
  instances: {
    hg19: {
      apiPath: 'http://localhost:8000/gpf_prefix/api/v3',
      frontendPath: 'http://localhost:8000/gpf_prefix',
    },
  },
  authPath: 'http://localhost:8000/gpf_prefix',
  oauthClientId: 'gpfjs-frontpage'
};
